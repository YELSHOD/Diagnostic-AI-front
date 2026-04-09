import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
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

  const latestError = errors.length > 0 ? errors[errors.length - 1] : null;

  return (
    <div>
      <PageIntro
        title="Live Logs"
        description={containerId
          ? "Watch the selected container in real time and inspect the latest structured error event."
          : "Pick a container first, then this page becomes the primary live investigation screen."}
        actions={containerId ? <Link className="button secondary" to="/containers">Change Container</Link> : undefined}
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
      {!containerId ? <div className="card empty-state">Pick a container from the <Link to="/containers">Containers</Link> page to start the live stream.</div> : null}
      {containerId ? (
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 16 }}>
          <article className="card kpi-card">
            <div style={{ color: "var(--text-muted)", fontSize: 12, letterSpacing: "0.04em", textTransform: "uppercase" }}>Visible Lines</div>
            <div style={{ fontSize: 30, fontWeight: 700, marginTop: 8 }}>{filtered.length}</div>
          </article>
          <article className="card kpi-card">
            <div style={{ color: "var(--text-muted)", fontSize: 12, letterSpacing: "0.04em", textTransform: "uppercase" }}>Error Events</div>
            <div style={{ fontSize: 30, fontWeight: 700, marginTop: 8 }}>{errors.length}</div>
          </article>
          <article className="card kpi-card">
            <div style={{ color: "var(--text-muted)", fontSize: 12, letterSpacing: "0.04em", textTransform: "uppercase" }}>Filter State</div>
            <div style={{ marginTop: 12 }}>{level || text ? "Filtered" : "All logs"}</div>
          </article>
        </section>
      ) : null}
      <div className="grid-2">
        <section className="card">
          <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
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
            {containerId && filtered.length === 0 ? <div className="empty-state">No log lines match the current stream yet. If the service is quiet, keep the socket open or relax the active filters.</div> : null}
            {filtered.map((line, idx) => (
              <div key={`${line.ts}-${idx}`} className={`log-row log-${line.payload.level ?? "INFO"}`}>
                [{line.ts}] {line.payload.level ?? "-"} {line.payload.message}
              </div>
            ))}
          </div>
        </section>
        <section className="card">
          <h3 style={{ marginTop: 0 }}>Latest Error Event</h3>
          {!latestError ? <div style={{ color: "var(--text-muted)" }}>No structured errors have been detected in this stream yet.</div> : null}
          {latestError ? (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                <div><b>{latestError.payload.exceptionType}</b></div>
                <span className="badge" style={{ borderColor: "var(--danger)", color: "var(--danger)" }}>{latestError.service}</span>
              </div>
              <div style={{ marginTop: 8 }}>{latestError.payload.message}</div>
              <div style={{ marginTop: 10, color: "var(--text-muted)", fontSize: 13 }}>
                Event time: {new Date(latestError.payload.eventTime).toLocaleString()}
                {latestError.payload.traceId ? ` • traceId: ${latestError.payload.traceId}` : " • no traceId"}
              </div>
              <pre style={{ marginTop: 10, whiteSpace: "pre-wrap", fontSize: 12, color: "var(--text-muted)" }}>
                {(latestError.payload.topFrames ?? []).join("\n")}
              </pre>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
