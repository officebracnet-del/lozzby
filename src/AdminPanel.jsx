import { useEffect, useState } from "react";

const API = "http://127.0.0.1:8000";

const categories = [
  "Electronics",
  "Fashion",
  "Mobile Accessories",
  "Home & Living",
  "Beauty",
  "Groceries",
  "Sports",
  "Automotive",
];

const sections = [
  "Featured",
  "Trending",
  "Flash Sale",
];

export default function AdminPanel() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(
    localStorage.getItem("token") || ""
  );

  // PRODUCT
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [section, setSection] = useState("Featured");

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

  // ORDERS
  const [orders, setOrders] = useState([]);
  const [orderSearch, setOrderSearch] = useState("");
  const [loadingOrders, setLoadingOrders] = useState(false);

  // =========================
  // LOAD PRODUCTS
  // =========================

  const loadProducts = async () => {
    try {
      const res = await fetch(`${API}/products`);
      const data = await res.json();

      if (Array.isArray(data)) {
        setProducts(data);
      }
    } catch (error) {
      console.log("Product loading error:", error);
    }
  };

  // =========================
  // LOAD ORDERS
  // =========================

  const loadOrders = async () => {
    if (!token) return;

    setLoadingOrders(true);

    try {
      const res = await fetch(`${API}/orders`, {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setOrders(Array.isArray(data) ? data : []);
      } else {
        console.log(data);
      }
    } catch (error) {
      console.log("Order loading error:", error);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadProducts();
      loadOrders();
    }
  }, [token]);

  // =========================
  // LOGIN
  // =========================

  const login = async () => {
    if (!username || !password) {
      alert("Username and password required");
      return;
    }

    try {
      const res = await fetch(`${API}/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        setToken(data.token);
        localStorage.setItem("token", data.token);
        alert("Login Successful");
      } else {
        alert(data.detail || "Login Failed");
      }
    } catch (error) {
      alert("Backend is not running");
    }
  };

  // =========================
  // IMAGE SELECT
  // =========================

  const selectImage = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be less than 2MB");
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setImage(reader.result);
    };

    reader.readAsDataURL(file);
  };

  // =========================
  // ADD PRODUCT
  // =========================

  const addProduct = async () => {
    if (!name.trim() || !price) {
      alert("Product name and price are required");
      return;
    }

    try {
      const res = await fetch(`${API}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          name: name.trim(),
          price: Number(price),
          image: image,
          category: category,
          section: section,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Product Added Successfully");

        setName("");
        setPrice("");
        setImage("");
        setCategory("Electronics");
        setSection("Featured");

        loadProducts();
      } else {
        alert(data.detail || "Product add failed");
      }
    } catch (error) {
      alert("Backend is not running");
    }
  };

  // =========================
  // DELETE PRODUCT
  // =========================

  const deleteProduct = async (productId, productName) => {
    const confirmDelete = window.confirm(
      `Delete "${productName || "this product"}"?`
    );

    if (!confirmDelete) return;

    if (!productId) {
      alert("Product ID not found");
      return;
    }

    try {
      const res = await fetch(
        `${API}/products/${encodeURIComponent(productId)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert("Product Deleted");
        loadProducts();
      } else {
        alert(data.detail || "Delete failed");
      }
    } catch (error) {
      alert("Backend is not running");
    }
  };

  // =========================
  // UPDATE ORDER STATUS
  // =========================

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(
        `${API}/orders/${encodeURIComponent(orderId)}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        loadOrders();
      } else {
        alert(data.detail || "Status update failed");
      }
    } catch (error) {
      alert("Backend is not running");
    }
  };

  // =========================
  // DELETE ORDER
  // =========================

  const deleteOrder = async (orderId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this order?"
    );

    if (!confirmDelete) return;

    try {
      const res = await fetch(
        `${API}/orders/${encodeURIComponent(orderId)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert("Order Deleted");
        loadOrders();
      } else {
        alert(data.detail || "Order delete failed");
      }
    } catch (error) {
      alert("Backend is not running");
    }
  };

  // =========================
  // LOGOUT
  // =========================

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setOrders([]);
  };

  // =========================
  // PRODUCT SEARCH
  // =========================

  const filteredProducts = products.filter((product) => {
    const text = `${product.name || ""} ${
      product.category || ""
    } ${product.section || ""}`.toLowerCase();

    return text.includes(search.toLowerCase());
  });

  // =========================
  // ORDER SEARCH
  // =========================

  const filteredOrders = orders.filter((order) => {
    const text = `
      ${order.customer_name || ""}
      ${order.phone || ""}
      ${order.address || ""}
      ${order.payment_method || ""}
      ${order.status || ""}
      ${order.id || ""}
    `.toLowerCase();

    return text.includes(orderSearch.toLowerCase());
  });

  // =========================
  // LOGIN SCREEN
  // =========================

  if (!token) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f1f5f9",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px",
        }}
      >
        <div
          style={{
            width: "380px",
            maxWidth: "100%",
            background: "white",
            padding: "30px",
            borderRadius: "15px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          }}
        >
          <h2>🧑‍💼 Lozzby Admin</h2>

          <p style={{ color: "#64748b" }}>
            Login to manage your store
          </p>

          <input
            style={inputStyle}
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            style={inputStyle}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button style={buttonStyle} onClick={login}>
            🔐 Login
          </button>
        </div>
      </div>
    );
  }

  // =========================
  // ADMIN PANEL
  // =========================

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f1f5f9",
        padding: "30px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "auto",
        }}
      >
        {/* HEADER */}

        <div style={cardStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "15px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2 style={{ margin: 0 }}>
                📊 Lozzby Admin Panel
              </h2>

              <p
                style={{
                  margin: "5px 0 0",
                  color: "#64748b",
                }}
              >
                Manage products and customer orders
              </p>
            </div>

            <button
              onClick={logout}
              style={{
                background: "#0f172a",
                color: "white",
                border: "none",
                padding: "10px 18px",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* ========================= */}
        {/* ADD PRODUCT */}
        {/* ========================= */}

        <div style={cardStyle}>
          <h3>➕ Add New Product</h3>

          <input
            style={inputStyle}
            placeholder="Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            style={inputStyle}
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />

          <label style={labelStyle}>
            🗂️ Category
          </label>

          <select
            style={inputStyle}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <label style={labelStyle}>
            📌 Website Section
          </label>

          <select
            style={inputStyle}
            value={section}
            onChange={(e) => setSection(e.target.value)}
          >
            {sections.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <label style={labelStyle}>
            🖼️ Product Image
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={selectImage}
            style={{ marginBottom: "15px" }}
          />

          {image && (
            <div style={{ marginBottom: "15px" }}>
              <p>Image Preview:</p>

              <img
                src={image}
                alt="Preview"
                style={{
                  width: "180px",
                  height: "180px",
                  objectFit: "contain",
                  border: "1px solid #ddd",
                  borderRadius: "10px",
                }}
              />
            </div>
          )}

          <button
            style={buttonStyle}
            onClick={addProduct}
          >
            ➕ Add Product
          </button>
        </div>

        {/* ========================= */}
        {/* PRODUCT SEARCH */}
        {/* ========================= */}

        <div style={cardStyle}>
          <h3>🔎 Search Products</h3>

          <input
            style={inputStyle}
            placeholder="Search product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* ========================= */}
        {/* PRODUCT LIST */}
        {/* ========================= */}

        <div style={cardStyle}>
          <h3>
            📦 Products ({filteredProducts.length})
          </h3>

          {filteredProducts.length === 0 && (
            <p style={{ color: "#64748b" }}>
              No products found.
            </p>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "20px",
            }}
          >
            {filteredProducts.map((product, index) => (
              <div
                key={
                  product.id ||
                  `${product.name}-${index}`
                }
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "12px",
                  padding: "15px",
                  background: "white",
                }}
              >
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name || "Product"}
                    style={{
                      width: "100%",
                      height: "180px",
                      objectFit: "contain",
                      borderRadius: "8px",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      height: "180px",
                      background: "#f1f5f9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#94a3b8",
                    }}
                  >
                    No Image
                  </div>
                )}

                <h3>
                  {product.name || "Unnamed Product"}
                </h3>

                <p
                  style={{
                    fontWeight: "bold",
                    fontSize: "18px",
                  }}
                >
                  ৳ {product.price}
                </p>

                <p style={{ color: "#64748b" }}>
                  Category: {product.category || "Not Set"}
                </p>

                <p>
                  Section:{" "}
                  <strong>
                    {product.section || "Featured"}
                  </strong>
                </p>

                <button
                  onClick={() =>
                    deleteProduct(
                      product.id,
                      product.name
                    )
                  }
                  style={deleteButtonStyle}
                >
                  🗑️ Delete
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ================================================= */}
        {/* CUSTOMER ORDERS */}
        {/* ================================================= */}

        <div style={cardStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "15px",
              flexWrap: "wrap",
            }}
          >
            <h3 style={{ margin: 0 }}>
              🛒 Customer Orders ({filteredOrders.length})
            </h3>

            <button
              onClick={loadOrders}
              style={{
                background: "#16a34a",
                color: "white",
                border: "none",
                padding: "10px 16px",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              🔄 Refresh Orders
            </button>
          </div>

          {/* ORDER SEARCH */}

          <input
            style={{
              ...inputStyle,
              marginTop: "20px",
            }}
            placeholder="🔎 Search by customer, phone, address, status..."
            value={orderSearch}
            onChange={(e) =>
              setOrderSearch(e.target.value)
            }
          />

          {loadingOrders && (
            <p style={{ color: "#64748b" }}>
              Loading orders...
            </p>
          )}

          {!loadingOrders &&
            filteredOrders.length === 0 && (
              <div
                style={{
                  background: "#f8fafc",
                  padding: "30px",
                  borderRadius: "10px",
                  textAlign: "center",
                  color: "#64748b",
                }}
              >
                No customer orders found.
              </div>
            )}

          {/* ORDER CARDS */}

          <div
            style={{
              display: "grid",
              gap: "20px",
              marginTop: "20px",
            }}
          >
            {filteredOrders.map((order, index) => (
              <div
                key={order.id || index}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "14px",
                  padding: "20px",
                  background: "#fff",
                }}
              >
                {/* ORDER HEADER */}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "10px",
                    flexWrap: "wrap",
                    marginBottom: "15px",
                  }}
                >
                  <div>
                    <h3 style={{ margin: 0 }}>
                      🧾 Order #{index + 1}
                    </h3>

                    <small
                      style={{
                        color: "#94a3b8",
                        wordBreak: "break-all",
                      }}
                    >
                      ID: {order.id}
                    </small>
                  </div>

                  <select
                    value={order.status || "Pending"}
                    onChange={(e) =>
                      updateOrderStatus(
                        order.id,
                        e.target.value
                      )
                    }
                    style={{
                      padding: "9px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontWeight: "bold",
                    }}
                  >
                    <option value="Pending">
                      Pending
                    </option>

                    <option value="Confirmed">
                      Confirmed
                    </option>

                    <option value="Processing">
                      Processing
                    </option>

                    <option value="Shipped">
                      Shipped
                    </option>

                    <option value="Delivered">
                      Delivered
                    </option>

                    <option value="Cancelled">
                      Cancelled
                    </option>
                  </select>
                </div>

                {/* CUSTOMER INFORMATION */}

                <div
                  style={{
                    background: "#f8fafc",
                    padding: "15px",
                    borderRadius: "10px",
                    marginBottom: "15px",
                  }}
                >
                  <h4 style={{ marginTop: 0 }}>
                    👤 Customer Information
                  </h4>

                  <p>
                    <strong>Name:</strong>{" "}
                    {order.customer_name || "N/A"}
                  </p>

                  <p>
                    <strong>Phone:</strong>{" "}
                    {order.phone || "N/A"}
                  </p>

                  <p>
                    <strong>Address:</strong>{" "}
                    {order.address || "N/A"}
                  </p>

                  <p>
                    <strong>Payment:</strong>{" "}
                    {order.payment_method || "COD"}
                  </p>
                </div>

                {/* ORDER ITEMS */}

                <h4>📦 Ordered Products</h4>

                <div
                  style={{
                    display: "grid",
                    gap: "10px",
                  }}
                >
                  {(order.items || []).map(
                    (item, itemIndex) => (
                      <div
                        key={itemIndex}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "10px",
                          background: "#f8fafc",
                          borderRadius: "8px",
                        }}
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            style={{
                              width: "60px",
                              height: "60px",
                              objectFit: "contain",
                              background: "white",
                              borderRadius: "6px",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "60px",
                              height: "60px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: "#e2e8f0",
                              borderRadius: "6px",
                              fontSize: "11px",
                            }}
                          >
                            No Image
                          </div>
                        )}

                        <div style={{ flex: 1 }}>
                          <strong>
                            {item.name}
                          </strong>

                          <p
                            style={{
                              margin: "4px 0 0",
                              color: "#64748b",
                            }}
                          >
                            ৳ {item.price} ×{" "}
                            {item.quantity}
                          </p>
                        </div>

                        <strong>
                          ৳{" "}
                          {Number(item.price) *
                            Number(item.quantity)}
                        </strong>
                      </div>
                    )
                  )}
                </div>

                {/* TOTAL */}

                <div
                  style={{
                    marginTop: "18px",
                    paddingTop: "15px",
                    borderTop:
                      "1px solid #e2e8f0",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <strong>Order Total</strong>

                  <strong
                    style={{
                      fontSize: "22px",
                    }}
                  >
                    ৳ {order.total}
                  </strong>
                </div>

                {/* DELETE ORDER */}

                <button
                  onClick={() =>
                    deleteOrder(order.id)
                  }
                  style={{
                    ...deleteButtonStyle,
                    marginTop: "15px",
                  }}
                >
                  🗑️ Delete Order
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================
// STYLES
// =========================

const cardStyle = {
  background: "white",
  padding: "25px",
  borderRadius: "15px",
  marginBottom: "25px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "15px",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  boxSizing: "border-box",
  fontSize: "15px",
};

const labelStyle = {
  display: "block",
  fontWeight: "600",
  marginBottom: "8px",
};

const buttonStyle = {
  width: "100%",
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "12px 20px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "15px",
};

const deleteButtonStyle = {
  width: "100%",
  background: "#ef4444",
  color: "white",
  border: "none",
  padding: "10px",
  borderRadius: "7px",
  cursor: "pointer",
  fontWeight: "bold",
};