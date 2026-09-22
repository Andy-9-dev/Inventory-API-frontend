import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AdminRoute from "./components/AdminRoute";
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import PlaceOrderPage from "./pages/PlaceOrderPage";
import ProductsPage from "./pages/ProductsPage";
import RegisterPage from "./pages/RegisterPage";
import "./App.css";

/**
 * Route tree:
 *
 *  /login                — public
 *  /register             — public
 *  /                     — ProtectedRoute > AdminRoute > AppLayout > DashboardPage
 *  /products             — ProtectedRoute > AppLayout > ProductsPage
 *  /orders/new           — ProtectedRoute > AppLayout > PlaceOrderPage
 *  /orders               — ProtectedRoute > AppLayout > OrderHistoryPage
 *  *                     — redirect to /login
 */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ── Public routes ── */}
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ── Protected routes — must be logged in ── */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>

              {/* Admin-only: Dashboard */}
              <Route element={<AdminRoute />}>
                <Route index element={<DashboardPage />} />
              </Route>

              {/* All authenticated users */}
              <Route path="products"   element={<ProductsPage />} />
              <Route path="orders/new" element={<PlaceOrderPage />} />
              <Route path="orders"     element={<OrderHistoryPage />} />

            </Route>
          </Route>

          {/* ── Catch-all ── */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
