from typing import TYPE_CHECKING

from db.base import Base
from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from db.mixins import TimestampMixin

if TYPE_CHECKING:
    from modules.users.model import User


class UserProvider(TimestampMixin, Base):
    __tablename__ = "user_providers"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    provider_name: Mapped[str] = mapped_column(nullable=False)
    provider_user_id: Mapped[str] = mapped_column(nullable=False)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    user: Mapped["User"] = relationship(back_populates="user_providers")
    __table_args__ = (
        UniqueConstraint("provider_name", "provider_user_id"),
    )

