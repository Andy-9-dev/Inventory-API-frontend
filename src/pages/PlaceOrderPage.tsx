import { useCallback, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { fetchProducts } from "../api";
import PlaceOrderSection from "../components/PlaceOrderSection";
import { useAuth } from "../context/AuthContext";
import type { Product } from "../types";

interface OutletCtx { theme: "dark" | "light" }

export default function PlaceOrderPage() {
  const { token, logout } = useAuth();
  useOutletContext<OutletCtx>();

  const [products, setProducts]       = useState<Product[]>([]);
  const [productsLoading, setLoading] = useState(true);
  const [productsError, setError]     = useState<string | null>(null);

  const onUnauthorized = useCallback(() => logout(), [logout]);

  const loadProducts = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      setProducts(await fetchProducts(token, onUnauthorized));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products.");
    } finally {
      setLoading(false);
    }
  }, [token, onUnauthorized]);

  useEffect(() => { void loadProducts(); }, [loadProducts]);

  // After an order is placed, refresh the product list (stock changed)
  const handleOrderPlaced = useCallback(() => {
    void loadProducts();
  }, [loadProducts]);

  return (
    <main className="app-main">
      {productsLoading && (
        <p className="status-msg">Loading products…</p>
      )}
      {productsError && (
        <p className="status-msg status-msg--error">{productsError}</p>
      )}
      {!productsLoading && (
        <PlaceOrderSection
          products={products}
          onOrderPlaced={handleOrderPlaced}
        />
      )}
    </main>
  );
}
