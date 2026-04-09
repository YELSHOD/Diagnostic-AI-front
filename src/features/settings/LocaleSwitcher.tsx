import { useSettingsStore } from "@features/settings/store";
import { useI18n } from "@shared/i18n/useI18n";
import type { Locale } from "@shared/i18n/messages";

const locales: Locale[] = ["ru", "kz", "en"];

export function LocaleSwitcher({ compact = false }: { compact?: boolean }) {
  const locale = useSettingsStore((s) => s.locale);
  const setLocale = useSettingsStore((s) => s.setLocale);
  const { t } = useI18n();

  return (
    <div className={compact ? "locale-switcher compact" : "locale-switcher"}>
      {!compact ? <div className="locale-label">{t("locale.label")}</div> : null}
      <div className="locale-track">
        {locales.map((entry) => (
          <button
            key={entry}
            type="button"
            className={`locale-pill${locale === entry ? " active" : ""}`}
            onClick={() => setLocale(entry)}
          >
            {t(`locale.${entry}`)}
          </button>
        ))}
      </div>
    </div>
  );
}
