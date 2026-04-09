import { useEffect } from "react";
import { ThemeToggle } from "@features/settings/ThemeToggle";
import { useI18n } from "@shared/i18n/useI18n";
import { useSettingsStore } from "@features/settings/store";

export function SettingsPanel({ compact = false }: { compact?: boolean }) {
  const theme = useSettingsStore((s) => s.theme);
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
      <ThemeToggle />
      {!compact ? <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 10 }}>{theme === "dark" ? t("settingsPanel.darkMode") : t("settingsPanel.lightMode")}</div> : null}
    </div>
  );
}
