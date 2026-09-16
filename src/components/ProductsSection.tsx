import { useState } from "react";
import { createProduct } from "../api";
import type { NewProductPayload } from "../api";
import type { Product } from "../types";

interface Props {
  products: Product[];
  loading: boolean;
  error: string | null;
  onProductsChange: (products: Product[]) => void;
  /** Called after a product is successfully added so parent can refresh stats */
  onProductAdded: () => void;
}

const EMPTY_FORM: NewProductPayload = { name: "", price: 0, stock: 0, category: "" };

/** Max stock we use as the 100% reference for the stock bar. */
const STOCK_BAR_MAX = 100;

function StockBar({ stock }: { stock: number }) {
  const pct = Math.min(100, Math.round((stock / STOCK_BAR_MAX) * 100));
  const isLow = stock < 10;
  return (
    <div className="stock-bar-wrap" aria-label={`Stock: ${stock}`}>
      <div
        className={`stock-bar-fill ${isLow ? "stock-bar-fill--low" : ""}`}
        style={{ width: `${pct}%` }}
        role="progressbar"
        aria-valuenow={stock}
        aria-valuemin={0}
        aria-valuemax={STOCK_BAR_MAX}
      />
    </div>
  );
}

export default function ProductsSection({
  products,
  loading,
  error,
  onProductsChange,
  onProductAdded,
}: Props) {
  const [form, setForm] = useState<NewProductPayload>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMsg(null);

    if (!form.name.trim()) {
      setFormError("Product name is required.");
      return;
    }
    if (form.price <= 0) {
      setFormError("Price must be greater than 0.");
      return;
    }
    if (form.stock < 0) {
      setFormError("Stock cannot be negative.");
      return;
    }

    setSubmitting(true);
    try {
      const created = await createProduct(form);
      onProductsChange([...products, created]);
      onProductAdded();
      setSuccessMsg(`"${created.name}" added successfully.`);
      setForm(EMPTY_FORM);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="card section-card" aria-labelledby="products-heading">
      <div className="section-header">
        <h2 id="products-heading">Products</h2>
        <span className="section-count">{products.length}</span>
      </div>

      {/* ── Product list ── */}
      {loading && <p className="status-msg">Loading products…</p>}
      {error && <p className="status-msg status-msg--error">{error}</p>}

      {!loading && !error && (
        <>
          {products.length === 0 ? (
            <p className="empty-state">No products yet. Add one below.</p>
          ) : (
            <div className="product-grid" role="list">
              {products.map((p) => (
                <article
                  key={p.id}
                  className="product-card"
                  role="listitem"
                  aria-label={p.name}
                >
                  <div className="product-card__top">
                    <span className="product-card__name">{p.name}</span>
                    <span className="product-card__category">
                      {p.category.trim() || "Uncategorized"}
                    </span>
                  </div>
                  <div className="product-card__price">${p.price.toFixed(2)}</div>
                  <div className="product-card__stock-row">
                    <span className={`product-card__stock-label ${p.stock < 10 ? "product-card__stock-label--low" : ""}`}>
                      {p.stock < 10 ? "⚠ " : ""}Stock: {p.stock}
                    </span>
                  </div>
                  <StockBar stock={p.stock} />
                </article>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Add product form ── */}
      <details className="form-collapsible">
        <summary>Add a new product</summary>
        <form onSubmit={handleSubmit} className="inline-form" noValidate>
          <div className="form-row">
            <div className="field">
              <label htmlFor="p-name">Name</label>
              <input
                id="p-name"
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Widget Pro"
                disabled={submitting}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="p-category">Category</label>
              <input
                id="p-category"
                type="text"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="e.g. Electronics"
                disabled={submitting}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="field">
              <label htmlFor="p-price">Price ($)</label>
              <input
                id="p-price"
                type="number"
                min="0.01"
                step="0.01"
                value={form.price === 0 ? "" : form.price}
                onChange={(e) =>
                  setForm({ ...form, price: parseFloat(e.target.value) || 0 })
                }
                placeholder="0.00"
                disabled={submitting}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="p-stock">Stock</label>
              <input
                id="p-stock"
                type="number"
                min="0"
                step="1"
                value={form.stock === 0 ? "" : form.stock}
                onChange={(e) =>
                  setForm({ ...form, stock: parseInt(e.target.value, 10) || 0 })
                }
                placeholder="0"
                disabled={submitting}
                required
              />
            </div>
          </div>

          {formError && (
            <p className="status-msg status-msg--error" role="alert">
              {formError}
            </p>
          )}
          {successMsg && (
            <p className="status-msg status-msg--success" role="status">
              {successMsg}
            </p>
          )}

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "Adding…" : "Add Product"}
          </button>
        </form>
      </details>
    </section>
  );
}
