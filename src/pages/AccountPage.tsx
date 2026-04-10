import { useEffect, useState } from "react";
import { changePassword, getAccount, updateAccount } from "@features/auth/api";
import { useAuthStore } from "@features/auth/store";
import { AuthLanding } from "@shared/ui/AuthLanding";

export function AccountPage() {
  const setCurrentUser = useAuthStore((state) => state.setCurrentUser);
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
        setError(err instanceof Error ? err.message : "Failed to load account");
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
      setError(err instanceof Error ? err.message : "Failed to update account");
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
      setError(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="page auth-page">
      <AuthLanding
        mode="account"
        eyebrow="Authenticated workspace"
        title="Manage workspace identity and security from one place"
        description="Keep account data, role context, and password updates inside the same product surface, so the credentials area feels like part of the platform instead of an isolated settings page."
        supportingTitle="What stays here"
        supportingPoints={[
          "Update the profile used across header, menus, and protected workflows",
          "Rotate your password without leaving the observability product shell",
          "Keep identity controls aligned with the same clean entry used for login and registration"
        ]}
      >
        <div className="auth-account-grid">
          {error ? <section className="card auth-inline-alert" role="alert">{error}</section> : null}
          <form className="card auth-card auth-landing-card" onSubmit={submitProfile}>
            <div className="auth-section-header">
              <div className="auth-section-title">Profile details</div>
              <div className="auth-section-copy">Update the identity shown across the workspace shell and account menus.</div>
            </div>
            <label className="field">
              <span>Email</span>
              <input
                aria-label="Email"
                className="input"
                value={profile.email}
                onChange={(event) => setProfile((state) => ({ ...state, email: event.target.value }))}
                disabled={loading}
              />
            </label>
            <label className="field">
              <span>Username</span>
              <input
                aria-label="Username"
                className="input"
                value={profile.username}
                onChange={(event) => setProfile((state) => ({ ...state, username: event.target.value }))}
                disabled={loading}
              />
            </label>
            <button className="button auth-submit" type="submit" disabled={loading || savingProfile}>
              {savingProfile ? "Saving..." : "Save account"}
            </button>
          </form>
          <form className="card auth-card auth-landing-card" onSubmit={submitPassword}>
            <div className="auth-section-header">
              <div className="auth-section-title">Password security</div>
              <div className="auth-section-copy">Use a dedicated password update flow to keep the local workspace secure.</div>
            </div>
            <label className="field">
              <span>Current password</span>
              <input
                aria-label="Current password"
                className="input"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(event) => setPasswordForm((state) => ({ ...state, currentPassword: event.target.value }))}
              />
            </label>
            <label className="field">
              <span>New password</span>
              <input
                aria-label="New password"
                className="input"
                type="password"
                value={passwordForm.newPassword}
                onChange={(event) => setPasswordForm((state) => ({ ...state, newPassword: event.target.value }))}
              />
            </label>
            <button className="button auth-submit" type="submit" disabled={savingPassword}>
              {savingPassword ? "Updating..." : "Change password"}
            </button>
          </form>
        </div>
      </AuthLanding>
    </div>
  );
}
