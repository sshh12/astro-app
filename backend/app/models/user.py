from sqlalchemy import BigInteger, Column, String, DateTime, ARRAY
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(BigInteger, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    api_keys = Column(ARRAY(String), default=list)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    lists = relationship("ListsOnUsers", back_populates="user")
    equipment = relationship("Equipment", back_populates="user")
    location = relationship("Location", back_populates="user")
    images = relationship("Image", back_populates="user")
