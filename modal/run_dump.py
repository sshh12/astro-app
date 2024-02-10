import asyncio
import argparse
from prisma import Prisma


async def main(args):
    prisma = Prisma()
    await prisma.connect()

    if args.drop:
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

    # from methods import _duplicate_list

    # default_lists = await prisma.list.find_many(
    #     where={
    #         "commonTemplate": True,
    #     },
    #     include={
    #         "objects": {
    #             "include": {
    #                 "SpaceObject": True,
    #             }
    #         }
    #     },
    # )
    # print(await _duplicate_list(prisma, default_lists[0], users[-1]))

    await prisma.disconnect()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--drop", action="store_true")
    args = parser.parse_args()
    asyncio.run(main(args))
