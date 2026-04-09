import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { LocaleSwitcher } from "@features/settings/LocaleSwitcher";
import { SettingsPanel } from "@features/settings/SettingsPanel";
import { useSettingsStore } from "@features/settings/store";
import { useI18n } from "@shared/i18n/useI18n";

type Props = { children: ReactNode };

export function ShellLayout({ children }: Props) {
  const { t } = useI18n();
  const sidebarCollapsed = useSettingsStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useSettingsStore((s) => s.toggleSidebar);
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
          <h2 style={{ marginTop: 10, marginBottom: 10 }}>Diagnostic AI</h2>
          <p className="sidebar-copy">{t("shell.copy")}</p>
        </div>
        <LocaleSwitcher compact />
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
        {sidebarCollapsed ? (
          <button type="button" className="sidebar-reopen" onClick={toggleSidebar} aria-label={t("shell.expand")} title={t("shell.expand")}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        ) : null}
        {children}
      </main>
    </div>
  );
}
