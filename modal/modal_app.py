from typing import Any

import modal
from pydantic import BaseModel
from modal_base import image_base, stub


class BackendArgs(BaseModel):
    func: str
    args: Any


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

    return {"result": "success"}
