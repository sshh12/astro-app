from typing import Dict
import json

import modal
from pydantic import BaseModel
from fastapi import Response
from modal_base import image_base, stub

import context
import date_util


class BackendArgs(BaseModel):
    func: str
    apiKey: str
    args: Dict


@stub.function(
    secret=modal.Secret.from_name("astro-app-secret"),
    image=image_base,
)
@modal.web_endpoint(method="POST")
async def backend(args: BackendArgs):

    async with context.Context(args.apiKey) as ctx:
        pass

    return Response(
        content=json.dumps(dict(date_util.get_resp())), media_type="application/json"
    )
