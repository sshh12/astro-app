from typing import Dict
import json

import modal
from pydantic import BaseModel
from fastapi import Response
from modal_base import image_base, stub


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
    from prisma import Prisma
    import context
    import methods

    prisma = Prisma()
    await prisma.connect()

    async with context.Context(args.api_key) as ctx:
        result = await methods.METHODS[args.func](ctx, **args.args)

    return Response(content=json.dumps(result), media_type="application/json")
