import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAlert } from "./alert/AlertContext";
import useDistributorStore from "./store/distributorStore";

export const DistributorTokenExpirationHandler = () => {
	const { showAlert } = useAlert();
	const navigate = useNavigate();

	useEffect(() => {
		const unsubscribe = useDistributorStore.subscribe((state, prevState) => {
			if(prevState.isAuthenticated && !state.isAuthenticated) {
				const currentPath = window.location.pathname;
        showAlert(
            "Your session has expired. Please log in again.",
          "info",
          {
            mode: "confirm",
            confirmText: "Login",
            onConfirm: () =>
              navigate("/distributor/login", { state: { from: currentPath } }),
          },
        );
			}
		});

		return () => unsubscribe()
	}, [navigate, showAlert]);

	return null; // This component doesn't render anything
};
