import { useEffect } from "react";
import { useSettingsStore } from "@features/settings/store";

export function SettingsPanel({ compact = false }: { compact?: boolean }) {
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <div className="card" style={{ padding: compact ? 10 : 14 }}>
      {!compact ? <h3 style={{ marginTop: 0 }}>Quick Settings</h3> : null}
      {compact ? <div style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 8 }}>Theme switch for demo use</div> : null}
      <label style={{ display: "block", fontSize: 13, marginBottom: 6 }}>Theme</label>
      <select className="select" value={theme} onChange={(e) => setTheme(e.target.value as "dark" | "light")}>
        <option value="dark">Dark</option>
        <option value="light">Light</option>
      </select>
    </div>
  );
}
