import React, { useState, useEffect, useRef } from "react";
import { FiSearch, FiPlus, FiMinus, FiTrash2, FiUser } from "react-icons/fi";
import distributorAxiosInstance from "../utils/DistributorAxiosInstance";

const AVAILABILITY_VISUALS = {
  inStock: { label: "In Stock", color: "#00a859" },
  lowStock: { label: "Low Stock", color: "#f2994a" },
  outOfStock: { label: "Out of Stock", color: "#eb5757" },
};

const getAvailability = (inStock, threshold = 10) => {
  if (inStock <= 0) return AVAILABILITY_VISUALS.outOfStock;
  if (inStock <= threshold) return AVAILABILITY_VISUALS.lowStock;
  return AVAILABILITY_VISUALS.inStock;
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);

const MUTED_TEXT = "#8b93a7";
const BORDER_COLOR = "#f1f1f5";

const PointOfSale = () => {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const [cart, setCart] = useState(null);
  const [cartLoading, setCartLoading] = useState(true);

  // Optional — a customer can decline to give any of this, and checkout
  // works fine with all three left blank.
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  const [checkingOut, setCheckingOut] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState("");

  const searchTimer = useRef(null);

  const fetchCart = async () => {
    try {
      setCartLoading(true);
      const response = await distributorAxiosInstance.get(
        "/food-amazon-database/cart/get-cart",
      );
      setCart(response.data);
    } catch (err) {
      console.error("Error loading current ticket:", err);
      setError("Couldn't load the current ticket.");
    } finally {
      setCartLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Distributor-scoped search — only ever returns products this distributor
  // actually owns, so there's no way to accidentally add someone else's
  // product to a walk-in ticket (and decrement their stock at checkout).
  useEffect(() => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      try {
        setSearching(true);
        const response = await distributorAxiosInstance.get(
          `/food-amazon-database/inventory/distributor/products?search=${encodeURIComponent(query)}&limit=8`,
        );
        if (response.data.success) setSearchResults(response.data.data);
      } catch (err) {
        console.error("Product search failed:", err);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(searchTimer.current);
  }, [query]);

  const addToCart = async (product) => {
    try {
      setError("");
      const response = await distributorAxiosInstance.post(
        "/food-amazon-database/cart/add-item",
        { productId: product._id, quantity: 1 },
      );
      setCart(response.data.cart);
      setQuery("");
      setSearchResults([]);
    } catch (err) {
      setError(err.response?.data || "Couldn't add item to the ticket.");
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) return;
    try {
      setError("");
      const response = await distributorAxiosInstance.put(
        `/food-amazon-database/cart/update-item/${productId}`,
        { quantity },
      );
      setCart(response.data.cart);
    } catch (err) {
      setError(err.response?.data || "Couldn't update quantity.");
    }
  };

  const removeItem = async (itemId) => {
    try {
      const response = await distributorAxiosInstance.delete(
        `/food-amazon-database/cart/remove-item/${itemId}`,
      );
      setCart(response.data.cart);
    } catch (err) {
      console.error("Error removing item:", err);
    }
  };

  // Only include fields the distributor actually filled in — the walk-in
  // order schema treats each customerSnapshot field as individually
  // optional, but rejects short/empty strings if the key is present at
  // all. Sending nothing for a blank field, rather than an empty string,
  // is what makes "customer declines to share" a clean, error-free path.
  const buildCustomerSnapshot = () => {
    const snapshot = {};
    const trimmedName = customerName.trim();
    if (trimmedName) {
      const [firstName, ...rest] = trimmedName.split(" ");
      snapshot.firstName = firstName;
      if (rest.length > 0) snapshot.lastName = rest.join(" ");
    }
    if (customerPhone.trim()) snapshot.phone = customerPhone.trim();
    if (customerEmail.trim()) snapshot.email = customerEmail.trim();
    return Object.keys(snapshot).length > 0 ? snapshot : undefined;
  };

  const completeSale = async () => {
    if (!cart || cart.items.length === 0) return;
    try {
      setCheckingOut(true);
      setError("");
      const customerSnapshot = buildCustomerSnapshot();
      const response = await distributorAxiosInstance.post(
        "/food-amazon-database/order/create",
        {
          cartId: cart._id,
          orderChannel: "walk-in",
          ...(customerSnapshot && { customerSnapshot }),
        },
      );
      setReceipt(response.data.order);
      setCustomerName("");
      setCustomerPhone("");
      setCustomerEmail("");
      await fetchCart(); // server already deleted the old cart; this loads the fresh empty one
    } catch (err) {
      setError(err.response?.data || "Sale could not be completed.");
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div>
      <h2 className="font-archivo text-dark-blue fw-semibold fs-2 mb-3">
        Point of Sale
      </h2>

      <div className="d-flex flex-column flex-lg-row gap-4">
        {/* Lookup panel */}
        <div className="bg-white rounded-4 p-4" style={{ flex: 1.2 }}>
          <h4 className="font-archivo fw-semibold text-dark-blue mb-3">
            Find a product
          </h4>
          <div className="position-relative mb-3">
            <input
              type="text"
              className="form-control py-2"
              placeholder="Search by product name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              style={{ paddingLeft: 44 }}
            />
          </div>
          {searching && (
            <p className="font-archivo fs-sm" style={{ color: MUTED_TEXT }}>
              Searching...
            </p>
          )}
          <div className="d-flex flex-column gap-2">
            {searchResults.map((product) => {
              const availability = getAvailability(
                product.inStock,
                product.lowStockThreshold,
              );
              const isOutOfStock = product.inStock <= 0;
              return (
                <button
                  key={product._id}
                  onClick={() => addToCart(product)}
                  disabled={isOutOfStock}
                  className="d-flex align-items-center justify-content-between border-0 rounded-3 px-3 py-2 text-start"
                  style={{ backgroundColor: "#f8f9fa" }}
                >
                  <div className="d-flex align-items-center gap-3">
                    {product.productImg && (
                      <img
                        src={product.productImg}
                        alt={product.name}
                        className="rounded-2"
                        style={{ width: 40, height: 40, objectFit: "cover" }}
                      />
                    )}
                    <div>
                      <p className="mb-0 font-archivo fs-sm fw-medium text-dark-blue">
                        {product.name}
                      </p>
                      <p
                        className="mb-0 font-archivo fs-xsm"
                        style={{ color: MUTED_TEXT }}
                      >
                        {formatCurrency(product.price)} ·{" "}
                        <span style={{ color: availability.color }}>
                          {availability.label}
                        </span>
                      </p>
                    </div>
                  </div>
                  <FiPlus color="#00a859" />
                </button>
              );
            })}
            {!searching &&
              query.trim().length >= 2 &&
              searchResults.length === 0 && (
                <p className="font-archivo fs-sm" style={{ color: MUTED_TEXT }}>
                  No products found for "{query}"
                </p>
              )}
          </div>
        </div>

        {/* Ticket panel */}
        <div
          className="bg-white rounded-4 p-4 d-flex flex-column"
          style={{ flex: 1 }}
        >
          <h4 className="font-archivo fw-semibold text-dark-blue mb-3">
            Current sale
          </h4>

          {error && (
            <div className="alert alert-danger fs-sm">
              {typeof error === "string" ? error : "Something went wrong."}
            </div>
          )}

          {cartLoading ? (
            <p className="font-archivo" style={{ color: MUTED_TEXT }}>
              Loading ticket...
            </p>
          ) : !cart || cart.items.length === 0 ? (
            <p className="font-archivo fs-sm" style={{ color: MUTED_TEXT }}>
              No items yet — search for a product to add it.
            </p>
          ) : (
            <div className="d-flex flex-column gap-3 mb-3">
              {cart.items.map((item) => (
                <div
                  key={item._id}
                  className="d-flex align-items-center justify-content-between"
                >
                  <div className="d-flex align-items-center gap-3">
                    {item.product.productImg && (
                      <img
                        src={item.product.productImg}
                        alt={item.product.name}
                        className="rounded-2"
                        style={{ width: 40, height: 40, objectFit: "cover" }}
                      />
                    )}
                    <div>
                      <p className="mb-0 font-archivo fs-sm fw-medium text-dark-blue">
                        {item.product.name}
                      </p>
                      <p
                        className="mb-0 font-archivo fs-xsm"
                        style={{ color: MUTED_TEXT }}
                      >
                        {formatCurrency(item.product.price)} each
                      </p>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <button
                      onClick={() =>
                        updateQuantity(item.product._id, item.quantity - 1)
                      }
                      className="border-0 rounded-circle d-flex align-items-center justify-content-center"
                      style={{
                        width: 26,
                        height: 26,
                        backgroundColor: "#f8f9fa",
                      }}
                    >
                      <FiMinus size={12} />
                    </button>
                    <span
                      className="fs-sm font-archivo"
                      style={{ minWidth: 16, textAlign: "center" }}
                    >
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.product._id, item.quantity + 1)
                      }
                      className="border-0 rounded-circle d-flex align-items-center justify-content-center"
                      style={{
                        width: 26,
                        height: 26,
                        backgroundColor: "#f8f9fa",
                      }}
                    >
                      <FiPlus size={12} />
                    </button>
                    <button
                      onClick={() => removeItem(item._id)}
                      className="border-0 bg-transparent"
                      style={{ color: "#eb5757" }}
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Optional customer details */}
          <div
            className="pt-3 mb-3"
            style={{ borderTop: `1px solid ${BORDER_COLOR}` }}
          >
            <div className="d-flex align-items-center gap-2 mb-2">
              <FiUser size={14} style={{ color: MUTED_TEXT }} />
              <span className="font-archivo fs-sm fw-medium text-dark-blue">
                Customer details
              </span>
              <span
                className="font-archivo fs-xsm"
                style={{ color: MUTED_TEXT }}
              >
                (optional)
              </span>
            </div>
            <p
              className="font-archivo fs-xsm mb-2"
              style={{ color: MUTED_TEXT }}
            >
              For your own records only — the customer can decline.
            </p>
            <div className="d-flex flex-column gap-2">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
              <input
                type="tel"
                className="form-control form-control-sm"
                placeholder="Phone number"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
              <input
                type="email"
                className="form-control form-control-sm"
                placeholder="Email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
              />
            </div>
          </div>

          <div
            className="mt-auto pt-3"
            style={{ borderTop: `1px solid ${BORDER_COLOR}` }}
          >
            <div className="d-flex justify-content-between mb-3">
              <span className="font-archivo fw-semibold text-dark-blue">
                Total
              </span>
              <span className="font-archivo fw-bold fs-5 text-dark-blue">
                {formatCurrency(cart?.totalAmount)}
              </span>
            </div>
            <button
              onClick={completeSale}
              disabled={!cart || cart.items.length === 0 || checkingOut}
              className="bg-primary-normal text-white border-0 rounded-2 w-100 py-3 font-archivo fw-semibold"
            >
              {checkingOut ? "Processing..." : "Complete Sale (Cash)"}
            </button>
          </div>
        </div>
      </div>

      {/* Receipt */}
      {receipt && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: "rgba(0,0,0,0.4)", zIndex: 1000 }}
        >
          <div className="bg-white rounded-4 p-4" style={{ width: 360 }}>
            <h5 className="font-archivo fw-semibold text-dark-blue mb-3">
              Sale complete ✓
            </h5>
            <p
              className="font-archivo fs-sm mb-2"
              style={{ color: MUTED_TEXT }}
            >
              Order {receipt.shortId}
            </p>
            {receipt.items.map((item) => (
              <div
                key={item.cartItemId || item.productId}
                className="d-flex justify-content-between font-archivo fs-sm mb-1 text-dark-blue"
              >
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
            <div
              className="d-flex justify-content-between fw-bold pt-2 mt-2 text-dark-blue font-archivo"
              style={{ borderTop: `1px solid ${BORDER_COLOR}` }}
            >
              <span>Total</span>
              <span>{formatCurrency(receipt.totalAmount)}</span>
            </div>
            <button
              onClick={() => setReceipt(null)}
              className="bg-primary-normal text-white border-0 rounded-2 w-100 py-2 mt-3 font-archivo fw-medium"
            >
              New sale
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PointOfSale;
