import React from "react";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { FiArrowLeft } from "react-icons/fi";
import formatToNaira from "../../utils/nairaFormatter";

const MUTED_TEXT = "#8b93a7";
const AVATAR_RING = "#5AC8B8";
const AVATAR_BG = "#F4B8B8";

const getInitials = (firstName, lastName) => {
  const a = firstName?.[0] || "";
  const b = lastName?.[0] || "";
  const initials = (a + b).toUpperCase();
  return initials || null;
};

const OrderDetails = ({ order, onBack }) => {
  if (!order) return null;

  const { customerSnapshot } = order;
  const isWalkIn = order.orderChannel === "walk-in";

  const customerName = customerSnapshot?.firstName
    ? `${customerSnapshot.firstName} ${customerSnapshot.lastName || ""}`.trim()
    : isWalkIn
      ? "Walk-in Customer"
      : "Unknown Customer";

  // customerSnapshot is the only address this schema stores — there's no
  // separate billing-address field anywhere in the Order model, so both
  // sections below intentionally show the same data. Flagging this so it
  // doesn't look like a bug later.
  const hasAddress = Boolean(customerSnapshot?.address);

  return (
    <div>
      <button
        onClick={onBack}
        className="bg-transparent border-0 d-flex align-items-center gap-2 mb-4 font-archivo fs-sm p-0"
        style={{ color: MUTED_TEXT }}
      >
        <FiArrowLeft size={16} /> Back to Orders
      </button>

      <h2
        className="font-archivo fw-bold text-dark-blue mb-4"
        style={{ fontSize: "28px" }}
      >
        {order.shortId || "—"}
      </h2>

      <div className="d-flex flex-column flex-lg-row gap-5">
        {/* Product grid */}
        <div style={{ flex: 2 }}>
          <div className="row g-4">
            {order.items.map((item) => (
              <div
                key={item.cartItemId || item.productId}
                className="col-12 col-md-6"
              >
                <img
                  src={item.productImg}
                  alt={item.name}
                  className="w-100 rounded-3"
                  style={{
                    height: 230,
                    objectFit: "cover",
                    backgroundColor: "#f1f1f5",
                  }}
                />
                <p className="font-archivo fw-bold text-dark-blue mt-3 mb-1">
                  {item.name}
                </p>
                <div className="d-flex justify-content-between align-items-center">
                  <span
                    className="font-archivo fs-sm"
                    style={{ color: MUTED_TEXT }}
                  >
                    Quantity - {item.quantity}
                  </span>
                  <span className="font-archivo fw-semibold text-primary-normal">
                    {formatToNaira(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer panel */}
        <div style={{ flex: 1, minWidth: 260 }}>
          <div className="d-flex align-items-center justify-content-between mb-4">
            <h4 className="font-archivo fw-semibold text-dark-blue mb-0">
              Customer Information
            </h4>
            <HiOutlineDotsHorizontal
              size={18}
              style={{ color: MUTED_TEXT, cursor: "pointer" }}
            />
          </div>

          <div className="d-flex flex-column align-items-center text-center mb-4">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center mb-3"
              style={{
                width: 130,
                height: 130,
                border: `4px solid ${AVATAR_RING}`,
              }}
            >
              <div
                className="rounded-circle d-flex align-items-center justify-content-center w-100 h-100"
                style={{ backgroundColor: AVATAR_BG }}
              >
                <span
                  className="font-archivo fw-bold"
                  style={{ fontSize: 32, color: "#8a4a4a" }}
                >
                  {getInitials(
                    customerSnapshot?.firstName,
                    customerSnapshot?.lastName,
                  )}
                </span>
              </div>
            </div>
            <p className="font-archivo fw-bold text-dark-blue fs-5 mb-1">
              {customerName}
            </p>
            {customerSnapshot?.email && (
              <p
                className="font-archivo fs-sm mb-0"
                style={{ color: MUTED_TEXT }}
              >
                {customerSnapshot.email}
              </p>
            )}
            {customerSnapshot?.phone && (
              <p
                className="font-archivo fs-sm mb-0"
                style={{ color: MUTED_TEXT }}
              >
                {customerSnapshot.phone}
              </p>
            )}
          </div>

          <hr style={{ borderColor: "#f1f1f5" }} />

          {hasAddress ? (
            <>
              <div className="mb-3">
                <p className="font-archivo fw-semibold text-dark-blue fs-sm mb-2">
                  Shipping Address
                </p>
                <p
                  className="font-archivo fs-sm mb-0"
                  style={{ color: MUTED_TEXT }}
                >
                  {customerSnapshot.address}
                </p>
                <p
                  className="font-archivo fs-sm mb-0"
                  style={{ color: MUTED_TEXT }}
                >
                  {customerSnapshot.city}, {customerSnapshot.state}
                </p>
              </div>
              <div>
                <p className="font-archivo fw-semibold text-dark-blue fs-sm mb-2">
                  Billing Address
                </p>
                <p
                  className="font-archivo fs-sm mb-0"
                  style={{ color: MUTED_TEXT }}
                >
                  {customerSnapshot.address}
                </p>
                <p
                  className="font-archivo fs-sm mb-0"
                  style={{ color: MUTED_TEXT }}
                >
                  {customerSnapshot.city}, {customerSnapshot.state}
                </p>
              </div>
            </>
          ) : (
            <p className="font-archivo fs-sm" style={{ color: MUTED_TEXT }}>
              {isWalkIn
                ? "No address on file — this was a walk-in sale."
                : "No address on file for this order."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
