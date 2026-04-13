import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useRuntimeTargets } from "@entities/runtime-target/api";
import { useLogsSocket } from "@features/realtime/useLogsSocket";
import { useRealtimeStore } from "@features/realtime/store";
import { useSettingsStore } from "@features/settings/store";
import { useI18n } from "@shared/i18n/useI18n";
import { PageIntro } from "@shared/ui/PageIntro";

function formatConsoleTime(timestamp: string) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    fractionalSecondDigits: 3,
    hour12: false
  }).format(date);
}

function parseConsoleSource(message: string, fallbackService: string) {
  const structuredMatch = message.match(/\]\s+([A-Za-z0-9_.$]+)\s+:\s+(.*)$/);
  if (!structuredMatch) {
    return {
      source: fallbackService,
      message
    };
  }

  return {
    source: structuredMatch[1],
    message: structuredMatch[2]
  };
}

export function LiveLogsPage() {
  const { t } = useI18n();
  const [params] = useSearchParams();
  const [text, setText] = useState("");
  const [level, setLevel] = useState("");
  const [follow, setFollow] = useState(true);
  const [errorPanelOpen, setErrorPanelOpen] = useState(false);
  const runtimeTargetId = params.get("runtimeTargetId") ?? params.get("containerId") ?? "";
  const runtimeTargets = useRuntimeTargets();
  const consoleRef = useRef<HTMLDivElement | null>(null);

  const logs = useRealtimeStore((s) => s.logs);
  const errors = useRealtimeStore((s) => s.errors);
  const connected = useRealtimeStore((s) => s.connected);
  const clearStream = useRealtimeStore((s) => s.clearStream);

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
  const selectedTargetName = useMemo(() => {
    return runtimeTargets.data?.find((target) => target.id === runtimeTargetId)?.name ?? runtimeTargetId;
  }, [runtimeTargets.data, runtimeTargetId]);

  useEffect(() => {
    if (!latestError) {
      setErrorPanelOpen(false);
    }
  }, [latestError]);

  useEffect(() => {
    if (!follow || !consoleRef.current) {
      return;
    }

    consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
  }, [filtered, follow]);

  function handleConsoleScroll() {
    if (!consoleRef.current) {
      return;
    }

    const viewport = consoleRef.current;
    const distanceFromBottom = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
    if (distanceFromBottom > 24) {
      setFollow(false);
    }
  }

  function handleFollowToggle() {
    setFollow((current) => {
      const next = !current;
      if (next && consoleRef.current) {
        consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
      }
      return next;
    });
  }

  function handleClear() {
    clearStream();
    setErrorPanelOpen(false);
  }

  return (
    <div className="logs-console-page">
      <PageIntro
        title="Live Logs"
        description={runtimeTargetId
          ? t("logs.descriptionSelected")
          : t("logs.descriptionEmpty")}
      />

      <section className="logs-console-shell">
        <header className="logs-console-toolbar">
          <div className="logs-console-toolbar-main">
            <div className="logs-console-toolbar-block">
              <span className="logs-console-toolbar-label">
                {runtimeTargetId ? `${t("logs.selected")}: ${selectedTargetName}` : t("logs.notSelected")}
              </span>
              <span
                className={`logs-console-connection ${connected ? "is-connected" : "is-disconnected"}`}
              >
                {connected ? t("common.connected") : t("common.disconnected")}
              </span>
            </div>

            <div className="logs-console-toolbar-controls">
              <input
                aria-label={t("logs.filterText")}
                className="input logs-console-input"
                placeholder={t("logs.filterText")}
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <select
                aria-label={t("logs.allLevels")}
                className="select logs-console-select"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
              >
                <option value="">{t("logs.allLevels")}</option>
                <option value="INFO">INFO</option>
                <option value="WARN">WARN</option>
                <option value="ERROR">ERROR</option>
                <option value="DEBUG">DEBUG</option>
              </select>
              <button type="button" className="button secondary" onClick={handleFollowToggle}>
                {follow ? "Following" : "Paused"}
              </button>
              <button type="button" className="button secondary" onClick={handleClear}>
                Clear
              </button>
              {runtimeTargetId ? (
                <Link className="button secondary" to="/runtime-targets">
                  {t("common.changeContainer")}
                </Link>
              ) : null}
            </div>
          </div>
        </header>

        {!runtimeTargetId ? (
          <div className="logs-console-empty logs-console-empty-standalone">{t("logs.pickContainer")}</div>
        ) : null}

        {runtimeTargetId ? (
          <>
            <div
              ref={consoleRef}
              className="logs-console-viewport"
              data-testid="logs-console"
              onScroll={handleConsoleScroll}
            >
              {filtered.length === 0 ? (
                <div className="logs-console-empty">{t("logs.noLinesYet")}</div>
              ) : null}
              {filtered.length > 0 ? (
                <div className="logs-console-head" role="row">
                  <span>Level</span>
                  <span>Time</span>
                  <span>Source</span>
                  <span>Message</span>
                </div>
              ) : null}
              {filtered.map((line, idx) => {
                const parsed = parseConsoleSource(line.payload.message, line.service);
                return (
                  <div key={`${line.ts}-${idx}`} className={`logs-console-row log-${line.payload.level ?? "INFO"}`}>
                    <span className="logs-console-level" title={line.payload.level ?? "-"}>
                      {line.payload.level ?? "-"}
                    </span>
                    <span className="logs-console-time" title={line.ts}>
                      {formatConsoleTime(line.ts)}
                    </span>
                    <span className="logs-console-service" title={parsed.source}>
                      {parsed.source}
                    </span>
                    <span className="logs-console-message" title={parsed.message}>
                      {parsed.message}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="logs-console-footer">
              <span className="logs-console-footer-meta">
                {filtered.length} {filtered.length === 1 ? "line" : "lines"}
              </span>
              <span className="logs-console-footer-meta">
                {errors.length} {errors.length === 1 ? "error" : "errors"}
              </span>
              <button
                type="button"
                className="button secondary"
                disabled={!latestError}
                onClick={() => setErrorPanelOpen((value) => !value)}
              >
                {errorPanelOpen ? "Hide latest error" : "Show latest error"}
              </button>
            </div>

            {errorPanelOpen && latestError ? (
              <section className="logs-console-error-panel">
                <div className="logs-console-error-header">
                  <h3>{t("logs.latestError")}</h3>
                  <span className="badge" style={{ borderColor: "var(--danger)", color: "var(--danger)" }}>
                    {latestError.service}
                  </span>
                </div>
                <div className="logs-console-error-type">{latestError.payload.exceptionType}</div>
                <div className="logs-console-error-message">{latestError.payload.message}</div>
                <div className="logs-console-error-meta">
                  {t("common.eventTime")}: {new Date(latestError.payload.eventTime).toLocaleString()}
                  {latestError.payload.traceId ? ` | traceId: ${latestError.payload.traceId}` : ` | ${t("common.noTraceId")}`}
                </div>
                <pre className="logs-console-error-frames">
                  {(latestError.payload.topFrames ?? []).join("\n")}
                </pre>
              </section>
            ) : null}
          </>
        ) : null}
      </section>
    </div>
  );
}
