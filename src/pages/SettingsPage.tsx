import { PageIntro } from "@shared/ui/PageIntro";
import { useSettingsStore } from "@features/settings/store";

export function SettingsPage() {
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
        title="Settings"
        description="These values keep the frontend aligned with your local backend while you run the observability stack during development and demos."
        actions={<button className="button secondary" onClick={resetDefaults}>Reset Defaults</button>}
      />
      <section className="card" style={{ maxWidth: 760 }}>
        <div style={{ marginBottom: 16, color: "var(--text-muted)", maxWidth: 680 }}>
          Use these controls when your Spring backend or websocket endpoint runs on a different local port. Reconnect values control how aggressively the log stream retries after a disconnect.
        </div>
        <div style={{ display: "grid", gap: 12 }}>
          <label>
            API Base URL
            <input className="input" style={{ display: "block", width: "100%" }} value={apiBaseUrl} onChange={(e) => setApiBaseUrl(e.target.value)} />
          </label>
          <label>
            WS Base URL
            <input className="input" style={{ display: "block", width: "100%" }} value={wsBaseUrl} onChange={(e) => setWsBaseUrl(e.target.value)} />
          </label>
          <label>
            Reconnect Min (ms)
            <input className="input" type="number" value={reconnectMinMs} onChange={(e) => setReconnectMinMs(Number(e.target.value))} />
          </label>
          <label>
            Reconnect Max (ms)
            <input className="input" type="number" value={reconnectMaxMs} onChange={(e) => setReconnectMaxMs(Number(e.target.value))} />
          </label>
        </div>
      </section>
    </div>
  );
}
