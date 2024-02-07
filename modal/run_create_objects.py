import asyncio
import argparse
from prisma import Prisma
from prisma.enums import SpaceObjectType


async def main():
    prisma = Prisma()
    await prisma.connect()

    await prisma.spaceobject.create(
        data={
            "name": "Sun",
            "searchKey": "sun",
            "solarSystemKey": "sun",
            "type": SpaceObjectType.SOLAR_SYSTEM_OBJECT,
        },
    )

    await prisma.disconnect()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    args = parser.parse_args()
    asyncio.run(main())
