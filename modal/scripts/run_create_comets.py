import sys
import os


sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from typing import List
import asyncio
import argparse
import random
import math
from prisma import Prisma
from prisma.enums import SpaceObjectType, Color
from skyfield.api import load
from skyfield.data import mpc
import re

import methods_web


def comet_apparent_magnitude_at_perihelion(
    magnitude_g, magnitude_k, perihelion_distance_au
):
    """
    Calculate the apparent magnitude of a comet at perihelion.

    Parameters:
    magnitude_g (float): The absolute magnitude of the comet's nucleus.
    magnitude_k (float): The slope parameter indicating the comet's activity.
    perihelion_distance_au (float): The distance from the comet to the Sun at perihelion in astronomical units.

    Returns:
    float: The approximate apparent magnitude of the comet at perihelion.
    """
    # Assuming the Earth-comet distance (D) is 1 AU at perihelion for simplicity
    D = 1.0
    apparent_magnitude = (
        magnitude_g
        + 5 * math.log10(D)
        + magnitude_k * math.log10(perihelion_distance_au)
    )
    return apparent_magnitude


async def main():
    prisma = Prisma()
    await prisma.connect()

    with load.open(mpc.COMET_URL) as f:
        comets = mpc.load_comets_dataframe(f)

    for _, row in comets.iterrows():
        ref = row["reference"]
        ref = re.sub(r"\s+", " ", ref)
        sk = (
            methods_web.clean_search_term(row["designation"])
            + "|"
            + methods_web.clean_search_term(ref)
        )
        am = comet_apparent_magnitude_at_perihelion(
            row["magnitude_g"], row["magnitude_k"], row["perihelion_distance_au"]
        )
        data = {
            "name": row["designation"],
            "names": ["DESIGNATION " + row["designation"], ref],
            "searchKey": sk,
            "cometKey": row["designation"],
            "type": SpaceObjectType.COMET,
            "color": random.choice(list(Color)),
            "fluxV": am,
        }
        await prisma.spaceobject.create(
            data=data,
        )

    await prisma.disconnect()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    args = parser.parse_args()
    asyncio.run(main())
