from enum import Enum


class SpaceObjectType(str, Enum):
    SOLAR_SYSTEM_OBJECT = "SOLAR_SYSTEM_OBJECT"
    STAR_OBJECT = "STAR_OBJECT"
    COMET = "COMET"
    EARTH_SATELLITE = "EARTH_SATELLITE"


class EquipmentType(str, Enum):
    VISUAL = "VISUAL"
    CAMERA = "CAMERA"
    BINOCULARS = "BINOCULARS"


class ListType(str, Enum):
    PERSONAL_COLLECTION = "PERSONAL_COLLECTION"
    CURATED_LIST = "CURATED_LIST"
    CONSTELLATION_GROUP = "CONSTELLATION_GROUP"


class AstrometryStatus(str, Enum):
    PENDING = "PENDING"
    DONE = "DONE"
    ERROR = "ERROR"
