import type {
  Order,
  OrderResponse,
  Product,
  StatsResponse,
} from "./types";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:4001/api";
// ── Products ─────────────────────────────────────────────────────────────────

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(`${BASE}/products`);
  if (!res.ok) throw new Error(`Failed to fetch products (${res.status})`);
  return res.json() as Promise<Product[]>;
}

export interface NewProductPayload {
  name: string;
  price: number;
  stock: number;
  category: string; // empty string is valid — backend/UI treats it as Uncategorized
}

export async function createProduct(payload: NewProductPayload): Promise<Product> {
  const res = await fetch(`${BASE}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to create product (${res.status})`);
  return res.json() as Promise<Product>;
}

// ── Orders ────────────────────────────────────────────────────────────────────

export interface NewOrderPayload {
  product_id: string;
  quantity: number;
}

/** Returns httpStatus alongside the body so callers can distinguish 200 vs 201. */
export async function createOrder(
  payload: NewOrderPayload
): Promise<{ httpStatus: number; data: OrderResponse }> {
  const res = await fetch(`${BASE}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  // 200 = rejected, 201 = confirmed — both are success at HTTP level.
  if (!res.ok) throw new Error(`Order request failed (${res.status})`);
  const data = (await res.json()) as OrderResponse;
  return { httpStatus: res.status, data };
}

export async function fetchOrders(): Promise<Order[]> {
  const res = await fetch(`${BASE}/orders`);
  if (!res.ok) throw new Error(`Failed to fetch orders (${res.status})`);
  return res.json() as Promise<Order[]>;
}

// ── Stats ─────────────────────────────────────────────────────────────────────

export async function fetchStats(): Promise<StatsResponse> {
  const res = await fetch(`${BASE}/stats`);
  if (!res.ok) throw new Error(`Failed to fetch stats (${res.status})`);
  return res.json() as Promise<StatsResponse>;
}
