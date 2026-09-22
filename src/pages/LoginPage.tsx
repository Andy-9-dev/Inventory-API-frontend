import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface LocationState {
  registered?: boolean;
  from?: { pathname: string };
}

export default function LoginPage() {
  const { login } = useAuth();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // ── All existing logic is untouched ──────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) { setError("Email is required."); return; }
    if (!password)     { setError("Password is required."); return; }

    setSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
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
          <span className="auth-card__chrome-label">// login</span>
        </div>

        {/* ── Card body ── */}
        <div className="auth-card__body">

          {/* Header */}
          <div className="auth-card__header">
            <span className="auth-card__glyph" aria-hidden="true">&gt;_</span>
            <h1 className="auth-card__title">
              Inventory &amp; Orders // Access
              <span className="auth-card__cursor" aria-hidden="true">▊</span>
            </h1>
            <p className="auth-card__subtitle">[ enter credentials to sign in ]</p>
          </div>

          {/* "Account created" banner — shown after register redirect */}
          {state?.registered && (
            <p className="status-msg status-msg--success" role="status">
              Account created — please sign in.
            </p>
          )}

          {/* Form — identical validation/submit logic */}
          <form onSubmit={handleSubmit} className="inline-form" noValidate>

            <div className="field">
              {/* Accessible label (visually hidden by CSS, read by screen readers) */}
              <label htmlFor="login-email">Email</label>
              {/* Terminal command-line prefix label */}
              <span className="field-cmd-label" aria-hidden="true">
                <span className="cmd-prompt">user@inventory:~$</span>{" "}
                <span className="cmd-flag">--email</span>
              </span>
              <input
                id="login-email"
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
              <label htmlFor="login-password">Password</label>
              <span className="field-cmd-label" aria-hidden="true">
                <span className="cmd-prompt">user@inventory:~$</span>{" "}
                <span className="cmd-flag">--password</span>
              </span>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={submitting}
                required
              />
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
              {submitting ? "Signing in…" : "[ SIGN IN ]"}
            </button>

          </form>

          <p className="auth-card__footer-link">
            No account?{" "}
            <Link to="/register">Create one</Link>
          </p>

        </div>{/* /.auth-card__body */}
      </div>{/* /.auth-card */}
    </div>
  );
}
