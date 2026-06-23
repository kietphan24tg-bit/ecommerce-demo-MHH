"""sync_schema_after_drift

Revision ID: 11af1f686aad
Revises: 47b8f661fede
Create Date: 2026-06-21 17:52:48.252899

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '11af1f686aad'
down_revision: Union[str, Sequence[str], None] = '47b8f661fede'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "users",
        sa.Column("role", sa.String(), nullable=False, server_default="user"),
    )
    op.create_check_constraint(
        op.f("ck_users_ck_users_role_valid"),
        "users",
        "role IN ('user', 'admin')",
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint(op.f("ck_users_ck_users_role_valid"), "users", type_="check")
    op.drop_column("users", "role")
