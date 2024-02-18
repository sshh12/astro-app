import asyncio
import argparse
from prisma import Prisma


async def main(args):
    prisma = Prisma()
    await prisma.connect()

    if args.drop:
        await prisma.listsonusers.delete_many()
        await prisma.spaceobjectsonusers.delete_many()
        await prisma.spaceobjectsonlists.delete_many()
        await prisma.list.delete_many()
        await prisma.user.delete_many()
        await prisma.spaceobject.delete_many()

    users = await prisma.user.find_many()
    for user in users:
        print(user)

    objects = await prisma.spaceobject.find_many()
    for obj in objects:
        print(obj)

    lists = await prisma.list.find_many()
    for list_ in lists:
        print(list_)

    await prisma.disconnect()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--drop", action="store_true")
    args = parser.parse_args()
    asyncio.run(main(args))
