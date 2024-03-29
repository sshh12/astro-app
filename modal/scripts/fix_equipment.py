import sys
import os

sys.path.append(os.path.dirname(__file__) + "/../")
import asyncio
import argparse
import tqdm
from prisma import Prisma

import methods_web


def chunk(lst, n):
    for i in range(0, len(lst), n):
        yield lst[i : i + n]


async def main(args):
    prisma = Prisma()
    await prisma.connect()

    users = await prisma.user.find_many()

    # await prisma.equipment.delete_many()

    for user in tqdm.tqdm(users):
        await methods_web._create_default_equipment(prisma, user)

    await prisma.disconnect()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    args = parser.parse_args()
    assert input("> ") == "yes"
    asyncio.run(main(args))
