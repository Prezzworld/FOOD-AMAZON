import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAlert } from "./alert/AlertContext";
import useAuthStore from "./store/authStore";


export const TokenExpirationHandler = () => {
	const { showAlert } = useAlert();
	const navigate = useNavigate();

	useEffect(() => {
		const unsubscribe = useAuthStore.subscribe((state, prevState) => {
		if(prevState.isAuthenticated && !state.isAuthenticated) {
				const currentPath = window.location.pathname;
        if (currentPath === "/login" || currentPath === "/signup") return;
        showAlert("Your session has expired. Please log in again.",
          "info",
          {
            mode: "confirm",
            confirmText: "Login",
            onConfirm: () =>
              navigate("/login", { state: { from: currentPath } }),
          },
        );
		}
		})

		return () => unsubscribe()
	}, [navigate, showAlert]);

	return null; // This component doesn't render anything
};
