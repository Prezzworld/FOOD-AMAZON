import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useToast } from "../../toast/ToastContext";
import { isTokenExpired } from "../../utils/tokenUtils";
import useAuthStore from "../../store/authStore";

const AuthStatus = ({ children }) => {
   const {token, isAuthenticated} = useAuthStore()
   // const { showAlert } = useAlert();
   const { showToast } = useToast();
   const location = useLocation();
   // const navigate = useNavigate()

   useEffect(() => {
      if (!isAuthenticated || isTokenExpired(token)) {
         showToast("You need to be logged in to checkout", "warning")
      }
   }, [isAuthenticated, token])

   if (!isAuthenticated || isTokenExpired(token)) { 
      return <Navigate to="/login" state={{ from: location.pathname }} replace />;
   }
   return children;
}
export default AuthStatus;