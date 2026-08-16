import React, { useEffect, useMemo, useState } from "react";

const API = "https://lozzby.onrender.com";

const STATUS_LIST = [
  "Pending",
  "Confirmed",
  "Processing",
  "Shipped",
  "Delivered",
];

const FALLBACK_BANNERS = [
  {
    title: "Smart Shopping Starts Here",
    subtitle: "Discover amazing products at smart prices",
    button: "Shop Now",
    image: "",
  },
  {
    title: "New Collection",
    subtitle: "Fresh products. Better deals. Easy shopping.",
    button: "Explore",
    image: "",
  },
  {
    title: "Fast • Easy • Secure",
    subtitle: "Order your favorite products from Daily Drop",
    button: "Buy Now",
    image: "",
  },
];

const CSS = `
* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  font-family: Inter, Arial, sans-serif;
  background: #f5f6f8;
  color: #172033;
}

button,
input,
textarea,
select {
  font: inherit;
}

button {
  cursor: pointer;
}

img {
  max-width: 100%;
}

.daily-drop {
  min-height: 100vh;
  overflow: hidden;
}

/* TOP BAR */
.topbar {
  background: #111827;
  color: #fff;
  font-size: 12px;
}

.topbar-inner {
  max-width: 1280px;
  margin: auto;
  padding: 8px 20px;
  display: flex;
  justify-content: space-between;
  gap: 15px;
}

.topbar span {
  opacity: 0.85;
}

/* NAVBAR */
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #fff;
  box-shadow: 0 2px 15px rgba(15, 23, 42, 0.08);
}

.nav-inner {
  max-width: 1280px;
  margin: auto;
  min-height: 74px;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  gap: 24px;
}

.brand {
  min-width: 190px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.brand-icon {
  width: 44px;
  height: 44px;
  border-radius: 13px;
  display: grid;
  place-items: center;
  color: #fff;
  font-size: 23px;
  background: linear-gradient(135deg, #ff5a36, #ff2d55);
  box-shadow: 0 8px 20px rgba(255, 64, 70, 0.25);
}

.brand-name {
  font-size: 23px;
  font-weight: 950;
  letter-spacing: -1px;
}

.brand-sub {
  color: #98a2b3;
  font-size: 10px;
  font-weight: 800;
}

.search-wrap {
  flex: 1;
  position: relative;
}

.search-wrap input {
  width: 100%;
  height: 46px;
  border: 2px solid #ff3d54;
  border-radius: 8px;
  padding: 0 115px 0 45px;
  outline: none;
  background: #fff;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 13px;
  color: #667085;
}

.search-button {
  position: absolute;
  right: 4px;
  top: 4px;
  height: 38px;
  padding: 0 20px;
  border: 0;
  border-radius: 6px;
  color: #fff;
  background: #ff3d54;
  font-weight: 800;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 9px;
}

.nav-action {
  border: 0;
  background: #fff;
  padding: 8px;
  color: #344054;
  text-align: center;
}

.nav-action-icon {
  font-size: 21px;
  display: block;
}

.nav-action small {
  font-size: 10px;
}

.cart-nav {
  position: relative;
}

.cart-badge {
  position: absolute;
  top: 1px;
  right: 0;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 20px;
  display: grid;
  place-items: center;
  background: #ff3d54;
  color: white;
  font-size: 10px;
  font-weight: 900;
}

/* CATEGORY NAV */
.category-nav {
  background: #fff;
  border-top: 1px solid #f0f1f3;
  border-bottom: 1px solid #e9eaed;
}

.category-nav-inner {
  max-width: 1280px;
  margin: auto;
  display: flex;
  overflow-x: auto;
}

.category-link {
  flex: 0 0 auto;
  padding: 14px 19px;
  border: 0;
  background: #fff;
  font-size: 13px;
  font-weight: 750;
  color: #344054;
}

.category-link:hover {
  color: #ff3d54;
}

/* HERO */
.hero-area {
  max-width: 1280px;
  margin: 18px auto 0;
  padding: 0 20px;
}

.hero {
  position: relative;
  min-height: 390px;
  border-radius: 8px;
  overflow: hidden;
  background:
    radial-gradient(
      circle at 85% 20%,
      rgba(255, 255, 255, 0.25),
      transparent 25%
    ),
    linear-gradient(120deg, #111827, #263f82 55%, #ff3d54);
  color: white;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(
      90deg,
      rgba(5, 10, 30, 0.72),
      rgba(5, 10, 30, 0.12)
    ),
    radial-gradient(
      circle at 70% 50%,
      rgba(255, 255, 255, 0.18),
      transparent 35%
    );
}

.hero-image {
  position: absolute;
  right: 0;
  top: 0;
  width: 55%;
  height: 100%;
  object-fit: cover;
  opacity: 0.95;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 600px;
  padding: 65px 55px;
}

.hero-tag {
  display: inline-block;
  padding: 7px 13px;
  border-radius: 4px;
  background: #ff3d54;
  font-size: 12px;
  font-weight: 900;
}

.hero h1 {
  margin: 18px 0 12px;
  font-size: clamp(38px, 5vw, 62px);
  line-height: 1;
  letter-spacing: -2px;
}

.hero p {
  margin: 0;
  color: #e5e7eb;
  line-height: 1.7;
}

.hero-btn {
  margin-top: 24px;
  border: 0;
  border-radius: 5px;
  padding: 13px 25px;
  background: #fff;
  color: #111827;
  font-weight: 900;
}

.slider-dots {
  position: absolute;
  z-index: 3;
  bottom: 20px;
  left: 55px;
  display: flex;
  gap: 7px;
}

.slider-dot {
  width: 8px;
  height: 8px;
  border: 0;
  padding: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.45);
}

.slider-dot.active {
  width: 25px;
  border-radius: 10px;
  background: #fff;
}

/* FEATURES */
.features {
  max-width: 1280px;
  margin: 18px auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.feature {
  background: #fff;
  border: 1px solid #eaecf0;
  border-radius: 7px;
  padding: 19px;
  display: flex;
  gap: 13px;
  align-items: center;
}

.feature-icon {
  width: 42px;
  height: 42px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #fff0f2;
  font-size: 20px;
}

.feature strong {
  display: block;
  font-size: 13px;
}

.feature span {
  display: block;
  margin-top: 3px;
  color: #98a2b3;
  font-size: 11px;
}

/* MAIN */
.main {
  max-width: 1280px;
  margin: auto;
  padding: 25px 20px 70px;
}

.section {
  margin-top: 30px;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title h2 {
  margin: 0;
  font-size: 25px;
  letter-spacing: -0.7px;
}

.section-title h2 span {
  color: #ff3d54;
}

.view-all {
  border: 0;
  background: none;
  color: #ff3d54;
  font-weight: 800;
  font-size: 13px;
}

/* CATEGORY CARDS */
.category-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
}

.category-card {
  min-height: 105px;
  background: #fff;
  border: 1px solid #eaecf0;
  border-radius: 7px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: 0.2s;
}

.category-card:hover {
  transform: translateY(-3px);
  border-color: #ffb4be;
  box-shadow: 0 10px 25px rgba(16, 24, 40, 0.08);
}

.category-circle {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: #fff3f4;
  font-size: 24px;
}

.category-card strong {
  font-size: 12px;
}

/* PRODUCT */
.product-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;
}

.product-card {
  position: relative;
  overflow: hidden;
  background: #fff;
  border: 1px solid #eaecf0;
  border-radius: 7px;
  transition: 0.25s;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 35px rgba(16, 24, 40, 0.12);
}

.sale-badge {
  position: absolute;
  z-index: 2;
  top: 9px;
  left: 9px;
  padding: 4px 7px;
  border-radius: 3px;
  color: #fff;
  background: #ff3d54;
  font-size: 9px;
  font-weight: 900;
}

.product-image {
  height: 205px;
  display: grid;
  place-items: center;
  overflow: hidden;
  background: #fafafa;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: 0.3s;
}

.product-card:hover .product-image img {
  transform: scale(1.06);
}

.no-image {
  font-size: 52px;
  opacity: 0.35;
}

.product-info {
  padding: 13px;
}

.product-category {
  color: #98a2b3;
  font-size: 10px;
  text-transform: uppercase;
  font-weight: 900;
}

.product-name {
  margin: 5px 0;
  font-size: 14px;
  font-weight: 800;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-price {
  color: #ff3d54;
  font-size: 18px;
  font-weight: 950;
}

.product-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  margin-top: 11px;
}

.add-btn,
.buy-btn {
  border: 0;
  border-radius: 4px;
  padding: 9px 4px;
  font-size: 11px;
  font-weight: 900;
}

.add-btn {
  background: #fff0f2;
  color: #ff3d54;
}

.buy-btn {
  color: #fff;
  background: #ff3d54;
}

/* FLASH */
.flash {
  padding: 20px;
  border-radius: 7px;
  background: linear-gradient(120deg, #fff1f3, #fff);
  border: 1px solid #ffd5db;
}

.flash-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.flash-title h2 {
  margin: 0;
  font-size: 24px;
}

.flash-timer {
  color: #ff3d54;
  font-weight: 900;
  font-size: 13px;
}

/* TRACKING */
.tracking {
  margin-top: 40px;
  padding: 30px;
  border-radius: 8px;
  color: white;
  background: linear-gradient(120deg, #111827, #243b78);
}

.tracking h2 {
  margin: 5px 0;
  font-size: 28px;
}

.tracking p {
  color: #d0d5dd;
}

.track-form {
  max-width: 650px;
  display: flex;
  gap: 8px;
  margin-top: 18px;
}

.track-form input {
  flex: 1;
  border: 0;
  border-radius: 5px;
  padding: 13px;
  outline: none;
}

.track-form button {
  border: 0;
  border-radius: 5px;
  padding: 0 20px;
  background: #ff3d54;
  color: white;
  font-weight: 900;
}

.tracking-result {
  margin-top: 20px;
  padding: 18px;
  border-radius: 7px;
  background: rgba(255, 255, 255, 0.1);
}

.status-row {
  display: flex;
  gap: 8px;
  margin-top: 20px;
}

.status-step {
  flex: 1;
  text-align: center;
}

.status-dot {
  width: 30px;
  height: 30px;
  margin: auto;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.15);
}

.status-step.done .status-dot {
  background: #fff;
  color: #ff3d54;
}

.status-step span {
  display: block;
  margin-top: 6px;
  font-size: 10px;
}

/* CART */
.overlay {
  position: fixed;
  z-index: 500;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
}

.drawer {
  position: absolute;
  right: 0;
  top: 0;
  width: min(440px, 100%);
  height: 100%;
  background: #fff;
  display: flex;
  flex-direction: column;
  animation: slide 0.25s;
}

.drawer-head {
  padding: 18px;
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #eaecf0;
}

.close {
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 5px;
  background: #f2f4f7;
}

.cart-items {
  flex: 1;
  overflow: auto;
  padding: 15px 18px;
}

.cart-item {
  display: grid;
  grid-template-columns: 62px 1fr auto;
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px solid #eaecf0;
}

.cart-thumb {
  width: 62px;
  height: 62px;
  border-radius: 5px;
  object-fit: contain;
  background: #f8fafc;
}

.qty {
  display: flex;
  gap: 7px;
  align-items: center;
  margin-top: 7px;
}

.qty button {
  width: 26px;
  height: 26px;
  border: 0;
  border-radius: 4px;
  background: #f2f4f7;
}

.remove {
  border: 0;
  background: none;
  color: #ef4444;
  font-size: 10px;
}

.drawer-bottom {
  padding: 18px;
  border-top: 1px solid #eaecf0;
}

.total-line {
  display: flex;
  justify-content: space-between;
  font-size: 20px;
  font-weight: 950;
  margin-bottom: 12px;
}

.checkout-btn {
  width: 100%;
  border: 0;
  padding: 14px;
  border-radius: 5px;
  background: #ff3d54;
  color: #fff;
  font-weight: 900;
}

/* MODAL */
.modal-wrap {
  position: fixed;
  z-index: 600;
  inset: 0;
  padding: 18px;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.6);
}

.modal {
  width: min(600px, 100%);
  max-height: 92vh;
  overflow: auto;
  border-radius: 8px;
  padding: 23px;
  background: #fff;
}

.modal-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.modal h2 {
  margin: 0;
}

.form-group {
  margin-bottom: 13px;
}

.form-group label {
  display: block;
  font-size: 12px;
  font-weight: 900;
  margin-bottom: 5px;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  border: 1px solid #d0d5dd;
  border-radius: 5px;
  padding: 12px;
  outline: none;
}

.form-group textarea {
  min-height: 90px;
}

.order-success {
  text-align: center;
  padding: 20px;
}

.success-icon {
  width: 65px;
  height: 65px;
  margin: auto;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: #dcfce7;
  font-size: 30px;
}

.order-id {
  margin-top: 15px;
  padding: 13px;
  background: #f2f4f7;
  border-radius: 5px;
  word-break: break-all;
  font-weight: 800;
}

.copy-btn {
  margin-top: 8px;
  border: 0;
  border-radius: 5px;
  padding: 9px 14px;
  color: #fff;
  background: #111827;
}

/* FOOTER */
.footer {
  background: #101828;
  color: #fff;
  padding: 45px 20px;
}

.footer-inner {
  max-width: 1280px;
  margin: auto;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 30px;
}

.footer h3 {
  margin-top: 0;
}

.footer p,
.footer li {
  color: #98a2b3;
  font-size: 12px;
  line-height: 1.8;
}

.footer ul {
  list-style: none;
  padding: 0;
}

.footer-bottom {
  max-width: 1280px;
  margin: 30px auto 0;
  padding-top: 20px;
  border-top: 1px solid #344054;
  color: #667085;
  font-size: 11px;
}

/* STATES */
.loading-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;
}

.skeleton {
  height: 320px;
  border-radius: 7px;
  background: linear-gradient(
    90deg,
    #eee 25%,
    #fafafa 50%,
    #eee 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.3s infinite;
}

.error-box {
  padding: 15px;
  border-radius: 5px;
  color: #b42318;
  background: #fef3f2;
}

.empty {
  text-align: center;
  padding: 60px 20px;
  color: #667085;
}

/* ANIMATION */
@keyframes slide {
  from {
    transform: translateX(100%);
  }

  to {
    transform: translateX(0);
  }
}

@keyframes shimmer {
  to {
    background-position: -200% 0;
  }
}

/* MOBILE */
@media (max-width: 1050px) {
  .product-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .loading-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .category-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 750px) {
  .topbar-inner {
    justify-content: center;
  }

  .topbar-inner span:last-child {
    display: none;
  }

  .nav-inner {
    flex-wrap: wrap;
    gap: 10px;
    padding: 10px 13px;
  }

  .brand {
    min-width: auto;
  }

  .search-wrap {
    order: 3;
    flex-basis: 100%;
  }

  .nav-actions {
    margin-left: auto;
  }

  .nav-action:not(.cart-nav) {
    display: none;
  }

  .hero-area {
    padding: 0 10px;
  }

  .hero {
    min-height: 400px;
  }

  .hero-image {
    width: 100%;
    opacity: 0.25;
  }

  .hero-content {
    padding: 55px 25px;
  }

  .features {
    padding: 0 10px;
    grid-template-columns: repeat(2, 1fr);
  }

  .main {
    padding: 20px 10px 55px;
  }

  .category-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .product-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 9px;
  }

  .loading-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .product-image {
    height: 175px;
  }

  .product-actions {
    grid-template-columns: 1fr;
  }

  .tracking {
    padding: 22px 16px;
  }

  .track-form {
    flex-direction: column;
  }

  .track-form button {
    height: 45px;
  }

  .status-row {
    overflow: auto;
  }

  .status-step {
    min-width: 75px;
  }

  .footer-inner {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 430px) {
  .features {
    grid-template-columns: 1fr;
  }

  .category-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .category-card {
    min-height: 90px;
  }

  .category-circle {
    width: 43px;
    height: 43px;
  }

  .hero h1 {
    font-size: 42px;
  }

  .product-image {
    height: 155px;
  }

  .product-info {
    padding: 10px;
  }

  .footer-inner {
    grid-template-columns: 1fr;
  }
}
`;

function ProductCard({ product, onAdd, onBuy, sale = false }) {
  return (
    <article className="product-card">
      {sale && <div className="sale-badge">FLASH SALE</div>}

      <div className="product-image">
        {product.image ? (
          <img src={product.image} alt={product.name} />
        ) : (
          <div className="no-image">📦</div>
        )}
      </div>

      <div className="product-info">
        <div className="product-category">
          {product.category || "Electronics"}
        </div>

        <div className="product-name" title={product.name}>
          {product.name}
        </div>

        <div className="product-price">
          ৳ {Number(product.price || 0).toLocaleString()}
        </div>

        <div className="product-actions">
          <button className="add-btn" onClick={onAdd}>
            🛒 Add
          </button>

          <button className="buy-btn" onClick={onBuy}>
            Buy Now
          </button>
        </div>
      </div>
    </article>
  );
}

function OrderStatus({ order }) {
  const current = STATUS_LIST.indexOf(order.status);

  return (
    <div className="tracking-result">
      <strong>Order ID</strong>

      <div style={{ marginTop: 5, wordBreak: "break-all" }}>
        {order.order_id || order.id}
      </div>

      <div style={{ marginTop: 10 }}>
        Customer: <strong>{order.customer_name}</strong>
      </div>

      <div style={{ marginTop: 5 }}>
        Total:{" "}
        <strong>
          ৳ {Number(order.total || 0).toLocaleString()}
        </strong>
      </div>

      <div style={{ marginTop: 5 }}>
        Payment: <strong>{order.payment_method}</strong>
      </div>

      <div className="status-row">
        {STATUS_LIST.map((status, index) => {
          const done = current >= index;

          return (
            <div
              key={status}
              className={`status-step ${done ? "done" : ""}`}
            >
              <div className="status-dot">
                {done ? "✓" : index + 1}
              </div>

              <span>{status}</span>
            </div>
          );
        })}
      </div>

      {order.status === "Cancelled" && (
        <div style={{ marginTop: 18 }}>
          ❌ Order cancelled.
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const [customer, setCustomer] = useState({
    customer_name: "",
    phone: "",
    address: "",
    payment_method: "COD",
  });

  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  const [trackId, setTrackId] = useState("");
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);

  const [bannerIndex, setBannerIndex] = useState(0);

  async function loadProducts() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API}/products`);

      if (!res.ok) {
        throw new Error("Products could not be loaded");
      }

      const data = await res.json();

      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(
        "Products load হচ্ছে না। Backend check করুন।"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setBannerIndex(
        (old) => (old + 1) % FALLBACK_BANNERS.length
      );
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const categories = useMemo(() => {
    const list = products
      .map((p) => p.category)
      .filter(Boolean);

    return ["All", ...new Set(list)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const text = `${product.name || ""} ${
        product.category || ""
      }`.toLowerCase();

      return (
        text.includes(search.toLowerCase()) &&
        (category === "All" ||
          product.category === category)
      );
    });
  }, [products, search, category]);

  const flashProducts = useMemo(
    () =>
      products
        .filter(
          (p) =>
            String(p.section || "").toLowerCase() ===
            "flash sale"
        )
        .slice(0, 5),
    [products]
  );

  const trendingProducts = useMemo(
    () =>
      products
        .filter(
          (p) =>
            String(p.section || "").toLowerCase() ===
            "trending"
        )
        .slice(0, 5),
    [products]
  );

  const featuredProducts = useMemo(
    () =>
      products
        .filter(
          (p) =>
            String(p.section || "").toLowerCase() ===
            "featured"
        )
        .slice(0, 5),
    [products]
  );

  const shownFeatured =
    featuredProducts.length > 0
      ? featuredProducts
      : filteredProducts.slice(0, 5);

  function addToCart(product) {
    setCart((old) => {
      const exists = old.find(
        (item) => item.id === product.id
      );

      if (exists) {
        return old.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...old,
        {
          ...product,
          quantity: 1,
        },
      ];
    });

    setCartOpen(true);
  }

  function increaseQuantity(id) {
    setCart((items) =>
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  }

  function decreaseQuantity(id) {
    setCart((items) =>
      items
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function removeFromCart(id) {
    setCart((items) =>
      items.filter((item) => item.id !== id)
    );
  }

  const cartCount = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const cartTotal = cart.reduce(
    (sum, item) =>
      sum +
      Number(item.price || 0) * item.quantity,
    0
  );

  function buyNow(product) {
    const exists = cart.find(
      (item) => item.id === product.id
    );

    if (!exists) {
      setCart((old) => [
        ...old,
        {
          ...product,
          quantity: 1,
        },
      ]);
    }

    setCartOpen(false);
    setCheckoutOpen(true);
  }

  function openCheckout() {
    if (!cart.length) {
      alert("Your cart is empty");
      return;
    }

    setCartOpen(false);
    setCheckoutOpen(true);
  }

  function updateCustomer(e) {
    const { name, value } = e.target;

    setCustomer((old) => ({
      ...old,
      [name]: value,
    }));
  }

  async function placeOrder(e) {
    e.preventDefault();

    if (!customer.customer_name.trim()) {
      alert("Please enter your name");
      return;
    }

    if (!customer.phone.trim()) {
      alert("Please enter your phone number");
      return;
    }

    if (!customer.address.trim()) {
      alert("Please enter your address");
      return;
    }

    if (!cart.length) {
      alert("Your cart is empty");
      return;
    }

    const orderData = {
      customer_name:
        customer.customer_name.trim(),

      phone: customer.phone.trim(),

      address: customer.address.trim(),

      payment_method:
        customer.payment_method,

      items: cart.map((item) => ({
        product_id: item.id || "",
        name: item.name,
        price: Number(item.price || 0),
        quantity: item.quantity,
        image: item.image || "",
      })),

      total: cartTotal,
    };

    try {
      setPlacingOrder(true);

      const res = await fetch(`${API}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.detail || "Order failed"
        );
      }

      setOrderSuccess(data);
      setTrackId(data.order_id || "");

      setCart([]);
      setCheckoutOpen(false);

      setCustomer({
        customer_name: "",
        phone: "",
        address: "",
        payment_method: "COD",
      });
    } catch (err) {
      console.error(err);
      alert(err.message || "Order failed");
    } finally {
      setPlacingOrder(false);
    }
  }

  async function trackOrder() {
    if (!trackId.trim()) {
      alert("Please enter Order ID");
      return;
    }

    try {
      setTrackingLoading(true);
      setTrackedOrder(null);

      const res = await fetch(
        `${API}/orders/${encodeURIComponent(
          trackId.trim()
        )}/track`
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.detail || "Order not found"
        );
      }

      setTrackedOrder(data);
    } catch (err) {
      alert(err.message || "Order not found");
    } finally {
      setTrackingLoading(false);
    }
  }

  function scrollTo(id) {
    document
      .getElementById(id)
      ?.scrollIntoView({
        behavior: "smooth",
      });
  }

  const banner =
    FALLBACK_BANNERS[bannerIndex];

  const categoryIcons = [
    "📱",
    "💻",
    "🎧",
    "⌚",
    "👕",
    "🏠",
    "🎮",
    "🎁",
  ];

  return (
    <div className="daily-drop">
      <style>{CSS}</style>

      {/* TOP BAR */}
      <div className="topbar">
        <div className="topbar-inner">
          <span>
            🚚 Fast Delivery Across Bangladesh
          </span>

          <span>
            ✨ Easy Checkout • Secure Shopping
          </span>
        </div>
      </div>

      {/* NAVBAR */}
      <header className="navbar">
        <div className="nav-inner">
          <div
            className="brand"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
          >
            <div className="brand-icon">
              🔥
            </div>

            <div>
              <div className="brand-name">
                Daily Drop
              </div>

              <div className="brand-sub">
                SHOP SMARTER
              </div>
            </div>
          </div>

          <div className="search-wrap">
            <span className="search-icon">
              🔍
            </span>

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search for products..."
            />

            <button className="search-button">
              Search
            </button>
          </div>

          <div className="nav-actions">
            <button
              className="nav-action"
              onClick={() =>
                scrollTo("tracking")
              }
            >
              <span className="nav-action-icon">
                📦
              </span>

              <small>Orders</small>
            </button>

            <button
              className="nav-action cart-nav"
              onClick={() =>
                setCartOpen(true)
              }
            >
              <span className="nav-action-icon">
                🛒
              </span>

              <small>Cart</small>

              {cartCount > 0 && (
                <span className="cart-badge">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* CATEGORY NAV */}
      <div className="category-nav">
        <div className="category-nav-inner">
          <button
            className="category-link"
            onClick={() => {
              setCategory("All");
              scrollTo("products");
            }}
          >
            🏠 Home
          </button>

          {categories
            .slice(1, 9)
            .map((item) => (
              <button
                key={item}
                className="category-link"
                onClick={() => {
                  setCategory(item);
                  scrollTo("products");
                }}
              >
                {item}
              </button>
            ))}

          <button
            className="category-link"
            onClick={() =>
              scrollTo("flash-sale")
            }
          >
            🔥 Flash Sale
          </button>
        </div>
      </div>

      {/* HERO */}
      <section className="hero-area">
        <div className="hero">
          {banner.image && (
            <img
              className="hero-image"
              src={banner.image}
              alt=""
            />
          )}

          <div className="hero-bg" />

          <div className="hero-content">
            <div className="hero-tag">
              🔥 DAILY DROP SPECIAL
            </div>

            <h1>{banner.title}</h1>

            <p>{banner.subtitle}</p>

            <button
              className="hero-btn"
              onClick={() =>
                scrollTo("products")
              }
            >
              {banner.button} →
            </button>
          </div>

          <div className="slider-dots">
            {FALLBACK_BANNERS.map(
              (_, index) => (
                <button
                  key={index}
                  className={`slider-dot ${
                    bannerIndex === index
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setBannerIndex(index)
                  }
                />
              )
            )}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features">
        <div className="feature">
          <div className="feature-icon">
            🚚
          </div>

          <div>
            <strong>
              Fast Delivery
            </strong>

            <span>
              Across Bangladesh
            </span>
          </div>
        </div>

        <div className="feature">
          <div className="feature-icon">
            💳
          </div>

          <div>
            <strong>
              Secure Payment
            </strong>

            <span>
              COD • Bkash • Nagad
            </span>
          </div>
        </div>

        <div className="feature">
          <div className="feature-icon">
            🔄
          </div>

          <div>
            <strong>
              Easy Order
            </strong>

            <span>
              Simple checkout process
            </span>
          </div>
        </div>

        <div className="feature">
          <div className="feature-icon">
            📦
          </div>

          <div>
            <strong>
              Order Tracking
            </strong>

            <span>
              Track anytime
            </span>
          </div>
        </div>
      </section>

      <main className="main">
        {/* CATEGORIES */}
        <section className="section">
          <div className="section-title">
            <h2>
              Shop By{" "}
              <span>Category</span>
            </h2>
          </div>

          <div className="category-grid">
            {categories
              .slice(1, 9)
              .map((item, index) => (
                <button
                  key={item}
                  className="category-card"
                  onClick={() => {
                    setCategory(item);
                    scrollTo("products");
                  }}
                >
                  <div className="category-circle">
                    {
                      categoryIcons[
                        index %
                          categoryIcons.length
                      ]
                    }
                  </div>

                  <strong>{item}</strong>
                </button>
              ))}

            {categories.length <= 1 && (
              <div className="empty">
                Add categories from Admin Panel
              </div>
            )}
          </div>
        </section>

        {/* FLASH SALE */}
        <section
          className="section"
          id="flash-sale"
        >
          <div className="flash">
            <div className="flash-title">
              <h2>
                🔥 Flash{" "}
                <span
                  style={{
                    color: "#ff3d54",
                  }}
                >
                  Sale
                </span>
              </h2>

              <div className="flash-timer">
                LIMITED TIME DEALS
              </div>
            </div>

            {flashProducts.length > 0 ? (
              <div className="product-grid">
                {flashProducts.map(
                  (product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      sale
                      onAdd={() =>
                        addToCart(product)
                      }
                      onBuy={() =>
                        buyNow(product)
                      }
                    />
                  )
                )}
              </div>
            ) : (
              <div className="empty">
                <div
                  style={{
                    fontSize: 35,
                  }}
                >
                  🔥
                </div>

                <strong>
                  Flash Sale products
                  will appear here
                </strong>

                <p>
                  Admin Panel থেকে section =
                  Flash Sale দিন।
                </p>
              </div>
            )}
          </div>
        </section>

        {/* TRENDING */}
        {trendingProducts.length >
          0 && (
          <section className="section">
            <div className="section-title">
              <h2>
                📈 Trending{" "}
                <span>Products</span>
              </h2>

              <button
                className="view-all"
                onClick={() => {
                  setCategory("All");
                  scrollTo("products");
                }}
              >
                View All →
              </button>
            </div>

            <div className="product-grid">
              {trendingProducts.map(
                (product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAdd={() =>
                      addToCart(product)
                    }
                    onBuy={() =>
                      buyNow(product)
                    }
                  />
                )
              )}
            </div>
          </section>
        )}

        {/* FEATURED */}
        <section
          className="section"
          id="products"
        >
          <div className="section-title">
            <h2>
              ⭐ Featured{" "}
              <span>Products</span>
            </h2>

            <button
              className="view-all"
              onClick={() =>
                setCategory("All")
              }
            >
              All Products →
            </button>
          </div>

          <div
            className="category-row"
            style={{
              marginBottom: 15,
              overflowX: "auto",
              display: "flex",
            }}
          >
            {categories.map((item) => (
              <button
                key={item}
                className="category-link"
                style={{
                  borderBottom:
                    category === item
                      ? "2px solid #ff3d54"
                      : "2px solid transparent",

                  color:
                    category === item
                      ? "#ff3d54"
                      : "#344054",
                }}
                onClick={() =>
                  setCategory(item)
                }
              >
                {item}
              </button>
            ))}
          </div>

          {error && (
            <div className="error-box">
              ⚠️ {error}
            </div>
          )}

          {loading ? (
            <div className="loading-grid">
              {[1, 2, 3, 4, 5].map(
                (x) => (
                  <div
                    className="skeleton"
                    key={x}
                  />
                )
              )}
            </div>
          ) : shownFeatured.length ===
            0 ? (
            <div className="empty">
              <div
                style={{
                  fontSize: 50,
                }}
              >
                📦
              </div>

              <h3>
                No products found
              </h3>

              <p>
                Admin Panel থেকে product
                add করুন।
              </p>
            </div>
          ) : (
            <div className="product-grid">
              {shownFeatured.map(
                (product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAdd={() =>
                      addToCart(product)
                    }
                    onBuy={() =>
                      buyNow(product)
                    }
                  />
                )
              )}
            </div>
          )}
        </section>

        {/* SEARCH RESULTS */}
        {search && (
          <section className="section">
            <div className="section-title">
              <h2>
                🔎 Search{" "}
                <span>Results</span>
              </h2>

              <div>
                {filteredProducts.length}{" "}
                found
              </div>
            </div>

            <div className="product-grid">
              {filteredProducts.map(
                (product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAdd={() =>
                      addToCart(product)
                    }
                    onBuy={() =>
                      buyNow(product)
                    }
                  />
                )
              )}
            </div>
          </section>
        )}

        {/* TRACKING */}
        <section
          className="tracking"
          id="tracking"
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 900,
            }}
          >
            📦 ORDER TRACKING
          </div>

          <h2>
            Where is my order?
          </h2>

          <p>
            আপনার Order ID দিয়ে
            order-এর current status দেখতে
            পারবেন।
          </p>

          <div className="track-form">
            <input
              value={trackId}
              onChange={(e) =>
                setTrackId(e.target.value)
              }
              placeholder="Enter your Order ID"
            />

            <button
              onClick={trackOrder}
              disabled={
                trackingLoading
              }
            >
              {trackingLoading
                ? "Checking..."
                : "Track Order"}
            </button>
          </div>

          {trackedOrder && (
            <OrderStatus
              order={trackedOrder}
            />
          )}
        </section>
      </main>

      {/* CART */}
      {cartOpen && (
        <div
          className="overlay"
          onClick={() =>
            setCartOpen(false)
          }
        >
          <aside
            className="drawer"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="drawer-head">
              <div>
                <h2
                  style={{
                    margin: 0,
                  }}
                >
                  Shopping Cart
                </h2>

                <small>
                  {cartCount} item(s)
                </small>
              </div>

              <button
                className="close"
                onClick={() =>
                  setCartOpen(false)
                }
              >
                ✕
              </button>
            </div>

            <div className="cart-items">
              {cart.length === 0 ? (
                <div className="empty">
                  <div
                    style={{
                      fontSize: 45,
                    }}
                  >
                    🛒
                  </div>

                  <h3>
                    Your cart is empty
                  </h3>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    className="cart-item"
                    key={item.id}
                  >
                    {item.image ? (
                      <img
                        className="cart-thumb"
                        src={item.image}
                        alt={item.name}
                      />
                    ) : (
                      <div className="cart-thumb">
                        📦
                      </div>
                    )}

                    <div>
                      <strong>
                        {item.name}
                      </strong>

                      <div
                        style={{
                          marginTop: 5,
                        }}
                      >
                        ৳{" "}
                        {Number(
                          item.price || 0
                        ).toLocaleString()}
                      </div>

                      <div className="qty">
                        <button
                          onClick={() =>
                            decreaseQuantity(
                              item.id
                            )
                          }
                        >
                          −
                        </button>

                        <strong>
                          {item.quantity}
                        </strong>

                        <button
                          onClick={() =>
                            increaseQuantity(
                              item.id
                            )
                          }
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <button
                      className="remove"
                      onClick={() =>
                        removeFromCart(
                          item.id
                        )
                      }
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="drawer-bottom">
                <div className="total-line">
                  <span>
                    Total
                  </span>

                  <span>
                    ৳{" "}
                    {cartTotal.toLocaleString()}
                  </span>
                </div>

                <button
                  className="checkout-btn"
                  onClick={
                    openCheckout
                  }
                >
                  Proceed to Checkout →
                </button>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* CHECKOUT */}
      {checkoutOpen && (
        <div className="modal-wrap">
          <div className="modal">
            <div className="modal-head">
              <div>
                <h2>
                  Checkout
                </h2>

                <small>
                  Enter your delivery
                  information
                </small>
              </div>

              <button
                className="close"
                onClick={() =>
                  setCheckoutOpen(false)
                }
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={placeOrder}
            >
              <div className="form-group">
                <label>
                  Full Name
                </label>

                <input
                  name="customer_name"
                  value={
                    customer.customer_name
                  }
                  onChange={
                    updateCustomer
                  }
                  placeholder="Your full name"
                />
              </div>

              <div className="form-group">
                <label>
                  Phone Number
                </label>

                <input
                  name="phone"
                  value={
                    customer.phone
                  }
                  onChange={
                    updateCustomer
                  }
                  placeholder="01XXXXXXXXX"
                />
              </div>

              <div className="form-group">
                <label>
                  Delivery Address
                </label>

                <textarea
                  name="address"
                  value={
                    customer.address
                  }
                  onChange={
                    updateCustomer
                  }
                  placeholder="House, Road, Area, District"
                />
              </div>

              <div className="form-group">
                <label>
                  Payment Method
                </label>

                <select
                  name="payment_method"
                  value={
                    customer.payment_method
                  }
                  onChange={
                    updateCustomer
                  }
                >
                  <option value="COD">
                    Cash on Delivery
                  </option>

                  <option value="Bkash">
                    Bkash
                  </option>

                  <option value="Nagad">
                    Nagad
                  </option>

                  <option value="Rocket">
                    Rocket
                  </option>
                </select>
              </div>

              <div
                style={{
                  padding: 15,
                  margin: "15px 0",
                  borderRadius: 5,
                  background:
                    "#f8fafc",
                  display: "flex",
                  justifyContent:
                    "space-between",
                  fontWeight: 950,
                }}
              >
                <span>
                  Order Total
                </span>

                <span>
                  ৳{" "}
                  {cartTotal.toLocaleString()}
                </span>
              </div>

              <button
                className="checkout-btn"
                type="submit"
                disabled={
                  placingOrder
                }
              >
                {placingOrder
                  ? "Placing Order..."
                  : "✓ Confirm Order"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SUCCESS */}
      {orderSuccess && (
        <div className="modal-wrap">
          <div className="modal">
            <div className="order-success">
              <div className="success-icon">
                ✓
              </div>

              <h2>
                Order Confirmed!
              </h2>

              <p>
                আপনার order successfully
                received হয়েছে।
              </p>

              <div className="order-id">
                Order ID:
                <br />
                {orderSuccess.order_id}
              </div>

              <button
                className="copy-btn"
                onClick={() => {
                  navigator.clipboard?.writeText(
                    orderSuccess.order_id
                  );

                  alert(
                    "Order ID copied!"
                  );
                }}
              >
                📋 Copy Order ID
              </button>

              <button
                className="checkout-btn"
                style={{
                  marginTop: 12,
                }}
                onClick={() => {
                  setOrderSuccess(
                    null
                  );

                  setTimeout(() => {
                    scrollTo(
                      "tracking"
                    );
                  }, 100);
                }}
              >
                📦 Track My Order
              </button>

              <button
                style={{
                  marginTop: 10,
                  border: 0,
                  background:
                    "transparent",
                  color: "#667085",
                  fontWeight: 700,
                }}
                onClick={() =>
                  setOrderSuccess(
                    null
                  )
                }
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <div>
            <h3>
              🔥 Daily Drop
            </h3>

            <p>
              Your modern online shopping
              destination. Discover products,
              order easily and track your
              delivery from anywhere.
            </p>
          </div>

          <div>
            <h3>Shop</h3>

            <ul>
              <li>All Products</li>
              <li>Flash Sale</li>
              <li>Trending</li>
              <li>Featured</li>
            </ul>
          </div>

          <div>
            <h3>Customer</h3>

            <ul>
              <li>Track Order</li>
              <li>Checkout</li>
              <li>Payment</li>
              <li>Delivery</li>
            </ul>
          </div>

          <div>
            <h3>Payment</h3>

            <p>
              💵 Cash on Delivery
            </p>

            <p>
              📱 Bkash
            </p>

            <p>
              📱 Nagad
            </p>

            <p>
              📱 Rocket
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          © 2026 Daily Drop. All rights reserved.
        </div>
      </footer>
    </div>
  );
}