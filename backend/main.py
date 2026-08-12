from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from jose import jwt, JWTError
from bson import ObjectId
from typing import List

from database import products_collection, db


app = FastAPI()


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
    "password": "01152008"
}


# =========================================================
# MONGODB COLLECTIONS
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

def verify_admin(authorization: str = Header(None)):

    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="No token"
        )

    try:

        parts = authorization.split(" ")

        if len(parts) != 2:
            raise HTTPException(
                status_code=401,
                detail="Invalid authorization"
            )

        token = parts[1]

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        if payload.get("role") != "admin":
            raise HTTPException(
                status_code=403,
                detail="Not admin"
            )

    except JWTError:

        raise HTTPException(
            status_code=401,
            detail="Invalid token"
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

    for product in products_collection.find():

        product["id"] = str(product["_id"])

        del product["_id"]

        products.append(product)

    return products


# =========================================================
# ADD PRODUCT - ADMIN
# =========================================================

@app.post("/products")
def add_product(
    product: Product,
    admin=Depends(verify_admin)
):

    products_collection.insert_one(
        product.dict()
    )

    return {
        "message": "Product Added"
    }


# =========================================================
# DELETE PRODUCT - ADMIN
# =========================================================

@app.delete("/products/{product_id}")
def delete_product(
    product_id: str,
    admin=Depends(verify_admin)
):

    try:

        result = products_collection.delete_one(
            {
                "_id": ObjectId(product_id)
            }
        )

        if result.deleted_count == 0:

            raise HTTPException(
                status_code=404,
                detail="Product not found"
            )

        return {
            "message": "Product Deleted"
        }

    except HTTPException:
        raise

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid product ID"
        )


# =========================================================
# ADMIN LOGIN
# =========================================================

@app.post("/admin/login")
def admin_login(data: dict):

    if (
        data.get("username") == ADMIN_USER["username"]
        and
        data.get("password") == ADMIN_USER["password"]
    ):

        token = jwt.encode(
            {
                "role": "admin"
            },
            SECRET_KEY,
            algorithm=ALGORITHM
        )

        return {
            "token": token
        }

    raise HTTPException(
        status_code=401,
        detail="Wrong credentials"
    )


# =========================================================
# CREATE ORDER - CUSTOMER
# =========================================================

@app.post("/orders")
def create_order(order: Order):

    # Customer name check
    if not order.customer_name.strip():

        raise HTTPException(
            status_code=400,
            detail="Customer name is required"
        )

    # Phone check
    if not order.phone.strip():

        raise HTTPException(
            status_code=400,
            detail="Phone number is required"
        )

    # Address check
    if not order.address.strip():

        raise HTTPException(
            status_code=400,
            detail="Address is required"
        )

    # Cart check
    if len(order.items) == 0:

        raise HTTPException(
            status_code=400,
            detail="Cart is empty"
        )

    # Total check
    if order.total <= 0:

        raise HTTPException(
            status_code=400,
            detail="Invalid total"
        )

    # Create order
    new_order = {

        "customer_name": order.customer_name,

        "phone": order.phone,

        "address": order.address,

        "payment_method": order.payment_method,

        "items": [
            item.dict()
            for item in order.items
        ],

        "total": order.total,

        "status": "Pending"
    }

    result = orders_collection.insert_one(
        new_order
    )

    return {

        "message": "Order placed successfully",

        "order_id": str(
            result.inserted_id
        ),

        "status": "Pending"
    }


# =========================================================
# TRACK ORDER - CUSTOMER
# =========================================================

@app.get("/orders/{order_id}/track")
def track_order(order_id: str):

    try:

        order = orders_collection.find_one(
            {
                "_id": ObjectId(order_id)
            }
        )

        if not order:

            raise HTTPException(
                status_code=404,
                detail="Order not found"
            )

        return {

            "order_id": str(
                order["_id"]
            ),

            "customer_name":
                order.get(
                    "customer_name",
                    ""
                ),

            "status":
                order.get(
                    "status",
                    "Pending"
                ),

            "items":
                order.get(
                    "items",
                    []
                ),

            "total":
                order.get(
                    "total",
                    0
                ),

            "payment_method":
                order.get(
                    "payment_method",
                    "COD"
                ),

            "created_at":
                order["_id"]
                .generation_time
                .isoformat()
        }

    except HTTPException:
        raise

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid order ID"
        )


# =========================================================
# GET ALL ORDERS - ADMIN
# =========================================================

@app.get("/orders")
def get_orders(
    admin=Depends(verify_admin)
):

    orders = []

    for order in orders_collection.find().sort(
        "_id",
        -1
    ):

        order["id"] = str(
            order["_id"]
        )

        del order["_id"]

        orders.append(order)

    return orders


# =========================================================
# UPDATE ORDER STATUS - ADMIN
# =========================================================

@app.put("/orders/{order_id}/status")
def update_order_status(
    order_id: str,
    data: dict,
    admin=Depends(verify_admin)
):

    allowed_statuses = [

        "Pending",

        "Confirmed",

        "Processing",

        "Shipped",

        "Delivered",

        "Cancelled"
    ]

    status = data.get("status")

    if status not in allowed_statuses:

        raise HTTPException(
            status_code=400,
            detail="Invalid order status"
        )

    try:

        result = orders_collection.update_one(

            {
                "_id": ObjectId(
                    order_id
                )
            },

            {
                "$set": {
                    "status": status
                }
            }
        )

        if result.matched_count == 0:

            raise HTTPException(
                status_code=404,
                detail="Order not found"
            )

        return {

            "message":
                "Order status updated",

            "status":
                status
        }

    except HTTPException:
        raise

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid order ID"
        )


# =========================================================
# DELETE ORDER - ADMIN
# =========================================================

@app.delete("/orders/{order_id}")
def delete_order(
    order_id: str,
    admin=Depends(verify_admin)
):

    try:

        result = orders_collection.delete_one(

            {
                "_id": ObjectId(
                    order_id
                )
            }
        )

        if result.deleted_count == 0:

            raise HTTPException(
                status_code=404,
                detail="Order not found"
            )

        return {
            "message": "Order deleted"
        }

    except HTTPException:
        raise

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid order ID"
        )


# =========================================================
# SAMPLE DATA
# =========================================================

@app.get("/add-sample")
def add_sample():

    products_collection.insert_many(

        [

            {
                "name": "Shirt",
                "price": 500,
                "image": "",
                "category": "Fashion",
                "section": "Featured"
            },

            {
                "name": "Pant",
                "price": 1200,
                "image": "",
                "category": "Fashion",
                "section": "Trending"
            },

            {
                "name": "Shoes",
                "price": 2500,
                "image": "",
                "category": "Fashion",
                "section": "Flash Sale"
            }

        ]
    )

    return {
        "message": "Sample added"
    }