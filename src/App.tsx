import { useCallback, useEffect, useState } from "react";
import { fetchOrders, fetchProducts, fetchStats } from "./api";
import OrderHistorySection from "./components/OrderHistorySection";
import PlaceOrderSection from "./components/PlaceOrderSection";
import ProductsSection from "./components/ProductsSection";
import StatsBar from "./components/StatsBar";
import type { Order, Product, StatsResponse } from "./types";
import "./App.css";

type Theme = "dark" | "light";

export default function App() {
  // ── Theme ─────────────────────────────────────────────────────────────────
  const [theme, setTheme] = useState<Theme>("dark");
  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  // ── Products ──────────────────────────────────────────────────────────────
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);

  // ── Orders ────────────────────────────────────────────────────────────────
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  // ── Loaders ───────────────────────────────────────────────────────────────
  const loadProducts = useCallback(async () => {
    setProductsLoading(true);
    setProductsError(null);
    try {
      setProducts(await fetchProducts());
    } catch (err) {
      setProductsError(err instanceof Error ? err.message : "Failed to load products.");
    } finally {
      setProductsLoading(false);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      setOrders(await fetchOrders());
    } catch (err) {
      setOrdersError(err instanceof Error ? err.message : "Failed to load orders.");
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      setStats(await fetchStats());
    } catch (err) {
      setStatsError(err instanceof Error ? err.message : "Failed to load stats.");
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Initial load — all three in parallel
  useEffect(() => {
    void loadProducts();
    void loadOrders();
    void loadStats();
  }, [loadProducts, loadOrders, loadStats]);

  const handleProductAdded = useCallback(() => {
    void loadStats();
  }, [loadStats]);

  const handleOrderPlaced = useCallback(() => {
    void loadProducts();
    void loadOrders();
    void loadStats();
  }, [loadProducts, loadOrders, loadStats]);

  return (
    <div className={`app-layout theme-${theme}`}>
      <header className="app-header">
        <div className="app-header__inner">
          <div className="app-header__title-block">
            <h1>Inventory &amp; Orders</h1>
            <p className="app-subtitle">
              Manage your products and track orders in one place.
            </p>
          </div>

          {/* ── Theme toggle ── */}
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? (
              // In terminal mode: show a bracketed command-prompt style label
              <span>[ light_mode ]</span>
            ) : (
              // In editorial mode: simple text label
              <span>Dark mode</span>
            )}
          </button>
        </div>
      </header>

      <div className="stats-bar-wrap">
        <StatsBar stats={stats} loading={statsLoading} error={statsError} />
      </div>

      <main className="app-main">
        <ProductsSection
          products={products}
          loading={productsLoading}
          error={productsError}
          onProductsChange={setProducts}
          onProductAdded={handleProductAdded}
        />

        <PlaceOrderSection
          products={products}
          onOrderPlaced={handleOrderPlaced}
        />

        <OrderHistorySection
          orders={orders}
          loading={ordersLoading}
          error={ordersError}
        />
      </main>

      <footer className="app-footer">
        <p>Inventory API Frontend — connected to localhost:4001</p>
      </footer>
    </div>
  );
}
