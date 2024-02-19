from prisma import Prisma, models


async def fetch_user(prisma: Prisma, api_key: str) -> models.User:
    user = await prisma.user.find_first(
        where={"apiKey": api_key},
        include={
            "lists": {
                "include": {
                    "List": {
                        "include": {
                            "objects": {
                                "include": {
                                    "SpaceObject": True,
                                }
                            }
                        },
                    },
                },
            },
            "objects": True,
        },
    )
    return user


class Context:
    def __init__(self, api_key: str):
        self.prisma = Prisma()
        self.api_key = api_key

    async def __aenter__(self):
        await self.prisma.connect()
        self.user = await fetch_user(self.prisma, self.api_key)
        return self

    async def __aexit__(self, exc_type, exc, tb):
        if exc:
            raise exc

    async def disconnect(self):
        await self.prisma.disconnect()
