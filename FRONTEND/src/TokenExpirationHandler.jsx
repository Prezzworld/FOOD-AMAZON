import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAlert } from "./alert/AlertContext";


export const TokenExpirationHandler = () => {
	const { showAlert } = useAlert();
	const navigate = useNavigate();

	useEffect(() => {
		const handleTokenExpired = (event) => {
			console.log("Token expired event received");
			const currentPath = window.location.pathname;
			showAlert(
				event.detail.message ||
					"Your session has expired. Please log in again.",
				"info",
				{
					mode: "confirm",
					confirmText: "Login",
					onConfirm: () => navigate("/login", { state: { from: currentPath } }),
				},
			);
		};

		window.addEventListener("tokenExpired", handleTokenExpired);

		return () => {
			window.removeEventListener("tokenExpired", handleTokenExpired);
		};
	}, [navigate]);

	return null; // This component doesn't render anything
};
