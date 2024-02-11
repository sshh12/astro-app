from typing import Tuple, List
from collections import defaultdict
import datetime as dt
import pytz

from skyfield import almanac
from skyfield.api import wgs84, load, Star, Angle

TIME_RESOLUTION_MINS = 10


def get_todays_noons(timezone: str) -> Tuple:
    zone = pytz.timezone(timezone)
    now = dt.datetime.now(zone)

    if now.hour >= 12:
        most_recent_noon = now.replace(hour=12, minute=0, second=0, microsecond=0)
        tomorrow = now + dt.timedelta(days=1)
        tomorrows_noon = tomorrow.replace(hour=12, minute=0, second=0, microsecond=0)
        return most_recent_noon, tomorrows_noon
    else:
        yesterday = now - dt.timedelta(days=1)
        yesterdays_noon = yesterday.replace(hour=12, minute=0, second=0, microsecond=0)
        upcoming_noon = now.replace(hour=12, minute=0, second=0, microsecond=0)
        return yesterdays_noon, upcoming_noon


def round_datetime(dt_obj) -> Tuple:
    round_to = dt.timedelta(minutes=TIME_RESOLUTION_MINS)
    seconds = (
        dt_obj - dt_obj.replace(hour=0, minute=0, second=0, microsecond=0)
    ).seconds
    rounding = (
        (seconds + round_to.total_seconds() / 2)
        // round_to.total_seconds()
        * round_to.total_seconds()
    )
    return dt_obj + dt.timedelta(0, rounding - seconds, -dt_obj.microsecond)


def space_object_to_observables(eph, object):
    if object.solarSystemKey is not None:
        return eph[object.solarSystemKey.replace("jupiter", "jupiter barycenter")]
    return Star(ra=Angle(hours=object.ra), dec=Angle(degrees=object.dec))


def get_orbit_calculations(objects: List, timezone: str, lat: float, lon: float):
    zone = pytz.timezone(timezone)
    most_recent_noon, next_noon = get_todays_noons(timezone)

    ts = load.timescale()
    t0 = ts.from_datetime(most_recent_noon)
    t1 = ts.from_datetime(next_noon)

    eph = load("de421.bsp")
    loc = wgs84.latlon(float(lat), float(lon), elevation_m=0.0)
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

    start = round_datetime(checkpoints["Day-"]) - dt.timedelta(
        minutes=TIME_RESOLUTION_MINS * 2
    )
    end = round_datetime(checkpoints["Day+"]) + dt.timedelta(
        minutes=TIME_RESOLUTION_MINS * 3
    )

    observables = {
        object.id: space_object_to_observables(eph, object) for object in objects
    }

    cur = start
    cur_state = 0
    resp = {
        "timezone": timezone,
        "time_state": [],
        "time": [],
        "objects": {o.id: {"alt": []} for o in objects},
    }
    while cur <= end:
        t = ts.from_datetime(cur)
        loc_time = loc_place.at(t)
        if cur_state < len(states) - 1 and cur >= checkpoints[states[cur_state + 1]]:
            cur_state += 1

        resp["time_state"].append(cur_state)
        resp["time"].append(int(cur.timestamp() * 1000))

        for oid, observable in observables.items():
            alt = loc_time.observe(observable).apparent().altaz()[0].degrees
            resp["objects"][oid]["alt"].append(round(alt, 2))

        cur += dt.timedelta(minutes=TIME_RESOLUTION_MINS)

    return resp
