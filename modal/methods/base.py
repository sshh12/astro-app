import random
import context
import re
from typing import List
from prisma.enums import Color

ASTRO_APP_BUCKET = "astro-app-io"
ASTRO_APP_BUCKET_PATH = "https://astro-app-io.s3.amazonaws.com/"

METHODS = {}


def method_web(require_login: bool = True):
    def wrap(func):
        async def wrapper(ctx: context.Context, **kwargs):
            if require_login and not ctx.user:
                return {"error": "Not logged in"}
            return await func(ctx, **kwargs)

        METHODS[func.__name__] = wrapper

    return wrap


def random_color() -> Color:
    color = random.choice(list(Color))
    if color in {Color.GRAY, Color.NEUTRAL}:
        return random_color()
    return color


def build_search_key(name: str, names: List[str]) -> str:
    names_full = set(names + [name])
    key = "|".join(clean_search_term(name) for name in names_full)
    return key


def clean_search_term(term: str) -> str:
    if term.startswith("NAME "):
        term = term[5:]
    return re.sub(r"[^\w0-9]+", "", term.lower())
