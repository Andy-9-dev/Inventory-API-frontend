import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Wraps any route that requires the user to be an admin.
 * Must always be nested inside <ProtectedRoute> so we can
 * assume isAuthenticated is already true here.
 * Non-admins are redirected to /orders/new (their default landing page).
 */
export default function AdminRoute() {
  const { user } = useAuth();

  if (user?.role !== "admin") {
    return <Navigate to="/orders/new" replace />;
  }

  return <Outlet />;
}
