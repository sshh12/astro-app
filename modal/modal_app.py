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
    retries=1,
    container_idle_timeout=300,
)
@modal.web_endpoint(method="POST")
async def backend(args: BackendArgs):
    from prisma import Prisma
    import context
    import methods
    import datetime

    prisma = Prisma(connect_timeout=datetime.timedelta(seconds=10))
    for i in range(10):
        print("connecting", i)
        try:
            await prisma.connect()
        except Exception as e:
            print("...failed", i, e)
        else:
            print("connected!")
            break

    async with context.Context(prisma, args.api_key) as ctx:
        result = await methods.METHODS[args.func](ctx, **args.args)

    return Response(content=json.dumps(result), media_type="application/json")
