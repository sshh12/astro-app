from prisma import Prisma, models
from prisma.enums import SpaceObjectType
from typing import Optional
import aiohttp
import re

from skyfield.api import Angle
from methods.base import random_color, build_search_key


async def query_and_import_simbad(
    prisma: Prisma, term: str, override_name: str = None, ignore_error: bool = False
) -> Optional[models.SpaceObject]:
    obj = await prisma.spaceobject.find_first(where={"name": term})
    if obj is not None:
        return obj

    async with aiohttp.ClientSession() as session:
        async with session.get(
            f"https://simbad.cds.unistra.fr/simbad/sim-basic?Ident={term}&submit=SIMBAD+search&output.format=ASCII"
        ) as response:
            output = await response.text()
    try:
        simbad_title = re.search(r"Object ([\s\S]+?)  ---", output).group(1).strip()
    except AttributeError:
        if ignore_error:
            return None
        raise Exception(f"Could not find simbad result for {term}")
    icrs_match = re.search(
        r"ICRS,ep=J2000,eq=2000\): (\d+) (\d+) ([\d\.]+)  ([\d+\-]+) (\d+) ([\d\.]+)",
        output,
    )
    idents_blob = re.search(r"Identifiers \(\d+\):([\s\S]+)\nB", output).group(1)
    idents = [val.strip() for val in idents_blob.strip().split("   ") if val.strip()]
    ra = Angle(
        hours=(
            float(icrs_match.group(1)),
            float(icrs_match.group(2)),
            float(icrs_match.group(3)),
        )
    ).hours
    dec = Angle(
        degrees=(
            float(icrs_match.group(4)),
            float(icrs_match.group(5)),
            float(icrs_match.group(6)),
        )
    ).degrees

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

    obj = await prisma.spaceobject.find_first(where={"simbadName": simbad_title})
    if not obj:
        title = simbad_title
        names = [id_[5:] for id_ in idents if "NAME" in id_]
        if len(names) > 0:
            title = names[0]
        if override_name is not None:
            title = override_name

        obj = await prisma.spaceobject.find_first(where={"name": title})

        if not obj:
            obj = await prisma.spaceobject.create(
                data={
                    "name": title,
                    "searchKey": build_search_key(title, idents),
                    "solarSystemKey": None,
                    "type": SpaceObjectType.STAR_OBJECT,
                    "ra": ra,
                    "dec": dec,
                    "fluxV": flux_v,
                    "names": idents,
                    "color": random_color(),
                    "simbadName": simbad_title,
                    "sizeMajor": size_major,
                    "sizeMinor": size_minor,
                    "sizeAngle": size_pa,
                },
            )
    return obj
