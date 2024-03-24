from typing import List
import datetime as dt
import pytz
import os

import space_util

from skyfield import almanac
from skyfield.api import wgs84, Loader

METHODS = {}


def method_cpu():
    import modal

    modal_func = modal.Function.lookup("astro-app", "astro_app_backend_cpu")

    def wrap(func):
        def wrapper(**kwargs):
            return func(**kwargs)

        async def call_async(**kwargs):
            if os.environ.get("LOCAL_CPU"):
                print("->", func.__name__)
                return func(**kwargs)
            else:
                return await modal_func.remote.aio(func.__name__, kwargs)

        wrapper.remote = call_async

        METHODS[func.__name__] = wrapper

        return wrapper

    return wrap


@method_cpu()
def get_orbit_calculations(
    objects: List, timezone: str, lat: float, lon: float, elevation: float
):
    zone = pytz.timezone(timezone)
    most_recent_noon, next_noon = space_util.get_todays_noons(timezone)

    load = Loader(space_util.CACHE_DIR)

    ts = load.timescale()
    t0 = ts.from_datetime(most_recent_noon)
    t1 = ts.from_datetime(next_noon)

    eph = load("de421.bsp")
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

    start = space_util.round_datetime(checkpoints["Day-"]) - dt.timedelta(
        minutes=space_util.TIME_RESOLUTION_MINS * 2
    )
    end = space_util.round_datetime(checkpoints["Day+"]) + dt.timedelta(
        minutes=space_util.TIME_RESOLUTION_MINS * 3
    )

    observables = {
        object.id: space_util.space_object_to_observables(ts, eph, object)
        for object in objects
    }

    cur = start
    cur_state = 0
    resp = {
        "timezone": timezone,
        "time_state": [],
        "time": [],
        "objects": {o.id: {"alt": [], "az": []} for o in objects},
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

        cur += dt.timedelta(minutes=space_util.TIME_RESOLUTION_MINS)

    return resp
