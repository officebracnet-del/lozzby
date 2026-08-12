import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const API = "http://127.0.0.1:8000";

const categories = [
  "All",
  "Electronics",
  "Fashion",
  "Mobile Accessories",
  "Home & Living",
  "Beauty",
  "Groceries",
  "Sports",
  "Automotive",
];

const reviews = [
  {
    name: "Nusrat Jahan",
    role: "Buyer",
    text: "Lozzby feels premium and reliable.",
    rating: 5,
  },
  {
    name: "Rakib",
    role: "Customer",
    text: "Very smooth shopping experience.",
    rating: 5,
  },
  {
    name: "Ayesha",
    role: "Customer",
    text: "Great shopping experience.",
    rating: 4,
  },
];

function App() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const [orderSuccess, setOrderSuccess] = useState(null);

  const [trackId, setTrackId] = useState("");
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);

  const [reviewIndex, setReviewIndex] = useState(0);

  // =====================================================
  // LOAD PRODUCTS
  // =====================================================

  const loadProducts = async () => {
    try {
      const res = await fetch(`${API}/products`);

      if (!res.ok) {
        throw new Error("Products load failed");
      }

      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.log("Product loading error:", error);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // =====================================================
  // FILTER PRODUCTS
  // =====================================================

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name
        ?.toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" ||
        product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, selectedCategory]);

  // =====================================================
  // SECTIONS
  // =====================================================

  const flashSaleProducts = filteredProducts.filter(
    (p) => p.section === "Flash Sale"
  );

  const trendingProducts = filteredProducts.filter(
    (p) => p.section === "Trending"
  );

  const featuredProducts = filteredProducts.filter(
    (p) => p.section === "Featured"
  );

  // =====================================================
  // CART
  // =====================================================

  const addToCart = (product) => {
    setCart((oldCart) => {
      const existing = oldCart.find(
        (item) => item.id === product.id
      );

      if (existing) {
        return oldCart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...oldCart,
        {
          ...product,
          quantity: 1,
        },
      ];
    });

    setCartOpen(true);
  };

  const increaseQuantity = (id) => {
    setCart((oldCart) =>
      oldCart.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  };

  const decreaseQuantity = (id) => {
    setCart((oldCart) =>
      oldCart
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
  };

  const removeFromCart = (id) => {
    setCart((oldCart) =>
      oldCart.filter((item) => item.id !== id)
    );
  };

  const cartCount = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const cartTotal = cart.reduce(
    (sum, item) =>
      sum + Number(item.price) * item.quantity,
    0
  );

  // =====================================================
  // BUY NOW
  // =====================================================

  const buyNow = (product) => {
    setCart([
      {
        ...product,
        quantity: 1,
      },
    ]);

    setCheckoutOpen(true);
  };

  // =====================================================
  // CHECKOUT
  // =====================================================

  const openCheckout = () => {
    if (cart.length === 0) {
      alert("Your cart is empty");
      return;
    }

    setCartOpen(false);
    setCheckoutOpen(true);
  };

  // =====================================================
  // PLACE ORDER
  // =====================================================

  const placeOrder = async () => {
    if (!customerName.trim()) {
      alert("Please enter your name");
      return;
    }

    if (!phone.trim()) {
      alert("Please enter your phone number");
      return;
    }

    if (!address.trim()) {
      alert("Please enter your address");
      return;
    }

    if (cart.length === 0) {
      alert("Your cart is empty");
      return;
    }

    const orderData = {
      customer_name: customerName,
      phone: phone,
      address: address,
      payment_method: paymentMethod,

      items: cart.map((item) => ({
        product_id: item.id || "",
        name: item.name,
        price: Number(item.price),
        quantity: item.quantity,
        image: item.image || "",
      })),

      total: cartTotal,
    };

    try {
      const res = await fetch(`${API}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || "Order failed");
        return;
      }

      setOrderSuccess(data);

      setCart([]);
      setCheckoutOpen(false);

      setCustomerName("");
      setPhone("");
      setAddress("");
      setPaymentMethod("COD");

      setTrackId(data.order_id);
    } catch (error) {
      console.log(error);
      alert("Backend is not running");
    }
  };

  // =====================================================
  // TRACK ORDER
  // =====================================================

  const trackOrder = async () => {
    if (!trackId.trim()) {
      alert("Please enter Order ID");
      return;
    }

    setTrackingLoading(true);
    setTrackedOrder(null);

    try {
      const res = await fetch(
        `${API}/orders/${encodeURIComponent(trackId.trim())}/track`
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || "Order not found");
        setTrackingLoading(false);
        return;
      }

      setTrackedOrder(data);
    } catch (error) {
      console.log(error);
      alert("Backend is not running");
    }

    setTrackingLoading(false);
  };

  const activeReview = reviews[reviewIndex];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* =================================================
          NAVBAR
      ================================================= */}

      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">

          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">

            <h1 className="text-2xl font-bold text-blue-700">
              Lozzby
            </h1>

            {/* SEARCH */}

            <div className="flex-1 max-w-xl w-full">
              <input
                type="text"
                placeholder="🔍 Search products..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3">

              <button
                onClick={() => setCartOpen(true)}
                className="bg-slate-900 text-white px-4 py-2 rounded-xl"
              >
                🛒 Cart ({cartCount})
              </button>

            </div>

          </div>

          {/* CATEGORY MENU */}

          <div className="flex gap-2 mt-4 overflow-x-auto pb-1">

            {categories.map((category) => (
              <button
                key={category}
                onClick={() =>
                  setSelectedCategory(category)
                }
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm ${
                  selectedCategory === category
                    ? "bg-blue-700 text-white"
                    : "bg-slate-100"
                }`}
              >
                {category}
              </button>
            ))}

          </div>

        </div>
      </header>

      {/* =================================================
          HERO
      ================================================= */}

      <section className="bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">

          <h1 className="text-4xl md:text-6xl font-bold">
            Welcome to Lozzby
          </h1>

          <p className="mt-4 text-lg">
            Your modern ecommerce marketplace
          </p>

          <button
            onClick={() =>
              window.scrollTo({
                top: 500,
                behavior: "smooth",
              })
            }
            className="mt-7 bg-white text-blue-900 px-7 py-3 rounded-xl font-bold"
          >
            Shop Now
          </button>

        </div>
      </section>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="max-w-7xl mx-auto px-4 pb-20">

        {/* INFO */}

        <section className="grid md:grid-cols-3 gap-4 mt-6">

          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="text-3xl">🚚</div>
            <h3 className="font-bold mt-2">
              Fast Delivery
            </h3>
            <p className="text-sm text-gray-500">
              Fast delivery service available.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="text-3xl">💳</div>
            <h3 className="font-bold mt-2">
              Easy Payment
            </h3>
            <p className="text-sm text-gray-500">
              COD / Bkash / Nagad / Rocket.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="text-3xl">🔒</div>
            <h3 className="font-bold mt-2">
              Secure Shopping
            </h3>
            <p className="text-sm text-gray-500">
              Safe and simple shopping.
            </p>
          </div>

        </section>

        {/* =================================================
            FLASH SALE
        ================================================= */}

        <ProductSection
          title="🔥 Flash Sale"
          subtitle="Limited time offers"
          products={flashSaleProducts}
          addToCart={addToCart}
          buyNow={buyNow}
        />

        {/* =================================================
            TRENDING
        ================================================= */}

        <ProductSection
          title="🔥 Trending Products"
          subtitle="Most popular products"
          products={trendingProducts}
          addToCart={addToCart}
          buyNow={buyNow}
        />

        {/* =================================================
            FEATURED
        ================================================= */}

        <ProductSection
          title="⭐ Featured Products"
          subtitle="Handpicked products for you"
          products={featuredProducts}
          addToCart={addToCart}
          buyNow={buyNow}
        />

        {/* =================================================
            SEARCH RESULTS
        ================================================= */}

        {search && (
          <ProductSection
            title={`🔍 Search Results for "${search}"`}
            subtitle={`${filteredProducts.length} product(s) found`}
            products={filteredProducts}
            addToCart={addToCart}
            buyNow={buyNow}
          />
        )}

        {/* =================================================
            TRACK ORDER
        ================================================= */}

        <section className="mt-14 bg-white rounded-2xl shadow p-6 md:p-8">

          <h2 className="text-2xl font-bold">
            🚚 Track Your Order
          </h2>

          <p className="text-gray-500 mt-1">
            Enter your Order ID to see your order status.
          </p>

          <div className="flex flex-col md:flex-row gap-3 mt-5">

            <input
              type="text"
              placeholder="Enter Order ID"
              value={trackId}
              onChange={(e) =>
                setTrackId(e.target.value)
              }
              className="flex-1 border rounded-xl px-4 py-3"
            />

            <button
              onClick={trackOrder}
              className="bg-blue-700 text-white px-7 py-3 rounded-xl font-bold"
            >
              {trackingLoading
                ? "Checking..."
                : "Track Order"}
            </button>

          </div>

          {/* TRACKING RESULT */}

          {trackedOrder && (
            <OrderTracking order={trackedOrder} />
          )}

        </section>

        {/* =================================================
            REVIEWS
        ================================================= */}

        <section className="mt-14 bg-white rounded-2xl shadow p-8">

          <h2 className="text-2xl font-bold">
            Customer Reviews
          </h2>

          <AnimatePresence mode="wait">

            <motion.div
              key={activeReview.name}
              initial={{
                opacity: 0,
                x: 20,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              exit={{
                opacity: 0,
                x: -20,
              }}
              className="mt-5"
            >

              <div className="text-yellow-500 text-xl">
                {"★".repeat(activeReview.rating)}
              </div>

              <p className="mt-3 text-gray-600">
                "{activeReview.text}"
              </p>

              <h4 className="font-bold mt-3">
                {activeReview.name}
              </h4>

              <p className="text-sm text-gray-500">
                {activeReview.role}
              </p>

            </motion.div>

          </AnimatePresence>

          <div className="flex gap-2 mt-5">

            <button
              onClick={() =>
                setReviewIndex(
                  (p) =>
                    (p - 1 + reviews.length) %
                    reviews.length
                )
              }
              className="px-4 py-2 bg-gray-200 rounded-lg"
            >
              Previous
            </button>

            <button
              onClick={() =>
                setReviewIndex(
                  (p) =>
                    (p + 1) %
                    reviews.length
                )
              }
              className="px-4 py-2 bg-slate-900 text-white rounded-lg"
            >
              Next
            </button>

          </div>

        </section>

      </main>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="bg-gray-100 p-8 text-center">

        <h3 className="font-bold text-lg">
          Lozzby
        </h3>

        <p className="text-gray-500 mt-2">
          Your modern ecommerce marketplace
        </p>

        <p className="text-sm text-gray-400 mt-5">
          © 2026 Lozzby. All rights reserved.
        </p>

      </footer>

      {/* =================================================
          CART MODAL
      ================================================= */}

      {cartOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">

          <div className="bg-white w-full max-w-md h-full p-6 overflow-y-auto">

            <div className="flex justify-between items-center">

              <h2 className="text-2xl font-bold">
                🛒 Your Cart
              </h2>

              <button
                onClick={() => setCartOpen(false)}
                className="text-2xl"
              >
                ✕
              </button>

            </div>

            {cart.length === 0 ? (

              <div className="text-center py-20 text-gray-500">
                Cart is empty
              </div>

            ) : (

              <>

                <div className="mt-6 space-y-4">

                  {cart.map((item) => (

                    <div
                      key={item.id}
                      className="border rounded-xl p-3"
                    >

                      <div className="flex gap-3">

                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-20 h-20 object-contain rounded-lg bg-gray-100"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-xs">
                            No Image
                          </div>
                        )}

                        <div className="flex-1">

                          <h3 className="font-bold">
                            {item.name}
                          </h3>

                          <p>
                            ৳ {item.price}
                          </p>

                          <div className="flex items-center gap-3 mt-2">

                            <button
                              onClick={() =>
                                decreaseQuantity(item.id)
                              }
                              className="w-8 h-8 bg-gray-200 rounded"
                            >
                              −
                            </button>

                            <span>
                              {item.quantity}
                            </span>

                            <button
                              onClick={() =>
                                increaseQuantity(item.id)
                              }
                              className="w-8 h-8 bg-gray-200 rounded"
                            >
                              +
                            </button>

                            <button
                              onClick={() =>
                                removeFromCart(item.id)
                              }
                              className="text-red-500 ml-auto"
                            >
                              🗑️
                            </button>

                          </div>

                        </div>

                      </div>

                    </div>

                  ))}

                </div>

                <div className="border-t mt-6 pt-5">

                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span>৳ {cartTotal}</span>
                  </div>

                  <button
                    onClick={openCheckout}
                    className="w-full mt-5 bg-blue-700 text-white py-3 rounded-xl font-bold"
                  >
                    Confirm Order
                  </button>

                </div>

              </>

            )}

          </div>

        </div>
      )}

      {/* =================================================
          CHECKOUT MODAL
      ================================================= */}

      {checkoutOpen && (

        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-lg rounded-2xl p-6 max-h-[90vh] overflow-y-auto">

            <div className="flex justify-between">

              <h2 className="text-2xl font-bold">
                📦 Confirm Order
              </h2>

              <button
                onClick={() =>
                  setCheckoutOpen(false)
                }
                className="text-xl"
              >
                ✕
              </button>

            </div>

            <div className="mt-5 space-y-4">

              <input
                type="text"
                placeholder="Your Name"
                value={customerName}
                onChange={(e) =>
                  setCustomerName(e.target.value)
                }
                className="w-full border rounded-xl px-4 py-3"
              />

              <input
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value)
                }
                className="w-full border rounded-xl px-4 py-3"
              />

              <textarea
                placeholder="Delivery Address"
                value={address}
                onChange={(e) =>
                  setAddress(e.target.value)
                }
                rows="4"
                className="w-full border rounded-xl px-4 py-3"
              />

              <div>

                <label className="font-semibold">
                  Payment Method
                </label>

                <select
                  value={paymentMethod}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value)
                  }
                  className="w-full border rounded-xl px-4 py-3 mt-2"
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

              <div className="bg-slate-50 rounded-xl p-4">

                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>৳ {cartTotal}</span>
                </div>

              </div>

              <button
                onClick={placeOrder}
                className="w-full bg-blue-700 text-white py-3 rounded-xl font-bold"
              >
                ✅ Place Order
              </button>

            </div>

          </div>

        </div>

      )}

      {/* =================================================
          ORDER SUCCESS
      ================================================= */}

      {orderSuccess && (

        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">

          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">

            <div className="text-5xl">
              🎉
            </div>

            <h2 className="text-2xl font-bold mt-4">
              Order Placed!
            </h2>

            <p className="text-gray-500 mt-2">
              Your order has been successfully placed.
            </p>

            <div className="bg-slate-100 rounded-xl p-4 mt-5">

              <p className="text-sm text-gray-500">
                Your Order ID
              </p>

              <p className="font-bold text-sm break-all mt-1">
                {orderSuccess.order_id}
              </p>

            </div>

            <button
              onClick={() => {
                setTrackId(orderSuccess.order_id);
                setOrderSuccess(null);

                setTimeout(() => {
                  document
                    .getElementById("track-order")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    });
                }, 100);
              }}
              className="w-full bg-blue-700 text-white py-3 rounded-xl mt-5 font-bold"
            >
              🚚 Track My Order
            </button>

            <button
              onClick={() =>
                setOrderSuccess(null)
              }
              className="mt-3 text-gray-500"
            >
              Close
            </button>

          </div>

        </div>

      )}

      {/* WHATSAPP */}

      <a
        href="https://wa.me/8801821367994"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-5 right-5 bg-green-500 text-white px-5 py-3 rounded-full shadow-lg z-30"
      >
        WhatsApp
      </a>

    </div>
  );
}


// =========================================================
// PRODUCT SECTION
// =========================================================

function ProductSection({
  title,
  subtitle,
  products,
  addToCart,
  buyNow,
}) {
  return (
    <section className="mt-12">

      <div className="mb-5">

        <h2 className="text-2xl font-bold">
          {title}
        </h2>

        <p className="text-gray-500">
          {subtitle}
        </p>

      </div>

      {products.length === 0 ? (

        <div className="bg-white rounded-xl p-10 text-center">

          <p className="text-gray-500">
            No products available
          </p>

        </div>

      ) : (

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">

          {products.map((product, index) => (

            <ProductCard
              key={`${product.id}-${index}`}
              product={product}
              addToCart={addToCart}
              buyNow={buyNow}
            />

          ))}

        </div>

      )}

    </section>
  );
}


// =========================================================
// PRODUCT CARD
// =========================================================

function ProductCard({
  product,
  addToCart,
  buyNow,
}) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition">

      <div className="h-56 bg-gray-100 flex items-center justify-center">

        {product.image ? (

          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain"
          />

        ) : (

          <div className="text-gray-400 text-sm">
            No Image
          </div>

        )}

      </div>

      <div className="p-4">

        <h3 className="font-semibold text-lg">
          {product.name}
        </h3>

        <p className="text-xl font-bold mt-2">
          ৳ {product.price}
        </p>

        <div className="flex gap-2 mt-4">

          <button
            onClick={() => addToCart(product)}
            className="flex-1 bg-slate-900 text-white py-2 rounded-lg"
          >
            🛒 Cart
          </button>

          <button
            onClick={() => buyNow(product)}
            className="flex-1 bg-blue-700 text-white py-2 rounded-lg"
          >
            Buy Now
          </button>

        </div>

      </div>

    </div>
  );
}


// =========================================================
// ORDER TRACKING
// =========================================================

function OrderTracking({ order }) {

  const statuses = [
    "Pending",
    "Confirmed",
    "Processing",
    "Shipped",
    "Delivered",
  ];

  const currentIndex =
    statuses.indexOf(order.status);

  return (
    <div className="mt-8 border-t pt-6">

      <div className="bg-slate-50 rounded-xl p-5">

        <p className="text-sm text-gray-500">
          Order ID
        </p>

        <p className="font-bold break-all">
          {order.order_id}
        </p>

        <p className="mt-4">
          Customer:{" "}
          <strong>{order.customer_name}</strong>
        </p>

        <p className="mt-1">
          Total:{" "}
          <strong>৳ {order.total}</strong>
        </p>

        <p className="mt-1">
          Payment:{" "}
          <strong>{order.payment_method}</strong>
        </p>

      </div>

      <div className="mt-8">

        {statuses.map((status, index) => {

          const completed =
            currentIndex >= index;

          return (
            <div
              key={status}
              className="flex items-start gap-4 mb-5"
            >

              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-white ${
                  completed
                    ? "bg-blue-700"
                    : "bg-gray-300"
                }`}
              >
                {completed ? "✓" : index + 1}
              </div>

              <div>

                <p
                  className={`font-bold ${
                    completed
                      ? "text-blue-700"
                      : "text-gray-400"
                  }`}
                >
                  {status}
                </p>

                {index === currentIndex && (
                  <p className="text-sm text-gray-500">
                    Current order status
                  </p>
                )}

              </div>

            </div>
          );

        })}

      </div>

      {order.status === "Cancelled" && (

        <div className="bg-red-50 text-red-600 p-4 rounded-xl">
          ❌ This order has been cancelled.
        </div>

      )}

    </div>
  );
}

export default App;