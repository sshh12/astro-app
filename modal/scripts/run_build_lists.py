import sys
import os


sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import asyncio
import argparse
from prisma import Prisma
from prisma.enums import Color
import methods


LISTS = {
    (
        "Messier Objects",
        "/list_icons/messier.jpg",
        "https://en.wikipedia.org/wiki/Messier_object",
        Color.BLUE,
    ): [f"M {i}" for i in range(1, 111)],
}


async def main(args):
    prisma = Prisma()
    await prisma.connect()

    await prisma.list.delete_many(where={"publicTemplate": True})

    for (title, img, credit, color), obj_names in LISTS.items():
        print("Building", title, "list...")
        objs = await asyncio.gather(
            *[
                methods.query_and_import_simbad(
                    prisma, obj_name, override_name=obj_name
                )
                for obj_name in obj_names
            ]
        )
        obj_ids = [obj.id for obj in objs]
        await prisma.list.create(
            data={
                "title": title,
                "color": color,
                "credit": credit,
                "imgURL": img,
                "publicTemplate": True,
                "objects": {"create": [{"spaceObjectId": objId} for objId in obj_ids]},
            },
        )


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    args = parser.parse_args()
    # assert input("> ") == "build-lists"
    asyncio.run(main(args))
