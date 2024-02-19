from typing import Dict
import json

import modal
from pydantic import BaseModel
from fastapi import Response
from modal_base import image_base, stub

import context
import methods


class BackendArgs(BaseModel):
    func: str
    api_key: str
    args: Dict


@stub.function(
    secrets=[modal.Secret.from_name("astro-app-secret")],
    image=image_base,
)
@modal.web_endpoint(method="POST")
async def backend(args: BackendArgs):

    async with context.Context(args.api_key) as ctx:
        result = await methods.METHODS[args.func](ctx, **args.args)

    await ctx.disconnect()

    return Response(content=json.dumps(result), media_type="application/json")
