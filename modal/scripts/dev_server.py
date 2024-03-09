import sys
import os


sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from flask import Flask, request, jsonify
from prisma import Prisma
import context
import methods

app = Flask(__name__)


@app.route("/", methods=["POST"])
async def index():
    prisma = Prisma()
    await prisma.connect()
    func_name = request.json["func"]
    func_args = request.json["args"]
    async with context.Context(prisma, request.json["api_key"]) as ctx:
        result = await methods.METHODS[func_name](ctx, **func_args)
    return jsonify(result)


if __name__ == "__main__":
    app.run(debug=True, port=9000)
