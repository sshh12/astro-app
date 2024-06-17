import sys
import os


sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import asyncio
import argparse
import json
from prisma import Prisma
import methods_web


async def main(args):
    prisma = Prisma()
    await prisma.connect()

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
    with open("../astro-app-ui/src/constants/lists.js", "w") as f:
        list_dicts = [methods_web._list_to_dict(list) for list in lists]
        list_dicts = [
            ld
            for ld in list_dicts
            if len(ld.get("objects", [])) > 0 and ld["type"] == "CURATED_LIST"
        ]
        f.write(
            "export const CURATED_LISTS = " + json.dumps(list_dicts, indent=2) + ";\n\n"
        )


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    args = parser.parse_args()
    asyncio.run(main(args))
