from typing import TYPE_CHECKING

from db.base import Base
from db.mixins import TimestampMixin
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from modules.products.models.product import Product


class Category(TimestampMixin, Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(nullable=False, unique=True)
    description: Mapped[str | None] = mapped_column(nullable=True)
    status: Mapped[str] = mapped_column(nullable=False)

    products: Mapped[list["Product"]] = relationship(back_populates="category")
