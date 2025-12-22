import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

export default function ProtectedRoute({ redirectPath = "/login" }) {
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  // If authenticated, render nested routes
  return <Outlet />;
}
