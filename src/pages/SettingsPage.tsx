import { LocaleSwitcher } from "@features/settings/LocaleSwitcher";
import { useI18n } from "@shared/i18n/useI18n";
import { PageIntro } from "@shared/ui/PageIntro";
import { useSettingsStore } from "@features/settings/store";

export function SettingsPage() {
  const { t } = useI18n();
  const apiBaseUrl = useSettingsStore((s) => s.apiBaseUrl);
  const wsBaseUrl = useSettingsStore((s) => s.wsBaseUrl);
  const reconnectMinMs = useSettingsStore((s) => s.reconnectMinMs);
  const reconnectMaxMs = useSettingsStore((s) => s.reconnectMaxMs);
  const setApiBaseUrl = useSettingsStore((s) => s.setApiBaseUrl);
  const setWsBaseUrl = useSettingsStore((s) => s.setWsBaseUrl);
  const setReconnectMinMs = useSettingsStore((s) => s.setReconnectMinMs);
  const setReconnectMaxMs = useSettingsStore((s) => s.setReconnectMaxMs);
  const resetDefaults = useSettingsStore((s) => s.resetDefaults);

  return (
    <div>
      <PageIntro
        title={t("settings.title")}
        description={t("settings.description")}
        actions={<button className="button secondary" onClick={resetDefaults}>{t("common.resetDefaults")}</button>}
      />
      <section className="card" style={{ maxWidth: 760 }}>
        <div style={{ marginBottom: 16, color: "var(--text-muted)", maxWidth: 680 }}>
          {t("settings.helper")}
        </div>
        <div style={{ marginBottom: 16 }}>
          <LocaleSwitcher />
        </div>
        <div style={{ display: "grid", gap: 12 }}>
          <label>
            {t("settings.apiBaseUrl")}
            <input className="input" style={{ display: "block", width: "100%" }} value={apiBaseUrl} onChange={(e) => setApiBaseUrl(e.target.value)} />
          </label>
          <label>
            {t("settings.wsBaseUrl")}
            <input className="input" style={{ display: "block", width: "100%" }} value={wsBaseUrl} onChange={(e) => setWsBaseUrl(e.target.value)} />
          </label>
          <label>
            {t("settings.reconnectMin")}
            <input className="input" type="number" value={reconnectMinMs} onChange={(e) => setReconnectMinMs(Number(e.target.value))} />
          </label>
          <label>
            {t("settings.reconnectMax")}
            <input className="input" type="number" value={reconnectMaxMs} onChange={(e) => setReconnectMaxMs(Number(e.target.value))} />
          </label>
        </div>
        <div className="card" style={{ marginTop: 16, background: "var(--bg-soft)" }}>
          {t("settings.defaultsNote")}
        </div>
      </section>
    </div>
  );
}
