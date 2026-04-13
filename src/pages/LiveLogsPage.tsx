import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useRuntimeTargets } from "@entities/runtime-target/api";
import { useLogsSocket } from "@features/realtime/useLogsSocket";
import { useRealtimeStore } from "@features/realtime/store";
import { useSettingsStore } from "@features/settings/store";
import { useI18n } from "@shared/i18n/useI18n";
import { PageIntro } from "@shared/ui/PageIntro";

type QuickRangeKey = "all" | "5m" | "15m" | "1h" | "6h" | "24h";

type ActiveTimeRange =
  | { kind: "all" }
  | { kind: "relative"; key: Exclude<QuickRangeKey, "all">; minutes: number }
  | { kind: "custom"; from: number; to: number };

type CustomRangeDraft = {
  from: string;
  to: string;
};

const QUICK_RANGES: Array<{ key: QuickRangeKey; minutes?: number }> = [
  { key: "all" },
  { key: "5m", minutes: 5 },
  { key: "15m", minutes: 15 },
  { key: "1h", minutes: 60 },
  { key: "6h", minutes: 360 },
  { key: "24h", minutes: 1_440 }
];

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

function parseDatetimeLocal(value: string) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? null : parsed;
}

function formatRangeSummaryDate(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(new Date(timestamp));
}

export function LiveLogsPage() {
  const { t } = useI18n();
  const [params] = useSearchParams();
  const [text, setText] = useState("");
  const [level, setLevel] = useState("");
  const [follow, setFollow] = useState(true);
  const [errorPanelOpen, setErrorPanelOpen] = useState(false);
  const [activeTimeRange, setActiveTimeRange] = useState<ActiveTimeRange>({ kind: "all" });
  const [customRangeDraft, setCustomRangeDraft] = useState<CustomRangeDraft>({ from: "", to: "" });
  const [customPanelOpen, setCustomPanelOpen] = useState(false);
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
    () => {
      const now = Date.now();

      return logs.filter((x) => {
        const lineTs = new Date(x.ts).getTime();
        const timeOk =
          activeTimeRange.kind === "all" ||
          (activeTimeRange.kind === "relative" && lineTs >= now - activeTimeRange.minutes * 60_000) ||
          (activeTimeRange.kind === "custom" &&
            lineTs >= activeTimeRange.from &&
            lineTs <= activeTimeRange.to);
        const lvlOk = !level || x.payload.level === level;
        const txtOk = !text || x.payload.message.toLowerCase().includes(text.toLowerCase());
        return timeOk && lvlOk && txtOk;
      });
    },
    [logs, activeTimeRange, text, level]
  );

  const latestError = errors.length > 0 ? errors[errors.length - 1] : null;
  const hasAnyLogs = logs.length > 0;
  const hasTimeRestriction = activeTimeRange.kind !== "all";
  const customRangeInvalid = useMemo(() => {
    const from = parseDatetimeLocal(customRangeDraft.from);
    const to = parseDatetimeLocal(customRangeDraft.to);

    return from !== null && to !== null && from > to;
  }, [customRangeDraft.from, customRangeDraft.to]);
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

  function handleQuickRangeSelect(key: QuickRangeKey) {
    setCustomPanelOpen(false);

    if (key === "all") {
      setActiveTimeRange({ kind: "all" });
      return;
    }

    const config = QUICK_RANGES.find((entry) => entry.key === key);
    if (!config?.minutes) {
      return;
    }

    setActiveTimeRange({ kind: "relative", key, minutes: config.minutes });
  }

  function handleApplyCustomRange() {
    const from = parseDatetimeLocal(customRangeDraft.from);
    const to = parseDatetimeLocal(customRangeDraft.to);

    if (from === null || to === null || from > to) {
      return;
    }

    setActiveTimeRange({ kind: "custom", from, to });
    setCustomPanelOpen(false);
  }

  function handleResetTimeRange() {
    setActiveTimeRange({ kind: "all" });
    setCustomRangeDraft({ from: "", to: "" });
    setCustomPanelOpen(false);
  }

  function isRangeActive(key: QuickRangeKey) {
    return (
      (key === "all" && activeTimeRange.kind === "all") ||
      (activeTimeRange.kind === "relative" && activeTimeRange.key === key)
    );
  }

  const activeRangeSummary = useMemo(() => {
    if (activeTimeRange.kind === "all") {
      return t("logs.activeRangeAll");
    }

    if (activeTimeRange.kind === "relative") {
      return `${t("logs.activeRangePrefix")}: ${t(`logs.range.${activeTimeRange.key}`)}`;
    }

    return `${t("logs.activeRangePrefix")}: ${formatRangeSummaryDate(activeTimeRange.from)} - ${formatRangeSummaryDate(activeTimeRange.to)}`;
  }, [activeTimeRange, t]);

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
          <div className="logs-console-toolbar-primary">
            <div className="logs-console-target-block">
              <span className="logs-console-toolbar-label">{t("logs.targetLabel")}</span>
              <div className="logs-console-toolbar-block">
                <strong className="logs-console-target-name">
                  {runtimeTargetId ? selectedTargetName : t("logs.notSelected")}
                </strong>
                <span className={`logs-console-status-chip ${connected ? "is-live" : "is-offline"}`}>
                  {connected ? t("common.connected") : t("common.disconnected")}
                </span>
                <button
                  type="button"
                  className={`logs-console-follow-chip ${follow ? "is-live" : "is-paused"}`}
                  aria-label={follow ? t("logs.pauseStream") : t("logs.resumeStream")}
                  onClick={handleFollowToggle}
                >
                  {follow ? t("logs.following") : t("logs.paused")}
                </button>
              </div>
            </div>

            <div className="logs-console-toolbar-actions">
              <button
                type="button"
                className="button secondary logs-console-action"
                onClick={handleClear}
              >
                {t("logs.clearConsole")}
              </button>
              {runtimeTargetId ? (
                <Link className="button secondary logs-console-action" to="/runtime-targets">
                  {t("common.changeContainer")}
                </Link>
              ) : null}
            </div>
          </div>

          <div className="logs-console-toolbar-secondary">
            <div className="logs-console-timebar">
              <span className="logs-console-toolbar-label">{t("logs.timeRange")}</span>
              <div className="logs-console-range-chips">
                {QUICK_RANGES.map((entry) => (
                  <button
                    key={entry.key}
                    type="button"
                    className={`logs-console-range-chip ${isRangeActive(entry.key) ? "is-active" : ""}`}
                    onClick={() => handleQuickRangeSelect(entry.key)}
                  >
                    {t(`logs.range.${entry.key}`)}
                  </button>
                ))}
                <button
                  type="button"
                  className={`logs-console-range-chip ${activeTimeRange.kind === "custom" || customPanelOpen ? "is-active" : ""}`}
                  onClick={() => setCustomPanelOpen((value) => !value)}
                >
                  {t("logs.range.custom")}
                </button>
              </div>
              <div className="logs-console-range-hint">{t("logs.streamedBufferHint")}</div>
              <div className="logs-console-range-summary" aria-label={t("logs.activeRangeLabel")}>
                {activeRangeSummary}
              </div>
              {customPanelOpen ? (
                <div className="logs-console-range-panel">
                  <label className="field">
                    <span>{t("logs.from")}</span>
                    <input
                      aria-label={t("logs.from")}
                      className="input"
                      type="datetime-local"
                      value={customRangeDraft.from}
                      onChange={(e) => setCustomRangeDraft((current) => ({ ...current, from: e.target.value }))}
                    />
                  </label>
                  <label className="field">
                    <span>{t("logs.to")}</span>
                    <input
                      aria-label={t("logs.to")}
                      className="input"
                      type="datetime-local"
                      value={customRangeDraft.to}
                      onChange={(e) => setCustomRangeDraft((current) => ({ ...current, to: e.target.value }))}
                    />
                  </label>
                  <div className="logs-console-range-panel-actions">
                    <button
                      type="button"
                      className="button secondary logs-console-action"
                      onClick={handleResetTimeRange}
                    >
                      {t("logs.resetRange")}
                    </button>
                    <button
                      type="button"
                      className="button logs-console-action"
                      disabled={!customRangeDraft.from || !customRangeDraft.to || customRangeInvalid}
                      onClick={handleApplyCustomRange}
                    >
                      {t("logs.applyRange")}
                    </button>
                  </div>
                </div>
              ) : null}
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
                <div className="logs-console-empty">
                  {hasAnyLogs && hasTimeRestriction ? t("logs.noLinesInRange") : t("logs.noLinesYet")}
                </div>
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
              <div className="logs-console-footer-stats">
                <span className="logs-console-footer-meta">
                  {filtered.length} {t("logs.linesLabel")}
                </span>
                <span className="logs-console-footer-meta">
                  {errors.length} {t("logs.errorsLabel")}
                </span>
              </div>
              <button
                type="button"
                className="button secondary logs-console-action"
                disabled={!latestError}
                onClick={() => setErrorPanelOpen((value) => !value)}
              >
                {errorPanelOpen ? t("logs.hideIncidentDetails") : t("logs.showIncidentDetails")}
              </button>
            </div>

            {errorPanelOpen && latestError ? (
              <section className="logs-console-error-panel">
                <div className="logs-console-error-header">
                  <h3>{t("logs.incidentDetails")}</h3>
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
