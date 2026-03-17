import { Navigate, useLocation } from "react-router-dom";
import { cartService } from "../utils/cartService";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const AuthStatus = ({ children }) => {
   const MySwal = withReactContent(Swal)
   const location = useLocation;
   // const navigate = useNavigate()
   const isAuthenticated = cartService.checkAuthStatus();

   if (!isAuthenticated) {
      MySwal.fire({
         icon: 'info',
         text: 'Log in to check out your order',
         showConfirmButton: false,
         timer: 1500
      });
      return <Navigate to="/login" state={{ from: location.pathname }} replace />;
   }
   return children;
}
export default AuthStatus;