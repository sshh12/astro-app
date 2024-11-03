from sqlalchemy import (
    BigInteger,
    Column,
    String,
    Boolean,
    Numeric,
    ForeignKey,
    DateTime,
)
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base


class Location(Base):
    __tablename__ = "locations"

    id = Column(BigInteger, primary_key=True, index=True)
    active = Column(Boolean, default=False)
    name = Column(String)
    lat = Column(Numeric)
    lon = Column(Numeric)
    elevation = Column(Numeric)
    timezone = Column(String)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    user_id = Column(BigInteger, ForeignKey("users.id"))

    # Relationship
    user = relationship("User", back_populates="location")
