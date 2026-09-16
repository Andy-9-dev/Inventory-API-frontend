import type { Order } from "../types";

interface Props {
  orders: Order[];
  loading: boolean;
  error: string | null;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function OrderHistorySection({ orders, loading, error }: Props) {
  return (
    <section className="card section-card" aria-labelledby="history-heading">
      <div className="section-header">
        <h2 id="history-heading">Order History</h2>
        <span className="section-count">{orders.length}</span>
      </div>

      {loading && <p className="status-msg">Loading orders…</p>}
      {error && <p className="status-msg status-msg--error">{error}</p>}

      {!loading && !error && (
        <>
          {orders.length === 0 ? (
            <p className="empty-state">No orders placed yet.</p>
          ) : (
            <ul className="order-list" role="list">
              {orders.map((o) => (
                <li key={o.id} className="order-row" role="listitem">
                  <div className="order-row__main">
                    <span className="order-row__product">{o.product_name}</span>
                    <span className="order-row__qty">×{o.quantity}</span>
                  </div>
                  <div className="order-row__meta">
                    <span className={`badge badge--${o.status}`}>
                      {o.status === "confirmed" ? "Confirmed" : "Rejected"}
                    </span>
                    <span className="order-row__date">{formatDate(o.created_at)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
