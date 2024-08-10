from typing import List, Dict, Tuple
from prisma import models
from prisma.enums import AstrometryStatus
from PIL import Image
from astropy.wcs import WCS
import openai
import context
import aiohttp
import asyncio
import aioboto3
import json
import uuid
import os
import io

from methods.base import method_web, ASTRO_APP_BUCKET, ASTRO_APP_BUCKET_PATH
from methods.encodings import user_to_dict
from methods.simbad import query_and_import_simbad


@method_web()
async def get_signed_image_upload(ctx: context.Context, type: str):
    session = aioboto3.Session()
    if type == "image/png":
        ext = "png"
    elif type == "image/jpeg":
        ext = "jpg"
    else:
        return {"error": "Invalid type"}
    tmp_path = f"temp_image_uploads/{uuid.uuid4()}.{ext}"
    async with session.client("s3") as s3_client:
        response = await s3_client.generate_presigned_url(
            "put_object",
            Params={"Bucket": ASTRO_APP_BUCKET, "Key": tmp_path, "ContentType": type},
            ExpiresIn=3600,
        )
    return {"signedUrl": response, "url": ASTRO_APP_BUCKET_PATH + tmp_path}


async def _get_astrometry_session_key() -> str:
    async with aiohttp.ClientSession() as session:
        async with session.post(
            "http://nova.astrometry.net/api/login",
            data={
                "request-json": json.dumps({"apikey": os.environ["ASTROMETRY_API_KEY"]})
            },
        ) as response:
            output = json.loads(await response.text())
    return output["session"]


async def _upload_to_astrometry(image_url: str) -> Dict:
    session_key = await _get_astrometry_session_key()
    args = {
        "session": session_key,
        "url": image_url,
        "allow_commercial_use": "n",
        "publicly_visible": "n",
        "allow_modifications": "n",
    }
    async with aiohttp.ClientSession() as session:
        async with session.post(
            f"http://nova.astrometry.net/api/url_upload",
            data={"request-json": json.dumps(args)},
        ) as response:
            output = json.loads(await response.text())
    return output


async def _get_astrometry_submission(subid: int) -> Dict:
    async with aiohttp.ClientSession() as session:
        async with session.get(
            f"http://nova.astrometry.net/api/submissions/{subid}",
        ) as response:
            output = json.loads(await response.text())
    return output


async def _get_astrometry_results(job_id: int) -> Dict:
    async with aiohttp.ClientSession() as session:
        async with session.get(
            f"http://nova.astrometry.net/api/jobs/{job_id}/info",
        ) as response:
            output = json.loads(await response.text())
        async with session.get(
            f"http://nova.astrometry.net/api/jobs/{job_id}/annotations",
        ) as response:
            output["annotations"] = json.loads(await response.text()).get(
                "annotations", []
            )
    return output


async def _get_astrometry_wcs(job_id: int) -> WCS:
    async with aiohttp.ClientSession() as session:
        async with session.get(
            f"http://nova.astrometry.net/wcs_file/{job_id}",
        ) as response:
            output = await response.text()
    return WCS(output)


@method_web()
async def add_image(ctx: context.Context, url: str):
    if not url.startswith(ASTRO_APP_BUCKET_PATH):
        return {"error": "Invalid URL"}
    astrometry_resp = await _upload_to_astrometry(url)
    new_image_args = {
        "userId": int(ctx.user.id),
        "title": "Untitled Image",
    }
    if astrometry_resp["status"] == "success":
        new_image_args["astrometrySid"] = astrometry_resp["subid"]
        new_image_args["astrometryStatus"] = AstrometryStatus.PENDING
    else:
        new_image_args["astrometrySid"] = 0
        new_image_args["astrometryStatus"] = AstrometryStatus.ERROR

    main_image_id = str(uuid.uuid4())
    s3_key = f"user_images/{ctx.user.id}/{main_image_id}.jpg"
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            image_data = await response.read()
    s3_session = aioboto3.Session()
    async with s3_session.client("s3") as s3_client:
        img = Image.open(io.BytesIO(image_data))
        img = img.convert("RGB")
        del image_data
        img_jpg_bytes = io.BytesIO()
        img.save(img_jpg_bytes, format="JPEG")
        width, height = img.size
        await s3_client.put_object(
            Bucket=ASTRO_APP_BUCKET,
            Key=s3_key,
            Body=img_jpg_bytes.getvalue(),
            ContentType="image/jpeg",
        )

    new_image_args["widthPx"] = width
    new_image_args["heightPx"] = height
    new_image_args["mainImageId"] = main_image_id
    await ctx.prisma.image.create(data=new_image_args)

    updated_user = await context.fetch_user(ctx.prisma, ctx.user.apiKey)
    return {**user_to_dict(updated_user)}


async def _get_all_object_ra_dec(ctx: context.Context) -> List[Tuple]:
    objs = await ctx.prisma.spaceobject.find_many(where={"ra": {"not": None}})
    return [(obj.id, float(obj.ra), float(obj.dec)) for obj in objs]


async def _name_image(job_results: Dict) -> str:
    client = openai.AsyncClient(api_key=os.environ["OPENAI_API_KEY"])
    resp = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": """
Given the platesolving results for an astro image, provide a title for this image based on what it contains. 
- Make it short and specific to the region of the sky, only a few words
- Prefer common names over catalog names
- Do not include quotes. 

Respond only with the title.
""".strip(),
            },
            {"role": "user", "content": repr(job_results)},
        ],
    )
    return resp.choices[0].message.content


async def _process_analyzed_image(
    ctx: context.Context,
    image: models.Image,
    job_id: int,
    job_calibration_id: int,
    job_results: Dict,
):
    objs_in_image = set(job_results["objects_in_field"])
    for annotation in job_results["annotations"]:
        objs_in_image |= set(annotation.get("names", []))
    await asyncio.gather(
        *[
            query_and_import_simbad(ctx.prisma, obj, ignore_error=True)
            for obj in objs_in_image
        ]
    )
    calibration = job_results["calibration"]
    wcs = await _get_astrometry_wcs(job_id)
    all_objs = await _get_all_object_ra_dec(ctx)
    ras = [obj[1] * 15 for obj in all_objs]
    decs = [obj[2] for obj in all_objs]
    x, y = wcs.all_world2pix(ras, decs, 1, adaptive=True, quiet=True)
    mappedObjs = []
    for (obj_id, _, _), (px, py) in zip(all_objs, zip(x, y)):
        if (
            px != px
            or py != py
            or px < 0
            or py < 0
            or px > image.widthPx
            or py > image.heightPx
        ):
            continue
        mappedObjs.append([str(obj_id), int(px), int(py)])
    await ctx.prisma.image.update(
        where={"id": image.id},
        data={
            "title": await _name_image(job_results),
            "astrometryStatus": AstrometryStatus.DONE,
            "astrometryJobId": job_id,
            "astrometryJobCalibrationsId": job_calibration_id,
            "objsInField": "|".join(job_results["objects_in_field"]),
            "ra": calibration["ra"],
            "dec": calibration["dec"],
            "widthArcSec": 0,
            "heightArcSec": 0,
            "radius": calibration["radius"],
            "pixelScale": calibration["pixscale"],
            "orientation": calibration["orientation"],
            "parity": calibration["parity"],
            "mappedObjs": json.dumps(mappedObjs),
        },
    )


@method_web()
async def refresh_images(ctx: context.Context):
    images = await ctx.prisma.image.find_many(
        where={"userId": ctx.user.id, "astrometryStatus": AstrometryStatus.PENDING}
    )
    for image in images:
        submission = await _get_astrometry_submission(image.astrometrySid)
        if len(submission["jobs"]) == 0:
            continue
        job_id = submission["jobs"][-1]
        try:
            job_calibration_id = submission["job_calibrations"][-1][-1]
        except IndexError:
            continue
        job_results = await _get_astrometry_results(job_id)
        if job_results["status"] == "success":
            await _process_analyzed_image(
                ctx, image, job_id, job_calibration_id, job_results
            )
        elif job_results["status"] == "failure":
            await ctx.prisma.image.update(
                where={"id": image.id},
                data={
                    "astrometryStatus": AstrometryStatus.ERROR,
                },
            )
    updated_user = await context.fetch_user(ctx.prisma, ctx.user.apiKey)
    return {**user_to_dict(updated_user)}
