import sys
import os

sys.path.append(os.path.dirname(__file__) + "/../")
import asyncio
import argparse
from prisma import Prisma

from methods import DEFAULT_LISTS

TEMP_PREFIX = "TEMP+++"


def chunk(lst, n):
    for i in range(0, len(lst), n):
        yield lst[i : i + n]


async def main(args):
    prisma = Prisma()
    await prisma.connect()

    users = await prisma.user.find_many()

    user_ids = [user.id for user in users]
    for (title, color), list_obj_ids in DEFAULT_LISTS.items():
        print("Clearing", title)
        existing_lists = await prisma.list.find_many(where={"title": title})
        existing_lists += await prisma.list.find_many(
            where={"title": TEMP_PREFIX + title}
        )
        for existing_lists_chunk in chunk(existing_lists, 1000):
            await prisma.listsonusers.delete_many(
                where={"listId": {"in": [list_.id for list_ in existing_lists_chunk]}}
            )

        lists_to_create = []
        for _ in users:
            lists_to_create.append(
                {
                    "title": TEMP_PREFIX + title,
                    "color": color,
                }
            )

        print("Building...")
        for lists_to_create_chunk in chunk(lists_to_create, 1000):
            await prisma.list.create_many(data=lists_to_create_chunk)
        lists = await prisma.list.find_many(where={"title": TEMP_PREFIX + title})
        print(f"Expected {len(users)} lists, got {len(lists)}.")

        print("Building users...")
        list_users_to_create = []
        for list_, user_id in zip(lists, user_ids):
            list_users_to_create.append({"userId": user_id, "listId": list_.id})
        for list_users_to_create_chunk in chunk(list_users_to_create, 1000):
            await prisma.listsonusers.create_many(data=list_users_to_create_chunk)

        print("Building objects...")
        list_objects_to_create = []
        for list_ in lists:
            for obj_id in list_obj_ids:
                list_objects_to_create.append(
                    {"spaceObjectId": obj_id, "listId": list_.id}
                )
        for list_objects_to_create_chunk in chunk(list_objects_to_create, 1000):
            await prisma.spaceobjectsonlists.create_many(
                data=list_objects_to_create_chunk
            )

        print("Fixing titles...")
        await prisma.list.update_many(
            where={"title": TEMP_PREFIX + title},
            data={"title": title},
        )

    await prisma.disconnect()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    args = parser.parse_args()
    assert input("> ") == "fix-lists"
    asyncio.run(main(args))
