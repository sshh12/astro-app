from typing import Tuple, List, Dict
import datetime as dt
import pytz
import tqdm
import numpy as np

from skyfield import almanac
from skyfield.api import wgs84, Loader, Star, Angle
from skyfield.framelib import ecliptic_frame
from skyfield.constants import GM_SUN_Pitjeva_2005_km3_s2 as GM_SUN
from skyfield.searchlib import find_maxima, find_minima
from skyfield.data import mpc


CACHE_DIR = "/root/cache/"
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


def round_datetime(dt_obj: dt.datetime) -> Tuple:
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


def round_datetime_to_hour(dt_obj: dt.datetime, round_up: bool = False) -> Tuple:
    if round_up:
        return dt_obj.replace(minute=0, second=0, microsecond=0) + dt.timedelta(hours=1)
    return dt_obj.replace(minute=0, second=0, microsecond=0)


def get_hours_between_dates_inclusive(start: dt.datetime, end: dt.datetime):
    return [
        start + dt.timedelta(hours=i)
        for i in range(int((end - start).total_seconds() / 3600) + 1)
    ]


def date_to_weekday(dt_obj: dt.datetime) -> str:
    return dt_obj.strftime("%A")


def space_object_to_observables(ts, eph, object):
    if object.solarSystemKey is not None:
        return eph[object.solarSystemKey]
    if object.cometKey is not None:
        with Loader(CACHE_DIR).open(mpc.COMET_URL) as f:
            comets = mpc.load_comets_dataframe(f).set_index("designation", drop=False)
        comet = eph["sun"] + mpc.comet_orbit(comets.loc[object.cometKey], ts, GM_SUN)
        return comet
    return Star(ra=Angle(hours=object.ra), dec=Angle(degrees=object.dec))


def get_week_info_with_weather_data(
    weather_data, timezone: str, lat: float, lon: float, elevation: float
) -> Dict:
    weather_fields = ["cloud_cover", "precipitation_probability"]
    zone = pytz.timezone(timezone)

    load = Loader(CACHE_DIR)
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

    start_noon, start_next_noon = get_todays_noons(timezone)
    for i in range(0, 7):
        most_recent_noon = round_datetime_to_hour(start_noon + dt.timedelta(days=i))
        next_noon = round_datetime_to_hour(
            start_next_noon + dt.timedelta(days=i), round_up=True
        )
        hours = get_hours_between_dates_inclusive(most_recent_noon, next_noon)

        date_info = {
            "start_weekday": date_to_weekday(most_recent_noon),
            "end_weekday": date_to_weekday(next_noon),
            "time": [int(h.timestamp() * 1000) for h in hours],
        }
        try:
            h_idxs = [hour_mapping[h] for h in hours]
        except KeyError:
            continue
        for k in weather_fields:
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


def get_longterm_orbit_calculations(
    object: List,
    timezone: str,
    lat: float,
    lon: float,
    elevation: float,
    nb_days: int = 365,
) -> List:

    load = Loader(CACHE_DIR)

    ts = load.timescale()

    eph = load("de421.bsp")
    loc = wgs84.latlon(float(lat), float(lon), elevation_m=float(elevation))
    earth = eph["earth"]
    loc_place = earth + loc

    obj = space_object_to_observables(ts, eph, object)

    def alt_at(t):
        return loc_place.at(t).observe(obj).apparent().altaz()[0].degrees

    alt_at.step_days = 0.1

    days = []

    start_noon, start_next_noon = get_todays_noons(timezone)
    for i in tqdm.tqdm(list(range(0, nb_days))):
        most_recent_noon = round_datetime_to_hour(start_noon + dt.timedelta(days=i))
        next_noon = round_datetime_to_hour(
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
