import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "@features/auth/api";
import { useAuthStore } from "@features/auth/store";
import { useI18n } from "@shared/i18n/useI18n";
import { AuthLanding } from "@shared/ui/AuthLanding";

export function LoginPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const { t } = useI18n();
  const [form, setForm] = useState({
    login: "",
    password: ""
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    if (!form.login.trim()) return t("auth.login.loginRequired");
    if (!form.password) return t("auth.login.passwordRequired");
    return null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
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
      setError(err instanceof Error ? err.message : t("auth.login.failed"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page auth-page">
      <AuthLanding
        mode="login"
        eyebrow={t("auth.login.eyebrow")}
        title={t("auth.login.title")}
        description={t("auth.login.description")}
        supportingTitle={t("auth.login.supportingTitle")}
        supportingPoints={[
          t("auth.login.point1"),
          t("auth.login.point2"),
          t("auth.login.point3")
        ]}
      >
        <form className="card auth-card auth-landing-card" onSubmit={handleSubmit}>
          <div className="auth-card-header">
            <div className="auth-card-title">{t("auth.login.cardTitle")}</div>
            <div className="auth-card-copy">{t("auth.login.cardCopy")}</div>
          </div>
          <label className="field">
            <span>{t("auth.login.loginField")}</span>
            <input
              aria-label={t("auth.login.loginField")}
              className="input"
              placeholder="dev.user"
              value={form.login}
              onChange={(event) => setForm((state) => ({ ...state, login: event.target.value }))}
            />
          </label>
          <label className="field">
            <span>{t("auth.login.passwordField")}</span>
            <input
              aria-label={t("auth.login.passwordField")}
              className="input"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(event) => setForm((state) => ({ ...state, password: event.target.value }))}
            />
          </label>
          {error ? <div className="card auth-inline-alert" role="alert">{error}</div> : null}
          <button className="button auth-submit" type="submit" disabled={submitting}>
            {submitting ? t("auth.login.submitting") : t("auth.login.submit")}
          </button>
          <p className="auth-switch">
            {t("auth.login.switchPrompt")} <Link to="/register">{t("auth.login.switchLink")}</Link>
          </p>
        </form>
      </AuthLanding>
    </div>
  );
}
