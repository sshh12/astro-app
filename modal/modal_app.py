from typing import Any
import json

import modal
from pydantic import BaseModel
from modal_base import image_base, stub


class BackendArgs(BaseModel):
    func: str
    args: Any


"""
fetch("https://sshh12--astro-app-backend.modal.run/", {
    method: "POST", 
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({func: "test", args: {}})
}).then(resp => resp.text()).then(console.log)
"""


@stub.function(
    # secret=modal.Secret.from_name("llm-chat-secret"),
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

    return json.dumps({"result": "success", "args": repr(args)})
