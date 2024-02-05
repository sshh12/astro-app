from typing import Tuple
from collections import defaultdict
import datetime as dt
import pytz

from skyfield import almanac
from skyfield.api import N, W, wgs84, load, Star

TIME_RESOLUTION_MINS = 10


def get_todays_noons() -> Tuple:
    zone = pytz.timezone("US/Eastern")
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


def get_resp():
    zone = pytz.timezone("US/Eastern")
    most_recent_noon, next_noon = get_todays_noons()
    ts = load.timescale()
    t0 = ts.from_datetime(most_recent_noon)
    t1 = ts.from_datetime(next_noon)
    eph = load("de421.bsp")
    loc = wgs84.latlon(40.8939 * N, 83.8917 * W)
    earth = eph["earth"]
    moon = eph["moon"]
    sun = eph["sun"]
    star = Star(ra_hours=(2, 31, 49.09456), dec_degrees=(89, 15, 50.7923))
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
        minutes=TIME_RESOLUTION_MINS * 3
    )
    end = round_datetime(checkpoints["Day+"]) + dt.timedelta(
        minutes=TIME_RESOLUTION_MINS * 3
    )
    cur = start
    cur_state = 0
    resp = defaultdict(list)
    while cur <= end:
        t = ts.from_datetime(cur)
        loc_time = loc_place.at(t)
        m = loc_time.observe(moon).apparent()
        s = loc_time.observe(sun).apparent()
        st = loc_time.observe(star).apparent()
        m_alt = m.altaz()[0].degrees
        s_alt = s.altaz()[0].degrees
        st_alt = st.altaz()[0].degrees
        if cur_state < len(states) - 1 and cur >= checkpoints[states[cur_state + 1]]:
            cur_state += 1
        resp["time_state"].append(cur_state)
        resp["time"].append(int(cur.timestamp() * 1000))
        resp["moon_alt"].append(round(m_alt, 2))
        resp["sun_alt"].append(round(s_alt, 2))
        resp["star_alt"].append(round(st_alt, 2))
        cur += dt.timedelta(minutes=TIME_RESOLUTION_MINS)
    return resp
