import { useCallback, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { fetchProducts } from "../api";
import ProductsSection from "../components/ProductsSection";
import { useAuth } from "../context/AuthContext";
import type { Product } from "../types";

interface OutletCtx { theme: "dark" | "light" }

export default function ProductsPage() {
  const { token, logout } = useAuth();
  // theme is available via outlet context but ProductsSection doesn't need it directly —
  // the theme class on app-layout handles all styling.
  useOutletContext<OutletCtx>();

  const [products, setProducts]         = useState<Product[]>([]);
  const [productsLoading, setLoading]   = useState(true);
  const [productsError, setError]       = useState<string | null>(null);

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

  return (
    <main className="app-main">
      <ProductsSection
        products={products}
        loading={productsLoading}
        error={productsError}
        onProductsChange={setProducts}
        onProductAdded={loadProducts}
      />
    </main>
  );
}
