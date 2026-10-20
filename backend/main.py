import os
import logging
import re
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from fastapi import FastAPI, HTTPException, Depends, Header, Query, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from jose import jwt, JWTError
from bson import ObjectId

from database import products_collection, db


# =========================================================
# CONFIGURATION
# =========================================================

logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"))
logger = logging.getLogger("lozzby")

SECRET_KEY = os.getenv("SECRET_KEY", "CHANGE-THIS-SECRET-IN-RENDER")
ALGORITHM = "HS256"

ADMIN_USER = os.getenv("ADMIN_USER", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "01152008")

ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "720")
)

app = FastAPI(
    title="Lozzby Backend",
    version="2.1.0",
    description="Lozzby ecommerce API",
)


# =========================================================
# CORS — FIXED
# =========================================================

default_origins = [
    "http://127.0.0.1:3000",
    "http://localhost:3000",
    "http://192.168.1.104:3000",
    "https://dailydrop-iyc5.onrender.com",
    "https://lozzby-frontend.onrender.com",
]

extra_origins = [
    origin.strip().rstrip("/")
    for origin in os.getenv("FRONTEND_ORIGINS", "").split(",")
    if origin.strip()
]

allowed_origins = list(dict.fromkeys(default_origins + extra_origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# DATABASE
# =========================================================

orders_collection = db["orders"]


# =========================================================
# MODELS
# =========================================================

class LoginRequest(BaseModel):
    username: str = Field(min_length=1, max_length=100)
    password: str = Field(min_length=1, max_length=256)


class Product(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    price: float = Field(ge=0)
    image: str = ""
    category: str = "Electronics"
    section: str = "Featured"
    description: str = ""
    stock: int = Field(default=0, ge=0)
    featured: bool = False
    active: bool = True


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=200)
    price: Optional[float] = Field(default=None, ge=0)
    image: Optional[str] = None
    category: Optional[str] = None
    section: Optional[str] = None
    description: Optional[str] = None
    stock: Optional[int] = Field(default=None, ge=0)
    featured: Optional[bool] = None
    active: Optional[bool] = None


class OrderStatus(BaseModel):
    status: str = Field(min_length=1, max_length=50)


class OrderCreate(BaseModel):
    customer_name: str = Field(min_length=1, max_length=200)
    phone: str = Field(min_length=5, max_length=40)
    address: str = Field(min_length=3, max_length=1000)
    items: list[dict[str, Any]] = Field(min_length=1)
    total: float = Field(ge=0)
    payment_method: str = "Cash on Delivery"
    note: str = ""


# =========================================================
# HELPERS
# =========================================================

def now_utc():
    return datetime.now(timezone.utc)


def serialize_value(value):
    if isinstance(value, ObjectId):
        return str(value)
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, dict):
        return {k: serialize_value(v) for k, v in value.items()}
    if isinstance(value, list):
        return [serialize_value(v) for v in value]
    return value


def serialize_doc(document):
    return serialize_value(dict(document))


def find_selector(item_id: str):
    if ObjectId.is_valid(item_id):
        return {"_id": ObjectId(item_id)}
    return {"name": item_id}


# =========================================================
# AUTHENTICATION
# =========================================================

def create_token(username: str):
    issued = now_utc()
    expires = issued + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    return jwt.encode(
        {
            "sub": username,
            "role": "admin",
            "iat": int(issued.timestamp()),
            "exp": int(expires.timestamp()),
        },
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


def verify_token(token: str):
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        username = payload.get("sub")
        role = payload.get("role")

        if username != ADMIN_USER or role != "admin":
            raise HTTPException(status_code=403, detail="Invalid admin token")

        return username

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
        )


async def admin_required(
    authorization: Optional[str] = Header(default=None, alias="Authorization"),
):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization required")

    scheme, separator, token = authorization.partition(" ")

    if not separator or scheme.lower() != "bearer" or not token.strip():
        raise HTTPException(
            status_code=401,
            detail="Use Authorization: Bearer <token>",
        )

    return verify_token(token.strip())


# =========================================================
# HOME / HEALTH
# =========================================================

@app.get("/")
def home():
    return {"message": "Lozzby Backend Running", "version": app.version}


@app.get("/healthz")
def healthz():
    return {"status": "ok"}


@app.get("/health")
def health():
    try:
        db.command("ping")
        return {"ok": True, "database": "connected"}
    except Exception:
        logger.exception("Database health check failed")
        raise HTTPException(status_code=503, detail="Database unavailable")


# =========================================================
# ADMIN LOGIN
# =========================================================

@app.post("/admin/login")
def admin_login(data: LoginRequest):
    if not ADMIN_PASSWORD:
        raise HTTPException(
            status_code=503,
            detail="fuck you",
        )

    if data.username != ADMIN_USER or data.password != ADMIN_PASSWORD:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password",
        )

    token = create_token(data.username)

    return {
        "message": "Login successful",
        "token": token,
        "access_token": token,
        "token_type": "bearer",
        "username": data.username,
        "role": "admin",
    }


@app.get("/admin/me")
def admin_me(admin=Depends(admin_required)):
    return {"username": admin, "role": "admin", "authenticated": True}


# =========================================================
# PRODUCTS — PUBLIC
# =========================================================

@app.get("/products")
def get_products(
    category: Optional[str] = None,
    section: Optional[str] = None,
    search: Optional[str] = None,
    featured: Optional[bool] = None,
    limit: int = Query(default=200, ge=1, le=500),
):
    filters = {}

    if category:
        filters["category"] = category
    if section:
        filters["section"] = section
    if featured is not None:
        filters["featured"] = featured
    if search:
        filters["name"] = {"$regex": re.escape(search), "$options": "i"}

    try:
        products = list(
            products_collection.find(filters).sort("_id", -1).limit(limit)
        )
        return [serialize_doc(p) for p in products]
    except Exception:
        logger.exception("Could not load products")
        raise HTTPException(status_code=500, detail="Could not load products")


@app.get("/products/{product_id}")
def get_product(product_id: str):
    try:
        product = products_collection.find_one(find_selector(product_id))
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        return serialize_doc(product)
    except HTTPException:
        raise
    except Exception:
        logger.exception("Product detail error")
        raise HTTPException(status_code=500, detail="Could not load product")


# =========================================================
# PRODUCTS — CREATE
# =========================================================

def _create_product(product: Product):
    try:
        if products_collection.find_one({"name": product.name}):
            raise HTTPException(
                status_code=400,
                detail="Product with this name already exists",
            )

        new_product = product.model_dump()
        new_product["created_at"] = now_utc()
        new_product["updated_at"] = now_utc()

        result = products_collection.insert_one(new_product)

        return {
            "message": "Product added successfully",
            "id": str(result.inserted_id),
            "_id": str(result.inserted_id),
        }
    except HTTPException:
        raise
    except Exception:
        logger.exception("Product creation error")
        raise HTTPException(status_code=500, detail="Could not add product")


@app.post("/products", status_code=status.HTTP_201_CREATED)
def add_product(product: Product, admin=Depends(admin_required)):
    return _create_product(product)


@app.post("/admin/products", status_code=status.HTTP_201_CREATED)
def admin_add_product(product: Product, admin=Depends(admin_required)):
    return _create_product(product)


@app.get("/admin/products")
def get_admin_products(admin=Depends(admin_required)):
    try:
        return [
            serialize_doc(p)
            for p in products_collection.find({}).sort("_id", -1)
        ]
    except Exception:
        logger.exception("Admin product list error")
        raise HTTPException(status_code=500, detail="Could not load products")


# =========================================================
# PRODUCTS — UPDATE
# =========================================================

def _update_product(product_id: str, product: ProductUpdate):
    changes = product.model_dump(exclude_unset=True)

    if not changes:
        raise HTTPException(status_code=400, detail="No fields supplied")

    changes["updated_at"] = now_utc()
    selector = find_selector(product_id)

    try:
        result = products_collection.update_one(selector, {"$set": changes})

        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Product not found")

        updated = products_collection.find_one(selector)
        return serialize_doc(updated) if updated else {
            "message": "Product updated successfully"
        }
    except HTTPException:
        raise
    except Exception:
        logger.exception("Product update error")
        raise HTTPException(status_code=500, detail="Could not update product")


@app.put("/products/{product_id}")
def update_product(
    product_id: str,
    product: ProductUpdate,
    admin=Depends(admin_required),
):
    return _update_product(product_id, product)


@app.patch("/products/{product_id}")
def patch_product(
    product_id: str,
    product: ProductUpdate,
    admin=Depends(admin_required),
):
    return _update_product(product_id, product)


@app.put("/admin/products/{product_id}")
def admin_update_product(
    product_id: str,
    product: ProductUpdate,
    admin=Depends(admin_required),
):
    return _update_product(product_id, product)


# =========================================================
# PRODUCTS — DELETE
# =========================================================

def _delete_product(product_id: str):
    try:
        result = products_collection.delete_one(find_selector(product_id))
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Product not found")
        return {"message": "Product deleted successfully"}
    except HTTPException:
        raise
    except Exception:
        logger.exception("Product delete error")
        raise HTTPException(status_code=500, detail="Could not delete product")


@app.delete("/products/{product_id}")
def delete_product(product_id: str, admin=Depends(admin_required)):
    return _delete_product(product_id)


@app.delete("/admin/products/{product_id}")
def admin_delete_product(product_id: str, admin=Depends(admin_required)):
    return _delete_product(product_id)


# =========================================================
# ORDERS — CREATE
# =========================================================

@app.post("/orders", status_code=status.HTTP_201_CREATED)
def create_order(order: OrderCreate):
    try:
        new_order = order.model_dump()
        new_order["status"] = "Pending"
        new_order["created_at"] = now_utc()
        new_order["updated_at"] = now_utc()

        result = orders_collection.insert_one(new_order)

        return {
            "message": "Order placed successfully",
            "id": str(result.inserted_id),
            "_id": str(result.inserted_id),
        }
    except Exception:
        logger.exception("Order creation error")
        raise HTTPException(status_code=500, detail="Could not create order")


# =========================================================
# ORDERS — READ
# =========================================================

@app.get("/orders")
def get_orders(admin=Depends(admin_required)):
    try:
        orders = list(orders_collection.find({}).sort("_id", -1))
        return [serialize_doc(order) for order in orders]
    except Exception:
        logger.exception("Order list error")
        raise HTTPException(status_code=500, detail="Could not load orders")


@app.get("/admin/orders")
def admin_get_orders(admin=Depends(admin_required)):
    return get_orders(admin)


# =========================================================
# ORDERS — UPDATE STATUS
# =========================================================

def _update_order_status(order_id: str, data: OrderStatus):
    try:
        selector = find_selector(order_id)
        result = orders_collection.update_one(
            selector,
            {"$set": {"status": data.status, "updated_at": now_utc()}},
        )

        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Order not found")

        updated = orders_collection.find_one(selector)
        return serialize_doc(updated) if updated else {
            "message": "Order status updated successfully"
        }
    except HTTPException:
        raise
    except Exception:
        logger.exception("Order status update error")
        raise HTTPException(status_code=500, detail="Could not update order")


@app.put("/orders/{order_id}/status")
def update_order_status(
    order_id: str,
    data: OrderStatus,
    admin=Depends(admin_required),
):
    return _update_order_status(order_id, data)


@app.patch("/admin/orders/{order_id}/status")
def admin_update_order_status(
    order_id: str,
    data: OrderStatus,
    admin=Depends(admin_required),
):
    return _update_order_status(order_id, data)


# =========================================================
# ORDERS — DELETE
# =========================================================

def _delete_order(order_id: str):
    try:
        result = orders_collection.delete_one(find_selector(order_id))
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Order not found")
        return {"message": "Order deleted successfully"}
    except HTTPException:
        raise
    except Exception:
        logger.exception("Order delete error")
        raise HTTPException(status_code=500, detail="Could not delete order")


@app.delete("/orders/{order_id}")
def delete_order(order_id: str, admin=Depends(admin_required)):
    return _delete_order(order_id)


@app.delete("/admin/orders/{order_id}")
def admin_delete_order(order_id: str, admin=Depends(admin_required)):
    return _delete_order(order_id)
