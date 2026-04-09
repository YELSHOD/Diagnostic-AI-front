import { useI18n } from "@shared/i18n/useI18n";
import { useSettingsStore } from "@features/settings/store";

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M12 2.5v3" />
        <path d="M12 18.5v3" />
        <path d="M21.5 12h-3" />
        <path d="M5.5 12h-3" />
        <path d="m18.7 5.3-2.1 2.1" />
        <path d="m7.4 16.6-2.1 2.1" />
        <path d="m18.7 18.7-2.1-2.1" />
        <path d="m7.4 7.4-2.1-2.1" />
      </g>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15.8 2.7a8.9 8.9 0 1 0 5.5 15.5A9.7 9.7 0 0 1 9.6 5.4a9.8 9.8 0 0 1 6.2-2.7Z" fill="currentColor" />
    </svg>
  );
}

export function ThemeToggle() {
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const { t } = useI18n();

  return (
    <div className="theme-toggle" role="group" aria-label={t("settingsPanel.theme")}>
      <button
        type="button"
        className={`theme-pill${theme === "dark" ? " active" : ""}`}
        onClick={() => setTheme("dark")}
        aria-label={t("settingsPanel.darkMode")}
        title={t("settingsPanel.darkMode")}
      >
        <MoonIcon />
      </button>
      <button
        type="button"
        className={`theme-pill${theme === "light" ? " active" : ""}`}
        onClick={() => setTheme("light")}
        aria-label={t("settingsPanel.lightMode")}
        title={t("settingsPanel.lightMode")}
      >
        <SunIcon />
      </button>
    </div>
  );
}
