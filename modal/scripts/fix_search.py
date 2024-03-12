import sys
import os

sys.path.append(os.path.dirname(__file__) + "/../")
import asyncio
import argparse
from prisma import Prisma
import methods


async def main(args):
    prisma = Prisma()
    await prisma.connect()

    space_objects = await prisma.spaceobject.find_many()
    for space_object in space_objects:
        print(space_object.name)
        names = set(space_object.names + [space_object.name])
        key = "|".join(methods.clean_search_term(name) for name in names)
        print(key)

        if key != space_object.searchKey:
            print(space_object.searchKey, "=>", key)
            if not args.dry:
                await prisma.spaceobject.update(
                    where={"id": space_object.id}, data={"searchKey": key}
                )

    await prisma.disconnect()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry", action="store_true")
    args = parser.parse_args()
    assert args.dry or input("> ") == "yes"
    asyncio.run(main(args))
