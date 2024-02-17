from typing import List, Dict
from prisma import Prisma, models
from prisma.enums import SpaceObjectType, Color
import context
import random
import aiohttp
import re

from skyfield.api import Angle
import space_util

METHODS = {}


def method(require_login: bool = True):
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


def _space_object_to_dict(obj: models.SpaceObject) -> dict:
    return {
        "id": str(obj.id),
        "name": obj.name,
        "names": obj.names,
        "searchKey": obj.searchKey,
        "solarSystemKey": obj.solarSystemKey,
        "color": obj.color,
        "simbadName": obj.simbadName,
        "type": obj.type,
    }


def _list_to_dict(list: models.List) -> dict:
    return {
        "id": str(list.id),
        "title": list.title,
        "color": list.color,
        "objects": [_space_object_to_dict(obj.SpaceObject) for obj in list.objects],
    }


def _get_favorite_objects(user: models.User) -> List:
    fav_list = next(
        (list.List for list in user.lists if list.List.title == "Favorites"), None
    )
    fav_list_objects = [obj.SpaceObject for obj in fav_list.objects]
    return fav_list_objects


def _user_to_dict(user: models.User) -> dict:
    return {
        "id": str(user.id),
        "name": user.name,
        "timezone": user.timezone,
        "lat": float(user.lat),
        "lon": float(user.lon),
        "elevation": float(user.elevation),
        "lists": [_list_to_dict(list.List) for list in user.lists],
    }


def clean_search_term(term: str) -> str:
    return re.sub(r"[\s\-'_]+", "", term.lower())


async def _duplicate_list(
    prisma: Prisma, list: models.List, user: models.User
) -> models.List:
    new_list = await prisma.list.create(
        data={
            "title": list.title,
            "commonTemplate": False,
            "objects": {
                "create": [
                    {"spaceObjectId": obj.SpaceObject.id} for obj in list.objects
                ]
            },
        },
    )
    await prisma.listsonusers.create({"userId": user.id, "listId": list.id})
    return new_list


async def _create_user(prisma: Prisma) -> models.User:
    new_user = await prisma.user.create(
        data={
            "name": _gen_name(),
            "apiKey": _gen_api_key(),
            "timezone": "America/Los_Angeles",
            "lat": 34.118330,
            "lon": -118.300333,
            "elevation": 0.0,
        },
    )
    default_lists = await prisma.list.find_many(
        where={
            "commonTemplate": True,
        },
        include={
            "objects": {
                "include": {
                    "SpaceObject": True,
                }
            }
        },
    )
    for list_ in default_lists:
        await _duplicate_list(prisma, list_, new_user)
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
    simbad_title = re.search(r"Object ([\s\S]+?)  ---", output).group(1).strip()
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

    obj = await prisma.spaceobject.find_first(where={"simbadName": simbad_title})
    if not obj:
        title = simbad_title
        names = [id_[5:] for id_ in idents if "NAME" in id_]
        if len(names) > 0:
            title = names[0]
        if override_name is not None:
            title = override_name
        obj = await prisma.spaceobject.create(
            data={
                "name": title,
                "searchKey": "|".join([clean_search_term(id_) for id_ in idents])
                .lower()
                .replace(" ", ""),
                "solarSystemKey": None,
                "type": SpaceObjectType.STAR_OBJECT,
                "ra": ra,
                "dec": dec,
                "names": idents,
                "color": _random_color(),
                "simbadName": simbad_title,
            },
        )
    return obj


@method(require_login=False)
async def create_user(ctx: context.Context) -> Dict:
    user = await _create_user(ctx.prisma)
    user = await context.fetch_user(ctx.prisma, user.apiKey)
    fav_objects = _get_favorite_objects(user)
    orbits = space_util.get_orbit_calculations(
        fav_objects, user.timezone, user.lat, user.lon
    )
    return {
        "api_key": user.apiKey,
        **_user_to_dict(user),
        "orbits": orbits,
    }


@method()
async def get_user(ctx: context.Context) -> Dict:
    fav_objects = _get_favorite_objects(ctx.user)
    orbits = space_util.get_orbit_calculations(
        fav_objects, ctx.user.timezone, ctx.user.lat, ctx.user.lon
    )
    return {**_user_to_dict(ctx.user), "orbits": orbits}


@method()
async def update_user(
    ctx: context.Context,
    name: str,
) -> Dict:
    await ctx.prisma.user.update(
        where={"id": ctx.user.id},
        data={
            "name": name,
        },
    )
    return {}


@method()
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
            "elevation": elevation,
            "lat": lat,
            "lon": lon,
            "timezone": timezone,
        },
    )
    return {}


@method()
async def get_space_object(ctx: context.Context, id: str) -> Dict:
    obj = await ctx.prisma.spaceobject.find_unique(where={"id": id})
    orbits = space_util.get_orbit_calculations(
        [obj], ctx.user.timezone, ctx.user.lat, ctx.user.lon
    )
    return {**_space_object_to_dict(obj), "orbits": orbits}


@method()
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
    objs = [obj.SpaceObject for obj in list_.objects]
    orbits = space_util.get_orbit_calculations(
        objs, ctx.user.timezone, ctx.user.lat, ctx.user.lon
    )
    return {**_list_to_dict(list_), "orbits": orbits}


@method()
async def update_space_object_lists(
    ctx: context.Context, list_ids: List[str], new_list_title: str, object_id: str
) -> Dict:
    obj = await ctx.prisma.spaceobject.find_unique(
        where={"id": object_id},
        include={
            "lists": {
                "include": {
                    "List": True,
                }
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
    if new_list_title:
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
    return {
        "list_ids_to_add": list_ids_to_add,
        "list_ids_to_remove": list_ids_to_remove,
        "new_list_id": str(new_list.id) if new_list else None,
        "list_ids_deleted": list_ids_deleted,
    }


@method()
async def search(ctx: context.Context, term: str) -> Dict:
    term = clean_search_term(term)
    objs = await ctx.prisma.spaceobject.find_many(
        where={"searchKey": {"contains": term}}
    )
    try:
        obj = await query_and_import_simbad(ctx.prisma, term)
        objs.append(obj)
    except Exception as e:
        print(e)
    objs = list({obj.id: obj for obj in objs}.values())
    orbits = space_util.get_orbit_calculations(
        objs, ctx.user.timezone, ctx.user.lat, ctx.user.lon
    )
    return {"objects": [_space_object_to_dict(obj) for obj in objs], "orbits": orbits}
