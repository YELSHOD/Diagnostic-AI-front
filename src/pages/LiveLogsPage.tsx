import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useLogsSocket } from "@features/realtime/useLogsSocket";
import { useRealtimeStore } from "@features/realtime/store";
import { useSettingsStore } from "@features/settings/store";
import { useI18n } from "@shared/i18n/useI18n";
import { PageIntro } from "@shared/ui/PageIntro";

export function LiveLogsPage() {
  const { t } = useI18n();
  const [params] = useSearchParams();
  const [text, setText] = useState("");
  const [level, setLevel] = useState("");
  const runtimeTargetId = params.get("runtimeTargetId") ?? params.get("containerId") ?? "";

  const logs = useRealtimeStore((s) => s.logs);
  const errors = useRealtimeStore((s) => s.errors);
  const connected = useRealtimeStore((s) => s.connected);

  const wsBaseUrl = useSettingsStore((s) => s.wsBaseUrl);
  const reconnectMinMs = useSettingsStore((s) => s.reconnectMinMs);
  const reconnectMaxMs = useSettingsStore((s) => s.reconnectMaxMs);

  useLogsSocket({ runtimeTargetId, wsBaseUrl, reconnectMinMs, reconnectMaxMs });

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
        description={runtimeTargetId
          ? t("logs.descriptionSelected")
          : t("logs.descriptionEmpty")}
        actions={runtimeTargetId ? <Link className="button secondary" to="/runtime-targets">{t("common.changeContainer")}</Link> : undefined}
      />
      <div className="topbar">
        <div style={{ color: "var(--text-muted)", fontSize: 14 }}>
          {runtimeTargetId ? `${t("logs.selected")}: ${runtimeTargetId}` : t("logs.notSelected")}
        </div>
        <div>
          <span className="badge" style={{ borderColor: connected ? "var(--ok)" : "var(--danger)" }}>
            {connected ? t("common.connected") : t("common.disconnected")}
          </span>
        </div>
      </div>
      {!runtimeTargetId ? <div className="card empty-state">{t("logs.pickContainer")}</div> : null}
      {runtimeTargetId ? (
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 16 }}>
          <article className="card kpi-card">
            <div style={{ color: "var(--text-muted)", fontSize: 12, letterSpacing: "0.04em", textTransform: "uppercase" }}>{t("logs.visibleLines")}</div>
            <div style={{ fontSize: 30, fontWeight: 700, marginTop: 8 }}>{filtered.length}</div>
          </article>
          <article className="card kpi-card">
            <div style={{ color: "var(--text-muted)", fontSize: 12, letterSpacing: "0.04em", textTransform: "uppercase" }}>{t("logs.errorEvents")}</div>
            <div style={{ fontSize: 30, fontWeight: 700, marginTop: 8 }}>{errors.length}</div>
          </article>
          <article className="card kpi-card">
            <div style={{ color: "var(--text-muted)", fontSize: 12, letterSpacing: "0.04em", textTransform: "uppercase" }}>{t("logs.filterState")}</div>
            <div style={{ marginTop: 12 }}>{level || text ? t("logs.filtered") : t("logs.allLogs")}</div>
          </article>
        </section>
      ) : null}
      <div className="grid-2">
        <section className="card">
          <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
            <input className="input" placeholder={t("logs.filterText")} value={text} onChange={(e) => setText(e.target.value)} />
            <select className="select" value={level} onChange={(e) => setLevel(e.target.value)}>
              <option value="">{t("logs.allLevels")}</option>
              <option value="INFO">INFO</option>
              <option value="WARN">WARN</option>
              <option value="ERROR">ERROR</option>
              <option value="DEBUG">DEBUG</option>
            </select>
          </div>
          <div style={{ maxHeight: 560, overflow: "auto" }}>
            {runtimeTargetId && filtered.length === 0 ? <div className="empty-state">{t("logs.noLinesYet")}</div> : null}
            {filtered.map((line, idx) => (
              <div key={`${line.ts}-${idx}`} className={`log-row log-${line.payload.level ?? "INFO"}`}>
                [{line.ts}] {line.payload.level ?? "-"} {line.payload.message}
              </div>
            ))}
          </div>
        </section>
        <section className="card">
          <h3 style={{ marginTop: 0 }}>{t("logs.latestError")}</h3>
          {!latestError ? <div style={{ color: "var(--text-muted)" }}>{t("logs.noStructuredErrors")}</div> : null}
          {latestError ? (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                <div><b>{latestError.payload.exceptionType}</b></div>
                <span className="badge" style={{ borderColor: "var(--danger)", color: "var(--danger)" }}>{latestError.service}</span>
              </div>
              <div style={{ marginTop: 8 }}>{latestError.payload.message}</div>
              <div style={{ marginTop: 10, color: "var(--text-muted)", fontSize: 13 }}>
                {t("common.eventTime")}: {new Date(latestError.payload.eventTime).toLocaleString()}
                {latestError.payload.traceId ? ` • traceId: ${latestError.payload.traceId}` : ` • ${t("common.noTraceId")}`}
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
