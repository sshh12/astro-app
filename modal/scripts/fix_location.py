import sys
import os

sys.path.append(os.path.dirname(__file__) + "/../")
import asyncio
import argparse
import tqdm
from prisma import Prisma


def chunk(lst, n):
    for i in range(0, len(lst), n):
        yield lst[i : i + n]


async def main(args):
    prisma = Prisma()
    await prisma.connect()

    users = await prisma.user.find_many()

    # await prisma.location.delete_many()

    for user in tqdm.tqdm(users):
        try:
            await prisma.location.create(
                data={
                    "userId": user.id,
                    "active": True,
                    "name": "Home",
                    "lat": user.lat,
                    "lon": user.lon,
                    "elevation": user.elevation,
                    "timezone": user.timezone,
                },
            )
        except Exception as e:
            print(user.id, user.__dict__, e)

    await prisma.disconnect()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    args = parser.parse_args()
    assert input("> ") == "yes"
    asyncio.run(main(args))
