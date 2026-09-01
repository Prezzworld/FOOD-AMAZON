import React, { useState, useEffect } from "react";
import { FiPlus, FiSliders, FiDownload, FiRefreshCw } from "react-icons/fi";
import distributorAxiosInstance from "../utils/DistributorAxiosInstance";
import "./dashboard.css";
import formatToNaira from "../../utils/nairaFormatter";

const AVAILABILITY_VISUALS = {
  inStock: { label: "In Stock", color: "#00a859" },
  lowStock: { label: "Low Stock", color: "#f2994a" },
  outOfStock: { label: "Out of Stock", color: "#eb5757" },
};

// Threshold now comes from the product itself (real per-product value),
// falling back to 10 only for the rare legacy doc that predates the
// backfill script somehow slipping through.
const getAvailability = (inStock, threshold = 10) => {
  if (inStock <= 0) return AVAILABILITY_VISUALS.outOfStock;
  if (inStock <= threshold) return AVAILABILITY_VISUALS.lowStock;
  return AVAILABILITY_VISUALS.inStock;
};

const formatDate = (dateString) => {
  if (!dateString) return "—";
  const d = new Date(dateString);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
};

const COLUMN_WIDTHS = {
  product: "24%",
  buyingPrice: "16%",
  quantity: "16%",
  threshold: "18%",
  expiry: "13%",
  availability: "13%",
};

const Inventory = () => {
  const [overview, setOverview] = useState(null);
  const [overviewLoading, setOverviewLoading] = useState(false);

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setOverviewLoading(true);
        const response = await distributorAxiosInstance.get(
          "/food-amazon-database/inventory/distributor/inventory-overview",
        );
        if (response.data.success) setOverview(response.data.data);
      } catch (err) {
        console.error("Error fetching inventory overview:", err);
      } finally {
        setOverviewLoading(false);
      }
    };
    fetchOverview();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setProductsLoading(true);
        setError("");
        const response = await distributorAxiosInstance.get(
          `/food-amazon-database/inventory/distributor/products?page=${currentPage}&limit=${itemsPerPage}`,
        );
        if (response.data.success) {
          setProducts(response.data.data);
          setTotalPages(response.data.pagination.pages || 1);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Couldn't load products. Please try again.");
      } finally {
        setProductsLoading(false);
      }
    };
    fetchProducts();
  }, [currentPage]);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const toggleReorder = async (productId) => {
    try {
      const response = await distributorAxiosInstance.patch(
        `/food-amazon-database/products/distributor/products/${productId}/toggle-reorder`,
      );
      if (response.data.success) {
        // Update just this one product locally instead of refetching
        // the whole paginated list for a single boolean flip.
        setProducts((prev) =>
          prev.map((p) => (p._id === productId ? response.data.data : p)),
        );
      }
    } catch (err) {
      console.error("Error toggling reorder status:", err);
    }
  };

  return (
    <div>
      <h2 className="font-archivo text-dark-blue fw-semibold fs-2 mb-3">
        Inventory
      </h2>

      {/* Overall Inventory */}
      <div className="bg-white rounded-4 p-4 mb-4">
        <h4 className="font-archivo fw-semibold text-dark-blue mb-4">
          Overall Inventory
        </h4>
        {overviewLoading ? (
          <p className="text-content-dark">Loading...</p>
        ) : (
          <div
            className="d-grid"
            style={{ gridTemplateColumns: "repeat(4, 1fr)" }}
          >
            <div className="metric-card">
              <p
                className="font-archivo fw-semibold mb-3"
                style={{ color: "#00a859" }}
              >
                Categories
              </p>
              <p className="font-archivo fw-bold fs-4 text-dark-blue mb-2">
                {overview?.categoriesCount ?? 0}
              </p>
              <p className="font-archivo fs-xsm text-content-dark mb-0">
                Last 7 days
              </p>
            </div>

            <div className="metric-card">
              <p
                className="font-archivo fw-semibold mb-3"
                style={{ color: "#f58634" }}
              >
                Total Products
              </p>
              <div className="d-flex justify-content-between">
                <p className="font-archivo fw-bold fs-4 text-dark-blue mb-2">
                  {overview?.newProductsLast7Days ?? 0}
                </p>
                <p className="font-archivo fw-bold fs-4 text-dark-blue mb-2">
                  {formatToNaira(overview?.revenueLast7Days)}
                </p>
              </div>
              <div className="d-flex justify-content-between">
                <p className="font-archivo fs-xsm text-content-dark mb-0">
                  Last 7 days
                </p>
                <p className="font-archivo fs-xsm text-content-dark mb-0">
                  Revenue
                </p>
              </div>
            </div>

            <div className="metric-card">
              <p
                className="font-archivo fw-semibold mb-3"
                style={{ color: "#2f80ed" }}
              >
                Top Selling
              </p>
              <div className="d-flex justify-content-between">
                <p className="font-archivo fw-bold fs-4 text-dark-blue mb-2">
                  {overview?.topSellingQuantity ?? 0}
                </p>
                <p className="font-archivo fw-bold fs-4 text-dark-blue mb-2">
                  {formatToNaira(overview?.topSellingRevenue)}
                </p>
              </div>
              <div className="d-flex justify-content-between">
                <p className="font-archivo fs-xsm text-content-dark mb-0">
                  Last 7 days
                </p>
                {/* Design says "Cost" here, but there's no buying-price data to
								    back that up — showing revenue under a "Cost" label would be
								    actively misleading, so this reads "Revenue" instead. */}
                <p className="font-archivo fs-xsm text-content-dark mb-0">
                  Revenue
                </p>
              </div>
            </div>

            <div className="metric-card">
              <p
                className="font-archivo fw-semibold mb-3"
                style={{ color: "#eb5757" }}
              >
                Low Stocks
              </p>
              <div className="d-flex justify-content-between">
                <p className="font-archivo fw-bold fs-4 text-dark-blue mb-2">
                  {overview?.reorderedCount ?? 0}
                </p>
                <p className="font-archivo fw-bold fs-4 text-dark-blue mb-2">
                  {overview?.outOfStockCount ?? 0}
                </p>
              </div>
              <div className="d-flex justify-content-between">
                <p className="font-archivo fs-xsm text-content-dark mb-0">
                  Ordered
                </p>
                <p className="font-archivo fs-xsm text-content-dark mb-0">
                  Not in stock
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Products */}
      <div className="bg-white rounded-4 p-4">
        <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
          <h4 className="font-archivo fw-semibold text-dark-blue mb-0">
            Products
          </h4>
          <div className="d-flex gap-2">
            <button
             
              className="d-flex align-items-center gap-2 bg-primary-normal border-0 text-white rounded-2 px-4 py-2 font-archivo fs-sm fw-medium"
            >
              <FiPlus size={16} /> Add Product
            </button>
            <button
              
              className="d-flex align-items-center gap-2 bg-white rounded-2 px-4 py-2 font-archivo fs-sm fw-medium text-dark-blue"
              style={{ border: "1px solid #e5e7eb" }}
            >
              <FiSliders size={16} /> Filters
            </button>
            <button
              
              className="d-flex align-items-center gap-2 bg-white rounded-2 px-4 py-2 font-archivo fs-sm fw-medium text-dark-blue"
              style={{ border: "1px solid #e5e7eb" }}
            >
              <FiDownload size={16} /> Download all
            </button>
          </div>
        </div>

        {/* Column headers */}
        <div
          className="d-flex align-items-center pb-3"
          style={{ borderBottom: "1px solid #f1f1f5" }}
        >
          <span
            className="font-archivo fs-sm text-content-dark"
            style={{ width: COLUMN_WIDTHS.product }}
          >
            Products
          </span>
          <span
            className="font-archivo fs-sm text-content-dark"
            style={{ width: COLUMN_WIDTHS.buyingPrice }}
          >
            Buying Price
          </span>
          <span
            className="font-archivo fs-sm text-content-dark"
            style={{ width: COLUMN_WIDTHS.quantity }}
          >
            Quantity
          </span>
          <span
            className="font-archivo fs-sm text-content-dark"
            style={{ width: COLUMN_WIDTHS.threshold }}
          >
            Threshold Value
          </span>
          <span
            className="font-archivo fs-sm text-content-dark"
            style={{ width: COLUMN_WIDTHS.expiry }}
          >
            Expiry Date
          </span>
          <span
            className="font-archivo fs-sm text-content-dark"
            style={{ width: COLUMN_WIDTHS.availability }}
          >
            Availability
          </span>
        </div>

        {/* Rows */}
        {productsLoading ? (
          <p className="text-content-dark text-center py-5">
            Loading products...
          </p>
        ) : error ? (
          <div className="alert alert-danger mt-3">{error}</div>
        ) : products.length === 0 ? (
          <p className="text-content-dark text-center py-5">
            No products found.
          </p>
        ) : (
          products.map((product) => {
            const availability = getAvailability(
              product.inStock,
              product.lowStockThreshold,
            );
            const isLowOrOut = availability !== AVAILABILITY_VISUALS.inStock;
            return (
              <div
                key={product._id}
                className="d-flex align-items-center py-3"
                style={{ borderBottom: "1px solid #f8f9fa" }}
              >
                <span
                  className="font-archivo fs-sm text-dark-blue"
                  style={{ width: COLUMN_WIDTHS.product }}
                >
                  {product.name}
                </span>
                <span
                  className="font-archivo fs-sm text-dark-blue"
                  style={{ width: COLUMN_WIDTHS.buyingPrice }}
                >
                  {formatToNaira(product.buyingPrice)}
                </span>
                <span
                  className="font-archivo fs-sm text-dark-blue"
                  style={{ width: COLUMN_WIDTHS.quantity }}
                >
                  {product.inStock} units
                </span>
                <span
                  className="font-archivo fs-sm text-dark-blue"
                  style={{ width: COLUMN_WIDTHS.threshold }}
                >
                  {product.lowStockThreshold ?? 10} units
                </span>
                <span
                  className="font-archivo fs-sm text-dark-blue"
                  style={{ width: COLUMN_WIDTHS.expiry }}
                >
                  {formatDate(product.expiryDate)}
                </span>
                <div style={{ width: COLUMN_WIDTHS.availability }}>
                  <span
                    className="font-archivo fs-sm fw-medium d-block"
                    style={{ color: availability.color }}
                  >
                    {availability.label}
                  </span>
                  {isLowOrOut && (
                    <button
                      onClick={() => toggleReorder(product._id)}
                      className="d-flex align-items-center gap-1 bg-transparent border-0 p-0 mt-1 font-archivo fs-xsm"
                      style={{
                        color: product.reorderRequested ? "#00a859" : "#9aa1ac",
                      }}
                    >
                      <FiRefreshCw size={11} />
                      {product.reorderRequested
                        ? "Reordered"
                        : "Mark reordered"}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Pagination — Previous / Page X of Y / Next, distinct from the
				    numbered pill pagination on the Orders page */}
        {!productsLoading && !error && products.length > 0 && (
          <div className="d-flex align-items-center justify-content-between pt-4">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="bg-white rounded-2 px-4 py-2 font-archivo fs-sm fw-medium"
              style={{
                border: "1px solid #e5e7eb",
                color: currentPage === 1 ? "#d1d5db" : "#282a36",
              }}
            >
              Previous
            </button>
            <span className="font-archivo fs-sm text-dark-blue">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="bg-white rounded-2 px-4 py-2 font-archivo fs-sm fw-medium"
              style={{
                border: "1px solid #e5e7eb",
                color: currentPage === totalPages ? "#d1d5db" : "#282a36",
              }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;
