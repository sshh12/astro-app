from sqlalchemy import BigInteger, Column, String, Boolean, Enum, DateTime
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.enums import ListType
from datetime import datetime, timezone


class List(Base):
    __tablename__ = "lists"

    id = Column(BigInteger, primary_key=True, index=True)
    title = Column(String)
    type = Column(Enum(ListType))
    img_url = Column(String)
    credit = Column(String)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    users = relationship("ListsOnUsers", back_populates="list")
    objects = relationship("SpaceObjectsOnLists", back_populates="list")
