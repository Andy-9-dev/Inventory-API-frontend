import { useCallback, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { fetchOrders } from "../api";
import OrderHistorySection from "../components/OrderHistorySection";
import { useAuth } from "../context/AuthContext";
import type { Order } from "../types";

interface OutletCtx { theme: "dark" | "light" }

export default function OrderHistoryPage() {
  const { token, logout } = useAuth();
  useOutletContext<OutletCtx>();

  const [orders, setOrders]         = useState<Order[]>([]);
  const [ordersLoading, setLoading] = useState(true);
  const [ordersError, setError]     = useState<string | null>(null);

  const onUnauthorized = useCallback(() => logout(), [logout]);

  const loadOrders = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      setOrders(await fetchOrders(token, onUnauthorized));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }, [token, onUnauthorized]);

  useEffect(() => { void loadOrders(); }, [loadOrders]);

  return (
    <main className="app-main">
      <OrderHistorySection
        orders={orders}
        loading={ordersLoading}
        error={ordersError}
      />
    </main>
  );
}
