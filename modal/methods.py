from typing import List, Dict
from prisma import Prisma, models
from prisma.enums import SpaceObjectType
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


def _space_object_to_dict(obj: models.SpaceObject) -> dict:
    return {
        "id": str(obj.id),
        "name": obj.name,
        "searchKey": obj.searchKey,
        "solarSystemKey": obj.solarSystemKey,
        "type": obj.type,
    }


def _list_to_dict(list: models.List) -> dict:
    return {
        "id": str(list.id),
        "title": list.title,
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
        "lists": [_list_to_dict(list.List) for list in user.lists],
    }


async def _add_user_to_list(
    prisma: Prisma, user: models.User, list: models.List
) -> models.List:
    await prisma.listsonusers.create({"userId": user.id, "listId": list.id})


async def _create_user(prisma: Prisma) -> models.User:
    new_user = await prisma.user.create(
        data={
            "name": _gen_name(),
            "apiKey": _gen_api_key(),
            "timezone": "America/Los_Angeles",
            "lat": 34.118330,
            "lon": 118.300333,
        },
    )
    default_lists = await prisma.list.find_many(
        where={
            "commonTemplate": True,
        }
    )
    for list_ in default_lists:
        await _add_user_to_list(prisma, new_user, list_)
    return new_user


async def query_and_import_simbad(prisma: Prisma, term: str) -> models.SpaceObject:
    async with aiohttp.ClientSession() as session:
        async with session.get(
            f"https://simbad.cds.unistra.fr/simbad/sim-basic?Ident={term}&submit=SIMBAD+search&output.format=ASCII"
        ) as response:
            output = await response.text()
    title = re.search(r"Object ([\s\S]+?)  ---", output).group(1).strip()
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

    obj = await prisma.spaceobject.find_first(where={"name": title})
    if not obj:
        obj = await prisma.spaceobject.create(
            data={
                "name": title,
                "searchKey": "|".join(idents).lower().replace(" ", ""),
                "solarSystemKey": None,
                "type": SpaceObjectType.STAR_OBJECT,
                "ra": ra,
                "dec": dec,
            },
        )
    return obj


@method(require_login=False)
async def create_user(ctx: context.Context) -> Dict:
    user = await _create_user(ctx.prisma)
    user = await context.fetch_user(ctx.prisma, user.apiKey)
    fav_objects = _get_favorite_objects(user)
    orbits = space_util.get_orbit_calculations(fav_objects)
    return {"api_key": user.apiKey, **_user_to_dict(user), "orbits": orbits}


@method()
async def get_user(ctx: context.Context) -> Dict:
    fav_objects = _get_favorite_objects(ctx.user)
    orbits = space_util.get_orbit_calculations(fav_objects)
    return {**_user_to_dict(ctx.user), "orbits": orbits}


@method()
async def get_space_object(ctx: context.Context, id: str) -> Dict:
    obj = await ctx.prisma.spaceobject.find_unique(where={"id": id})
    orbits = space_util.get_orbit_calculations([obj])
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
    orbits = space_util.get_orbit_calculations(objs)
    return {**_list_to_dict(list_), "orbits": orbits}


@method()
async def search(ctx: context.Context, term: str) -> Dict:
    term = term.strip().lower().replace(" ", "")
    objs = await ctx.prisma.spaceobject.find_many(
        where={"searchKey": {"contains": term}}
    )
    if len(objs) == 0:
        try:
            obj = await query_and_import_simbad(ctx.prisma, term)
            objs = [obj]
        except Exception as e:
            print(e)
    orbits = space_util.get_orbit_calculations(objs)
    return {"objects": [_space_object_to_dict(obj) for obj in objs], "orbits": orbits}
