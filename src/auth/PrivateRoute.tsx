import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";
import { useAuthGuard } from "./useAuthGuard";

interface PrivateRouteProps {
  children: React.ReactElement;
  allowedRoles: string[];
}

export const PrivateRoute = ({ children, allowedRoles }: PrivateRouteProps) => {
  const { user } = useAuth();
  const { loading } = useAuthGuard();
  const location = useLocation();

  if (loading) return <div>Cargando...</div>;

  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;

  if (!allowedRoles.includes(user.role))
    return <Navigate to="/login" replace state={{ from: location }} />;

  return children;
};
