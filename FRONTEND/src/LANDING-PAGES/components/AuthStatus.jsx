import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { cartService } from "../utils/cartService";
// import { useAlert } from "../../alert/AlertContext";
import { useToast } from "../../toast/ToastContext";
import { isTokenExpired } from "../../utils/tokenUtils";

const AuthStatus = ({ children }) => {
   // const { showAlert } = useAlert();
   const { showToast } = useToast();
   const location = useLocation();
   // const navigate = useNavigate()
   const token = localStorage.getItem("token")
   const isAuthenticated = cartService.checkAuthStatus() && token && !isTokenExpired(token);

   useEffect(() => {
      if (!isAuthenticated) {
         showToast("You need to be logged in to checkout", "warning")
      }
   }, [isAuthenticated])

   if (!isAuthenticated) { 
      return <Navigate to="/login" state={{ from: location.pathname }} replace />;
   }
   return children;
}
export default AuthStatus;