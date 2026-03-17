import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export const DistributorTokenExpirationHandler = () => {
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
               navigate("/distributor/login", { state: { from: currentPath } });
            }
         });
      };

      window.addEventListener("distributorTokenExpired", handleTokenExpired);

      return () => {
         window.removeEventListener("distributorTokenExpired", handleTokenExpired);
      };
   }, [navigate]);

   return null; // This component doesn't render anything
};
