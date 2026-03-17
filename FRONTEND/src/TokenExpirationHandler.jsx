import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export const TokenExpirationHandler = () => {
	const navigate = useNavigate();

	useEffect(() => {
		const handleTokenExpired = (event) => {
			console.log("Token expired event received");

			MySwal.fire({
				icon: "warning",
				title: "Session Expired",
				text:
					event.detail.message ||
					"Your session has expired. Please log in again.",
				showCancelButton: false,
				confirmButtonText: "Log In",
				confirmButtonColor: "#00a859",
				allowOutsideClick: false,
			}).then((result) => {
				if (result.isConfirmed) {
					// Save current location so we can redirect back after login
					const currentPath = window.location.pathname;
					navigate("/login", { state: { from: currentPath } });
				}
			});
		};

		window.addEventListener("tokenExpired", handleTokenExpired);

		return () => {
			window.removeEventListener("tokenExpired", handleTokenExpired);
		};
	}, [navigate]);

	return null; // This component doesn't render anything
};
