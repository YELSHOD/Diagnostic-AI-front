import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "@features/auth/api";
import { useAuthStore } from "@features/auth/store";
import { PageIntro } from "@shared/ui/PageIntro";

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
      <PageIntro
        title="Login"
        description="Sign in to Diagnostic AI to access your local observability workspace."
      />
      <form className="card auth-card" onSubmit={handleSubmit}>
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
        {error ? <div className="card" role="alert">{error}</div> : null}
        <button className="button" type="submit" disabled={submitting}>
          {submitting ? "Signing in..." : "Login"}
        </button>
        <p className="auth-switch">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </div>
  );
}
