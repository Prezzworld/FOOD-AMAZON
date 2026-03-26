import { useEffect, useState } from "react";
import { useToast } from "./ToastContext";
import {
	BsCheckCircle,
	BsXCircle,
	BsInfoCircle,
	BsExclamationTriangle,
} from "react-icons/bs";

const ToastItem = ({ toast }) => {
	const { removeToast } = useToast();
	const [visible, setVisible] = useState(false);
	useEffect(() => {
		const enterTimer = setTimeout(() => setVisible(true), 10);
		return () => clearTimeout(enterTimer);
	}, []);
	const handleClose = () => {
		setVisible(false);
		setTimeout(() => removeToast(toast.id), 300);
	};
	const typeConfig = {
		success: {
			bgClass: "bg-white",
			color: "text-success",
			icon: <BsCheckCircle className="w-100 h-100"/>,
			label: "Success",
		},
		error: {
			bgClass: "bg-white",
			color: "text-danger",
			icon: <BsXCircle className="w-100 h-100"/>,
			label: "Error",
		},
		warning: {
			bgClass: "bg-white",
			color: "text-warning",
			icon: <BsExclamationTriangle className="w-100 h-100"/>,
			label: "Warning",
		},
		info: {
			bgClass: "bg-white",
			color: "text-info",
			icon: <BsInfoCircle className="w-100 h-100"/>,
			label: "Info",
		},
	};
	const config = typeConfig[toast.type] || typeConfig.info;
	return (
		<div
			className={`toast show mb-2 ${config.bgClass} ${config.color} border-0 px-3 py-2`}
			role="alert"
			aria-live="assertive"
			style={{
				minWidth: "250px",
				maxWidth: "360px",
				width: "100%",
				opacity: visible ? 1 : 0,
				transform: visible ? "translateX(0)" : "translateX(20px)",
				transition: "opacity 0.3s ease, transform 0.3s ease",
			}}
		>
			<div
				className={`toast-header border-0 ${config.color}`}
				// style={{ backgroundColor: "rgba(0,0,0,0.15)" }}
			>
				<div
					className="me-2 d-flex align-items-center toast-icon justify-content-center rounded-circle bg-white fs-6"
					style={{	
						color:
							toast.type === "warning"
								? "#ffc107"
								: toast.type === "success"
									? "#198754"
									: toast.type === "error"
										? "#dc3545"
										: "#0d6efd"
					}}
				>
					{config.icon}
				</div>
				<strong className="me-auto font-inter fw-medium">{config.label}</strong>
				{/* Close button — clicking this triggers the handleClose animation */}
				<button
					type="button"
					className="btn-close btn-dark ms-2"
					aria-label="Close"
					onClick={handleClose}
					style={{ fontSize: "0.8rem" }}
				/>
			</div>
			<div className="toast-body font-inter mt-1" style={{ fontSize: "0.9rem" }}>
				{toast.message}
			</div>
		</div>
	);
};

export default ToastItem;
