import React from "react";
import { Navigate } from "react-router-dom";
import { isTokenExpired } from "../../utils/tokenUtils";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("disToken");
  const distributor = localStorage.getItem("distributor");

  if (!token || !distributor || isTokenExpired(token)) {
    localStorage.removeItem("disToken")
    localStorage.removeItem("distributor")
    localStorage.removeItem("disRefreshToken")
    return <Navigate to="/distributor/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
