from prisma import Prisma, models
import context
import random

METHODS = {}


def method(require_login: bool = True):
    def wrap(func):
        async def wrapper(ctx: context.Context, **kwargs):
            if require_login and not ctx.user:
                return {"error": "Not logged in"}
            return await func(ctx, **kwargs)

        METHODS[func.__name__] = wrapper

    return wrap


def _gen_api_key() -> str:
    alphabet = "abcdefghjkmnpqrstuvABCDEFGHJKMNPQRSTUVWXYZ23456789"
    return "".join(random.choice(alphabet) for _ in range(16))


def _gen_name() -> str:
    alphabet = "123456789"
    return "astro-" + "".join(random.choice(alphabet) for _ in range(8))


def _user_to_dict(user: models.User) -> dict:
    return {
        "name": user.name,
        "timezone": user.timezone,
        "lat": user.lat,
        "lon": user.lon,
    }


async def _create_user(prisma: Prisma) -> models.User:
    new_user = await prisma.user.create(
        data={
            "name": _gen_name(),
            "apiKey": _gen_api_key(),
            "timezone": "America/Los_Angeles",
            "lat": 34.11833,
            "lon": 118.300333,
        },
    )
    return new_user


@method(require_login=False)
async def create_user(ctx: context.Context) -> dict:
    user = await _create_user(ctx.prisma)
    return {"api_key": user.apiKey, **_user_to_dict(user)}


@method()
async def get_user(ctx: context.Context) -> dict:
    return {**_user_to_dict(ctx.user)}
