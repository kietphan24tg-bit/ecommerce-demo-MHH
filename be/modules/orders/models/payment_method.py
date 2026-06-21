from typing import TYPE_CHECKING

from db.base import Base
from db.mixins import TimestampMixin
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from modules.orders.models.order import Order


class PaymentMethod(TimestampMixin, Base):
    __tablename__ = "payment_methods"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(nullable=False, unique=True)
    code: Mapped[str] = mapped_column(nullable=False, unique=True)
    description: Mapped[str | None] = mapped_column(nullable=True)

    orders: Mapped[list["Order"]] = relationship(back_populates="payment_method")
