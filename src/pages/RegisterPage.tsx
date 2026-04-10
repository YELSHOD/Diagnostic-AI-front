import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "@features/auth/api";
import { useAuthStore } from "@features/auth/store";
import { AuthLanding } from "@shared/ui/AuthLanding";

export function RegisterPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    role: "BACKEND"
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const session = await register(form);
      setSession({
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        currentUser: session.user
      });
      navigate("/overview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page auth-page">
      <AuthLanding
        mode="register"
        eyebrow="Operator onboarding"
        title="Create access for your observability workspace"
        description="Register from the same landing surface, choose your role once, and keep the first-run experience clean instead of breaking it into decorative blocks."
        supportingTitle="What this setup gives you"
        supportingPoints={[
          "Choose your role once and keep the rest of the workflow simple",
          "Start with one protected identity for logs, analytics, and clusters",
          "Keep login and registration inside one coherent product entry"
        ]}
      >
        <form className="card auth-card auth-landing-card" onSubmit={handleSubmit}>
          <div className="auth-card-header">
            <div className="auth-card-title">Register</div>
            <div className="auth-card-copy">Create your account and define the first role for this workspace.</div>
          </div>
          <label className="field">
            <span>Email</span>
            <input
              aria-label="Email"
              className="input"
              placeholder="user@example.com"
              value={form.email}
              onChange={(event) => setForm((state) => ({ ...state, email: event.target.value }))}
            />
          </label>
          <label className="field">
            <span>Username</span>
            <input
              aria-label="Username"
              className="input"
              placeholder="dev.user"
              value={form.username}
              onChange={(event) => setForm((state) => ({ ...state, username: event.target.value }))}
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
          <label className="field">
            <span>Role</span>
            <select
              aria-label="Role"
              className="input"
              value={form.role}
              onChange={(event) => setForm((state) => ({ ...state, role: event.target.value }))}
            >
              <option value="BACKEND">Backend</option>
              <option value="FRONTEND">Frontend</option>
              <option value="DEVOPS">DevOps</option>
              <option value="ANALYST">Analyst</option>
              <option value="QA">QA</option>
            </select>
          </label>
          {error ? <div className="card auth-inline-alert" role="alert">{error}</div> : null}
          <button className="button auth-submit" type="submit" disabled={submitting}>
            {submitting ? "Creating account..." : "Register"}
          </button>
          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </AuthLanding>
    </div>
  );
}
