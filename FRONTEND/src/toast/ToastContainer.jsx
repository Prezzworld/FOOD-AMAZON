import { createPortal } from "react-dom";
import { useToast } from "./ToastContext";
import ToastItem from "./ToastItem";
import './toast.css'

const ToastContainer = () => {
  const { toasts } = useToast();
  if (toasts.length === 0) return null;
  return createPortal(
		<div
			style={{
				position: "fixed",
				top: "16px",
				right: "10px",
				zIndex: 9999,
				display: "flex",
				// flexDirection: "column",
				// alignItems: "flex-end",
				// pointer-events: none on the container means the container div
				// itself doesn't block clicks on the page behind it.
				// Individual ToastItems still receive pointer events normally.
				pointerEvents: "none",
			}}
		>
			{/* Each toast gets pointer-events: auto so the close button works */}
			<div style={{ pointerEvents: "auto" }}>
				{toasts.map((toast) => (
					<ToastItem key={toast.id} toast={toast} />
				))}
			</div>
		</div>,
		// This is where we're portaling to — directly onto document.body
		document.body,
	);
};

export default ToastContainer