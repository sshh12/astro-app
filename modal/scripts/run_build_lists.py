import sys
import os


sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import asyncio
import argparse
import json
from prisma import Prisma
from prisma.enums import Color
import methods_web

CACHE_FN = "spaceobject.cache.json"

LISTS = {
    (
        "Messier Objects",
        "/list_icons/messier.jpg",
        "https://en.wikipedia.org/wiki/Messier_object",
        Color.BLUE,
    ): [f"M {i}" for i in range(1, 111)],
    (
        "Solar System",
        "/list_icons/solar-system.jpg",
        "https://en.wikipedia.org/wiki/Solar_System",
        Color.YELLOW,
    ): [
        "Sun",
        "Mercury",
        "Venus",
        "Moon",
        "Mars",
        "Jupiter",
        "Saturn",
        "Uranus",
        "Neptune",
        "Pluto",
    ],
    (
        "Galaxy Clusters & Groups",
        "/list_icons/galaxy-groups.jpg",
        "https://www.skyatnightmagazine.com/astrophotography/galaxies/galaxy-clusters-groups",
        Color.BLUE,
    ): [
        "Fornax Cluster",
        "M 96",
        "Virgo Cluster",
        "NGC 5982",
        "NGC 4216",
        "NGC 7331",
        "Abell 1367",
        "Abell 2151",
        "NGC 3190",
        "NGC 3187",
        "Leo Triplet",
        "HCG 92",
    ],
    (
        "Grand Spiral Galaxies",
        "/list_icons/grand-spiral.jpg",
        "https://en.wikipedia.org/wiki/Grand_design_spiral_galaxy",
        Color.BLUE,
    ): [
        "M 51",
        "M 74",
        "M 81",
        "M 83",
        "M 101",
        "NGC 5364",
        "NGC 1232",
        "NGC 7424",
        "NGC 2997",
        "NGC 3631",
    ],
    (
        "Red Giants",
        "/list_icons/red-giants.jpg",
        "https://www.go-astronomy.com/red-giant-stars.php",
        Color.RED,
    ): [
        "Arcturus",
        "VY CMa",
        "μ Cephei",
        "RW Cephei",
        "HD 208816",
        "Gacrux",
        "WOH G64",
        "Rasalgethi",
        "Betelgeuse",
        "S Persei",
        "VX Sagittarii",
        "Antares",
        "UY Scuti",
        "119 Tauri",
        "Aldebaran",
    ],
    (
        "Variable Stars",
        "/list_icons/var-stars.jpg",
        "https://en.wikipedia.org/wiki/Variable_star",
        Color.RED,
    ): [
        "Algol",
        "Mira",
        "Delta Cephei",
        "Chi Cygni",
        "RR Lyrae",
        "Betelgeuse",
        "Eta Aquilae",
        "VY Canis Majoris",
        "R Coronae Borealis",
        "T Tauri",
    ],
    (
        "Supernova Remnants",
        "/list_icons/snrs.jpg",
        "https://www.go-astronomy.com/supernova-remnants.php",
        Color.GREEN,
    ): [
        "W50",
        "W44",
        "W49B",
        "3C 58",
        "Cassiopeia A",
        "SN 1572",
        "HD 25137",
        "HD 168132",
        "SN 185",
        "NGC 6995",
        "Cygnus Loop",
        "Veil Nebula",
        "LMC N49",
        "SN 1987A",
        "Tarantula Nebula",
        "Kesteven 75",
        "Jellyfish Nebula",
        "SN 1006",
        "RCW 103",
        "SN 1604",
        "Puppis A",
        "SN 1996av",
        "MGC 56140",
        "Crab Nebula",
        "SNR G180.0-01.7",
        "1E 0102.2-7219",
        "Vela Junior",
        "Vela SNR",
    ],
    (
        "Comets",
        "/list_icons/comets.jpg",
        "https://skyandtelescope.org/astronomy-news/the-best-comets-in-2024/",
        Color.GREEN,
    ): [
        "12P/Pons-Brooks",
        "144P/Kushida",
        "62P/Tsuchinshan",
        "29P/Schwassmann-Wachmann",
        "13P/Olbers",
        "C/2023 A3 (Tsuchinshan-ATLAS)",
        "333P/LINEAR",
    ],
    (
        "Black Holes",
        "/list_icons/black-hole.jpg",
        "https://www.go-astronomy.com/black-holes.php",
        Color.GRAY,
    ): [
        "W50",
        "SS 433",
        "V1487 Aql",
        "W49B",
        "V821 Ara",
        "XTE J1650-500",
        "Cygnus X-1",
        "Cygnus X-3",
        "V404 Cyg",
        "IL Lupi",
        "V616 Mon",
        "GU Mus",
        "V381 Nor",
        "Great Annihilator",
        "Messier 15",
        "ESO 243-49",
        "SN 1997D",
        "GCIRS 13E",
        "Sagittarius A*",
        "V4641 Sgr",
        "IGR J17091-3624",
        "V1033 Sco",
        "HR 6819",
        "M33 X-7",
        "KV UMa",
        "M82 X-1",
        "M87*",
        "PKS 1302-102",
        "QZ Vul",
    ],
    (
        "Iconic Hubble",
        "/list_icons/hubble.jpg",
        "https://esahubble.org/images/archive/top100/",
        Color.GRAY,
    ): [
        "M 16",
        "Westerlund 2",
        "HDF",
        "HUDF",
        "NGC 4038",
        "NGC 6302",
        "M 1",
        "M 104",
        "M 51",
        "Barnard 33",
        "NGC 7293",
        "NGC 6543",
        "M 57",
        "M 42",
        "NGC 3372",
        "HCG 92",
        "UGC 10214",
        "UGC 1810",
        "V838 Monocerotis",
        "Bubble Nebula",
        "Horsehead Nebula",
        "M 31",
        "NGC 6302",
        "NGC 1300",
        "M 106",
        "NGC 2841",
        "NGC 7049",
        "Jupiter",
        "Saturn",
    ],
    (
        "Go Astronomy - Top 20",
        "/list_icons/go-astro.jpg",
        "https://skyandtelescope.org/observing/deep-sky-naked-eye/",
        Color.PURPLE,
    ): [
        "M 31",
        "M 44",
        "Carina Nebula",
        "Jewel Box",
        "M 22",
        "M 13",
        "Omega Centauri",
        "M 42",
        "Alpha Persei Cluster",
        "NGC 869",
        "M 8",
        "M 7",
        "M 20",
        "Butterfly Cluster",
        "M 4",
        "Hyades",
        "M 45",
        "Triangulum Galaxy",
        "Small Magellanic Cloud",
        "Mizar",
    ],
    (
        "Go Astronomy - Top 20 Wide Field",
        "/list_icons/go-astro.jpg",
        "https://www.go-astronomy.com/top20-astrophotography.htm",
        Color.PURPLE,
    ): [
        "Galactic Center",
        "Large Magellanic Cloud",
        "Barnard's Loop",
        "Coalsack Nebula",
        "Heart Nebula",
        "Rho Ophiuchi cloud",
        "Orion Nebula",
        "Small Magellanic Cloud",
        "Veil Nebula",
        "Andromeda Galaxy",
        "IC 2118",
        "California Nebula",
        "Carina Nebula",
        "NGC 2170",
        "North America Nebula",
        "Pleiades",
        "Horsehead Nebula",
        "Lagoon Nebula",
        "Rosette Nebula",
        "Triangulum Galaxy",
    ],
    (
        "S&T - Naked Eye",
        "/list_icons/st.jpg",
        "https://skyandtelescope.org/observing/deep-sky-naked-eye/",
        Color.RED,
    ): [
        "M 31",
        "NGC 869",
        "NGC 884",
        "M 7",
        "M 6",
        "M 8",
        "M 22",
        "M 25",
        "IC 4665",
        "M 39",
        "M 13",
        "M 5",
        "M 16",
        "M 17",
        "IC 4756",
        "NGC 663",
        "NGC 6633",
        "IC 4665",
        "M 23",
        "M 11",
        "M 15",
        "M 92",
    ],
    (
        "AstroBackyard",
        "/list_icons/backyard-astro.jpg",
        "https://astrobackyard.com/learn-astrophotography/",
        Color.RED,
    ): [
        "Andromeda Galaxy",
        "Orion Nebula",
        "Eagle Nebula",
        "Cave Nebula",
        "IC 1396",
        "Lagoon Nebula",
        "Crescent Nebula",
        "M 84",
        "Leo Triplet",
        "VdB 141",
        "Rosette Nebula",
        "Flaming Star Nebula",
        "Horsehead Nebula",
    ],
    (
        "r/astrophotography",
        "/list_icons/reddit.jpg",
        "https://www.reddit.com/r/astrophotography",
        Color.ORANGE,
    ): [
        "Andromeda Galaxy",
        "Triangulum Galaxy",
        "Leo Triplet",
        "M 81",
        "M 101",
        "Orion Nebula",
        "Crescent Nebula",
        "Rosette Nebula",
        "Heart Nebula",
        "IC 1848",
        "Veil Nebula",
        "Pleiades",
        "Galactic Center",
        "Moon",
        "Jupiter",
    ],
}


async def resolve_object(prisma, obj_name):
    obj = await prisma.spaceobject.find_unique(where={"name": obj_name})
    if not obj:
        obj = await methods_web.query_and_import_simbad(prisma, obj_name)
    if not obj:
        raise Exception("Could not find " + obj_name + " in SIMBAD")
    return obj.id


class Cache:
    def __init__(self):
        self.cache = {}
        if os.path.exists(CACHE_FN):
            with open(CACHE_FN, "r") as f:
                self.cache = json.load(f)

    def get(self, obj_name):
        return self.cache.get(obj_name)

    def set(self, obj_name, obj_id):
        self.cache[obj_name] = obj_id

    def save(self):
        with open(CACHE_FN, "w") as f:
            json.dump(self.cache, f, indent=2)


async def resolve_object_cached(cache: Cache, prisma: Prisma, obj_name: str):
    if obj_id := cache.get(obj_name):
        return obj_id
    obj_id = await resolve_object(prisma, obj_name)
    cache.set(obj_name, obj_id)
    return obj_id


async def main(args):
    prisma = Prisma()
    await prisma.connect()

    if not args.dry:
        public_lists = await prisma.list.find_many(where={"publicTemplate": True})
        await prisma.spaceobjectsonlists.delete_many(
            where={"listId": {"in": [l.id for l in public_lists]}}
        )
        await prisma.list.delete_many(where={"publicTemplate": True})

    cache = Cache()

    for (title, img, credit, color), obj_names in LISTS.items():
        print("Building", title, "list...")
        obj_ids = await asyncio.gather(
            *[resolve_object_cached(cache, prisma, obj_name) for obj_name in obj_names]
        )
        obj_ids = list(set(obj_ids))
        cache.save()
        if not args.dry:
            await prisma.list.create(
                data={
                    "title": title,
                    "color": color,
                    "credit": credit,
                    "imgURL": img,
                    "publicTemplate": True,
                    "objects": {
                        "create": [{"spaceObjectId": objId} for objId in obj_ids]
                    },
                },
            )


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry", action="store_true")
    args = parser.parse_args()
    assert args.dry or input("> ") == "yes"
    asyncio.run(main(args))
