from sqlalchemy import (
    BigInteger,
    Column,
    String,
    Numeric,
    Integer,
    ForeignKey,
    DateTime,
    Enum,
)
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base
from app.models.enums import AstrometryStatus


class Image(Base):
    __tablename__ = "images"

    id = Column(BigInteger, primary_key=True, index=True)
    astrometry_net_sid = Column(BigInteger)
    astrometry_net_job_id = Column(BigInteger)
    astrometry_net_job_calibrations_id = Column(BigInteger)
    astrometry_net_status = Column(Enum(AstrometryStatus))

    ra = Column(Numeric)
    dec = Column(Numeric)
    width_arc_sec = Column(Numeric)
    height_arc_sec = Column(Numeric)
    radius = Column(Numeric)
    pixel_scale = Column(Numeric)
    orientation = Column(Numeric)
    parity = Column(Numeric)

    objs_in_field = Column(String)
    width_px = Column(Integer)
    height_px = Column(Integer)
    mapped_objs = Column(JSON)

    title = Column(String)
    main_image_id = Column(String)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    user_id = Column(BigInteger, ForeignKey("users.id"))

    # Relationship
    user = relationship("User", back_populates="images")
