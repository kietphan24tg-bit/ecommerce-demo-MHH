from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from api.v1.router import api_router
from core.exceptions import AppException, NotFoundException
from core.exception_handlers import app_exception_handler, http_exception_handler, unhandled_exception_handler, validation_exception_handler
from core.logging import setup_logging
from core.middleware.logging import logging_middleware
from core.middleware.request_id import request_id_middleware
from core.responses import success_response
from db.database import Base, engine
from core.config import get_settings
from modules.auth.models.password_reset import PasswordReset
from modules.auth.models.session import Session
from modules.auth.models.user_provider import UserProvider
from modules.categories.model import Category
from modules.orders.models.address import Address
from modules.carts.cart_item import CartItem
from modules.orders.models.order import Order
from modules.orders.models.payment_method import PaymentMethod
from modules.orders.models.promotion import Promotion
from modules.orders.models.shipping_method import ShippingMethod
from modules.products.models.product import Product
from modules.products.models.benefits import Benefits
from modules.products.models.product_review import ProductReview
from modules.saved_items.model import SavedItem
from modules.users.model import User
from starlette.exceptions import HTTPException as StarletteHTTPException


settings = get_settings()
setup_logging()
app = FastAPI(
    title=settings.app_name,
    debug=settings.debug,
)

# request id middleware
app.middleware("http")(request_id_middleware)
app.middleware("http")(logging_middleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(Exception, unhandled_exception_handler)
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError,validation_exception_handler)
app.include_router(api_router, prefix=f"/{settings.api_prefix}")

@app.on_event("startup")
def on_startup() -> None:
    # Importing models above ensures SQLAlchemy sees the tables before create_all.
    Base.metadata.create_all(bind=engine)
@app.get("/")
def root() -> dict[str, str]:
    return {"message": "Fast api is running"}

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=4000, reload=True)


@app.get("/test-success")
def test_success():
    return success_response(
        data={"ok": True},
        message="Operation successful",
    )

@app.get("/test-not-found")
def test_not_found():
    raise NotFoundException(message="User not found")

class LoginBody(BaseModel):
    email: str
    password: str = Field(min_length=8)
@app.post("/test-validation")
def test_validation(body: LoginBody):
    return success_response(data={"email": body.email})


@app.get("/test-500")
def test_500():
    data = None
    return data["x"]
