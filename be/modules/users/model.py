from typing import TYPE_CHECKING

from db.base import Base
from db.mixins import TimestampMixin
from sqlalchemy import CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from modules.auth.models.password_reset import PasswordReset
    from modules.auth.models.session import Session
    from modules.auth.models.user_provider import UserProvider
    from modules.orders.models.address import Address
    from modules.orders.models.order import Order
    from modules.products.models.product_review import ProductReview
    from modules.saved_items.model import SavedItem


class User(TimestampMixin, Base):
    __tablename__ = "users"
    __table_args__ = (
        CheckConstraint("role IN ('user', 'admin')", name="ck_users_role_valid"),
    )

    DEFAULT_ROLE = "user"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    full_name: Mapped[str] = mapped_column(nullable=False)
    email: Mapped[str] = mapped_column(unique=True, index=True, nullable=False)
    phone: Mapped[str | None] = mapped_column(nullable=True)
    role: Mapped[str] = mapped_column(nullable=False, default=DEFAULT_ROLE)
    password_hash: Mapped[str | None] = mapped_column(nullable=True)

    sessions: Mapped[list["Session"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    user_providers: Mapped[list["UserProvider"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    addresses: Mapped[list["Address"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    orders: Mapped[list["Order"]] = relationship(back_populates="user")
    saved_items: Mapped[list["SavedItem"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    reviews: Mapped[list["ProductReview"]] = relationship(back_populates="user")
    password_resets: Mapped[list["PasswordReset"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
