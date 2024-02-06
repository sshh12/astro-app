from prisma import Prisma, models
import random


def gen_api_key() -> str:
    alphabet = "abcdefghjkmnpqrstuvABCDEFGHJKMNPQRSTUVWXYZ23456789"
    return "".join(random.choice(alphabet) for _ in range(16))


def gen_name() -> str:
    alphabet = "123456789"
    return "astro" + "-".join(random.choice(alphabet) for _ in range(8))


async def create_user(prisma: Prisma) -> models.User:
    new_user = await prisma.user.create(
        data={
            "name": gen_name(),
            "apiKey": gen_api_key(),
        },
    )
    return new_user


class Context:
    def __init__(self, api_key: str):
        self.prisma = Prisma()
        self.api_key = api_key

    async def __aenter__(self):
        await self.prisma.connect()
        user = await self.prisma.user.find_first(where={"apiKey": self.api_key})
        print(user)
        return self

    async def __aexit__(self, exc_type, exc, tb):
        self.prisma.disconnect()
        if exc:
            raise exc
