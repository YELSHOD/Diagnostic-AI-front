import { useState, type ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LocaleSwitcher } from "@features/settings/LocaleSwitcher";
import { SettingsPanel } from "@features/settings/SettingsPanel";
import { useSettingsStore } from "@features/settings/store";
import { useI18n } from "@shared/i18n/useI18n";

type Props = { children: ReactNode };

export function ShellLayout({ children }: Props) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const sidebarCollapsed = useSettingsStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useSettingsStore((s) => s.toggleSidebar);
  const [profileOpen, setProfileOpen] = useState(false);
  const items = [
    ["/overview", t("shell.nav.overview")],
    ["/containers", t("shell.nav.containers")],
    ["/logs", t("shell.nav.logs")],
    ["/analysis", t("shell.nav.analysis")],
    ["/settings", t("shell.nav.settings")],
    ["/ai-chat", t("shell.nav.aiChat")]
  ] as const;

  return (
    <div className={`shell${sidebarCollapsed ? " collapsed" : ""}`}>
      <aside className="sidebar">
        <button type="button" className="sidebar-toggle" onClick={toggleSidebar} aria-label={t("shell.collapse")} title={t("shell.collapse")}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5 8 12l7 7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <div className="sidebar-hero">
          <div className="sidebar-kicker">{t("shell.kicker")}</div>
          <p className="sidebar-copy">{t("shell.copy")}</p>
        </div>
        <div className="sidebar-section">{t("shell.section")}</div>
        <nav style={{ display: "grid", gap: 8 }}>
          {items.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              className="button"
              style={({ isActive }) => ({
                display: "block",
                background: isActive ? "var(--accent)" : "var(--bg-soft)",
                color: isActive ? "#031819" : "var(--text)"
              })}
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div style={{ marginTop: 20 }}>
          <SettingsPanel compact />
        </div>
        <div className="sidebar-footer">{t("shell.footer")}</div>
      </aside>
      <main className="main">
        <header className="shell-header">
          <div className="shell-header-main">
            {sidebarCollapsed ? (
              <button type="button" className="sidebar-reopen" onClick={toggleSidebar} aria-label={t("shell.expand")} title={t("shell.expand")}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M5 7h14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M5 12h14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M5 17h14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            ) : null}
            <div>
              <div className="shell-title">Diagnostic AI</div>
              <div className="shell-subtitle">{t("shell.headerSubtitle")}</div>
            </div>
          </div>
          <div className="shell-header-actions">
            <div className="shell-header-locale">
              <LocaleSwitcher compact />
            </div>
            <div className="profile-menu">
              <button
                type="button"
                className={`profile-trigger${profileOpen ? " active" : ""}`}
                aria-label={t("shell.profile")}
                title={t("shell.profile")}
                onClick={() => setProfileOpen((value) => !value)}
              >
                <span className="profile-avatar">DA</span>
              </button>
              {profileOpen ? (
                <div className="profile-dropdown" role="menu" aria-label={t("shell.profileMenu")}>
                  <div className="profile-summary">
                    <div className="profile-summary-main">
                      <div className="profile-summary-name">{t("shell.profileName")}</div>
                      <div className="profile-summary-role">{t("shell.profileRole")}</div>
                    </div>
                    <div className="profile-status">
                      <span className="profile-status-dot" />
                      {t("shell.profileStatus")}
                    </div>
                  </div>
                  <div className="profile-divider" />
                  <button
                    type="button"
                    className="profile-item"
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/settings");
                    }}
                  >
                    {t("shell.profileSettings")}
                  </button>
                  <button
                    type="button"
                    className="profile-item danger"
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/");
                    }}
                  >
                    {t("shell.profileExit")}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>
        {children}
        <footer className="shell-footer">
          <div className="shell-footer-mark">Diagnostic AI</div>
          <div className="shell-footer-copy">
            <span>{t("shell.footer")}</span>
            <span>{t("shell.footerMeta")}</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
