import { useState } from "react";
import { createOrder } from "../api";
import { isOrderRejected } from "../types";
import type { Product } from "../types";

interface Props {
  products: Product[];
  onOrderPlaced: () => void; // tells parent to refresh products + orders
}

type OrderResult =
  | { kind: "confirmed"; message: string }
  | { kind: "rejected"; message: string }
  | null;

export default function PlaceOrderSection({ products, onOrderPlaced }: Props) {
  const [productId, setProductId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [result, setResult] = useState<OrderResult>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidationError(null);
    setResult(null);

    // Client-side validation
    if (!productId) {
      setValidationError("Please select a product.");
      return;
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      setValidationError("Quantity must be at least 1.");
      return;
    }

    setSubmitting(true);
    try {
      const { httpStatus, data } = await createOrder({ product_id: productId, quantity });

      if (isOrderRejected(data, httpStatus)) {
        // 200 rejected path — surface the backend's message
        setResult({ kind: "rejected", message: data.message });
      } else {
        // 201 confirmed path
        const selectedProduct = products.find((p) => p.id === productId);
        setResult({
          kind: "confirmed",
          message: `Order confirmed! ${quantity}× ${selectedProduct?.name ?? "item"} — order #${data.id}`,
        });
        // Reset form and trigger parent refresh (products stock changed)
        setProductId("");
        setQuantity(1);
        onOrderPlaced();
      }
    } catch (err) {
      setResult({
        kind: "rejected",
        message: err instanceof Error ? err.message : "Unknown error placing order.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="card" aria-labelledby="order-heading">
      <h2 id="order-heading">Place an Order</h2>

      <form onSubmit={handleSubmit} className="inline-form" noValidate>
        <div className="field">
          <label htmlFor="o-product">Product</label>
          <select
            id="o-product"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            disabled={submitting || products.length === 0}
            required
          >
            <option value="">— select a product —</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (stock: {p.stock}, ${p.price.toFixed(2)})
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="o-qty">Quantity</label>
          <input
            id="o-qty"
            type="number"
            min="1"
            step="1"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
            disabled={submitting}
            required
          />
        </div>

        {validationError && (
          <p className="status-msg error" role="alert">
            {validationError}
          </p>
        )}

        {result?.kind === "confirmed" && (
          <p className="status-msg success" role="status">
            ✓ {result.message}
          </p>
        )}

        {result?.kind === "rejected" && (
          <p className="status-msg warning" role="alert">
            ⚠ {result.message}
          </p>
        )}

        {products.length === 0 && (
          <p className="status-msg muted">Add products first before placing orders.</p>
        )}

        <button
          type="submit"
          className="btn-primary"
          disabled={submitting || products.length === 0}
        >
          {submitting ? "Placing…" : "Place Order"}
        </button>
      </form>
    </section>
  );
}
