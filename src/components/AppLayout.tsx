import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type Theme = "dark" | "light";

/**
 * Shell for all protected pages.
 * Owns theme state (dark default) and renders the persistent top navbar.
 * Passes `theme` down to the page content via an Outlet context so child
 * pages can apply the theme class to their own root elements.
 */
export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState<Theme>("dark");
  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const isAdmin = user?.role === "admin";

  return (
    <div className={`app-layout theme-${theme}`}>
      {/* ── Top navbar ── */}
      <header className="app-header">
        <div className="app-header__inner">
          {/* Brand */}
          <div className="app-header__title-block">
            <h1
              className="app-header__brand"
              onClick={() => navigate(isAdmin ? "/" : "/orders/new")}
              role="link"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter")
                  navigate(isAdmin ? "/" : "/orders/new");
              }}
            >
              Inventory &amp; Orders
            </h1>
          </div>

          {/* Nav links */}
          <nav className="app-nav" aria-label="Main navigation">
            {isAdmin && (
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `app-nav__link${isActive ? " app-nav__link--active" : ""}`
                }
              >
                Dashboard
              </NavLink>
            )}
            <NavLink
              to="/products"
              className={({ isActive }) =>
                `app-nav__link${isActive ? " app-nav__link--active" : ""}`
              }
            >
              Products
            </NavLink>
            <NavLink
              to="/orders/new"
              className={({ isActive }) =>
                `app-nav__link${isActive ? " app-nav__link--active" : ""}`
              }
            >
              Place Order
            </NavLink>
            <NavLink
              to="/orders"
              end
              className={({ isActive }) =>
                `app-nav__link${isActive ? " app-nav__link--active" : ""}`
              }
            >
              Order History
            </NavLink>
          </nav>

          {/* Right side: user info + theme toggle + logout */}
          <div className="app-header__actions">
            <span className="app-header__user" aria-label="Logged in user">
              <span className="app-header__user-email">{user?.email}</span>
              <span className="app-header__user-role">{user?.role}</span>
            </span>

            <button
              type="button"
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? (
                <span>[ light_mode ]</span>
              ) : (
                <span>Dark mode</span>
              )}
            </button>

            <button
              type="button"
              className="btn-logout"
              onClick={logout}
            >
              {theme === "dark" ? "[ logout ]" : "Log out"}
            </button>
          </div>
        </div>
      </header>

      {/* ── Page content — Outlet receives theme via context ── */}
      <Outlet context={{ theme } satisfies { theme: Theme }} />

      <footer className="app-footer">
        <p>Inventory API Frontend — connected to localhost:4001</p>
      </footer>
    </div>
  );
}
