from typing import List, Dict, Optional
from prisma import Prisma, models, errors
from prisma.enums import SpaceObjectType, Color
from decimal import Decimal
import context
import random
import aiohttp
import asyncio
import re

from skyfield.api import Angle
import methods_cpu

METHODS = {}

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
    ("Popular Nebulas", Color.RED): [
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
    ("Popular Galaxies", Color.BLUE): [
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
    ("Solar System", Color.YELLOW): [
        "944241942959718401",
        "944241943064412161",
        "944241943171366913",
        "944241943273340929",
        "944241943363649537",
        "944241943455465473",
        "944241943558094849",
        "944241943667408897",
        "944241943765680129",
        "944241943867162625",
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


def _space_object_to_dict(
    obj: models.SpaceObject, expand: bool = False, show_content: bool = True
) -> dict:
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
                "color": obj.color,
                "type": obj.type,
                "imgURL": obj.imgURL,
                "ra": float(obj.ra) if obj.ra else None,
                "dec": float(obj.dec) if obj.dec else None,
                "fluxV": float(obj.fluxV) if obj.fluxV else None,
                "sizeMajor": float(obj.sizeMajor) if obj.sizeMajor else None,
                "sizeMinor": float(obj.sizeMinor) if obj.sizeMinor else None,
                "sizeAngle": float(obj.sizeAngle) if obj.sizeAngle else None,
            }
        )
    if expand:
        props.update(
            {
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


def _get_favorite_objects(user: models.User) -> List:
    fav_list = next(
        (list.List for list in user.lists if list.List.title == FAVORITES), None
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
        "lists": [
            _list_to_dict(list.List, show_objects=list.List.title == FAVORITES)
            for list in user.lists
        ],
        "equipment": [_equipment_to_dict(equip) for equip in user.equipment],
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


async def get_orbit_calculations_batch(
    objects: List[models.SpaceObject],
    timezone: str,
    lat: float,
    lon: float,
    elevation: float,
    batch_size: int = 8,
    resolution_mins: Optional[int] = None,
):
    if resolution_mins is None:
        if any(obj.type == SpaceObjectType.EARTH_SATELLITE for obj in objects):
            resolution_mins = 1
        else:
            resolution_mins = 10
    if len(objects) <= batch_size:
        results_combined = await methods_cpu.get_orbit_calculations.remote(
            objects=objects,
            timezone=timezone,
            lat=lat,
            lon=lon,
            elevation=elevation,
            resolution_mins=resolution_mins,
        )
    else:
        objs = sorted(objects, key=lambda obj: str(obj.type))
        results = await asyncio.gather(
            *[
                methods_cpu.get_orbit_calculations.remote(
                    objects=obj_chunk,
                    timezone=timezone,
                    lat=lat,
                    lon=lon,
                    elevation=elevation,
                    resolution_mins=resolution_mins,
                )
                for obj_chunk in chunk(objs, batch_size)
            ]
        )
        results_combined = results[0]
        for result in results[1:]:
            results_combined["objects"].update(result["objects"])
    return results_combined


async def get_longterm_orbit_calculations_batch(
    object: models.SpaceObject,
    timezone: str,
    lat: float,
    lon: float,
    elevation: float,
    batch_size: int = 20,
):
    results = await asyncio.gather(
        *[
            methods_cpu.get_longterm_orbit_calculations.remote(
                object=object,
                timezone=timezone,
                lat=lat,
                lon=lon,
                elevation=elevation,
                start_days=day_chunk[0],
                offset_days=len(day_chunk),
            )
            for day_chunk in chunk(list(range(365)), batch_size)
        ]
    )
    results_combined = [day for result in results for day in result]
    return results_combined


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


async def _create_user(prisma: Prisma) -> models.User:
    new_user = await prisma.user.create(
        data={
            "name": _gen_name(),
            "apiKey": _gen_api_key(),
            "timezone": DEFAULT_TZ,
            "lat": DEFAULT_LAT,
            "lon": DEFAULT_LON,
            "elevation": DEFAULT_ELEVATION,
        },
    )
    await asyncio.gather(
        _create_default_lists(prisma, new_user),
        _create_default_equipment(prisma, new_user),
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
    fav_objects = _get_favorite_objects(user)
    orbits = await get_orbit_calculations_batch(
        fav_objects, user.timezone, user.lat, user.lon, user.elevation
    )
    return {
        "api_key": user.apiKey,
        **_user_to_dict(user),
        "orbits": orbits,
    }


@method_web()
async def get_user(ctx: context.Context) -> Dict:
    fav_objects = _get_favorite_objects(ctx.user)
    orbits = await get_orbit_calculations_batch(
        fav_objects, ctx.user.timezone, ctx.user.lat, ctx.user.lon, ctx.user.elevation
    )
    return {**_user_to_dict(ctx.user), "orbits": orbits}


@method_web()
async def update_user(
    ctx: context.Context,
    name: str,
) -> Dict:
    try:
        await ctx.prisma.user.update(
            where={"id": ctx.user.id},
            data={
                "name": name,
            },
        )
    except errors.UniqueViolationError:
        return {"error": "Name already in use"}
    return {}


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
    return {}


@method_web(require_login=False)
async def get_space_object(ctx: context.Context, id: str) -> Dict:
    obj = await ctx.prisma.spaceobject.find_unique(where={"id": id})
    if ctx.user:
        orbits = await get_orbit_calculations_batch(
            [obj], ctx.user.timezone, ctx.user.lat, ctx.user.lon, ctx.user.elevation
        )
    else:
        orbits = await get_orbit_calculations_batch(
            [obj], DEFAULT_TZ, DEFAULT_LAT, DEFAULT_LON, DEFAULT_ELEVATION
        )
    return {**_space_object_to_dict(obj, expand=True), "orbits": orbits}


@method_web(require_login=False)
async def get_space_object_details(ctx: context.Context, id: str) -> Dict:
    obj = await ctx.prisma.spaceobject.find_unique(where={"id": id})
    if ctx.user:
        long_term_details = await get_longterm_orbit_calculations_batch(
            obj,
            ctx.user.timezone,
            ctx.user.lat,
            ctx.user.lon,
            ctx.user.elevation,
        )
    else:
        long_term_details = await get_longterm_orbit_calculations_batch(
            obj,
            DEFAULT_TZ,
            DEFAULT_LAT,
            DEFAULT_LON,
            DEFAULT_ELEVATION,
        )
    return {"details": long_term_details}


@method_web(require_login=False)
async def get_space_object_current(ctx: context.Context, id: str) -> Dict:
    obj = await ctx.prisma.spaceobject.find_unique(where={"id": id})
    if ctx.user:
        current_details = await methods_cpu.get_current_orbit_calculations.remote(
            object=obj, timezone=ctx.user.timezone, lat=ctx.user.lat, lon=ctx.user.lon, elevation=ctx.user.elevation
        )
    else:
        current_details = await methods_cpu.get_current_orbit_calculations.remote(
            object=obj, timezone=DEFAULT_TZ, lat=DEFAULT_LAT, lon=DEFAULT_LON, elevation=DEFAULT_ELEVATION
        )
    return {**current_details}


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
    objs = [obj.SpaceObject for obj in list_.objects]
    if ctx.user:
        orbits = await get_orbit_calculations_batch(
            objs, ctx.user.timezone, ctx.user.lat, ctx.user.lon, ctx.user.elevation
        )
    else:
        orbits = await get_orbit_calculations_batch(
            objs, DEFAULT_TZ, DEFAULT_LAT, DEFAULT_LON, DEFAULT_ELEVATION
        )
    return {**_list_to_dict(list_), "orbits": orbits}


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
    return {
        "list_ids_to_add": list_ids_to_add,
        "list_ids_to_remove": list_ids_to_remove,
        "new_list_id": str(new_list.id) if new_list else None,
        "list_ids_deleted": list_ids_deleted,
    }


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
    objs = list({obj.id: obj for obj in objs}.values())[:20]
    orbits = await get_orbit_calculations_batch(
        objs,
        ctx.user.timezone,
        ctx.user.lat,
        ctx.user.lon,
        ctx.user.elevation,
        resolution_mins=10,
    )
    return {"objects": [_space_object_to_dict(obj) for obj in objs], "orbits": orbits}


@method_web()
async def get_location_details(ctx: context.Context, weather_data: Dict) -> Dict:
    week = await methods_cpu.get_week_info_with_weather_data.remote(
        weather_data=weather_data,
        timezone=ctx.user.timezone,
        lat=ctx.user.lat,
        lon=ctx.user.lon,
        elevation=ctx.user.elevation,
    )
    return {"location_details": week}


@method_web()
async def get_public_lists(ctx: context.Context) -> Dict:
    lists = await ctx.prisma.list.find_many(
        where={"publicTemplate": True},
    )
    return {"lists": [_list_to_dict(list) for list in lists]}


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
    new_equip = await ctx.prisma.equipment.create(
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
    return _equipment_to_dict(new_equip)


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
    return {"deleted": True}


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
    return {"updated": True}
