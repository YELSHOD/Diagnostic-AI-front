import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "@features/auth/api";
import { useAuthStore } from "@features/auth/store";
import { AuthFrame } from "@shared/ui/AuthFrame";

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
      <AuthFrame
        eyebrow="Operator onboarding"
        title="Create a secure operator profile for your local workspace"
        description="Register once, choose your role, and keep observability, live logs, and diagnostics under one protected session."
        panelTitle="Role-aware access"
        panelBody="Your role becomes the first identity marker for the workspace, making the product feel structured from the start while staying simple for the MVP."
        highlights={[
          { value: "5", label: "Available roles" },
          { value: "1", label: "Unified workspace" },
          { value: "Fast", label: "Local setup" }
        ]}
      >
        <form className="card auth-card auth-card-strong" onSubmit={handleSubmit}>
          <div className="auth-card-header">
            <div className="auth-card-title">Create account</div>
            <div className="auth-card-copy">Set up your credentials and role for the dissertation workspace.</div>
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
      </AuthFrame>
    </div>
  );
}
