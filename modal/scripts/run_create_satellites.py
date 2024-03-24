import sys
import os


sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import asyncio
import argparse
import random
from prisma import Prisma
from prisma.enums import SpaceObjectType, Color
import methods_web
import space_util


async def main(args):
    prisma = Prisma()
    await prisma.connect()

    sats = space_util.get_satellites()

    for sat in sats.values():
        name = sat.name
        names = ["SATNUM " + str(sat.model.satnum), name]
        key = methods_web.build_search_key(name, names)
        data = {
            "name": name,
            "names": names,
            "searchKey": key,
            "celestrakKey": sat.name,
            "type": SpaceObjectType.EARTH_SATELLITE,
            "color": random.choice(list(Color)),
            "fluxV": None,
        }
        print(data)
        if not args.dry:
            await prisma.spaceobject.create(
                data=data,
            )

    await prisma.disconnect()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry", action="store_true")
    args = parser.parse_args()
    assert args.dry or input("> ") == "yes"
    asyncio.run(main(args))
