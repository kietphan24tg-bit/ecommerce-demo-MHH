from typing import TYPE_CHECKING

from db.base import Base
from db.mixins import TimestampMixin
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from modules.orders.models.address import Address
    from modules.carts.cart_item import CartItem
    from modules.orders.models.payment_method import PaymentMethod
    from modules.orders.models.promotion import Promotion
    from modules.orders.models.shipping_method import ShippingMethod
    from modules.users.model import User


class Order(TimestampMixin, Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    shipping_method_id: Mapped[int | None] = mapped_column(
        ForeignKey("shipping_methods.id", ondelete="SET NULL"),
        nullable=True,
    )
    payment_method_id: Mapped[int | None] = mapped_column(
        ForeignKey("payment_methods.id", ondelete="SET NULL"),
        nullable=True,
    )
    promotion_id: Mapped[int | None] = mapped_column(
        ForeignKey("promotions.id", ondelete="SET NULL"),
        nullable=True,
    )
    address_id: Mapped[int | None] = mapped_column(
        ForeignKey("addresses.id", ondelete="SET NULL"),
        nullable=True,
    )
    total_amount: Mapped[int] = mapped_column(nullable=False)
    status: Mapped[str] = mapped_column(nullable=False)
    note: Mapped[str | None] = mapped_column(nullable=True)
    discount: Mapped[int | None] = mapped_column(nullable=True)
    subtotal: Mapped[int] = mapped_column(nullable=False)

    user: Mapped["User"] = relationship(back_populates="orders")
    cart_items: Mapped[list["CartItem"]] = relationship(
        back_populates="order",
        cascade="all, delete-orphan",
    )
    shipping_method: Mapped["ShippingMethod | None"] = relationship(back_populates="orders")
    payment_method: Mapped["PaymentMethod | None"] = relationship(back_populates="orders")
    promotion: Mapped["Promotion | None"] = relationship(back_populates="orders")
    address: Mapped["Address | None"] = relationship(back_populates="orders")
