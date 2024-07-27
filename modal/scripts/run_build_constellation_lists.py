import sys
import os


sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import asyncio
import argparse
import json
from prisma import Prisma
from prisma.enums import Color, ListType
import methods_web

CACHE_FN = "spaceobject.cache.json"

LISTS = {
    (
        "Andromeda",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [
        ["Almach", "Mirach"],
        ["Mirach", "delta And"],
        ["delta And", "Alpheratz"],
        ["Mirach", "mu And"],
        ["mu And", "nu And"],
    ],
    (
        "Antlia",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [
        ["alpha Ant", "eta Ant"],
    ],
    (
        "Apus",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [
        ["beta Aps", "gamma Aps"],
        ["gamma Aps", "alpha Aps"],
    ],
    (
        "Aquarius",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [
        ["Albali", "Sadalsuud"],
        ["Sadalsuud", "Sadalmelik"],
        ["Sadalmelik", "Ancha"],
        ["Ancha", "iota Aqr"],
        ["Ancha", "sigma Aqr"],
        ["sigma Aqr", "tau Aqr"],
        ["tau Aqr", "Skat"],
        ["Skat", "88 Aquarii"],
        ["Sadalmelik", "gamma Aqr"],
        ["gamma Aqr", "zeta Aqr"],
        ["zeta Aqr", "eta Aqr"],
        ["eta Aqr", "lambda Aqr"],
        ["lambda Aqr", "91 Aquarii"],
        ["91 Aquarii", "98 Aquarii"],
    ],
    (
        "Aquila",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [
        ["delta Aql", "lambda Aql"],
        ["delta Aql", "eta Aql"],
        ["eta Aql", "theta Aql"],
        ["delta Aql", "zeta Aql"],
        ["delta Aql", "Altair"],
        ["Altair", "beta Aql"],
        ["Altair", "Tarazed"],
    ],
    (
        "Ara",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [
        ["alpha Ara", "theta Ara"],
        ["theta Ara", "beta Ara"],
        ["beta Ara", "gamma Ara"],
        ["gamma Ara", "delta Ara"],
        ["delta Ara", "eta Ara"],
        ["eta Ara", "zeta Ara"],
        ["zeta Ara", "alpha Ara"],
    ],
    (
        "Aries",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [
        ["Gamma Arietis", "Sheratan"],
        ["Sheratan", "Hamal"],
        ["Hamal", "41 Arietis"],
    ],
    (
        "Auriga",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [
        ["Capella", "Menkalinan"],
        ["Menkalinan", "theta Aur"],
        ["theta Aur", "Elnath"],
        ["Elnath", "Hassaleh"],
        ["Hassaleh", "zeta Aur"],
        ["zeta Aur", "Capella"],
    ],
    (
        "Boötes",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Caelum",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Camelopardalis",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Cancer",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Canes Venatici",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Canis Major",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Canis Minor",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Capricornus",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Carina",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Cassiopeia",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Centaurus",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Cepheus",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Cetus",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Chamaeleon",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Circinus",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Columba",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Coma Berenices",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Corona Australis",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Corona Borealis",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Corvus",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Crater",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Crux",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Cygnus",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Delphinus",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Dorado",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Draco",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Equuleus",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Eridanus",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Fornax",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Gemini",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Grus",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Hercules",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Horologium",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Hydra",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Hydrus",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Indus",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Lacerta",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Leo",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Leo Minor",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Lepus",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Libra",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Lupus",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Lynx",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Lyra",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Mensa",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Microscopium",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Monoceros",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Musca",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Norma",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Octans",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Ophiuchus",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Orion",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [
        ["Rigel", "Saiph"],
        ["Saiph", "Alnitak"],
        ["Alnitak", "Alnilam"],
        ["Alnilam", "Mintaka"],
        ["Mintaka", "Rigel"],
        ["Alnitak", "Betelgeuse"],
        ["Betelgeuse", "Meissa"],
        ["Meissa", "Bellatrix"],
        ["Bellatrix", "Mintaka"],
        ["Betelgeuse", "mu Ori"],
        ["mu Ori", "xi Ori"],
        ["xi Ori", "64 Ori"],
        ["xi Ori", "nu Ori"],
        ["nu Ori", "Chi1 Orionis"],
        ["Bellatrix", "Pi3 Orionis"],
        ["Pi3 Orionis", "Pi2 Orionis"],
        ["Pi2 Orionis", "Pi1 Orionis"],
        ["Pi3 Orionis", "Pi4 Orionis"],
        ["Pi4 Orionis", "Pi5 Orionis"],
        ["Pi5 Orionis", "Pi6 Orionis"],
    ],
    (
        "Pavo",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Pegasus",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Perseus",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Phoenix",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Pictor",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Pisces",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Piscis Austrinus",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Puppis",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Pyxis",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Reticulum",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Sagitta",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Sagittarius",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Scorpius",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Sculptor",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Scutum",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Serpens",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Sextans",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Taurus",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Telescopium",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Triangulum",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Triangulum Australe",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Tucana",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Ursa Major",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Ursa Minor",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Vela",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Virgo",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Volans",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
    (
        "Vulpecula",
        "/list_icons/constellation.jpg",
        "https://en.wikipedia.org/wiki/IAU_designated_constellations",
        Color.GREEN,
    ): [],
}


async def resolve_object(prisma, obj_name):
    obj = await prisma.spaceobject.find_unique(where={"name": obj_name})
    if not obj:
        obj = await methods_web.query_and_import_simbad(prisma, obj_name)
    if not obj:
        raise Exception("Could not find " + obj_name + " in SIMBAD")
    return obj.id


class Cache:
    def __init__(self):
        self.cache = {}
        if os.path.exists(CACHE_FN):
            with open(CACHE_FN, "r") as f:
                self.cache = json.load(f)

    def get(self, obj_name):
        return self.cache.get(obj_name)

    def set(self, obj_name, obj_id):
        self.cache[obj_name] = obj_id

    def save(self):
        with open(CACHE_FN, "w") as f:
            json.dump(self.cache, f, indent=2)


async def resolve_object_cached(cache: Cache, prisma: Prisma, obj_name: str):
    if obj_id := cache.get(obj_name):
        return (obj_id, obj_name)
    obj_id = await resolve_object(prisma, obj_name)
    cache.set(obj_name, obj_id)
    return (obj_id, obj_name)


async def main(args):
    prisma = Prisma()
    await prisma.connect()

    if not args.dry:
        public_lists = await prisma.list.find_many(
            where={"publicTemplate": True, "type": ListType.CONSTELLATION_GROUP}
        )
        await prisma.spaceobjectsonlists.delete_many(
            where={"listId": {"in": [l.id for l in public_lists]}}
        )
        await prisma.list.delete_many(
            where={"publicTemplate": True, "type": ListType.CONSTELLATION_GROUP}
        )

    cache = Cache()

    constellations_data = []

    for (title, img, credit, color), edges in LISTS.items():
        print("Building", title, "list...")
        obj_names = list(set([edge[0] for edge in edges] + [edge[1] for edge in edges]))
        obj_ids_names = await asyncio.gather(
            *[resolve_object_cached(cache, prisma, obj_name) for obj_name in obj_names]
        )
        names_to_ids = {name: obj_id for obj_id, name in obj_ids_names}
        obj_ids = list(set(names_to_ids.values()))
        objs = await prisma.spaceobject.find_many(where={"id": {"in": obj_ids}})
        constellations_data.append(
            {
                "name": title,
                "edges": [
                    (
                        str(names_to_ids[edge[0]]),
                        str(names_to_ids[edge[1]]),
                    )
                    for edge in edges
                ],
                "objects": [methods_web.space_object_to_dict(obj) for obj in objs],
            }
        )

        cache.save()
        if not args.dry:
            await prisma.list.create(
                data={
                    "title": title,
                    "color": color,
                    "credit": credit,
                    "imgURL": img,
                    "publicTemplate": True,
                    "type": ListType.CONSTELLATION_GROUP,
                    "objects": {
                        "create": [{"spaceObjectId": objId} for objId in obj_ids]
                    },
                },
            )

    with open("../app/data/constellations.js", "w") as f:
        f.write(
            "export const CONSTELLATIONS = "
            + json.dumps(constellations_data, indent=2)
            + ";\n\n"
        )

    lists = await prisma.list.find_many(
        where={"publicTemplate": True},
        include={
            "objects": {
                "include": {
                    "SpaceObject": True,
                }
            },
        },
    )
    with open("../app/data/lists.js", "w") as f:
        f.write(
            "export const LISTS = "
            + json.dumps([methods_web.list_to_dict(list) for list in lists], indent=2)
            + ";\n\n"
        )


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry", action="store_true")
    args = parser.parse_args()
    assert args.dry or input("> ") == "yes"
    asyncio.run(main(args))
