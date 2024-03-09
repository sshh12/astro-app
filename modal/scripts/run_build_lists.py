import sys
import os


sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import asyncio
import argparse
import json
from prisma import Prisma
from prisma.enums import Color
import methods

CACHE_FN = "spaceobject.cache.json"

LISTS = {
    (
        "Messier Objects",
        "/list_icons/messier.jpg",
        "https://en.wikipedia.org/wiki/Messier_object",
        Color.BLUE,
    ): [f"M {i}" for i in range(1, 111)],
}


async def resolve_object(prisma, obj_name):
    obj = await prisma.spaceobject.find_unique(where={"name": obj_name})
    if not obj:
        obj = await methods.query_and_import_simbad(prisma, obj_name)
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
        return obj_id
    obj_id = await resolve_object(prisma, obj_name)
    cache.set(obj_name, obj_id)
    return obj_id


async def main(args):
    prisma = Prisma()
    await prisma.connect()

    if not args.dry:
        public_lists = await prisma.list.find_many(where={"publicTemplate": True})
        await prisma.spaceobjectsonlists.delete_many(
            where={"listId": {"in": [l.id for l in public_lists]}}
        )
        await prisma.list.delete_many(where={"publicTemplate": True})

    cache = Cache()

    for (title, img, credit, color), obj_names in LISTS.items():
        print("Building", title, "list...")
        obj_ids = await asyncio.gather(
            *[resolve_object_cached(cache, prisma, obj_name) for obj_name in obj_names]
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
                    "objects": {
                        "create": [{"spaceObjectId": objId} for objId in obj_ids]
                    },
                },
            )


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry", action="store_true")
    args = parser.parse_args()
    # assert input("> ") == "build-lists"
    asyncio.run(main(args))
