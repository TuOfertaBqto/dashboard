import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";

export const PrivateRoute = ({
  children,
}: {
  children: React.ReactElement;
}) => {
  const { token, user } = useAuth();

  if (!token || !user) return <Navigate to="/login" replace />;

  const allowedRoles = ["super_admin", "admin", "main", "vendor"];
  if (!allowedRoles.includes(user.role))
    return <Navigate to="/login" replace />;

  return children;
};
