import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "@features/auth/api";
import { useAuthStore } from "@features/auth/store";
import { AuthLanding } from "@shared/ui/AuthLanding";

export function LoginPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [form, setForm] = useState({
    login: "",
    password: ""
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const session = await login(form);
      setSession({
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        currentUser: session.user
      });
      navigate("/overview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page auth-page">
      <AuthLanding
        mode="login"
        eyebrow="Secure access"
        title="One local workspace for logs, runtime health, and investigation"
        description="Open the platform from one clean entry point, watch your local services, and continue cluster analysis without turning the login screen into a separate product."
        supportingTitle="What opens after sign in"
        supportingPoints={[
          "Live logs, containers, analytics, and investigation in one shell",
          "Protected access for REST and WebSocket flows through the same session",
          "A cleaner product entry that feels like a landing page, not a dashboard split into tiles"
        ]}
      >
        <form className="card auth-card auth-landing-card" onSubmit={handleSubmit}>
          <div className="auth-card-header">
            <div className="auth-card-title">Login</div>
            <div className="auth-card-copy">Enter your workspace credentials and continue where you left off.</div>
          </div>
          <label className="field">
            <span>Email or username</span>
            <input
              aria-label="Email or username"
              className="input"
              placeholder="dev.user"
              value={form.login}
              onChange={(event) => setForm((state) => ({ ...state, login: event.target.value }))}
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              aria-label="Password"
              className="input"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(event) => setForm((state) => ({ ...state, password: event.target.value }))}
            />
          </label>
          {error ? <div className="card auth-inline-alert" role="alert">{error}</div> : null}
          <button className="button auth-submit" type="submit" disabled={submitting}>
            {submitting ? "Signing in..." : "Login"}
          </button>
          <p className="auth-switch">
            New here? <Link to="/register">Create an account</Link>
          </p>
        </form>
      </AuthLanding>
    </div>
  );
}
