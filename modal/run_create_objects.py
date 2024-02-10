from typing import List
import asyncio
import argparse
from prisma import Prisma
from prisma.enums import SpaceObjectType

import methods


SOLAR_SYSTEM = {
    "sun": "Sun",
    "mercury": "Mercury",
    "venus": "Venus",
    "mars": "Mars",
    "jupiter barycenter": "Jupiter",
    "saturn": "Saturn",
    "uranus": "Uranus",
    "neptune": "Neptune",
    "pluto": "Pluto",
    "moon": "Moon",
}

DEEP_SPACE = {"Polaris", "M 31", "M 42"}


async def create_list(prisma: Prisma, title: str, items: List):
    list_ = await prisma.list.find_first(where={"title": title, "commonTemplate": True})
    if list_ is None:
        list_ = await prisma.list.create(
            {
                "title": title,
                "commonTemplate": True,
            }
        )
    for item_name in items:
        obj = await prisma.spaceobject.find_first(where={"name": item_name})
        try:
            await prisma.spaceobjectsonlists.create(
                {
                    "listId": list_.id,
                    "spaceObjectId": obj.id,
                }
            )
        except Exception:
            continue


async def main():
    prisma = Prisma()
    await prisma.connect()

    for key, name in SOLAR_SYSTEM.items():
        try:
            await prisma.spaceobject.create(
                data={
                    "name": name,
                    "searchKey": methods.clean_search_term(name),
                    "solarSystemKey": key,
                    "type": SpaceObjectType.SOLAR_SYSTEM_OBJECT,
                },
            )
        except Exception:
            continue

    for obj_name in DEEP_SPACE:
        await methods.query_and_import_simbad(prisma, obj_name)

    await create_list(prisma, "Favorites", ["Sun", "Moon", "Jupiter", "M 31", "M 42"])
    await create_list(prisma, "Beginner Objects", ["Moon"])

    await prisma.disconnect()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    args = parser.parse_args()
    asyncio.run(main())
