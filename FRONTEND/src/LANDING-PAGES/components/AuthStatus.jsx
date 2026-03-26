import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { cartService } from "../utils/cartService";
// import { useAlert } from "../../alert/AlertContext";
import { useToast } from "../../toast/ToastContext";

const AuthStatus = ({ children }) => {
   // const { showAlert } = useAlert();
   const { showToast } = useToast();
   const location = useLocation();
   // const navigate = useNavigate()
   const isAuthenticated = cartService.checkAuthStatus();

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