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


@stub.cls(
    secrets=[modal.Secret.from_name("astro-app-secret")],
    image=image_base,
    mounts=[modal.Mount.from_local_python_packages("context", "methods_web")],
    container_idle_timeout=500,
    allow_concurrent_inputs=10,
    cpu=0.25,
)
class AstroApp:
    @modal.enter()
    async def open_connection(self):
        from prisma import Prisma

        self.prisma = Prisma()
        await self.prisma.connect()

    @modal.web_endpoint(method="POST", label="astro-app-backend")
    async def backend(self, args: BackendArgs):
        import context
        import methods_web

        async with context.Context(self.prisma, args.api_key) as ctx:
            result = await methods_web.METHODS[args.func](ctx, **args.args)

        return Response(content=json.dumps(result), media_type="application/json")

    @modal.exit()
    async def close_connection(self):
        await self.prisma.disconnect()
