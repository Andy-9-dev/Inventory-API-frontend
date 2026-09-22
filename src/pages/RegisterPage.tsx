import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { UserRole } from "../types";

export default function RegisterPage() {
  const { register } = useAuth();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [role, setRole]         = useState<UserRole>("user");
  const [error, setError]       = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // ── All existing logic is untouched ──────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!email.trim())       { setError("Email is required."); return; }
    if (!password)           { setError("Password is required."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }

    setSubmitting(true);
    try {
      await register(email.trim(), password, role);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" role="main">

        {/* ── Terminal window chrome ── */}
        <div className="auth-card__chrome" aria-hidden="true">
          <div className="auth-card__dots">
            <span className="auth-card__dot auth-card__dot--close" />
            <span className="auth-card__dot auth-card__dot--min"   />
            <span className="auth-card__dot auth-card__dot--max"   />
          </div>
          <span className="auth-card__chrome-label">// register</span>
        </div>

        {/* ── Card body ── */}
        <div className="auth-card__body">

          {/* Header */}
          <div className="auth-card__header">
            <span className="auth-card__glyph" aria-hidden="true">&gt;_</span>
            <h1 className="auth-card__title">
              Inventory &amp; Orders // Register
              <span className="auth-card__cursor" aria-hidden="true">▊</span>
            </h1>
            <p className="auth-card__subtitle">[ create a new account ]</p>
          </div>

          {/* Form — identical validation/submit logic */}
          <form onSubmit={handleSubmit} className="inline-form" noValidate>

            <div className="field">
              <label htmlFor="reg-email">Email</label>
              <span className="field-cmd-label" aria-hidden="true">
                <span className="cmd-prompt">user@inventory:~$</span>{" "}
                <span className="cmd-flag">--email</span>
              </span>
              <input
                id="reg-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={submitting}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="reg-password">Password</label>
              <span className="field-cmd-label" aria-hidden="true">
                <span className="cmd-prompt">user@inventory:~$</span>{" "}
                <span className="cmd-flag">--password</span>
              </span>
              <input
                id="reg-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                disabled={submitting}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="reg-confirm">Confirm password</label>
              <span className="field-cmd-label" aria-hidden="true">
                <span className="cmd-prompt">user@inventory:~$</span>{" "}
                <span className="cmd-flag">--confirm-password</span>
              </span>
              <input
                id="reg-confirm"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat password"
                disabled={submitting}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="reg-role">Role</label>
              <span className="field-cmd-label" aria-hidden="true">
                <span className="cmd-prompt">user@inventory:~$</span>{" "}
                <span className="cmd-flag">--role</span>
              </span>
              <select
                id="reg-role"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                disabled={submitting}
              >
                <option value="user">user — place orders</option>
                <option value="admin">admin — full access</option>
              </select>
            </div>

            {error && (
              <p className="status-msg status-msg--error" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="btn-primary btn-full"
              disabled={submitting}
            >
              {submitting ? "Creating account…" : "[ CREATE ACCOUNT ]"}
            </button>

          </form>

          <p className="auth-card__footer-link">
            Already have an account?{" "}
            <Link to="/login">Sign in</Link>
          </p>

        </div>{/* /.auth-card__body */}
      </div>{/* /.auth-card */}
    </div>
  );
}
