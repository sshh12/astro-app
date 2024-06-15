from typing import Tuple, Dict, Any
import datetime as dt
import pandas as pd
import pytz

from skyfield.api import Loader, Star, Angle
from skyfield.constants import GM_SUN_Pitjeva_2005_km3_s2 as GM_SUN
from skyfield.data import mpc
from skyfield.sgp4lib import EarthSatellite


CACHE_DIR = "/"
TIME_RESOLUTION_MINS = 1

DUMMY_STAR = Star(ra=Angle(hours=0), dec=Angle(degrees=0))


def get_loader() -> Loader:
    load = Loader(CACHE_DIR)
    return load


def get_comets() -> pd.DataFrame:
    with Loader(CACHE_DIR).open(mpc.COMET_URL) as f:
        comets = mpc.load_comets_dataframe(f).set_index("designation", drop=False)
    return comets


def get_satellites() -> Dict[str, EarthSatellite]:
    stations_url = "https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle"
    satellites = get_loader().tle_file(stations_url, filename="celestrak-active.txt")
    return {s.name: s for s in satellites}


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


def round_datetime(dt_obj: dt.datetime, mins: int = 1) -> Tuple:
    round_to = dt.timedelta(minutes=mins)
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
    if object["solarSystemKey"] is not None:
        return eph[object["solarSystemKey"]]
    if object["cometKey"] is not None:
        comets = get_comets()
        try:
            return eph["sun"] + mpc.comet_orbit(
                comets.loc[object["cometKey"]], ts, GM_SUN
            )
        except KeyError:
            return DUMMY_STAR
    if object["celestrakKey"] is not None:
        try:
            sat = get_satellites()[object["celestrakKey"]]
            obs = eph["earth"] + sat
            obs.satellite = sat
            return obs
        except KeyError:
            return DUMMY_STAR
    return Star(ra=Angle(hours=object["ra"]), dec=Angle(degrees=object["dec"]))


def ts_from_timestamp(ts: any, timestamp: int, zone: Any):
    return ts.from_datetime(dt.datetime.fromtimestamp(timestamp / 1000, tz=zone))
