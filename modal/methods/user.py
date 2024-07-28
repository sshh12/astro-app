from typing import List, Dict
from prisma import Prisma, models, errors
from prisma.enums import Color
from decimal import Decimal
import base64
import context
import random
import asyncio

from methods.base import method_web
from methods.encodings import (
    user_to_dict,
    space_object_to_dict,
    list_to_dict,
)

FAVORITES = "Favorites"

DEFAULT_TZ = "America/Los_Angeles"
DEFAULT_LAT = 34.118330
DEFAULT_LON = -118.300333
DEFAULT_ELEVATION = 0.0

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


def _gen_api_key() -> str:
    alphabet = "abcdefghjkmnpqrstuvABCDEFGHJKMNPQRSTUVWXYZ23456789"
    return "".join(random.choice(alphabet) for _ in range(16))


def _gen_name() -> str:
    alphabet = "123456789"
    return "astro-" + "".join(random.choice(alphabet) for _ in range(8))


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


@method_web(require_login=False)
async def create_user(ctx: context.Context) -> Dict:
    user = await _create_user(ctx.prisma)
    user = await context.fetch_user(ctx.prisma, user.apiKey)
    return {
        "api_key": user.apiKey,
        **user_to_dict(user),
    }


@method_web()
async def get_user(ctx: context.Context) -> Dict:
    return {**user_to_dict(ctx.user)}


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
    return {**user_to_dict(updated_user), "error": error}


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
    return {**user_to_dict(updated_user)}


@method_web(require_login=False)
async def get_space_object(ctx: context.Context, id: str) -> Dict:
    obj = await ctx.prisma.spaceobject.find_unique(where={"id": id})
    return {**space_object_to_dict(obj)}


@method_web(require_login=False)
async def get_space_objects(ctx: context.Context, ids: List[str]) -> Dict:
    objs = await ctx.prisma.spaceobject.find_many(where={"id": {"in": ids}})
    return [space_object_to_dict(obj) for obj in objs]


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
    return {**list_to_dict(list_)}


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
    return {**user_to_dict(updated_user)}


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
    return list_to_dict(new_list)


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
    return {**user_to_dict(updated_user)}


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
    return {**user_to_dict(updated_user)}


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
    return {**user_to_dict(updated_user)}


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
    return {**user_to_dict(updated_user)}


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
    return {**user_to_dict(updated_user)}


@method_web()
async def delete_image(ctx: context.Context, id: str) -> Dict:
    await ctx.prisma.image.delete_many(
        where={"userId": ctx.user.id, "id": id},
    )
    updated_user = await context.fetch_user(ctx.prisma, ctx.user.apiKey)
    return {**user_to_dict(updated_user)}


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
    return {**user_to_dict(updated_user)}


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
