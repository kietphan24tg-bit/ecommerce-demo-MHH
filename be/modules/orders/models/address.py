from typing import TYPE_CHECKING

from db.base import Base
from db.mixins import TimestampMixin
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from modules.orders.models.order import Order
    from modules.users.model import User


class Address(TimestampMixin, Base):
    __tablename__ = "addresses"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    street: Mapped[str] = mapped_column(nullable=False)
    city: Mapped[str] = mapped_column(nullable=False)
    district: Mapped[str] = mapped_column(nullable=False)
    ward: Mapped[str] = mapped_column(nullable=False)
    is_default: Mapped[bool] = mapped_column(nullable=False, default=False)
    recipient_name: Mapped[str] = mapped_column(nullable=False)
    recipient_phone: Mapped[str] = mapped_column(nullable=False)
    recipient_email: Mapped[str | None] = mapped_column(nullable=True)

    user: Mapped["User"] = relationship(back_populates="addresses")
    orders: Mapped[list["Order"]] = relationship(back_populates="address")
