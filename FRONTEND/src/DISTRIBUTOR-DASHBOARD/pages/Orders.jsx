import React, {useState, useEffect} from 'react';
import {
  FiList,
  FiCalendar,
  FiPackage,
  FiMapPin,
  FiBarChart2,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import distributorAxiosInstance from "../utils/DistributorAxiosInstance";

const TABS = [
  { label: "All Orders", value: "all", statuses: null },
  {
    label: "Pending Orders",
    value: "pending",
    statuses: "pending,processing,shipped",
  },
  { label: "Delivered Orders", value: "delivered", statuses: "delivered" },
  { label: "Cancelled Orders", value: "cancelled", statuses: "cancelled" },
];

const COLUMN_WIDTHS = {
  orderId: "15%",
  date: "18%",
  product: "27%",
  location: "20%",
  status: "20%",
};

const STATUS_VISUALS = {
  delivered: { label: "Delivered", color: "#00a859", Icon: FiCheckCircle },
  cancelled: { label: "Cancelled", color: "#f58634", Icon: FiXCircle },
  pending: { label: "Pending", color: "#2f80ed", Icon: FiXCircle },
};

const getStatusVisual = (deliveryStatus, paymentStatus) => {
  if (paymentStatus === "failed" || deliveryStatus === "cancelled") {
    return STATUS_VISUALS.cancelled;
  }
  if (deliveryStatus === "delivered") return STATUS_VISUALS.delivered;
  return STATUS_VISUALS.pending; // pending, processing, shipped, or unpaid
};

const formatDate = (dateString) => {
  const d = new Date(dateString);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}-${month}-${d.getFullYear()}`;
};

const getProductName = (items) => {
  if (!items || items.length === 0) return "—";
  const first = items[0].name;
  return items.length > 1 ? `${first} +${items.length - 1} more` : first;
};

const getLocation = (order) =>
  order.orderChannel === "walk-in"
    ? "Walk-in"
    : order.customerSnapshot?.city || "—";

const Orders = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");
        const activeTabConfig = TABS.find((t) => t.value === activeTab);
        const params = new URLSearchParams({
          page: currentPage,
          limit: itemsPerPage,
        });
        if (activeTabConfig.statuses)
          params.set("status", activeTabConfig.statuses);

        const response = await distributorAxiosInstance.get(
          `/food-amazon-database/order/distributor/orders?${params.toString()}`,
        );
        if (response.data.success) {
          setOrders(response.data.data);
          setTotalPages(response.data.pagination.pages || 1);
          setTotalItems(response.data.pagination.total || 0);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Couldn't load orders. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [activeTab, currentPage])

  const handleTabChange = (value) => {
    setActiveTab(value);
    setCurrentPage(1); // any filter change starts back on page 1
  };

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = [1];
    const left = Math.max(2, currentPage - 1);
    const right = Math.min(totalPages - 1, currentPage + 1);
    if (left > 2) pages.push("left-ellipsis");
    for (let p = left; p <= right; p++) pages.push(p);
    if (right < totalPages - 1) pages.push("right-ellipsis");
    pages.push(totalPages);
    return pages;
  };

  const goToPage = (page) => {
    if (page === currentPage || page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const fromItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const toItem = Math.min(currentPage * itemsPerPage, totalItems);
  return (
    <div>
      <h2 className="font-archivo text-dark-blue fw-semibold fs-2 mb-3">
        Orders
      </h2>
      <div className="bg-white rounded-4 p-4">
        {/* Tab bar — full-width gray divider, blue underline only under the active tab */}
        <div
          className="d-flex"
          style={{ gap: "3rem", borderBottom: "1px solid #f1f1f5" }}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => handleTabChange(tab.value)}
                className="bg-transparent border-0 font-archivo fs-sm pb-3"
                style={{
                  color: isActive ? "#2f80ed" : "#9aa1ac",
                  fontWeight: isActive ? 600 : 400,
                  borderBottom: isActive
                    ? "2px solid #2f80ed"
                    : "2px solid transparent",
                  marginBottom: "-1px",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Column headers */}
        <div
          className="d-flex align-items-center pt-4 pb-3"
          style={{ borderBottom: "1px solid #f1f1f5" }}
        >
          <div
            className="d-flex align-items-center gap-2"
            style={{ width: COLUMN_WIDTHS.orderId }}
          >
            <FiList size={16} color="#7c8798" />
            <span className="font-archivo fs-sm fw-medium text-dark-blue">
              Order ID
            </span>
          </div>
          <div
            className="d-flex align-items-center gap-2"
            style={{ width: COLUMN_WIDTHS.date }}
          >
            <FiCalendar size={16} color="#f58634" />
            <span className="font-archivo fs-sm fw-medium text-dark-blue">
              Ordered Date
            </span>
          </div>
          <div
            className="d-flex align-items-center gap-2"
            style={{ width: COLUMN_WIDTHS.product }}
          >
            <FiPackage size={16} color="#f58634" />
            <span className="font-archivo fs-sm fw-medium text-dark-blue">
              Product Name
            </span>
          </div>
          <div
            className="d-flex align-items-center gap-2"
            style={{ width: COLUMN_WIDTHS.location }}
          >
            <FiMapPin size={16} color="#9aa1ac" />
            <span className="font-archivo fs-sm fw-medium text-dark-blue">
              Location
            </span>
          </div>
          <div
            className="d-flex align-items-center gap-2"
            style={{ width: COLUMN_WIDTHS.status }}
          >
            <FiBarChart2 size={16} color="#2f80ed" />
            <span className="font-archivo fs-sm fw-medium text-dark-blue">
              Status
            </span>
          </div>
        </div>

        {/* Rows */}
        {loading ? (
          <p className="text-content-dark text-center py-5">
            Loading orders...
          </p>
        ) : error ? (
          <div className="alert alert-danger mt-3">{error}</div>
        ) : orders.length === 0 ? (
          <p className="text-content-dark text-center py-5">
            No orders found for this filter.
          </p>
        ) : (
          orders.map((order) => {
            const visual = getStatusVisual(
              order.paymentInfo?.deliveryStatus,
              order.paymentInfo?.paymentStatus,
            );
            const StatusIcon = visual.Icon;
            return (
              <div
                key={order._id}
                className="d-flex align-items-center py-3"
                style={{ borderBottom: "1px solid #f8f9fa" }}
              >
                <div style={{ width: COLUMN_WIDTHS.orderId }}>
                  <span className="font-archivo fs-sm text-dark-blue">
                    {order.shortId || "—"}
                  </span>
                </div>
                <div style={{ width: COLUMN_WIDTHS.date }}>
                  <span className="font-archivo fs-sm text-dark-blue">
                    {formatDate(order.createdAt)}
                  </span>
                </div>
                <div style={{ width: COLUMN_WIDTHS.product }}>
                  <span className="font-archivo fs-sm text-dark-blue">
                    {getProductName(order.items)}
                  </span>
                </div>
                <div style={{ width: COLUMN_WIDTHS.location }}>
                  <span className="font-archivo fs-sm text-dark-blue">
                    {getLocation(order)}
                  </span>
                </div>
                <div style={{ width: COLUMN_WIDTHS.status }}>
                  <div className="d-flex align-items-center gap-2">
                    <StatusIcon size={16} color={visual.color} />
                    <span
                      className="font-archivo fs-sm"
                      style={{ color: visual.color }}
                    >
                      {visual.label}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Footer: count + pagination */}
        {!loading && !error && orders.length > 0 && (
          <div className="d-flex align-items-center justify-content-between pt-4">
            <span className="font-archivo fs-sm text-content-dark">
              Showing {fromItem} to {toItem} of {totalItems} Items
            </span>
            <div className="d-flex align-items-center gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="bg-transparent border-0 d-flex align-items-center justify-content-center"
                style={{
                  width: 32,
                  height: 32,
                  color: currentPage === 1 ? "#d1d5db" : "#7c8798",
                }}
              >
                <BsChevronLeft size={14} />
              </button>
              {getPageNumbers().map((page, index) =>
                page === "left-ellipsis" || page === "right-ellipsis" ? (
                  <span
                    key={`${page}-${index}`}
                    className="font-archivo fs-sm text-content-dark"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className="border-0 d-flex align-items-center justify-content-center font-archivo fs-sm fw-medium"
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "8px",
                      backgroundColor:
                        page === currentPage ? "#00a859" : "transparent",
                      color: page === currentPage ? "#ffffff" : "#7c8798",
                    }}
                  >
                    {page}
                  </button>
                ),
              )}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="bg-transparent border-0 d-flex align-items-center justify-content-center"
                style={{
                  width: 32,
                  height: 32,
                  color: currentPage === totalPages ? "#d1d5db" : "#7c8798",
                }}
              >
                <BsChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders
