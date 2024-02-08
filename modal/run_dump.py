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

    # from methods import _user_to_dict

    # user = await prisma.user.find_first(
    #     where={"name": "astro-79736868"},
    #     include={
    #         "lists": {
    #             "include": {
    #                 "List": {
    #                     "include": {
    #                         "objects": {
    #                             "include": {
    #                                 "SpaceObject": True,
    #                             }
    #                         }
    #                     },
    #                 },
    #             },
    #         },
    #         "objects": True,
    #     },
    # )
    # print(_user_to_dict(user))
    # from methods import query_and_import_simbad

    # print(await query_and_import_simbad(prisma, "Polaris"))

    await prisma.disconnect()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--drop", action="store_true")
    args = parser.parse_args()
    asyncio.run(main(args))
