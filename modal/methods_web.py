from typing import List, Dict
from prisma import Prisma, models, errors
from prisma.enums import SpaceObjectType, Color, AstrometryStatus
from decimal import Decimal
from PIL import Image
import base64
import context
import random
import aiohttp
import asyncio
import aioboto3
import json
import uuid
import re
import os
import io

from skyfield.api import Angle

METHODS = {}

FAVORITES = "Favorites"

DEFAULT_TZ = "America/Los_Angeles"
DEFAULT_LAT = 34.118330
DEFAULT_LON = -118.300333
DEFAULT_ELEVATION = 0.0
ASTRO_APP_BUCKET = "astro-app-io"
ASTRO_APP_BUCKET_PATH = "https://astro-app-io.s3.amazonaws.com/"

DEFAULT_LISTS = {
    (FAVORITES, Color.RED): [
        "944241942959718401",
        "944241943363649537",
        "944241943867162625",
        "944241952512442369",
        "944241955830530049",
        "944241965995786241",
        "950079201617838082",
    ],
    ("Nebulas", Color.RED): [
        "944241955830530049",
        "944241958223970305",
        "944241962644766721",
        "944241965995786241",
        "944241968814784513",
        "944241971144065025",
        "944241973560868865",
        "944241976047599617",
        "944241978420101121",
        "944241982988746753",
        "944241985593442305",
        "944241988150820865",
        "944241990489964545",
        "944241993160130561",
        "944241995678580737",
        "944241998345437185",
    ],
    ("Galaxies", Color.BLUE): [
        "944242002229231617",
        "944242005918744577",
        "944242009715900417",
        "944242012176351233",
        "944242016663961601",
        "944242351239495681",
        "944242354172428289",
        "944242358486532097",
        "944242361449775105",
        "944242363892203521",
        "944242445538164737",
        "948083556061446145",
        "948752825148604417",
    ],
}

DEFAULT_EQUIPMENT = {
    "teleFocalLength": 250,
    "teleAperture": 50,
    "teleName": "Seestar - S50",
    "camName": "Seestar - S50 (IMX462)",
    "camWidth": 1080,
    "camHeight": 1920,
    "camPixelWidth": 2.90,
    "camPixelHeight": 2.90,
    "eyeFocalLength": None,
    "eyeFOV": None,
    "eyeName": "Custom",
    "barlow": 1,
    "binning": 1,
    "binoAperture": None,
    "binoMagnification": None,
    "binoActualFOV": None,
    "binoName": "Custom",
    "type": "CAMERA",
}


def method_web(require_login: bool = True):
    def wrap(func):
        async def wrapper(ctx: context.Context, **kwargs):
            if require_login and not ctx.user:
                return {"error": "Not logged in"}
            return await func(ctx, **kwargs)

        METHODS[func.__name__] = wrapper

    return wrap


def _gen_api_key() -> str:
    alphabet = "abcdefghjkmnpqrstuvABCDEFGHJKMNPQRSTUVWXYZ23456789"
    return "".join(random.choice(alphabet) for _ in range(16))


def _gen_name() -> str:
    alphabet = "123456789"
    return "astro-" + "".join(random.choice(alphabet) for _ in range(8))


def _random_color() -> Color:
    return random.choice(list(Color))


def _space_object_to_dict(obj: models.SpaceObject, show_content: bool = True) -> dict:
    props = {
        "id": str(obj.id),
    }
    if show_content:
        props.update(
            {
                "name": obj.name,
                "names": obj.names,
                "searchKey": obj.searchKey,
                "solarSystemKey": obj.solarSystemKey,
                "cometKey": obj.cometKey,
                "celestrakKey": obj.celestrakKey,
                "color": obj.color,
                "type": obj.type,
                "imgURL": obj.imgURL,
                "ra": float(obj.ra) if obj.ra else None,
                "dec": float(obj.dec) if obj.dec else None,
                "fluxV": float(obj.fluxV) if obj.fluxV else None,
                "sizeMajor": float(obj.sizeMajor) if obj.sizeMajor else None,
                "sizeMinor": float(obj.sizeMinor) if obj.sizeMinor else None,
                "sizeAngle": float(obj.sizeAngle) if obj.sizeAngle else None,
                "simbadName": obj.simbadName,
                "imgCredit": obj.imgCredit,
                "description": obj.description,
                "descriptionCredit": obj.descriptionCredit,
            }
        )
    return props


def _list_to_dict(list: models.List, show_objects: bool = True) -> dict:
    list_dict = {
        "id": str(list.id),
        "title": list.title,
        "color": list.color,
        "credit": list.credit,
        "imgURL": list.imgURL,
        "type": list.type,
    }
    if list.objects:
        list_dict["objects"] = [
            _space_object_to_dict(obj.SpaceObject, show_content=show_objects)
            for obj in list.objects
        ]
    return list_dict


def _equipment_to_dict(equipment: models.Equipment) -> dict:
    float_keys = [
        "teleFocalLength",
        "teleAperture",
        "camPixelWidth",
        "camPixelHeight",
        "barlow",
        "eyeFocalLength",
        "eyeFOV",
        "binoAperture",
        "binoMagnification",
        "binoActualFOV",
    ]
    int_keys = ["camWidth", "camHeight", "binning"]
    str_keys = ["teleName", "camName", "eyeName", "binoName"]
    eq_dict = {
        "id": str(equipment.id),
        "active": equipment.active,
        "type": equipment.type,
    }
    for key in float_keys:
        eq_dict[key] = (
            float(getattr(equipment, key))
            if getattr(equipment, key) is not None
            else None
        )
    for key in str_keys + int_keys:
        eq_dict[key] = getattr(equipment, key)
    return eq_dict


def _location_to_dict(location: models.Location) -> dict:
    return {
        "id": str(location.id),
        "name": location.name,
        "active": location.active,
        "timezone": location.timezone,
        "lat": float(location.lat),
        "lon": float(location.lon),
        "elevation": float(location.elevation),
    }


def _image_to_dict(user: models.User, image: models.Image) -> dict:
    solve_dict = {}
    if image.ra:
        solve_dict = {
            "ra": float(image.ra),
            "dec": float(image.dec),
            "widthArcSec": float(image.widthArcSec),
            "heightArcSec": float(image.heightArcSec),
            "radius": float(image.radius),
            "pixelScale": float(image.pixelScale),
            "orientation": float(image.orientation),
            "parity": float(image.parity),
        }
    if image.objsInField:
        solve_dict["objsInField"] = image.objsInField.split("|")
    return {
        "id": str(image.id),
        "title": image.title,
        "mainImageId": image.mainImageId,
        "mainImageUrl": f"{ASTRO_APP_BUCKET_PATH}user_images/{user.id}/{image.mainImageId}.jpg",
        "astrometrySid": image.astrometrySid,
        "astrometryStatus": image.astrometryStatus,
        "astrometryJobId": image.astrometryJobId,
        "astrometryJobCalibrationsId": image.astrometryJobCalibrationsId,
        **solve_dict,
    }


def _user_to_dict(user: models.User) -> dict:
    return {
        "id": str(user.id),
        "name": user.name,
        "lists": [_list_to_dict(list.List) for list in user.lists],
        "equipment": [_equipment_to_dict(equip) for equip in user.equipment],
        "location": [_location_to_dict(loc) for loc in user.location],
        "images": [_image_to_dict(user, image) for image in user.images],
    }


def clean_search_term(term: str) -> str:
    if term.startswith("NAME "):
        term = term[5:]
    return re.sub(r"[^\w0-9]+", "", term.lower())


def build_search_key(name: str, names: List[str]) -> str:
    names_full = set(names + [name])
    key = "|".join(clean_search_term(name) for name in names_full)
    return key


def chunk(list: List, size: int) -> List[List]:
    return [list[i : i + size] for i in range(0, len(list), size)]


async def _create_default_lists(prisma: Prisma, user: models.User) -> List[models.List]:
    new_lists = []
    for (title, color), obj_ids in DEFAULT_LISTS.items():
        new_list = await prisma.list.create(
            data={
                "title": title,
                "color": color,
                "objects": {"create": [{"spaceObjectId": objId} for objId in obj_ids]},
                "users": {"create": [{"userId": user.id}]},
            },
        )
        new_lists.append(new_list)
    return new_list


async def _create_default_equipment(
    prisma: Prisma, user: models.User
) -> List[models.Equipment]:
    new_equip = await prisma.equipment.create(
        data={
            "userId": user.id,
            "active": True,
            **DEFAULT_EQUIPMENT,
        },
    )
    return [new_equip]


async def _create_default_location(
    prisma: Prisma, user: models.User
) -> List[models.Location]:
    new_location = await prisma.location.create(
        data={
            "userId": user.id,
            "active": True,
            "timezone": DEFAULT_TZ,
            "name": "Los Angeles, CA",
            "lat": DEFAULT_LAT,
            "lon": DEFAULT_LON,
            "elevation": DEFAULT_ELEVATION,
        },
    )
    return [new_location]


async def _create_user(prisma: Prisma) -> models.User:
    new_user = await prisma.user.create(
        data={
            "name": _gen_name(),
            "apiKey": _gen_api_key(),
        },
    )
    await asyncio.gather(
        _create_default_lists(prisma, new_user),
        _create_default_equipment(prisma, new_user),
        _create_default_location(prisma, new_user),
    )
    return new_user


async def query_and_import_simbad(
    prisma: Prisma, term: str, override_name: str = None
) -> models.SpaceObject:
    obj = await prisma.spaceobject.find_first(where={"name": term})
    if obj is not None:
        return obj

    async with aiohttp.ClientSession() as session:
        async with session.get(
            f"https://simbad.cds.unistra.fr/simbad/sim-basic?Ident={term}&submit=SIMBAD+search&output.format=ASCII"
        ) as response:
            output = await response.text()
    try:
        simbad_title = re.search(r"Object ([\s\S]+?)  ---", output).group(1).strip()
    except AttributeError:
        raise Exception(f"Could not find simbad result for {term}")
    icrs_match = re.search(
        r"ICRS,ep=J2000,eq=2000\): (\d+) (\d+) ([\d\.]+)  ([\d+\-]+) (\d+) ([\d\.]+)",
        output,
    )
    idents_blob = re.search(r"Identifiers \(\d+\):([\s\S]+)\nB", output).group(1)
    idents = [val.strip() for val in idents_blob.strip().split("   ") if val.strip()]
    ra = Angle(
        hours=(
            float(icrs_match.group(1)),
            float(icrs_match.group(2)),
            float(icrs_match.group(3)),
        )
    ).hours
    dec = Angle(
        degrees=(
            float(icrs_match.group(4)),
            float(icrs_match.group(5)),
            float(icrs_match.group(6)),
        )
    ).degrees

    flux_v_match = re.search(r"Flux V : ([\d\.]+) ", output)
    flux_v = float(flux_v_match.group(1)) if flux_v_match else None

    size_match = re.search(
        r"Angular size:\s+([\d\.]+)\s+([\d\.]+)\s+([\d\.]+) ", output
    )
    if size_match:
        size_major = float(size_match.group(1))
        size_minor = float(size_match.group(2))
        size_pa = float(size_match.group(3))
    else:
        size_match = re.search(r"Angular size: ([\d\.]+) ([\d\.]+)   ~", output)
        if size_match:
            size_major = float(size_match.group(1))
            size_minor = float(size_match.group(2))
            size_pa = None
        else:
            size_major = None
            size_minor = None
            size_pa = None

    obj = await prisma.spaceobject.find_first(where={"simbadName": simbad_title})
    if not obj:
        title = simbad_title
        names = [id_[5:] for id_ in idents if "NAME" in id_]
        if len(names) > 0:
            title = names[0]
        if override_name is not None:
            title = override_name

        obj = await prisma.spaceobject.find_first(where={"name": title})

        if not obj:
            obj = await prisma.spaceobject.create(
                data={
                    "name": title,
                    "searchKey": build_search_key(title, idents),
                    "solarSystemKey": None,
                    "type": SpaceObjectType.STAR_OBJECT,
                    "ra": ra,
                    "dec": dec,
                    "fluxV": flux_v,
                    "names": idents,
                    "color": _random_color(),
                    "simbadName": simbad_title,
                    "sizeMajor": size_major,
                    "sizeMinor": size_minor,
                    "sizeAngle": size_pa,
                },
            )
    return obj


@method_web(require_login=False)
async def create_user(ctx: context.Context) -> Dict:
    user = await _create_user(ctx.prisma)
    user = await context.fetch_user(ctx.prisma, user.apiKey)
    return {
        "api_key": user.apiKey,
        **_user_to_dict(user),
    }


@method_web()
async def get_user(ctx: context.Context) -> Dict:
    return {**_user_to_dict(ctx.user)}


@method_web()
async def update_user(
    ctx: context.Context,
    name: str,
) -> Dict:
    error = None
    try:
        await ctx.prisma.user.update(
            where={"id": ctx.user.id},
            data={
                "name": name,
            },
        )
    except errors.UniqueViolationError:
        error = "Name already in use"
    updated_user = await context.fetch_user(ctx.prisma, ctx.user.apiKey)
    return {**_user_to_dict(updated_user), "error": error}


@method_web()
async def update_user_location(
    ctx: context.Context,
    elevation: int,
    lat: float,
    lon: float,
    timezone: str,
) -> Dict:
    await ctx.prisma.user.update(
        where={"id": ctx.user.id},
        data={
            "elevation": Decimal(elevation),
            "lat": Decimal(lat),
            "lon": Decimal(lon),
            "timezone": timezone,
        },
    )
    updated_user = await context.fetch_user(ctx.prisma, ctx.user.apiKey)
    return {**_user_to_dict(updated_user)}


@method_web(require_login=False)
async def get_space_object(ctx: context.Context, id: str) -> Dict:
    obj = await ctx.prisma.spaceobject.find_unique(where={"id": id})
    return {**_space_object_to_dict(obj)}


@method_web(require_login=False)
async def get_list(ctx: context.Context, id: str) -> Dict:
    list_ = await ctx.prisma.list.find_unique(
        where={"id": id},
        include={
            "objects": {
                "include": {
                    "SpaceObject": True,
                }
            }
        },
    )
    if list_ is None:
        return {"error": "List not found"}
    return {**_list_to_dict(list_)}


@method_web()
async def update_space_object_lists(
    ctx: context.Context, list_ids: List[str], new_list_title: str, object_id: str
) -> Dict:
    user_lists = await ctx.prisma.listsonusers.find_many(
        where={"userId": ctx.user.id},
    )
    obj = await ctx.prisma.spaceobject.find_unique(
        where={
            "id": object_id,
        },
        include={
            "lists": {
                "where": {"listId": {"in": [list_.listId for list_ in user_lists]}},
                "include": {"List": True},
            }
        },
    )
    obj_existing_list_ids = [str(list_.List.id) for list_ in obj.lists]
    list_ids_to_add = [
        list_id for list_id in list_ids if list_id not in obj_existing_list_ids
    ]
    list_ids_to_remove = [
        list_id for list_id in obj_existing_list_ids if list_id not in list_ids
    ]
    for list_id in list_ids_to_add:
        await ctx.prisma.spaceobjectsonlists.create(
            data={"listId": int(list_id), "spaceObjectId": obj.id}
        )
    for list_id in list_ids_to_remove:
        await ctx.prisma.spaceobjectsonlists.delete_many(
            where={"listId": int(list_id), "spaceObjectId": obj.id}
        )
    if new_list_title and new_list_title != FAVORITES:
        new_list = await ctx.prisma.list.create(
            data={"title": new_list_title, "color": _random_color()}
        )
        await ctx.prisma.spaceobjectsonlists.create(
            data={"listId": new_list.id, "spaceObjectId": obj.id}
        )
        await ctx.prisma.listsonusers.create(
            data={"userId": ctx.user.id, "listId": new_list.id}
        )
    else:
        new_list = None
    list_ids_deleted = []
    for list_id in list_ids_to_remove:
        list_objs = await ctx.prisma.spaceobjectsonlists.find_many(
            where={"listId": int(list_id)}
        )
        if len(list_objs) == 0:
            await ctx.prisma.listsonusers.delete_many(where={"listId": int(list_id)})
            await ctx.prisma.list.delete(where={"id": int(list_id)})
            list_ids_deleted.append(list_id)
    updated_user = await context.fetch_user(ctx.prisma, ctx.user.apiKey)
    return {**_user_to_dict(updated_user)}


@method_web()
async def search(ctx: context.Context, term: str) -> Dict:
    print("search/", repr(term))
    term = clean_search_term(term)
    objs = await ctx.prisma.spaceobject.find_many(
        where={"searchKey": {"contains": term}}
    )
    try:
        obj = await query_and_import_simbad(ctx.prisma, term)
        objs.append(obj)
    except Exception as e:
        print(e)
    objs = list({obj.id: obj for obj in objs}.values())[:10]
    return {"objects": [_space_object_to_dict(obj) for obj in objs]}


@method_web()
async def add_list(ctx: context.Context, id: str) -> Dict:
    list = await ctx.prisma.list.find_unique(
        where={"id": id},
        include={"objects": True},
    )
    if list is None or not list.publicTemplate:
        return {"error": "List not found"}
    new_list = await ctx.prisma.list.create(
        data={
            "title": list.title,
            "color": list.color,
            "objects": {
                "create": [
                    {"spaceObjectId": obj_on_list.spaceObjectId}
                    for obj_on_list in list.objects
                ]
            },
            "users": {"create": [{"userId": ctx.user.id}]},
        },
    )
    return _list_to_dict(new_list)


@method_web()
async def delete_list(ctx: context.Context, id: str) -> Dict:
    cnt = await ctx.prisma.listsonusers.delete_many(
        where={"listId": id, "userId": ctx.user.id},
    )
    if cnt == 0:
        return {"error": "List not found"}
    await ctx.prisma.spaceobjectsonlists.delete_many(
        where={"listId": id},
    )
    await ctx.prisma.list.delete(
        where={"id": id},
    )
    return {"deleted": True}


@method_web()
async def add_equipment(ctx: context.Context, equipment_details: Dict) -> Dict:
    existing_equip = await ctx.prisma.equipment.find_many(
        where={
            "userId": ctx.user.id,
        },
    )
    int_keys = [
        "binning",
        "camWidth",
        "camHeight",
    ]
    all_keys = [
        "teleFocalLength",
        "teleAperture",
        "teleName",
        "camPixelWidth",
        "camPixelHeight",
        "camName",
        "barlow",
        "eyeFocalLength",
        "eyeFOV",
        "eyeName",
        "binoAperture",
        "binoMagnification",
        "binoActualFOV",
        "binoName",
        "type",
    ] + int_keys
    if set(equipment_details.keys()) != set(all_keys):
        print("bad equip request", equipment_details)
        return {"error": "Invalid request"}
    for key in all_keys:
        if equipment_details[key] == "":
            equipment_details[key] = None
    for key in int_keys:
        if equipment_details[key] is not None:
            equipment_details[key] = int(equipment_details[key])
    await ctx.prisma.equipment.create(
        data={
            **equipment_details,
            "userId": ctx.user.id,
            "active": True,
        },
    )
    await ctx.prisma.equipment.update_many(
        where={"id": {"in": [equip.id for equip in existing_equip]}},
        data={"active": False},
    )
    updated_user = await context.fetch_user(ctx.prisma, ctx.user.apiKey)
    return {**_user_to_dict(updated_user)}


@method_web()
async def delete_equipment(ctx: context.Context, id: str) -> Dict:
    await ctx.prisma.equipment.delete_many(
        where={"userId": ctx.user.id, "id": id},
    )
    existing_equip = await ctx.prisma.equipment.find_many(
        where={
            "userId": ctx.user.id,
        },
    )
    if len(existing_equip) > 0 and not any(equip.active for equip in existing_equip):
        await ctx.prisma.equipment.update(
            where={"id": existing_equip[0].id, "userId": ctx.user.id},
            data={"active": True},
        )
    updated_user = await context.fetch_user(ctx.prisma, ctx.user.apiKey)
    return {**_user_to_dict(updated_user)}


@method_web()
async def set_active_equipment(ctx: context.Context, id: str) -> Dict:
    await ctx.prisma.equipment.update_many(
        where={"userId": ctx.user.id},
        data={"active": False},
    )
    await ctx.prisma.equipment.update(
        where={"id": id, "userId": ctx.user.id},
        data={"active": True},
    )
    updated_user = await context.fetch_user(ctx.prisma, ctx.user.apiKey)
    return {**_user_to_dict(updated_user)}


@method_web()
async def add_location(ctx: context.Context, location_details: Dict) -> Dict:
    existing_loc = await ctx.prisma.location.find_many(
        where={
            "userId": ctx.user.id,
        },
    )
    all_keys = [
        "name",
        "timezone",
        "lat",
        "lon",
        "elevation",
    ]
    if set(location_details.keys()) != set(all_keys):
        print("bad loc request", location_details)
        return {"error": "Invalid request"}
    for key in all_keys:
        if location_details[key] == "":
            location_details[key] = None
    await ctx.prisma.location.create(
        data={**location_details, "userId": ctx.user.id, "active": True},
    )
    await ctx.prisma.location.update_many(
        where={"id": {"in": [loc.id for loc in existing_loc]}},
        data={"active": False},
    )
    updated_user = await context.fetch_user(ctx.prisma, ctx.user.apiKey)
    return {**_user_to_dict(updated_user)}


@method_web()
async def delete_location(ctx: context.Context, id: str) -> Dict:
    await ctx.prisma.location.delete_many(
        where={"userId": ctx.user.id, "id": id},
    )
    existing_loc = await ctx.prisma.location.find_many(
        where={
            "userId": ctx.user.id,
        },
    )
    if len(existing_loc) > 0 and not any(loc.active for loc in existing_loc):
        await ctx.prisma.location.update(
            where={"id": existing_loc[0].id, "userId": ctx.user.id},
            data={"active": True},
        )
    updated_user = await context.fetch_user(ctx.prisma, ctx.user.apiKey)
    return {**_user_to_dict(updated_user)}


@method_web()
async def set_active_location(ctx: context.Context, id: str) -> Dict:
    await ctx.prisma.location.update_many(
        where={"userId": ctx.user.id},
        data={"active": False},
    )
    await ctx.prisma.location.update(
        where={"id": id, "userId": ctx.user.id},
        data={"active": True},
    )
    updated_user = await context.fetch_user(ctx.prisma, ctx.user.apiKey)
    return {**_user_to_dict(updated_user)}


@method_web(require_login=False)
async def get_geocode(ctx: context.Context, lat: float, lon: float) -> Dict:
    from tzfpy import get_tz
    from geopy.geocoders import Nominatim

    geolocator = Nominatim(
        user_agent=f"astro-app-{ctx.user.id if ctx.user else 'anon'}"
    )
    location = geolocator.reverse(f"{lat}, {lon}")

    return {"timezone": get_tz(lon, lat), "location": dict(location.raw)}


@method_web(require_login=False)
async def get_de421(ctx: context.Context) -> Dict:
    from skyfield.api import Loader

    load = Loader(".")
    load("de421.bsp")
    with open("./de421.bsp", "rb") as f:
        de421_data = f.read()
    return {"de421_b64": base64.b64encode(de421_data).decode()}


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
    return output


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
        del image_data
        img_jpg_bytes = io.BytesIO()
        img.save(img_jpg_bytes, format="JPEG")
        await s3_client.put_object(
            Bucket=ASTRO_APP_BUCKET,
            Key=s3_key,
            Body=img_jpg_bytes.getvalue(),
            ContentType="image/jpeg",
        )

    print(new_image_args)
    new_image_args["mainImageId"] = main_image_id
    await ctx.prisma.image.create(data=new_image_args)

    updated_user = await context.fetch_user(ctx.prisma, ctx.user.apiKey)
    return {**_user_to_dict(updated_user)}


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
        job_calibration_id = submission["job_calibrations"][-1][-1]
        job_results = await _get_astrometry_results(job_id)
        if job_results["status"] == "success":
            calibration = job_results["calibration"]
            await ctx.prisma.image.update(
                where={"id": image.id},
                data={
                    "title": (
                        job_results["objects_in_field"][0]
                        if len(job_results.get("objects_in_field", [])) > 0
                        else "Untitled Image"
                    ),
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
                },
            )
        elif job_results["status"] == "failure":
            await ctx.prisma.image.update(
                where={"id": image.id},
                data={
                    "astrometryStatus": AstrometryStatus.ERROR,
                },
            )
    updated_user = await context.fetch_user(ctx.prisma, ctx.user.apiKey)
    return {**_user_to_dict(updated_user)}
