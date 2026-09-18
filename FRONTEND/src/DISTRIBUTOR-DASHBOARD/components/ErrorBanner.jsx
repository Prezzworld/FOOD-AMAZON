// Reusable error state — a red-tinted card showing what went wrong, with an
// optional "Try again" button.
//
// Pair it with TanStack Query's refetch so users can recover in place:
//   const { data, error, refetch } = useQuery(...);
//   if (error) return <ErrorBanner message={error.message} onRetry={refetch} />;
//
// Props:
//   message    — what to tell the user (usually error.message)
//   onRetry    — omit for errors the user can't act on (renders message only)
//   fullHeight — true = fill and center within a fixed-height parent
//                (cards like CustomerList); false = padded block for
//                flowing page sections (Inventory, Orders)
//   compact    — tighter padding, no heading row, for small panels (POS ticket)
import { FiAlertCircle } from "react-icons/fi";
import "../pages/dashboard.css";

const ErrorBanner = ({
  message = "Something went wrong. Please try again.",
  onRetry,
  fullHeight = false,
  compact = false,
}) => (
  <div
    className={`d-flex justify-content-center ${
      fullHeight ? "align-items-center h-100" : compact ? "py-4" : "py-5"
    }`}
  >
    <div
      className="bg-red-50 border border-red-200 rounded-lg p-4 text-center"
      role="alert"
    >
      {!compact && (
        <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
          <FiAlertCircle size={20} className="text-red-600" />
          <p className="font-archivo fs-sm fw-semibold text-dark-blue mb-0">
            Something went wrong
          </p>
        </div>
      )}
      <p className="font-archivo fs-sm text-content-dark mb-0">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-primary-normal text-white border-0 rounded-2 px-4 py-2 mt-3 font-archivo fs-sm fw-medium"
        >
          Try again
        </button>
      )}
    </div>
  </div>
);

export default ErrorBanner;
