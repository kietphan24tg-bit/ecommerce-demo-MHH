from typing import TYPE_CHECKING

from db.base import Base
from db.mixins import TimestampMixin
from sqlalchemy import CheckConstraint, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from modules.categories.model import Category
    from modules.products.models.benefits import Benefits
    from modules.products.models.product_review import ProductReview
    from modules.carts.cart_item import CartItem
    from modules.saved_items.model import SavedItem


class Product(TimestampMixin, Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(nullable=False)
    description: Mapped[str | None] = mapped_column(nullable=True)
    original_price: Mapped[int] = mapped_column(nullable=False)
    discount_type: Mapped[str | None] = mapped_column(nullable=True)
    discount: Mapped[int | None] = mapped_column(nullable=True)
    category_id: Mapped[int | None] = mapped_column(
        ForeignKey("categories.id", ondelete="SET NULL"),
        nullable=True,
    )
    slug: Mapped[str] = mapped_column(nullable=False, unique=True)
    # Average rating derived from product reviews.
    rating: Mapped[float | None] = mapped_column(nullable=True)
    country: Mapped[str | None] = mapped_column(nullable=True)
    gallery: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    sizes: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    colors: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)

    category: Mapped["Category"] = relationship(back_populates="products")
    benefits: Mapped[list["Benefits"]] = relationship(back_populates="product")
    cart_items: Mapped[list["CartItem"]] = relationship(back_populates="product")
    reviews: Mapped[list["ProductReview"]] = relationship(
        back_populates="product",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    saved_by_users: Mapped[list["SavedItem"]] = relationship(
        back_populates="product",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    __table_args__ = (
        CheckConstraint("original_price >= 0", name="check_original_price_non_negative"),
        CheckConstraint(
            "discount_type IN ('percentage', 'fixed') OR discount_type IS NULL",
            name="check_discount_type_valid",
        ),
        CheckConstraint("discount >= 0 OR discount IS NULL", name="check_discount_non_negative"),
        CheckConstraint(
            "(discount_type IS NULL AND discount IS NULL) OR (discount_type IS NOT NULL AND discount IS NOT NULL)",
            name="check_discount_pair_consistency",
        ),
        CheckConstraint(
            "discount_type != 'percentage' OR discount <= 100",
            name="check_discount_percentage_range",
        ),
        CheckConstraint(
            "discount_type != 'fixed' OR discount <= original_price",
            name="check_discount_fixed_range",
        ),
        CheckConstraint("rating >= 0 AND rating <= 5 OR rating IS NULL", name="check_rating_range"),
    )
