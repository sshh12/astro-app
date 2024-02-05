from typing import Dict
import json

import modal
from pydantic import BaseModel
from fastapi import Response
from modal_base import image_base, stub
import date_util


class BackendArgs(BaseModel):
    func: str
    args: Dict


"""
fetch("https://sshh12--astro-app-backend.modal.run/", {
    method: "POST", 
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({func: "test", args: {}})
}).then(resp => resp.json()).then(console.log)
"""


@stub.function(
    secret=modal.Secret.from_name("astro-app-secret"),
    image=image_base,
)
@modal.web_endpoint(method="POST")
async def backend(args: BackendArgs):
    # from prisma import Prisma
    # import datetime

    # prisma = Prisma()
    # await prisma.connect()
    # user = await prisma.user.find_first(where={"apiKey": args.apiKey})
    # if user is None:
    #     raise RuntimeError()

    return Response(
        content=json.dumps(dict(date_util.get_resp())), media_type="application/json"
    )
