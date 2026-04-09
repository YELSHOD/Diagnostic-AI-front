import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { SettingsPanel } from "@features/settings/SettingsPanel";

type Props = { children: ReactNode };

const items = [
  ["/overview", "Overview"],
  ["/containers", "Containers"],
  ["/logs", "Live Logs"],
  ["/analysis", "Analysis"],
  ["/settings", "Settings"],
  ["/ai-chat", "AI Chat (Later)"]
] as const;

export function ShellLayout({ children }: Props) {
  return (
    <div className="shell">
      <aside className="sidebar">
        <h2 style={{ marginTop: 0, marginBottom: 18 }}>Diagnostic AI</h2>
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
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
