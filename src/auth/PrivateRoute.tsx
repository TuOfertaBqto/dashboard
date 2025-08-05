import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";

interface PrivateRouteProps {
  children: React.ReactElement;
  allowedRoles: string[];
}

export const PrivateRoute = ({ children, allowedRoles }: PrivateRouteProps) => {
  const { token, user } = useAuth();

  if (!token || !user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
