import { useEffect, useMemo, useState } from "react";
import { useDefaultIngestProject, useGenerateDefaultIngestProject } from "@entities/project/api";
import { LocaleSwitcher } from "@features/settings/LocaleSwitcher";
import { settingsDefaults, useSettingsStore } from "@features/settings/store";
import { useI18n } from "@shared/i18n/useI18n";
import { PageIntro } from "@shared/ui/PageIntro";

type DraftSettings = {
  apiBaseUrl: string;
  wsBaseUrl: string;
  reconnectMinMs: number;
  reconnectMaxMs: number;
};

export function SettingsPage() {
  const { t } = useI18n();
  const apiBaseUrl = useSettingsStore((s) => s.apiBaseUrl);
  const wsBaseUrl = useSettingsStore((s) => s.wsBaseUrl);
  const reconnectMinMs = useSettingsStore((s) => s.reconnectMinMs);
  const reconnectMaxMs = useSettingsStore((s) => s.reconnectMaxMs);
  const applyConnectionSettings = useSettingsStore((s) => s.applyConnectionSettings);
  const resetConnectionDefaults = useSettingsStore((s) => s.resetConnectionDefaults);
  const defaultProject = useDefaultIngestProject();
  const generateProject = useGenerateDefaultIngestProject();
  const active = useMemo(
    () => ({ apiBaseUrl, wsBaseUrl, reconnectMinMs, reconnectMaxMs }),
    [apiBaseUrl, wsBaseUrl, reconnectMinMs, reconnectMaxMs]
  );

  const [draft, setDraft] = useState<DraftSettings>(active);

  useEffect(() => {
    setDraft(active);
  }, [apiBaseUrl, wsBaseUrl, reconnectMinMs, reconnectMaxMs, active]);

  const hasUnsavedChanges = useMemo(
    () =>
      draft.apiBaseUrl !== active.apiBaseUrl ||
      draft.wsBaseUrl !== active.wsBaseUrl ||
      draft.reconnectMinMs !== active.reconnectMinMs ||
      draft.reconnectMaxMs !== active.reconnectMaxMs,
    [active, draft]
  );

  function patchDraft(patch: Partial<DraftSettings>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function handleSave() {
    applyConnectionSettings(draft);
  }

  function handleResetDraft() {
    setDraft(active);
  }

  function handleResetDefaults() {
    resetConnectionDefaults();
  }

  function applyLocalPreset(port: 8080 | 8081) {
    patchDraft({
      apiBaseUrl: `http://localhost:${port}`,
      wsBaseUrl: `ws://localhost:${port}`
    });
  }

  const ingestUrl = `${active.apiBaseUrl.replace(/\/$/, "")}/api/public/logs`;

  return (
    <div className="settings-page">
      <PageIntro
        title={t("settings.title")}
        description={t("settings.description")}
        actions={
          <div className="settings-actions">
            <span className={`settings-save-state ${hasUnsavedChanges ? "is-dirty" : "is-saved"}`}>
              {hasUnsavedChanges ? t("settings.unsavedChanges") : t("settings.saved")}
            </span>
            <button
              type="button"
              className="button secondary settings-action-button"
              onClick={handleResetDraft}
              disabled={!hasUnsavedChanges}
            >
              {t("settings.resetDraft")}
            </button>
            <button
              type="button"
              className="button secondary settings-action-button"
              onClick={handleResetDefaults}
            >
              {t("common.resetDefaults")}
            </button>
            <button
              type="button"
              className="button settings-action-button"
              onClick={handleSave}
              disabled={!hasUnsavedChanges}
            >
              {t("settings.save")}
            </button>
          </div>
        }
      />

      <div className="settings-layout">
        <section className="card settings-panel">
          <div className="settings-panel-header">
            <div>
              <div className="settings-panel-kicker">{t("settings.connectionTitle")}</div>
              <h2>{t("settings.connectionTitle")}</h2>
            </div>
            <p>{t("settings.transportHelper")}</p>
          </div>

          <div className="settings-field-grid">
            <label className="field">
              <span>{t("settings.apiBaseUrl")}</span>
              <input
                className="input"
                value={draft.apiBaseUrl}
                onChange={(e) => patchDraft({ apiBaseUrl: e.target.value })}
              />
            </label>

            <label className="field">
              <span>{t("settings.wsBaseUrl")}</span>
              <input
                className="input"
                value={draft.wsBaseUrl}
                onChange={(e) => patchDraft({ wsBaseUrl: e.target.value })}
              />
            </label>
          </div>

          <div className="settings-panel-divider" />

          <div className="settings-panel-header">
            <div>
              <div className="settings-panel-kicker">{t("settings.reconnectTitle")}</div>
              <h2>{t("settings.reconnectTitle")}</h2>
            </div>
            <p>{t("settings.reconnectHelper")}</p>
          </div>

          <div className="settings-field-grid settings-field-grid-compact">
            <label className="field">
              <span>{t("settings.reconnectMin")}</span>
              <input
                className="input"
                type="number"
                value={draft.reconnectMinMs}
                onChange={(e) => patchDraft({ reconnectMinMs: Number(e.target.value) || 0 })}
              />
            </label>

            <label className="field">
              <span>{t("settings.reconnectMax")}</span>
              <input
                className="input"
                type="number"
                value={draft.reconnectMaxMs}
                onChange={(e) => patchDraft({ reconnectMaxMs: Number(e.target.value) || 0 })}
              />
            </label>
          </div>
        </section>

        <aside className="settings-sidebar">
          <section className="card settings-panel settings-side-card">
            <div className="settings-panel-kicker">{t("settings.presetsTitle")}</div>
            <h2>{t("settings.presetsTitle")}</h2>
            <p>{t("settings.presetsHelper")}</p>

            <div className="settings-presets">
              <button type="button" className="button secondary" onClick={() => applyLocalPreset(8080)}>
                {t("settings.preset8080")}
              </button>
              <button type="button" className="button secondary" onClick={() => applyLocalPreset(8081)}>
                {t("settings.preset8081")}
              </button>
            </div>

            <div className="settings-defaults-note">
              {t("settings.defaultsNote")}
              <br />
              {settingsDefaults.apiBaseUrl} / {settingsDefaults.wsBaseUrl}
            </div>
          </section>

          <section className="card settings-panel settings-side-card">
            <div className="settings-panel-kicker">{t("locale.label")}</div>
            <h2>{t("settings.workspaceTitle")}</h2>
            <p>{t("settings.workspaceHelper")}</p>
            <LocaleSwitcher compact />
          </section>

          <section className="card settings-panel settings-side-card">
            <div className="settings-panel-kicker">Project key</div>
            <h2>Local service connection</h2>
            <p>
              Use this key in local backend services so they can send logs to this DiagnosticServiceAI instance.
            </p>
            {defaultProject.isLoading ? (
              <div style={{ color: "var(--text-muted)" }}>Loading project key...</div>
            ) : null}
            {defaultProject.data ? (
              <div style={{ display: "grid", gap: 8, fontSize: 13 }}>
                <code style={{ wordBreak: "break-all" }}>DIAGNOSTIC_PROJECT_KEY={defaultProject.data.projectKey}</code>
                <code style={{ wordBreak: "break-all" }}>DIAGNOSTIC_SERVER_URL={ingestUrl}</code>
              </div>
            ) : (
              <button
                type="button"
                className="button"
                onClick={() => generateProject.mutate()}
                disabled={generateProject.isPending}
              >
                {generateProject.isPending ? "Generating..." : "Generate project key"}
              </button>
            )}
            <div className="settings-defaults-note">
              Runtime Targets will appear automatically after a service sends its first log event with this key.
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
