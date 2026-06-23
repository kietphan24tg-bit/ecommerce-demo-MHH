from typing import TYPE_CHECKING

from db.base import Base
from db.mixins import TimestampMixin
from sqlalchemy import CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from modules.orders.models.order import Order


class Promotion(TimestampMixin, Base):
    __tablename__ = "promotions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(nullable=False, unique=True)
    code: Mapped[str] = mapped_column(nullable=False, unique=True)
    description: Mapped[str | None] = mapped_column(nullable=True)
    type: Mapped[str] = mapped_column(nullable=False)
    discount_value: Mapped[int] = mapped_column(nullable=False)
    start_date: Mapped[str] = mapped_column(nullable=False)
    end_date: Mapped[str] = mapped_column(nullable=False)
    is_active: Mapped[bool] = mapped_column(nullable=False, default=True)

    orders: Mapped[list["Order"]] = relationship(back_populates="promotion")

    __table_args__ = (
        CheckConstraint("discount_value >= 0", name="check_discount_value_non_negative"),
        CheckConstraint("type IN ('percentage', 'fixed')", name="check_promotion_type_valid"),
        CheckConstraint("type != 'percentage' OR discount_value <= 100", name="check_promotion_percentage_range"),
    )
