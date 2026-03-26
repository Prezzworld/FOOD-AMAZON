import { createPortal } from "react-dom";
import { useAlert } from "./AlertContext";
import {
	BsCheckCircle,
	BsXCircle,
	BsInfoCircle,
	BsExclamationTriangle,
} from "react-icons/bs";
import './alert.css'

// Alert.jsx renders the actual UI for the current alert.
// It handles both modes — inline and confirm — in one component.
//
// For "inline" mode: renders a standard Bootstrap alert bar that the user
// can dismiss with an X button.
//
// For "confirm" mode: renders a modal-like overlay with a message and two
// buttons (confirm/cancel). This replaces Swal.fire({ showConfirmButton: true }).

const Alert = () => {
	const { alert, hideAlert, handleConfirm, handleCancel } = useAlert();

	// If there's no active alert, render nothing
	if (!alert) return null;

	// Map type to Bootstrap color classes
	const typeConfig = {
		success: { alertClass: "alert-success", color: "text-success", icon: <BsCheckCircle className="w-100 h-100"/> },
		error: { alertClass: "alert-danger", color: "text-danger", icon: <BsXCircle className="w-100 h-100"/> },
		warning: { alertClass: "alert-warning", color: "text-warning", icon: <BsExclamationTriangle className="w-100 h-100"/> },
		info: { alertClass: "alert-primary", color: "text-primary", icon: <BsInfoCircle className="w-100 h-100"/> },
	};

	const config = typeConfig[alert.type] || typeConfig.info;

	// --- INLINE MODE ---
	// Renders a Bootstrap alert bar at the top of wherever AlertContainer
	// is placed in your page. Good for form errors, success messages, etc.
	if (alert.mode === "inline") {
		return (
			<div
				className={`alert ${config.alertClass} alert-dismissible d-flex alert-inline align-items-center font-inter p-3 position-fixed start-50 translate-middle-x`}
				role="alert"
				style={{ fontSize: "0.9rem", top: '10px', maxWidth: "100%", width: "90%" }}
			>
				<span className="me-2" style={{width: "32px", height: "32px"}}>{config.icon}</span>
				<span>{alert.message}</span>
				<button
					type="button"
					className="btn-close ms-auto mt-2 me-2 fs-6"
					aria-label="Close"
					onClick={hideAlert}
				/>
			</div>
		);
	}

	// --- CONFIRM MODE ---
	// Renders a full overlay with a centered card, message, and action buttons.
	// Uses createPortal just like ToastContainer so it always appears on top
	// of everything else, regardless of where it's rendered in the component tree.
	if (alert.mode === "confirm") {
		return createPortal(
			// Dark semi-transparent overlay that covers the entire screen
			<div
				style={{
					position: "fixed",
					inset: 0, // shorthand for top/right/bottom/left: 0
					backgroundColor: "rgba(0, 0, 0, 0.5)",
					zIndex: 9998, // just below toasts (9999) but above everything else
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
          padding: "1rem",
          // margin: "1rem"
				}}
				// Clicking the backdrop dismisses the alert (same as Cancel)
				onClick={handleCancel}
			>
				{/* The card itself — stopPropagation prevents clicks inside
                    the card from bubbling up to the backdrop and dismissing */}
				<div
					className="bg-white rounded-4 shadow-lg p-4 mx-2"
					style={{ maxWidth: "440px", width: "100%" }}
					onClick={(e) => e.stopPropagation()}
				>
					{/* Icon */}
					<div className="text-center mb-3">
						<div
							className={`d-inline-flex align-items-center justify-content-center rounded-circle ${
								alert.type === "error"
									? "text-danger"
									: alert.type === "warning"
										? "text-warning"
										: alert.type === "success"
											? "text-success"
											: "text-primary"
							}`}
							style={{ width: "56px", height: "56px", fontSize: "1.5rem" }}
						>
							{config.icon}
						</div>
					</div>

					{/* Message */}
					<p
						className="text-center font-inter mb-4"
						style={{ fontSize: "0.95rem", color: "#444" }}
					>
						{alert.message}
					</p>

					{/* Action buttons */}
					<div className="d-flex gap-3 justify-content-center">
						<button
							className="btn btn-outline-secondary font-inter px-4 py-2"
							onClick={handleCancel}
						>
							{alert.cancelText}
						</button>
						<button
							className={`btn font-inter px-4 py-2 text-white ${
								alert.type === "error"
									? "btn-danger"
									: alert.type === "warning"
										? "btn-warning"
										: alert.type === "success"
											? "btn-success"
											: "btn-primary"
							}`}
							onClick={handleConfirm}
						>
							{alert.confirmText}
						</button>
					</div>
				</div>
			</div>,
			document.body,
		);
	}

	return null;
};

export default Alert;
