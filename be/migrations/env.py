from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

from core.config import get_settings
from modules.auth.models.password_reset import PasswordReset
from db.base import Base
from modules.auth.models.session import Session
from modules.auth.models.user_provider import UserProvider
from modules.categories.model import Category
from modules.carts.cart_item import CartItem
from modules.orders.models.address import Address
from modules.orders.models.order import Order
from modules.orders.models.payment_method import PaymentMethod
from modules.orders.models.promotion import Promotion
from modules.orders.models.shipping_method import ShippingMethod
from modules.products.models.benefits import Benefits
from modules.products.models.product import Product
from modules.products.models.product_review import ProductReview
from modules.saved_items.model import SavedItem
from modules.users.model import User

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

settings = get_settings()
config.set_main_option("sqlalchemy.url", settings.database_url)

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Importing models above registers all tables on Base.metadata.
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
