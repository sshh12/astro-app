from typing import Tuple, List, Dict
import datetime as dt
import pytz

from skyfield import almanac
from skyfield.api import wgs84, Loader, Star, Angle
from skyfield.framelib import ecliptic_frame

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


def space_object_to_observables(eph, object):
    if object.solarSystemKey is not None:
        return eph[object.solarSystemKey]
    return Star(ra=Angle(hours=object.ra), dec=Angle(degrees=object.dec))


def get_orbit_calculations(
    objects: List, timezone: str, lat: float, lon: float, elevation: float
) -> Dict:
    zone = pytz.timezone(timezone)
    most_recent_noon, next_noon = get_todays_noons(timezone)

    load = Loader(CACHE_DIR)

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

        cur += dt.timedelta(minutes=TIME_RESOLUTION_MINS)

    return resp


def calculate_week_info_with_weather_data(
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
