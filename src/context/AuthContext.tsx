import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { apiLogin, apiRegister } from "../api";
import type { RegisterPayload } from "../api";
import type {
  AuthContextValue,
  StoredSession,
  User,
  UserRole,
} from "../types";

// ── Storage helpers ───────────────────────────────────────────────────────────

const STORAGE_KEY = "inv_session";

function saveSession(token: string, user: User): void {
  const session: StoredSession = { token, user };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

function loadSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
}

function clearSession(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  // Restore session from localStorage on first render
  const stored = loadSession();
  const [token, setToken] = useState<string | null>(stored?.token ?? null);
  const [user, setUser] = useState<User | null>(stored?.user ?? null);

  // If the stored session is stale/corrupted, clear it
  useEffect(() => {
    if (!stored?.token || !stored?.user) {
      clearSession();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      const { token: newToken, user: newUser } = await apiLogin({
        email,
        password,
      });
      saveSession(newToken, newUser);
      setToken(newToken);
      setUser(newUser);
      // Admins land on dashboard; regular users go straight to new order
      navigate(newUser.role === "admin" ? "/" : "/orders/new", {
        replace: true,
      });
    },
    [navigate]
  );

  const register = useCallback(
    async (
      email: string,
      password: string,
      role: UserRole
    ): Promise<void> => {
      const payload: RegisterPayload = { email, password, role };
      await apiRegister(payload);
      // Don't auto-login; redirect to /login so the user authenticates properly
      navigate("/login", {
        replace: true,
        state: { registered: true },
      });
    },
    [navigate]
  );

  const logout = useCallback((): void => {
    clearSession();
    setToken(null);
    setUser(null);
    navigate("/login", { replace: true });
  }, [navigate]);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      isAuthenticated: token !== null && user !== null,
      login,
      register,
      logout,
    }),
    [token, user, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/** Throws if used outside <AuthProvider>. */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
