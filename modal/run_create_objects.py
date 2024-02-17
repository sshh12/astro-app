from typing import List
import asyncio
import argparse
import random
from prisma import Prisma
from prisma.enums import SpaceObjectType, Color

import methods


SOLAR_SYSTEM = {
    "Sun": ("sun", Color.YELLOW),
    "Mercury": ("mercury", Color.GRAY),
    "Venus": ("venus", Color.ORANGE),
    "Mars": ("mars", Color.RED),
    "Jupiter": ("jupiter barycenter", Color.ORANGE),
    "Saturn": ("saturn barycenter", Color.YELLOW),
    "Uranus": ("uranus barycenter", Color.CYAN),
    "Neptune": ("neptune barycenter", Color.BLUE),
    "Pluto": ("pluto barycenter", Color.GRAY),
    "Moon": ("moon", Color.GRAY),
}

SOLAR_SYSTEM_NAMES = list(SOLAR_SYSTEM.keys())

LISTS = {
    "Favorites": ["Sun", "Moon", "Jupiter", "Andromeda", "Great Orion Nebula"],
    "Beginner Deep Space Objects": [
        "Andromeda",
        "Great Orion Nebula",
        "Crab Nebula",
        "Pleiades",
        "Horsehead Nebula",
    ],
    "Solar System": SOLAR_SYSTEM_NAMES,
}


async def create_list(prisma: Prisma, title: str, items: List):
    list_ = await prisma.list.find_first(where={"title": title, "commonTemplate": True})
    if list_ is None:
        list_ = await prisma.list.create(
            {
                "title": title,
                "commonTemplate": True,
                "color": random.choice(list(Color)),
            }
        )
    for item_name in items:
        if item_name not in SOLAR_SYSTEM_NAMES:
            obj = await methods.query_and_import_simbad(
                prisma, item_name, override_name=item_name
            )
        obj = await prisma.spaceobject.find_first(where={"name": item_name})
        try:
            await prisma.spaceobjectsonlists.create(
                {
                    "listId": list_.id,
                    "spaceObjectId": obj.id,
                }
            )
        except Exception as e:
            print("Error", title, item_name, e)
            continue


async def main():
    prisma = Prisma()
    await prisma.connect()

    for name, (key, color) in SOLAR_SYSTEM.items():
        try:
            await prisma.spaceobject.create(
                data={
                    "name": name,
                    "names": [f"NAME {name}"],
                    "searchKey": methods.clean_search_term(name),
                    "solarSystemKey": key,
                    "type": SpaceObjectType.SOLAR_SYSTEM_OBJECT,
                    "color": color,
                },
            )
        except Exception:
            continue

    for list_name, items in LISTS.items():
        await create_list(prisma, list_name, items)

    await prisma.disconnect()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    args = parser.parse_args()
    asyncio.run(main())
