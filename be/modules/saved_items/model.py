from db.base import Base
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from db.mixins import TimestampMixin
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from modules.users.model import User
    from modules.products.models.product import Product

class SavedItem(TimestampMixin, Base):
    __tablename__ = "saved_items"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
    )
    color: Mapped[str | None] = mapped_column(nullable=True)
    size: Mapped[str | None] = mapped_column(nullable=True)

    user: Mapped["User"] = relationship(back_populates="saved_items")
    product: Mapped["Product"] = relationship(back_populates="saved_by_users")
