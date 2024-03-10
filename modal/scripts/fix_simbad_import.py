import sys
import os

sys.path.append(os.path.dirname(__file__) + "/../")
import asyncio
import argparse
from prisma import Prisma
import aiohttp
import re


async def main(args):
    prisma = Prisma()
    await prisma.connect()

    space_objects = await prisma.spaceobject.find_many(
        where={"simbadName": {"not": None}, "sizeMajor": None}
    )
    for object in space_objects:
        print(object.simbadName)
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"https://simbad.cds.unistra.fr/simbad/sim-basic?Ident={object.simbadName}&submit=SIMBAD+search&output.format=ASCII"
            ) as response:
                output = await response.text()
        try:
            simbad_title = re.search(r"Object ([\s\S]+?)  ---", output).group(1).strip()
        except AttributeError:
            print(f"Could not find simbad result for {simbad_title}")
            continue
        assert (
            object.simbadName == simbad_title
        ), f"{object.simbadName} != {simbad_title}"

        flux_v_match = re.search(r"Flux V : ([\d\.]+) ", output)
        flux_v = float(flux_v_match.group(1)) if flux_v_match else None

        size_match = re.search(
            r"Angular size:\s+([\d\.]+)\s+([\d\.]+)\s+([\d\.]+) ", output
        )
        if size_match:
            size_major = float(size_match.group(1))
            size_minor = float(size_match.group(2))
            size_pa = float(size_match.group(3))
        else:
            size_match = re.search(r"Angular size: ([\d\.]+) ([\d\.]+)   ~", output)
            if size_match:
                size_major = float(size_match.group(1))
                size_minor = float(size_match.group(2))
                size_pa = None
            else:
                size_major = None
                size_minor = None
                size_pa = None

        data = {
            "fluxV": flux_v,
            "sizeMajor": size_major,
            "sizeMinor": size_minor,
            "sizeAngle": size_pa,
        }

        print("-> fluxV", flux_v, "size", size_major, size_minor, size_pa)

        if not args.dry and any(data.values()):
            await prisma.spaceobject.update(
                where={"id": object.id},
                data={k: v for k, v in data.items() if v is not None},
            )
            print("-> updated")

    await prisma.disconnect()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry", action="store_true")
    args = parser.parse_args()
    assert args.dry or input("> ") == "yes"
    asyncio.run(main(args))
