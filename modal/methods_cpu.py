from typing import List, Dict
import datetime as dt
import pytz
import os

import numpy as np
import tqdm
from skyfield import almanac
from skyfield.api import wgs84
from skyfield.searchlib import find_maxima, find_minima
from skyfield.framelib import ecliptic_frame

import space_util

METHODS = {}


def method_cpu():
    import modal

    modal_func = modal.Function.lookup("astro-app", "astro_app_backend_cpu")

    def wrap(func):
        def wrapper(**kwargs):
            return func(**kwargs)

        async def call_async(**kwargs):
            if os.environ.get("LOCAL_CPU"):
                print("-cpu start->", func.__name__)
                result = func(**kwargs)
                print("-cpu end->", func.__name__)
                return result
            else:
                return await modal_func.remote.aio(func.__name__, kwargs)

        wrapper.remote = call_async

        METHODS[func.__name__] = wrapper

        return wrapper

    return wrap


@method_cpu()
def get_orbit_calculations(
    objects: List, timezone: str, lat: float, lon: float, elevation: float
) -> Dict:
    zone = pytz.timezone(timezone)
    most_recent_noon, next_noon = space_util.get_todays_noons(timezone)

    load = space_util.get_loader()
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


@method_cpu()
def get_longterm_orbit_calculations(
    object: List,
    timezone: str,
    lat: float,
    lon: float,
    elevation: float,
    start_days: int,
    offset_days: int,
) -> List:

    load = space_util.get_loader()
    ts = load.timescale()

    eph = load("de421.bsp")
    loc = wgs84.latlon(float(lat), float(lon), elevation_m=float(elevation))
    earth = eph["earth"]
    loc_place = earth + loc

    obj = space_util.space_object_to_observables(ts, eph, object)

    def alt_at(t):
        return loc_place.at(t).observe(obj).apparent().altaz()[0].degrees

    alt_at.step_days = 0.1

    days = []

    start_noon, start_next_noon = space_util.get_todays_noons(timezone)
    for i in tqdm.tqdm(list(range(start_days, start_days + offset_days))):
        most_recent_noon = space_util.round_datetime_to_hour(
            start_noon + dt.timedelta(days=i)
        )
        next_noon = space_util.round_datetime_to_hour(
            start_next_noon + dt.timedelta(days=i), round_up=True
        )

        day_info = {
            "i": i,
            "start": int(most_recent_noon.timestamp() * 1000),
            "end": int(next_noon.timestamp() * 1000),
        }

        t0 = ts.from_datetime(most_recent_noon)
        t1 = ts.from_datetime(next_noon)
        f = almanac.dark_twilight_day(eph, loc)
        times, events = almanac.find_discrete(t0, t1, f)

        night_idx = np.where(events == 1)[0]
        if len(night_idx) != 2:
            continue
        n0 = times[night_idx[0]]
        n1 = times[night_idx[-1]]

        _, max_alts = find_maxima(n0, n1, alt_at)
        if len(max_alts) > 0:
            max_alt = max(max_alts)
        else:
            max_alt = max(alt_at(n0), alt_at(n1))
        day_info["max_alt"] = round(max_alt, 2)

        _, min_alts = find_minima(n0, n1, alt_at)
        if len(min_alts) > 0:
            min_alt = min(min_alts)
        else:
            min_alt = min(alt_at(n0), alt_at(n1))
        day_info["min_alt"] = round(min_alt, 2)

        days.append(day_info)

    return days


@method_cpu()
def get_week_info_with_weather_data(
    weather_data: Dict, timezone: str, lat: float, lon: float, elevation: float
) -> Dict:
    weather_fields = ["cloud_cover", "precipitation_probability", "visibility"]
    zone = pytz.timezone(timezone)

    load = space_util.get_loader()
    ts = load.timescale()
    eph = load("de421.bsp")
    sun, moon, earth = eph["sun"], eph["moon"], eph["earth"]
    loc = wgs84.latlon(float(lat), float(lon), elevation_m=float(elevation))

    hour_mapping = {}
    for hi, date in enumerate(weather_data["hourly"]["time"]):
        hdt = dt.datetime.strptime(date, "%Y-%m-%dT%H:%M")
        hdt = zone.localize(hdt)
        hour_mapping[hdt] = hi

    date_to_weather_code = {
        date: weather_data["daily"]["weather_code"][di]
        for di, date in enumerate(weather_data["daily"]["time"])
    }

    week = []

    start_noon, start_next_noon = space_util.get_todays_noons(timezone)
    for i in range(0, 7):
        most_recent_noon = space_util.round_datetime_to_hour(
            start_noon + dt.timedelta(days=i)
        )
        next_noon = space_util.round_datetime_to_hour(
            start_next_noon + dt.timedelta(days=i), round_up=True
        )
        hours = space_util.get_hours_between_dates_inclusive(
            most_recent_noon, next_noon
        )

        date_info = {
            "start_weekday": space_util.date_to_weekday(most_recent_noon),
            "end_weekday": space_util.date_to_weekday(next_noon),
            "time": [int(h.timestamp() * 1000) for h in hours],
        }
        try:
            h_idxs = [hour_mapping[h] for h in hours]
        except KeyError:
            continue
        for k in weather_fields:
            if k in weather_data["hourly"]:
                date_info[k] = [weather_data["hourly"][k][hi] for hi in h_idxs]

        start_date = most_recent_noon.isoformat()[:10]
        date_info["weather_code"] = date_to_weather_code[start_date]

        tmid = ts.from_datetime(hours[len(hours) // 2])
        earth_pos = earth.at(tmid)
        sun_apparent = earth_pos.observe(sun).apparent()
        moon_apparent = earth_pos.observe(moon).apparent()
        _, slon, _ = sun_apparent.frame_latlon(ecliptic_frame)
        _, mlon, _ = moon_apparent.frame_latlon(ecliptic_frame)
        moon_angle = (mlon.degrees - slon.degrees) % 360.0
        percent = 100.0 * moon_apparent.fraction_illuminated(sun)
        date_info["moon_angle"] = round(moon_angle, 2)
        date_info["moon_illumination"] = round(percent, 2)

        twilight_state = [
            int(almanac.dark_twilight_day(eph, loc)(ts.from_datetime(t))) for t in hours
        ]
        date_info["twilight_state"] = twilight_state

        week.append(date_info)

    return week
