import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "@features/auth/api";
import { useAuthStore } from "@features/auth/store";
import { useI18n } from "@shared/i18n/useI18n";
import { AuthLanding } from "@shared/ui/AuthLanding";

export function RegisterPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const { t } = useI18n();
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
      setError(err instanceof Error ? err.message : t("auth.register.failed"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page auth-page">
      <AuthLanding
        mode="register"
        eyebrow={t("auth.register.eyebrow")}
        title={t("auth.register.title")}
        description={t("auth.register.description")}
        supportingTitle={t("auth.register.supportingTitle")}
        supportingPoints={[
          t("auth.register.point1"),
          t("auth.register.point2"),
          t("auth.register.point3")
        ]}
      >
        <form className="card auth-card auth-landing-card" onSubmit={handleSubmit}>
          <div className="auth-card-header">
            <div className="auth-card-title">{t("auth.register.cardTitle")}</div>
            <div className="auth-card-copy">{t("auth.register.cardCopy")}</div>
          </div>
          <label className="field">
            <span>{t("auth.register.emailField")}</span>
            <input
              aria-label={t("auth.register.emailField")}
              className="input"
              placeholder="user@example.com"
              value={form.email}
              onChange={(event) => setForm((state) => ({ ...state, email: event.target.value }))}
            />
          </label>
          <label className="field">
            <span>{t("auth.register.usernameField")}</span>
            <input
              aria-label={t("auth.register.usernameField")}
              className="input"
              placeholder="dev.user"
              value={form.username}
              onChange={(event) => setForm((state) => ({ ...state, username: event.target.value }))}
            />
          </label>
          <label className="field">
            <span>{t("auth.register.passwordField")}</span>
            <input
              aria-label={t("auth.register.passwordField")}
              className="input"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(event) => setForm((state) => ({ ...state, password: event.target.value }))}
            />
          </label>
          <label className="field">
            <span>{t("auth.register.roleField")}</span>
            <select
              aria-label={t("auth.register.roleField")}
              className="input"
              value={form.role}
              onChange={(event) => setForm((state) => ({ ...state, role: event.target.value }))}
            >
              <option value="BACKEND">{t("auth.register.roleBackend")}</option>
              <option value="FRONTEND">{t("auth.register.roleFrontend")}</option>
              <option value="DEVOPS">{t("auth.register.roleDevops")}</option>
              <option value="ANALYST">{t("auth.register.roleAnalyst")}</option>
              <option value="QA">{t("auth.register.roleQa")}</option>
            </select>
          </label>
          {error ? <div className="card auth-inline-alert" role="alert">{error}</div> : null}
          <button className="button auth-submit" type="submit" disabled={submitting}>
            {submitting ? t("auth.register.submitting") : t("auth.register.submit")}
          </button>
          <p className="auth-switch">
            {t("auth.register.switchPrompt")} <Link to="/login">{t("auth.register.switchLink")}</Link>
          </p>
        </form>
      </AuthLanding>
    </div>
  );
}
