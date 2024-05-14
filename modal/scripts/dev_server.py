import sys
import os


sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from flask import Flask, request, jsonify
from flask_cors import CORS
from prisma import Prisma
import context
import methods_web

app = Flask(__name__)
CORS(app)


@app.route("/", methods=["POST"])
async def index():
    prisma = Prisma()
    await prisma.connect()
    func_name = request.json["func"]
    func_args = request.json["args"]
    print("start", func_name)
    async with context.Context(prisma, request.json["api_key"]) as ctx:
        result = await methods_web.METHODS[func_name](ctx, **func_args)
    print("end", func_name)
    return jsonify(result)


if __name__ == "__main__":
    app.run(debug=True, port=9000)
