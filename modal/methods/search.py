from typing import Dict, List
from prisma import models
import context
import openai
import os
import json
import asyncio
from pydantic import BaseModel

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
    return objs


class SearchOutput(BaseModel):
    deep_sky_object_ids: List[str]
    planet_names: List[str]
    comet_ids: List[str]


async def _prompt_to_object_names(prompt: str, user_text: str) -> List[str]:
    client = openai.AsyncClient(api_key=os.environ["OPENAI_API_KEY"])
    resp = await client.beta.chat.completions.parse(
        model="gpt-4o-mini",
        temperature=0.1,
        response_format={
            "type": "json_schema",
            "json_schema": {
                "name": "search_output",
                "strict": True,
                "schema": {
                    "type": "object",
                    "properties": {
                        "analysis": {
                            "type": "string",
                            "description": "Brief analysis including what types of objects are best given the users location and equipment.'",
                        },
                        "deep_sky_object_catalog_ids": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "The catalog names of deep sky objects you recommend. E.g. NGC 1234, M 31, IC 343. Empty list if none applicable.",
                        },
                        "planet_names": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "The names of planets you recommend. E.g. Mars, Venus, Jupiter. Empty list if none applicable.",
                        },
                    },
                    "additionalProperties": False,
                    "required": [
                        "analysis",
                        "deep_sky_object_catalog_ids",
                        "planet_names",
                    ],
                },
            },
        },
        messages=[
            {
                "role": "system",
                "content": """
You are an astronomy enthusiast who helps others find interesting objects in the sky.

Given a query of user preferences, respond with a brief analysis and then the names of objects (typically 3 - 20).

You MUST format your result as a json based on the specified schema.
""".strip(),
            },
            {
                "role": "user",
                "content": f"""
## About Me
{user_text}
                
## My Question
{prompt}
""".strip(),
            },
        ],
    )
    output = json.loads(resp.choices[0].message.content)
    print("SearchGPT", output)

    items = []
    for ids in output.values():
        items.extend(ids)

    return list(set(items))


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
