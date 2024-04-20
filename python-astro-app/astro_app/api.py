from typing import List, Dict, Tuple
from functools import cache
import datetime as dt
import json

import pytz
import skyfield
from skyfield.api import Loader, wgs84
from skyfield import almanac

from astro_app import space_util

load = Loader("/")

METHODS = {}


def method_api():
    def wrap(func):
        def wrapper(**kwargs):
            return func(**kwargs)

        METHODS[func.__name__] = wrapper

    return wrap


@cache
def get_commons() -> Tuple:
    load = space_util.get_loader()
    ts = load.timescale()
    eph = load("de421.bsp")
    return ts, eph


@method_api()
def test() -> Dict:
    eph = load("de421.bsp")
    return {
        "output": f"Loaded pytz=={pytz.__version__} skyfield=={skyfield.__version__} eph={eph is not None}"
    }


@method_api()
def get_orbit_calculations(
    objects: List,
    timezone: str,
    lat: float,
    lon: float,
    elevation: float,
    resolution_mins: int,
) -> Dict:
    zone = pytz.timezone(timezone)
    most_recent_noon, next_noon = space_util.get_todays_noons(timezone)

    ts, eph = get_commons()
    t0 = ts.from_datetime(most_recent_noon)
    t1 = ts.from_datetime(next_noon)

    loc = wgs84.latlon(float(lat), float(lon), elevation_m=float(elevation))
    earth = eph["earth"]
    loc_place = earth + loc

    f = almanac.dark_twilight_day(eph, loc)
    times, events = almanac.find_discrete(t0, t1, f)

    previous_e = f(t0).item()
    checkpoints = {}
    for t, e in zip(times, events):
        if previous_e < e:
            checkpoints[almanac.TWILIGHTS[e] + "+"] = t.astimezone(zone)
        else:
            checkpoints[almanac.TWILIGHTS[previous_e] + "-"] = t.astimezone(zone)
        previous_e = e

    states = list(checkpoints.keys())
    assert len(states) == 8

    start = space_util.round_datetime(
        checkpoints["Day-"], mins=resolution_mins
    ) - dt.timedelta(minutes=resolution_mins * 2)
    end = space_util.round_datetime(
        checkpoints["Day+"], mins=resolution_mins
    ) + dt.timedelta(minutes=resolution_mins * 3)

    observables = {
        object["id"]: space_util.space_object_to_observables(ts, eph, object)
        for object in objects
    }

    cur = start
    cur_state = 0
    resp = {
        "timezone": timezone,
        "time_state": [],
        "time": [],
        "objects": {o["id"]: {"alt": [], "az": []} for o in objects},
    }
    while cur <= end:
        t = ts.from_datetime(cur)
        loc_time = loc_place.at(t)
        if cur_state < len(states) - 1 and cur >= checkpoints[states[cur_state + 1]]:
            cur_state += 1

        resp["time_state"].append(cur_state)
        resp["time"].append(int(cur.timestamp() * 1000))

        for oid, observable in observables.items():
            alt_az = loc_time.observe(observable).apparent().altaz()
            alt = alt_az[0].degrees
            az = alt_az[1].degrees
            resp["objects"][oid]["alt"].append(round(alt, 2))
            resp["objects"][oid]["az"].append(round(az, 2))

        cur += dt.timedelta(minutes=resolution_mins)

    return resp


def call(method_name: str, kwargs: Dict) -> str:
    return json.dumps(METHODS[method_name](**kwargs))
