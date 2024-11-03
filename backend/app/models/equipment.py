from sqlalchemy import (
    BigInteger,
    Column,
    String,
    Boolean,
    Enum,
    Numeric,
    Integer,
    ForeignKey,
    DateTime,
)
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base
from app.models.enums import EquipmentType


class Equipment(Base):
    __tablename__ = "equipment"

    id = Column(BigInteger, primary_key=True, index=True)
    type = Column(Enum(EquipmentType))
    active = Column(Boolean, default=False)

    tele_focal_length = Column(Numeric)
    tele_aperture = Column(Numeric)
    tele_name = Column(String)
    cam_width = Column(Integer)
    cam_height = Column(Integer)
    cam_pixel_width = Column(Numeric)
    cam_pixel_height = Column(Numeric)
    cam_name = Column(String)
    barlow = Column(Numeric)
    binning = Column(Integer)
    eye_focal_length = Column(Numeric)
    eye_fov = Column(Numeric)
    eye_name = Column(String)
    bino_aperture = Column(Numeric)
    bino_magnification = Column(Numeric)
    bino_actual_fov = Column(Numeric)
    bino_name = Column(String)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    user_id = Column(BigInteger, ForeignKey("users.id"))

    # Relationship
    user = relationship("User", back_populates="equipment")
