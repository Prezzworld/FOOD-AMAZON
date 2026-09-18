// Reusable loading state — an icon circle with a spinning refresh icon
// (matching the Reviews page look), or a compact spinner for small panels.
//
// Props:
//   message    — helper text shown under the icon (e.g. "Loading products...")
//   fullHeight — true = fill the parent container (use inside fixed-height
//                panels like CustomerList's 400px card); false = pad itself
//                vertically (use in flowing page sections like Inventory)
//   compact    — small spinner instead of the big icon circle (side panels
//                like the POS ticket)
import { FiRefreshCcw } from "react-icons/fi";
import "../pages/dashboard.css";

const LoadingSpinner = ({ message = "", fullHeight = false, compact = false }) => (
  <div
    className={`d-flex justify-content-center align-items-center ${
      fullHeight ? "h-100" : compact ? "py-4" : "py-5"
    }`}
  >
    <div className="d-flex flex-column align-items-center text-center gap-3">
      {compact ? (
        <div className="spinner-border text-primary-normal" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      ) : (
        <div className="state-icon-circle d-flex justify-content-center align-items-center rounded-circle bg-white border border-2 border-primary">
          <FiRefreshCcw size={36} className="text-primary state-icon-spin" />
        </div>
      )}
      {message && (
        <p className="font-archivo fs-sm text-content-dark mb-0">{message}</p>
      )}
    </div>
  </div>
);

export default LoadingSpinner;
