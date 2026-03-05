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

  return (
    <div>
      <div className="topbar"><h1 style={{ margin: 0 }}>Settings</h1></div>
      <section className="card" style={{ maxWidth: 760 }}>
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
