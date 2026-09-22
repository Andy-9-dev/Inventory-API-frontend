// ── Products ──────────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string; // may be empty string — display as "Uncategorized"
}

// ── Orders ────────────────────────────────────────────────────────────────────

export interface Order {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  status: "confirmed" | "rejected";
  created_at: string;
}

// Shape returned by POST /api/orders when confirmed (201)
export interface OrderConfirmed {
  id: string;
  product_id: string;
  quantity: number;
  status: "confirmed";
  created_at: string;
}

// Shape returned by POST /api/orders when rejected (200)
export interface OrderRejected {
  message: string;
  order: OrderConfirmed & { status: "rejected" };
}

export type OrderResponse = OrderConfirmed | OrderRejected;

export function isOrderRejected(
  res: OrderResponse,
  httpStatus: number
): res is OrderRejected {
  return httpStatus === 200 && "message" in res;
}

// ── Stats ─────────────────────────────────────────────────────────────────────

export interface StatsResponse {
  totalProducts: number;
  lowStockCount: number;
  totalOrders: number;
  confirmedOrders: number;
  rejectedOrders: number;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export type UserRole = "admin" | "user";

export interface User {
  id: string;
  email: string;
  role: UserRole;
}

/** What gets persisted to localStorage alongside the raw JWT */
export interface StoredSession {
  token: string;
  user: User;
}

export interface AuthContextValue {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
}
