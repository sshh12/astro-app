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
    mounts=[modal.Mount.from_local_python_packages("context", "methods", "space_util")],
)
@modal.web_endpoint(method="POST")
async def backend(args: BackendArgs):
    from prisma import Prisma
    import context
    import methods
    import datetime

    prisma = Prisma()
    try:
        await prisma.connect(timeout=datetime.timedelta(seconds=10))
    except Exception as e:
        print("Failed to connect to database, retrying", e)
        await prisma.connect(timeout=datetime.timedelta(seconds=10))

    async with context.Context(prisma, args.api_key) as ctx:
        result = await methods.METHODS[args.func](ctx, **args.args)

    return Response(content=json.dumps(result), media_type="application/json")
