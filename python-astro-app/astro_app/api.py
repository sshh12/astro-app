import pytz
import skyfield
from skyfield.api import Loader

load = Loader("/")


def test() -> str:
    eph = load("de421.bsp")
    return f"Loaded VM pytz=={pytz.__version__} skyfield=={skyfield.__version__} earth=[[{eph['earth']}]]"
