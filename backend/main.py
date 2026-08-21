from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from jose import jwt, JWTError
from bson import ObjectId
from typing import List, Optional

from database import products_collection, db


app = FastAPI(title="Lozzby Backend")


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:3000",
        "http://localhost:3000",
        "http://192.168.1.104:3000",
        "https://dailydrop-iyc5.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# CONFIG
# =========================================================

SECRET_KEY = "lozzby_secret"
ALGORITHM = "HS256"

ADMIN_USER = {
    "username": "admin",
    "password": "01152008",
}


# =========================================================
# COLLECTIONS
# =========================================================

orders_collection = db["orders"]


# =========================================================
# PRODUCT MODEL
# =========================================================

class Product(BaseModel):
    name: str
    price: float
    image: str = ""
    category: str = "Electronics"
    section: str = "Featured"


# =========================================================
# ORDER ITEM MODEL
# =========================================================

class OrderItem(BaseModel):
    product_id: str = ""
    name: str
    price: float
    quantity: int
    image: str = ""


# =========================================================
# ORDER MODEL
# =========================================================

class Order(BaseModel):
    customer_name: str
    phone: str
    address: str
    payment_method: str = "COD"
    items: List[OrderItem]
    total: float


# =========================================================
# ADMIN AUTH
# =========================================================

def verify_admin(
    authorization: Optional[str] = Header(default=None)
):
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="No token provided",
        )

    parts = authorization.split(" ")

    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=401,
            detail="Invalid authorization",
        )

    token = parts[1]

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        if payload.get("role") != "admin":
            raise HTTPException(
                status_code=403,
                detail="Not authorized as admin",
            )

        return True

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
        )


# =========================================================
# HOME
# =========================================================

@app.get("/")
def home():
    return {
        "message": "Lozzby Backend Running"
    }


# =========================================================
# GET PRODUCTS
# =========================================================

@app.get("/products")
def get_products():

    products = []

    for product in products_collection.find().sort("_id", -1):

        product["id"] = str(product["_id"])

        del product["_id"]

        products.append(product)

    return products


# =========================================================
# ADD PRODUCT
# =========================================================

@app.post("/products")
def add_product(
    product: Product,
    admin=Depends(verify_admin),
):

    product_data = {
        "name": product.name.strip(),
        "price": product.price,
        "image": product.image,
        "category": product.category,
        "section": product.section,
    }

    if not product_data["name"]:
        raise HTTPException(
            status_code=400,
            detail="Product name is required",
        )

    if product.price < 0:
        raise HTTPException(
            status_code=400,
            detail="Invalid product price",
        )

    result = products_collection.insert_one(
        product_data
    )

    return {
        "message": "Product Added Successfully",
        "id": str(result.inserted_id),
        "product": {
            "id": str(result.inserted_id),
            **product_data,
        },
    }


# =========================================================
# DELETE PRODUCT
# =========================================================

@app.delete("/products/{product_id}")
def delete_product(
    product_id: str,
    admin=Depends(verify_admin),
):

    if not ObjectId.is_valid(product_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid product ID",
        )

    result = products_collection.delete_one(
        {
            "_id": ObjectId(product_id)
        }
    )

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Product not found",
        )

    return {
        "message": "Product Deleted Successfully"
    }


# =========================================================
# ADMIN LOGIN
# =========================================================

@app.post("/admin/login")
def admin_login(data: dict):

    username = data.get("username")
    password = data.get("password")

    if (
        username == ADMIN_USER["username"]
        and password == ADMIN_USER["password"]
    ):

        token = jwt.encode(
            {
                "role": "admin",
                "username": username,
            },
            SECRET_KEY,
            algorithm=ALGORITHM,
        )

        return {
            "token": token
        }

    raise HTTPException(
        status_code=401,
        detail="Wrong username or password",
    )


# =========================================================
# CREATE ORDER
# =========================================================

@app.post("/orders")
def create_order(order: Order):

    if not order.customer_name.strip():
        raise HTTPException(
            status_code=400,
            detail="Customer name is required",
        )

    if not order.phone.strip():
        raise HTTPException(
            status_code=400,
            detail="Phone number is required",
        )

    if not order.address.strip():
        raise HTTPException(
            status_code=400,
            detail="Address is required",
        )

    if len(order.items) == 0:
        raise HTTPException(
            status_code=400,
            detail="Cart is empty",
        )

    if order.total <= 0:
        raise HTTPException(
            status_code=400,
            detail="Invalid total",
        )

    new_order = {
        "customer_name": order.customer_name.strip(),
        "phone": order.phone.strip(),
        "address": order.address.strip(),
        "payment_method": order.payment_method,
        "items": [
            item.dict()
            for item in order.items
        ],
        "total": order.total,
        "status": "Pending",
    }

    result = orders_collection.insert_one(
        new_order
    )

    return {
        "message": "Order placed successfully",
        "order_id": str(result.inserted_id),
        "status": "Pending",
    }


# =========================================================
# TRACK ORDER
# =========================================================

@app.get("/orders/{order_id}/track")
def track_order(order_id: str):

    if not ObjectId.is_valid(order_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid order ID",
        )

    order = orders_collection.find_one(
        {
            "_id": ObjectId(order_id)
        }
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found",
        )

    return {
        "order_id": str(order["_id"]),
        "customer_name": order.get(
            "customer_name",
            "",
        ),
        "phone": order.get(
            "phone",
            "",
        ),
        "address": order.get(
            "address",
            "",
        ),
        "status": order.get(
            "status",
            "Pending",
        ),
        "items": order.get(
            "items",
            [],
        ),
        "total": order.get(
            "total",
            0,
        ),
        "payment_method": order.get(
            "payment_method",
            "COD",
        ),
        "created_at": order["_id"].generation_time.isoformat(),
    }


# =========================================================
# GET ALL ORDERS
# =========================================================

@app.get("/orders")
def get_orders(
    admin=Depends(verify_admin),
):

    orders = []

    for order in orders_collection.find().sort(
        "_id",
        -1,
    ):

        order["id"] = str(
            order["_id"]
        )

        del order["_id"]

        orders.append(order)

    return orders


# =========================================================
# UPDATE ORDER STATUS
# =========================================================

@app.put("/orders/{order_id}/status")
def update_order_status(
    order_id: str,
    data: dict,
    admin=Depends(verify_admin),
):

    allowed_statuses = [
        "Pending",
        "Confirmed",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
    ]

    status = data.get("status")

    if status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Invalid order status",
        )

    if not ObjectId.is_valid(order_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid order ID",
        )

    result = orders_collection.update_one(
        {
            "_id": ObjectId(order_id)
        },
        {
            "$set": {
                "status": status
            }
        },
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Order not found",
        )

    return {
        "message": "Order status updated",
        "status": status,
    }


# =========================================================
# DELETE ORDER
# =========================================================

@app.delete("/orders/{order_id}")
def delete_order(
    order_id: str,
    admin=Depends(verify_admin),
):

    if not ObjectId.is_valid(order_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid order ID",
        )

    result = orders_collection.delete_one(
        {
            "_id": ObjectId(order_id)
        }
    )

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Order not found",
        )

    return {
        "message": "Order Deleted Successfully"
    }