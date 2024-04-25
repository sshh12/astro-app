from typing import List, Dict, Tuple, Callable
from functools import cache
import datetime as dt
import json

import pytz
import skyfield
import numpy as np
from skyfield.api import Loader, wgs84
from skyfield import almanac
from skyfield.positionlib import position_of_radec
from skyfield.framelib import ecliptic_frame
from skyfield.searchlib import find_maxima, find_minima

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
def get_orbit_calculations(
    objects: List,
    timezone: str,
    lat: float,
    lon: float,
    elevation: float,
    resolution_mins: int,
    send_js: Callable,
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


@method_api()
def get_longterm_orbit_calculations(
    object: List,
    timezone: str,
    lat: float,
    lon: float,
    elevation: float,
    start_days: int,
    offset_days: int,
    send_js: Callable,
) -> List:

    ts, eph = get_commons()

    loc = wgs84.latlon(float(lat), float(lon), elevation_m=float(elevation))
    earth = eph["earth"]
    loc_place = earth + loc

    obj = space_util.space_object_to_observables(ts, eph, object)

    def alt_at(t):
        return loc_place.at(t).observe(obj).apparent().altaz()[0].degrees

    def az_at(t):
        return loc_place.at(t).observe(obj).apparent().altaz()[1].degrees

    alt_at.step_days = 0.1

    resp = []

    start_noon, start_next_noon = space_util.get_todays_noons(timezone)
    for i in range(start_days, start_days + offset_days):
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

        max_alt_times, max_alts = find_maxima(n0, n1, alt_at)
        if len(max_alts) == 0:
            max_alt_times = [n0, n1]
        max_alt_ts = max(max_alt_times, key=lambda t: alt_at(t))
        max_alt = alt_at(max_alt_ts)
        day_info["max_alt"] = round(max_alt, 2)
        day_info["az_at_max_alt"] = round(az_at(max_alt_ts), 2)
        day_info["ts_at_max_alt"] = int(max_alt_ts.utc_datetime().timestamp() * 1000)

        min_alt_times, min_alts = find_minima(n0, n1, alt_at)
        if len(min_alts) == 0:
            min_alt_times = [n0, n1]
        min_alt_ts = min(min_alt_times, key=lambda t: alt_at(t))
        min_alt = alt_at(min_alt_ts)
        day_info["min_alt"] = round(min_alt, 2)
        day_info["az_at_min_alt"] = round(az_at(min_alt_ts), 2)
        day_info["ts_at_min_alt"] = int(min_alt_ts.utc_datetime().timestamp() * 1000)
        day_info["satellite_passes"] = []

        if object["type"] == "EARTH_SATELLITE":
            pass_t, pass_events = obj.satellite.find_events(
                loc, n0, n1, altitude_degrees=10.0
            )
            pass_sunlit = obj.satellite.at(pass_t).is_sunlit(eph)
            cur_start = None
            cur_culm = None
            for pass_ti, event, sunlit_flag in zip(pass_t, pass_events, pass_sunlit):
                if event == 0:
                    cur_start = (pass_ti, sunlit_flag == 1)
                elif event == 1 and cur_start is not None:
                    cur_culm = (pass_ti, sunlit_flag == 1)
                elif event == 2 and cur_culm is not None and cur_start is not None:
                    day_info["satellite_passes"].append(
                        {
                            "ts_start": int(
                                cur_start[0].utc_datetime().timestamp() * 1000
                            ),
                            "ts_culminate": int(
                                cur_culm[0].utc_datetime().timestamp() * 1000
                            ),
                            "ts_end": int(pass_ti.utc_datetime().timestamp() * 1000),
                            "alt_start": round(alt_at(cur_start[0]), 2),
                            "alt_culminate": round(alt_at(cur_culm[0]), 2),
                            "alt_end": round(alt_at(pass_ti), 2),
                            "az_start": round(az_at(cur_start[0]), 2),
                            "az_culminate": round(az_at(cur_culm[0]), 2),
                            "az_end": round(az_at(pass_ti), 2),
                            "sunlit": any(
                                [cur_start[1], cur_culm[1], sunlit_flag == 1]
                            ),
                        }
                    )
                    cur_start = None
                    cur_culm = None

        resp.append(day_info)
        if i % 10 == 0:
            send_js(resp)

    return resp


@method_api()
def get_current_orbit_calculations(
    object: List,
    timezone: str,
    lat: float,
    lon: float,
    elevation: float,
    send_js: Callable,
) -> Dict:

    ts, eph = get_commons()
    earth = eph["earth"]
    loc = wgs84.latlon(float(lat), float(lon), elevation_m=float(elevation))
    loc_place = earth + loc

    t_now = ts.now()

    obj = space_util.space_object_to_observables(ts, eph, object)

    apparent_pos = loc_place.at(t_now).observe(obj).apparent()

    ra, dec, _ = apparent_pos.radec()

    alt_az = apparent_pos.altaz()

    pos_radec = position_of_radec(ra.hours, dec.degrees, t=t_now, center=399)
    subpoint = wgs84.subpoint(pos_radec)

    return {
        "time": int(t_now.utc_datetime().timestamp() * 1000),
        "alt": round(alt_az[0].degrees, 2),
        "az": round(alt_az[1].degrees, 2),
        "ra": ra.hours,
        "dec": dec.degrees,
        "lat": subpoint.latitude.degrees,
        "lon": subpoint.longitude.degrees,
    }


@method_api()
def get_week_info_with_weather_data(
    weather_data: Dict,
    timezone: str,
    lat: float,
    lon: float,
    elevation: float,
    send_js: Callable,
) -> Dict:
    weather_fields = ["cloud_cover", "precipitation_probability", "visibility"]
    zone = pytz.timezone(timezone)

    ts, eph = get_commons()
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

    resp = []

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

        resp.append(date_info)

    return resp


def call(send_js: Callable, method_name: str, kwargs: Dict) -> str:
    def _send_js(data: Dict):
        send_js(json.dumps(data))

    all_kwargs = {**kwargs, "send_js": _send_js}
    return json.dumps(METHODS[method_name](**all_kwargs))
