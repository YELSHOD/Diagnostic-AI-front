import { useEffect } from "react";
import { useI18n } from "@shared/i18n/useI18n";
import { useSettingsStore } from "@features/settings/store";

export function SettingsPanel({ compact = false }: { compact?: boolean }) {
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const locale = useSettingsStore((s) => s.locale);
  const { t } = useI18n();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <div className="card" style={{ padding: compact ? 10 : 14 }}>
      {!compact ? <h3 style={{ marginTop: 0 }}>{t("settingsPanel.quick")}</h3> : null}
      {compact ? <div style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 8 }}>{t("settingsPanel.themeHint")}</div> : null}
      <label style={{ display: "block", fontSize: 13, marginBottom: 6 }}>{t("settingsPanel.theme")}</label>
      <select className="select" value={theme} onChange={(e) => setTheme(e.target.value as "dark" | "light")}>
        <option value="dark">{t("settingsPanel.dark")}</option>
        <option value="light">{t("settingsPanel.light")}</option>
      </select>
    </div>
  );
}
