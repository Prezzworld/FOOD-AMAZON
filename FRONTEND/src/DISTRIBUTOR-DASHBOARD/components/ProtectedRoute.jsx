import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("disToken");
  const distributor = localStorage.getItem("distributor");

  if (!token || !distributor) {
    return <Navigate to="/distributor/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
