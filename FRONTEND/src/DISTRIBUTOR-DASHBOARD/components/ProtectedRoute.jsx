import React, {useEffect} from "react";
import { Navigate } from "react-router-dom";
import { isTokenExpired } from "../../utils/tokenUtils";
import useDistributorStore from "../../store/distributorStore";

const ProtectedRoute = ({ children }) => {
  const {disToken, distributor, isAuthenticated} = useDistributorStore()

   const shouldRedirect =
     !disToken || !distributor || !isAuthenticated || isTokenExpired(disToken);

   useEffect(() => {
     if (shouldRedirect) {
       useDistributorStore.getState().logout();
     }
   }, [shouldRedirect]);

   if (shouldRedirect) {
     return <Navigate to="/distributor/login" replace />;
   }

  return children;
};

export default ProtectedRoute;
