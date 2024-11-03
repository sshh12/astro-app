from sqlalchemy import BigInteger, Column, String, DateTime, Numeric, Enum, Text
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base
from app.models.enums import SpaceObjectType


class SpaceObject(Base):
    __tablename__ = "space_objects"

    id = Column(BigInteger, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    names = Column(ARRAY(String))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    ra = Column(Numeric)
    dec = Column(Numeric)
    flux_v = Column(Numeric)
    size_major = Column(Numeric)
    size_minor = Column(Numeric)
    size_angle = Column(Numeric)

    solar_system_key = Column(String)
    comet_key = Column(String)
    celestrak_key = Column(String)
    simbad_name = Column(String)
    simbad_type = Column(String)
    type = Column(Enum(SpaceObjectType))

    description = Column(Text)
    description_credit = Column(String)

    # Relationships
    lists = relationship("SpaceObjectsOnLists", back_populates="space_object")
