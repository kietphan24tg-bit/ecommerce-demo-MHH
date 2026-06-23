"""enable_social_auth_users

Revision ID: f316af0b7f8d
Revises: b809e86bb67b
Create Date: 2026-06-22 18:35:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "f316af0b7f8d"
down_revision: Union[str, Sequence[str], None] = "b809e86bb67b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column("users", "phone", existing_type=sa.String(), nullable=True)
    op.alter_column(
        "users",
        "password_hash",
        existing_type=sa.String(),
        nullable=True,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column(
        "users",
        "password_hash",
        existing_type=sa.String(),
        nullable=False,
    )
    op.alter_column("users", "phone", existing_type=sa.String(), nullable=False)
