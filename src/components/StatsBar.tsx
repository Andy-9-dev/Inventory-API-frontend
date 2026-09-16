import type { StatsResponse } from "../types";

interface Props {
  stats: StatsResponse | null;
  loading: boolean;
  error: string | null;
}

export default function StatsBar({ stats, loading, error }: Props) {
  if (loading) {
    return (
      <div className="stats-bar" aria-label="Summary statistics">
        {[0, 1, 2].map((i) => (
          <div key={i} className="stat-card stat-card--skeleton" aria-hidden="true" />
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="stats-bar">
        <p className="stats-error" role="alert">
          {error ?? "Stats unavailable."}
        </p>
      </div>
    );
  }

  return (
    <div className="stats-bar" role="region" aria-label="Summary statistics">
      {/* Total Products */}
      <div className="stat-card">
        <span className="stat-label">Total Products</span>
        <span className="stat-value">{stats.totalProducts}</span>
      </div>

      {/* Low Stock */}
      <div className="stat-card">
        <span className="stat-label">Low Stock</span>
        <span
          className={`stat-value ${stats.lowStockCount > 0 ? "stat-value--warning" : ""}`}
        >
          {stats.lowStockCount}
        </span>
        {stats.lowStockCount > 0 && (
          <span className="stat-sub stat-sub--warning">
            {stats.lowStockCount} item{stats.lowStockCount !== 1 ? "s" : ""} below threshold
          </span>
        )}
      </div>

      {/* Total Orders */}
      <div className="stat-card">
        <span className="stat-label">Total Orders</span>
        <span className="stat-value">{stats.totalOrders}</span>
        <span className="stat-sub">
          <span className="stat-confirmed">{stats.confirmedOrders} confirmed</span>
          {", "}
          <span className="stat-rejected">{stats.rejectedOrders} rejected</span>
        </span>
      </div>
    </div>
  );
}
