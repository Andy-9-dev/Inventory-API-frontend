import type {
  Order,
  OrderResponse,
  Product,
  StatsResponse,
  User,
} from "./types";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4001/api";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Build the Authorization header object from a token. */
function authHeader(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

/**
 * Central response checker.
 * - Throws on any non-ok status.
 * - Calls onUnauthorized (if provided) and throws on 401 specifically,
 *   so callers can log the user out and redirect without the API layer
 *   importing context or react-router directly.
 */
function checkStatus(
  res: Response,
  onUnauthorized?: () => void
): void {
  if (res.status === 401) {
    onUnauthorized?.();
    throw new Error("Session expired. Please log in again.");
  }
  if (!res.ok) {
    throw new Error(`Request failed (${res.status})`);
  }
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export async function apiLogin(payload: LoginPayload): Promise<LoginResponse> {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    // Pull the backend's error message if available
    let msg = `Login failed (${res.status})`;
    try {
      const body = (await res.json()) as { message?: string };
      if (body.message) msg = body.message;
    } catch {
      // ignore parse errors
    }
    throw new Error(msg);
  }
  return res.json() as Promise<LoginResponse>;
}

export interface RegisterPayload {
  email: string;
  password: string;
  role: "admin" | "user";
}

export async function apiRegister(payload: RegisterPayload): Promise<void> {
  const res = await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let msg = `Registration failed (${res.status})`;
    try {
      const body = (await res.json()) as { message?: string };
      if (body.message) msg = body.message;
    } catch {
      // ignore parse errors
    }
    throw new Error(msg);
  }
}

// ── Products ──────────────────────────────────────────────────────────────────

export async function fetchProducts(
  token: string,
  onUnauthorized?: () => void
): Promise<Product[]> {
  const res = await fetch(`${BASE}/products`, {
    headers: { ...authHeader(token) },
  });
  checkStatus(res, onUnauthorized);
  return res.json() as Promise<Product[]>;
}

export interface NewProductPayload {
  name: string;
  price: number;
  stock: number;
  category: string;
}

export async function createProduct(
  payload: NewProductPayload,
  token: string,
  onUnauthorized?: () => void
): Promise<Product> {
  const res = await fetch(`${BASE}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader(token) },
    body: JSON.stringify(payload),
  });
  checkStatus(res, onUnauthorized);
  return res.json() as Promise<Product>;
}

// ── Orders ────────────────────────────────────────────────────────────────────

export interface NewOrderPayload {
  product_id: string;
  quantity: number;
}

/**
 * Returns httpStatus alongside the body so callers can distinguish 200 vs 201.
 * The API uses 200 for rejected and 201 for confirmed — both are HTTP-ok.
 */
export async function createOrder(
  payload: NewOrderPayload,
  token: string,
  onUnauthorized?: () => void
): Promise<{ httpStatus: number; data: OrderResponse }> {
  const res = await fetch(`${BASE}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader(token) },
    body: JSON.stringify(payload),
  });
  checkStatus(res, onUnauthorized);
  const data = (await res.json()) as OrderResponse;
  return { httpStatus: res.status, data };
}

export async function fetchOrders(
  token: string,
  onUnauthorized?: () => void
): Promise<Order[]> {
  const res = await fetch(`${BASE}/orders`, {
    headers: { ...authHeader(token) },
  });
  checkStatus(res, onUnauthorized);
  return res.json() as Promise<Order[]>;
}

// ── Stats ─────────────────────────────────────────────────────────────────────

export async function fetchStats(
  token: string,
  onUnauthorized?: () => void
): Promise<StatsResponse> {
  const res = await fetch(`${BASE}/stats`, {
    headers: { ...authHeader(token) },
  });
  checkStatus(res, onUnauthorized);
  return res.json() as Promise<StatsResponse>;
}
