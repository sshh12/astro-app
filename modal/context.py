from prisma import Prisma


class Context:
    def __init__(self, api_key: str):
        self.prisma = Prisma()
        self.api_key = api_key

    async def __aenter__(self):
        await self.prisma.connect()
        self.user = await self.prisma.user.find_first(where={"apiKey": self.api_key})
        return self

    async def __aexit__(self, exc_type, exc, tb):
        if exc:
            raise exc
