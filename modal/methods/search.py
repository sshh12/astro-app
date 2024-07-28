from typing import Dict, List
from prisma import models
import context
import openai
import os
import asyncio

from methods.base import method_web, clean_search_term
from methods.encodings import user_to_text
from methods.simbad import query_and_import_simbad
from methods.encodings import (
    space_object_to_dict,
)


async def _search_by_term(ctx: context.Context, term: str) -> List[models.SpaceObject]:
    term = clean_search_term(term)
    objs = await ctx.prisma.spaceobject.find_many(
        where={"searchKey": {"contains": term}}
    )
    try:
        obj = await query_and_import_simbad(ctx.prisma, term)
        objs.append(obj)
    except Exception as e:
        print(e)
    objs = list({obj.id: obj for obj in objs}.values())[:10]
    return {"objects": [space_object_to_dict(obj) for obj in objs]}


async def _prompt_to_object_names(prompt: str, user_text: str) -> List[str]:
    client = openai.AsyncClient(api_key=os.environ["OPENAI_API_KEY"])
    resp = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": """
You are an astronomy enthusiast who helps others find interesting objects in the sky.

Given a query of user preferences, respond with a brief analysis and then the names of objects (typically 3 - 20).

You MUST format your result as a comma-separated list of catalog names OR planet names at the very end (e.g. "M31, M42, M45, Saturn").
""".strip(),
            },
            {
                "role": "user",
                "content": f"""
## My Question
{prompt}

## About Me
{user_text}

## Task
Respond with a comma-separated list of catalog names OR planet names at the very end (e.g. "M31, M42, M45, Saturn").
""",
            },
        ],
    )
    resp = resp.choices[0].message.content
    print("SearchGPT", resp)

    return list(set(resp.strip().split("\n")[-1].split(", ")))


async def _search_by_prompt(
    ctx: context.Context, prompt: str
) -> List[models.SpaceObject]:
    user_text = user_to_text(ctx.user)
    names = await _prompt_to_object_names(prompt, user_text)
    objs = await asyncio.gather(
        *[
            query_and_import_simbad(ctx.prisma, name, ignore_error=True)
            for name in names
        ]
    )
    objs = [obj for obj in objs if obj is not None]
    return objs


@method_web()
async def search(ctx: context.Context, term: str, prompt: str) -> Dict:
    print("search/", repr(term), repr(prompt))
    objs = None
    if term:
        objs = await _search_by_term(ctx, term)
    elif prompt:
        objs = await _search_by_prompt(ctx, prompt)
    if objs is not None:
        return {"objects": [space_object_to_dict(obj) for obj in objs]}
    else:
        return {"error": "No search term or prompt"}
