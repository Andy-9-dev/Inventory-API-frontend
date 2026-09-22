import { useCallback, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { fetchStats } from "../api";
import StatsBar from "../components/StatsBar";
import { useAuth } from "../context/AuthContext";
import type { StatsResponse } from "../types";

interface OutletCtx { theme: "dark" | "light" }

export default function DashboardPage() {
  const { token, logout } = useAuth();
  // theme is read from outlet context by child components; not needed here directly
  useOutletContext<OutletCtx>();

  const [stats, setStats]           = useState<StatsResponse | null>(null);
  const [statsLoading, setLoading]  = useState(true);
  const [statsError, setError]      = useState<string | null>(null);

  const onUnauthorized = useCallback(() => logout(), [logout]);

  const loadStats = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      setStats(await fetchStats(token, onUnauthorized));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load stats.");
    } finally {
      setLoading(false);
    }
  }, [token, onUnauthorized]);

  useEffect(() => { void loadStats(); }, [loadStats]);

  return (
    <main className="app-main">
      <div className="page-heading">
        <h2>Dashboard</h2>
        <p className="page-heading__sub">Overview of your inventory system</p>
      </div>

      <div className="stats-bar-wrap">
        <StatsBar stats={stats} loading={statsLoading} error={statsError} />
      </div>
    </main>
  );
}
