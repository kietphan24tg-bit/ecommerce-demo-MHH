from typing import TYPE_CHECKING

from db.base import Base
from db.mixins import TimestampMixin
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from modules.orders.models.order import Order


class ShippingMethod(TimestampMixin, Base):
    __tablename__ = "shipping_methods"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(nullable=False, unique=True)
    code: Mapped[str] = mapped_column(nullable=False, unique=True)
    description: Mapped[str | None] = mapped_column(nullable=True)
    cost: Mapped[int] = mapped_column(nullable=False)
    estimated_delivery_time: Mapped[str | None] = mapped_column(nullable=True)

    orders: Mapped["Order"] = relationship(back_populates="shipping_method")
