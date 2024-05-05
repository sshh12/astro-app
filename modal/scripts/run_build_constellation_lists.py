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
                "objects": [methods_web._space_object_to_dict(obj) for obj in objs],
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


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry", action="store_true")
    args = parser.parse_args()
    assert args.dry or input("> ") == "yes"
    asyncio.run(main(args))
