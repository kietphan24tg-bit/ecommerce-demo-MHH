from typing import TYPE_CHECKING

from db.base import Base
from db.mixins import TimestampMixin
from sqlalchemy import CheckConstraint, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from modules.products.models.product import Product
    from modules.users.model import User


class ProductReview(TimestampMixin, Base):
    __tablename__ = "product_reviews"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
    )
    user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    rating: Mapped[int] = mapped_column(nullable=False)
    comment: Mapped[str | None] = mapped_column(nullable=True)
    color: Mapped[str | None] = mapped_column(nullable=True)
    helpful_count: Mapped[int] = mapped_column(nullable=False, default=0)
    size: Mapped[str | None] = mapped_column(nullable=True)

    product: Mapped["Product"] = relationship(back_populates="reviews")
    user: Mapped["User"] = relationship(back_populates="reviews")

    __table_args__ = (
        CheckConstraint("rating >= 1 AND rating <= 5", name="check_rating_range"),
    )
