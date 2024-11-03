from sqlalchemy import BigInteger, Column, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class ListsOnUsers(Base):
    __tablename__ = "lists_users"

    list_id = Column(BigInteger, ForeignKey("lists.id"), primary_key=True)
    user_id = Column(BigInteger, ForeignKey("users.id"), primary_key=True)

    # Relationships
    user = relationship("User", back_populates="lists")
    list = relationship("List", back_populates="users")


class SpaceObjectsOnLists(Base):
    __tablename__ = "space_objects_lists"

    list_id = Column(BigInteger, ForeignKey("lists.id"), primary_key=True)
    space_object_id = Column(
        BigInteger, ForeignKey("space_objects.id"), primary_key=True
    )

    # Relationships
    list = relationship("List", back_populates="objects")
    space_object = relationship("SpaceObject", back_populates="lists")
