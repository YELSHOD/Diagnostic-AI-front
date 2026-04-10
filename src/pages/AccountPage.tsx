import { useEffect, useState } from "react";
import { changePassword, getAccount, updateAccount } from "@features/auth/api";
import { useAuthStore } from "@features/auth/store";
import { useI18n } from "@shared/i18n/useI18n";
import { AuthLanding } from "@shared/ui/AuthLanding";

export function AccountPage() {
  const setCurrentUser = useAuthStore((state) => state.setCurrentUser);
  const { t } = useI18n();
  const [profile, setProfile] = useState({
    email: "",
    username: ""
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: ""
  });
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getAccount()
      .then((account) => {
        if (!active) return;
        setProfile({
          email: account.email,
          username: account.username
        });
        setCurrentUser(account);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : t("auth.account.loadFailed"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [setCurrentUser]);

  async function submitProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingProfile(true);
    setError(null);
    try {
      const account = await updateAccount(profile);
      setProfile({
        email: account.email,
        username: account.username
      });
      setCurrentUser(account);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.account.updateFailed"));
    } finally {
      setSavingProfile(false);
    }
  }

  async function submitPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingPassword(true);
    setError(null);
    try {
      await changePassword(passwordForm);
      setPasswordForm({
        currentPassword: "",
        newPassword: ""
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.account.passwordFailed"));
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="page auth-page">
      <AuthLanding
        mode="account"
        eyebrow={t("auth.account.eyebrow")}
        title={t("auth.account.title")}
        description={t("auth.account.description")}
        supportingTitle={t("auth.account.supportingTitle")}
        supportingPoints={[
          t("auth.account.point1"),
          t("auth.account.point2"),
          t("auth.account.point3")
        ]}
      >
        <div className="auth-account-grid">
          {error ? <section className="card auth-inline-alert" role="alert">{error}</section> : null}
          <form className="card auth-card auth-landing-card" onSubmit={submitProfile}>
            <div className="auth-section-header">
              <div className="auth-section-title">{t("auth.account.profileTitle")}</div>
              <div className="auth-section-copy">{t("auth.account.profileCopy")}</div>
            </div>
            <label className="field">
              <span>{t("auth.register.emailField")}</span>
              <input
                aria-label={t("auth.register.emailField")}
                className="input"
                value={profile.email}
                onChange={(event) => setProfile((state) => ({ ...state, email: event.target.value }))}
                disabled={loading}
              />
            </label>
            <label className="field">
              <span>{t("auth.register.usernameField")}</span>
              <input
                aria-label={t("auth.register.usernameField")}
                className="input"
                value={profile.username}
                onChange={(event) => setProfile((state) => ({ ...state, username: event.target.value }))}
                disabled={loading}
              />
            </label>
            <button className="button auth-submit" type="submit" disabled={loading || savingProfile}>
              {savingProfile ? t("auth.account.saving") : t("auth.account.save")}
            </button>
          </form>
          <form className="card auth-card auth-landing-card" onSubmit={submitPassword}>
            <div className="auth-section-header">
              <div className="auth-section-title">{t("auth.account.passwordTitle")}</div>
              <div className="auth-section-copy">{t("auth.account.passwordCopy")}</div>
            </div>
            <label className="field">
              <span>{t("auth.account.currentPassword")}</span>
              <input
                aria-label={t("auth.account.currentPassword")}
                className="input"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(event) => setPasswordForm((state) => ({ ...state, currentPassword: event.target.value }))}
              />
            </label>
            <label className="field">
              <span>{t("auth.account.newPassword")}</span>
              <input
                aria-label={t("auth.account.newPassword")}
                className="input"
                type="password"
                value={passwordForm.newPassword}
                onChange={(event) => setPasswordForm((state) => ({ ...state, newPassword: event.target.value }))}
              />
            </label>
            <button className="button auth-submit" type="submit" disabled={savingPassword}>
              {savingPassword ? t("auth.account.updatingPassword") : t("auth.account.changePassword")}
            </button>
          </form>
        </div>
      </AuthLanding>
    </div>
  );
}
