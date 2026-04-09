import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useLogsSocket } from "@features/realtime/useLogsSocket";
import { useRealtimeStore } from "@features/realtime/store";
import { useSettingsStore } from "@features/settings/store";
import { PageIntro } from "@shared/ui/PageIntro";

export function LiveLogsPage() {
  const [params] = useSearchParams();
  const [text, setText] = useState("");
  const [level, setLevel] = useState("");
  const containerId = params.get("containerId") ?? "";

  const logs = useRealtimeStore((s) => s.logs);
  const errors = useRealtimeStore((s) => s.errors);
  const connected = useRealtimeStore((s) => s.connected);

  const wsBaseUrl = useSettingsStore((s) => s.wsBaseUrl);
  const reconnectMinMs = useSettingsStore((s) => s.reconnectMinMs);
  const reconnectMaxMs = useSettingsStore((s) => s.reconnectMaxMs);

  useLogsSocket({ containerId, wsBaseUrl, reconnectMinMs, reconnectMaxMs });

  const filtered = useMemo(
    () =>
      logs.filter((x) => {
        const lvlOk = !level || x.payload.level === level;
        const txtOk = !text || x.payload.message.toLowerCase().includes(text.toLowerCase());
        return lvlOk && txtOk;
      }),
    [logs, text, level]
  );

  return (
    <div>
      <PageIntro
        title="Live Logs"
        description={containerId
          ? "Watch the selected container in real time and inspect the latest structured error event."
          : "Pick a container first, then this page becomes the primary live investigation screen."}
      />
      <div className="topbar">
        <div style={{ color: "var(--text-muted)", fontSize: 14 }}>
          {containerId ? `Selected container: ${containerId}` : "No container selected"}
        </div>
        <div>
          <span className="badge" style={{ borderColor: connected ? "var(--ok)" : "var(--danger)" }}>
            {connected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>
      {!containerId ? <div className="card">Pick a container from Containers page.</div> : null}
      <div className="grid-2">
        <section className="card">
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <input className="input" placeholder="Filter text" value={text} onChange={(e) => setText(e.target.value)} />
            <select className="select" value={level} onChange={(e) => setLevel(e.target.value)}>
              <option value="">All levels</option>
              <option value="INFO">INFO</option>
              <option value="WARN">WARN</option>
              <option value="ERROR">ERROR</option>
              <option value="DEBUG">DEBUG</option>
            </select>
          </div>
          <div style={{ maxHeight: 560, overflow: "auto" }}>
            {filtered.map((line, idx) => (
              <div key={`${line.ts}-${idx}`} className={`log-row log-${line.payload.level ?? "INFO"}`}>
                [{line.ts}] {line.payload.level ?? "-"} {line.payload.message}
              </div>
            ))}
          </div>
        </section>
        <section className="card">
          <h3 style={{ marginTop: 0 }}>Latest Error Event</h3>
          {errors.length === 0 ? <div style={{ color: "var(--text-muted)" }}>No errors yet.</div> : null}
          {errors.length > 0 ? (
            <div>
              <div><b>{errors[errors.length - 1].payload.exceptionType}</b></div>
              <div style={{ marginTop: 8 }}>{errors[errors.length - 1].payload.message}</div>
              <pre style={{ marginTop: 10, whiteSpace: "pre-wrap", fontSize: 12, color: "var(--text-muted)" }}>
                {(errors[errors.length - 1].payload.topFrames ?? []).join("\n")}
              </pre>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
