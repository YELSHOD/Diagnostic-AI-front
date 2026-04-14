import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useRuntimeTargets } from "@entities/runtime-target/api";
import { diagnoseLogsWithGemini, type AiDiagnosisResponse } from "@features/ai/api";
import { useRealtimeStore } from "@features/realtime/store";
import { useI18n } from "@shared/i18n/useI18n";
import { PageIntro } from "@shared/ui/PageIntro";

type ChatMode = "diagnosis" | "product_help";

type ChatMessage =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "assistant"; mode: ChatMode; response: AiDiagnosisResponse; contextLabel: string | null };

const DEFAULT_TIME_RANGE = {
  mode: "all" as const,
  label: "Showing: All streamed",
  from: null,
  to: null
};

const DIAGNOSIS_HINTS = [
  "log",
  "logs",
  "error",
  "exception",
  "trace",
  "failure",
  "failed",
  "runtime",
  "target",
  "incident",
  "order",
  "restaurant",
  "заказ",
  "лог",
  "логи",
  "ошибка",
  "исключение",
  "почему упало",
  "ресторан"
];

const PRODUCT_HELP_HINTS = [
  "where",
  "how do i",
  "how to",
  "password",
  "settings",
  "account",
  "page",
  "screen",
  "change password",
  "api base url",
  "ws base url",
  "где",
  "как",
  "пароль",
  "настройк",
  "аккаунт",
  "страниц",
  "экран",
  "сменить пароль"
];

function inferMode(question: string, hasContext: boolean): ChatMode {
  const normalized = question.toLowerCase();
  if (PRODUCT_HELP_HINTS.some((hint) => normalized.includes(hint))) {
    return "product_help";
  }

  const isDiagnosis = hasContext || DIAGNOSIS_HINTS.some((hint) => normalized.includes(hint));
  return isDiagnosis ? "diagnosis" : "product_help";
}

function buildLogLines(logs: Array<{ ts: string; service: string; payload: { message: string; level?: string | null } }>) {
  return logs.slice(-40).map((line) => {
    const level = line.payload.level ?? "INFO";
    return `${line.ts} ${level} [${line.service}] ${line.payload.message}`;
  });
}

function toAssistantSections(response: AiDiagnosisResponse) {
  return [
    response.probableRootCause ? { titleKey: "aiChat.rootCauseTitle", items: [response.probableRootCause] } : null,
    response.timeline.length > 0 ? { titleKey: "aiChat.timelineTitle", items: response.timeline } : null,
    response.evidence.length > 0 ? { titleKey: "aiChat.evidenceTitle", items: response.evidence } : null,
    response.nextChecks.length > 0 ? { titleKey: "aiChat.nextChecksTitle", items: response.nextChecks } : null
  ].filter(Boolean) as Array<{ titleKey: string; items: string[] }>;
}

export function AiChatPage() {
  const { t } = useI18n();
  const runtimeTargets = useRuntimeTargets();
  const selectedContainerId = useRealtimeStore((s) => s.selectedContainerId);
  const logs = useRealtimeStore((s) => s.logs);
  const [question, setQuestion] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const selectedTarget = useMemo(() => {
    return runtimeTargets.data?.find((target) => target.id === selectedContainerId) ?? null;
  }, [runtimeTargets.data, selectedContainerId]);

  const diagnosisContext = useMemo(() => {
    if (!selectedTarget) {
      return { service: "", logLines: [] as string[], label: null as string | null };
    }

    const lines = buildLogLines(
      logs.filter((entry) => entry.service === selectedTarget.name || entry.service === selectedTarget.id)
    );

    if (lines.length === 0) {
      return { service: "", logLines: [] as string[], label: null as string | null };
    }

    return {
      service: selectedTarget.name,
      logLines: lines,
      label: `${t("aiChat.usingContext")}: ${selectedTarget.name}`
    };
  }, [logs, selectedTarget, t]);

  async function handleSubmit() {
    const trimmed = question.trim();
    if (!trimmed) {
      return;
    }

    const mode = inferMode(trimmed, diagnosisContext.logLines.length > 0);
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmed
    };

    setMessages((current) => [...current, userMessage]);
    setQuestion("");
    setPending(true);
    setError(null);

    try {
      const response = await diagnoseLogsWithGemini({
        mode,
        service: mode === "diagnosis" ? diagnosisContext.service : "",
        question: trimmed,
        logLines: mode === "diagnosis" ? diagnosisContext.logLines : [],
        timeRange: DEFAULT_TIME_RANGE,
        levelFilter: "",
        textFilter: ""
      });

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          mode,
          response,
          contextLabel: mode === "diagnosis" ? diagnosisContext.label : null
        }
      ]);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : t("aiChat.failed"));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="ai-chat-page">
      <PageIntro
        title={t("aiChat.title")}
        description={t("aiChat.description")}
        actions={<Link className="button secondary" to="/analysis">{t("aiChat.backToAnalysis")}</Link>}
      />

      <section className="ai-chat-v2-shell">
        <div className="ai-chat-thread card">
          {messages.length === 0 ? (
            <div className="ai-chat-empty">
              <div className="ai-chat-empty-title">{t("aiChat.emptyTitle")}</div>
              <div className="ai-chat-empty-copy">{t("aiChat.emptyState")}</div>
              <div className="ai-chat-empty-prompts">
                <div className="ai-chat-prompt-chip">{t("aiChat.prompt1")}</div>
                <div className="ai-chat-prompt-chip">{t("aiChat.prompt2")}</div>
                <div className="ai-chat-prompt-chip">{t("aiChat.prompt3")}</div>
              </div>
            </div>
          ) : null}

          {messages.map((message) => {
            if (message.role === "user") {
              return (
                <div key={message.id} className="ai-chat-bubble is-user">
                  <div className="ai-chat-bubble-role">{t("aiChat.userRole")}</div>
                  <div>{message.text}</div>
                </div>
              );
            }

            return (
              <div key={message.id} className="ai-chat-bubble is-assistant">
                <div className="ai-chat-bubble-role">{t("aiChat.assistantRole")}</div>
                {message.contextLabel ? <div className="ai-chat-context-note">{message.contextLabel}</div> : null}
                <div className="ai-chat-summary">{message.response.summary}</div>
                <div className="ai-chat-answer-meta">
                  <span className="badge">{message.response.provider}</span>
                  <span className="badge">{message.response.model}</span>
                  <span className="badge">{message.mode === "diagnosis" ? t("aiChat.modeDiagnosis") : t("aiChat.modeProductHelp")}</span>
                </div>
                {toAssistantSections(message.response).map((section) => (
                  <div key={section.titleKey} className="ai-chat-section">
                    <h3>{t(section.titleKey)}</h3>
                    <ul className="ai-chat-list">
                      {section.items.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
                    </ul>
                  </div>
                ))}
                <details className="ai-chat-raw">
                  <summary>{t("aiChat.rawToggle")}</summary>
                  <pre>{message.response.rawText}</pre>
                </details>
              </div>
            );
          })}

          {pending ? (
            <div className="ai-chat-bubble is-assistant is-pending" aria-label={t("aiChat.loadingBubble")}>
              <div className="ai-chat-bubble-role">{t("aiChat.assistantRole")}</div>
              <div className="ai-chat-typing">
                <span />
                <span />
                <span />
              </div>
            </div>
          ) : null}

          {error ? <div className="card-error ai-chat-error">{error}</div> : null}
        </div>

        <div className="ai-chat-composer card">
          {diagnosisContext.label ? <div className="ai-chat-context-note">{diagnosisContext.label}</div> : <div className="ai-chat-context-note">{t("aiChat.noContextHint")}</div>}
          <label className="field">
            <span>{t("aiChat.questionLabel")}</span>
            <textarea
              aria-label={t("aiChat.questionLabel")}
              className="textarea ai-chat-composer-input"
              rows={4}
              value={question}
              placeholder={t("aiChat.composerPlaceholder")}
              onChange={(event) => setQuestion(event.target.value)}
            />
          </label>
          <div className="ai-chat-actions">
            <button
              type="button"
              className="button"
              disabled={!question.trim() || pending}
              onClick={handleSubmit}
            >
              {pending ? t("aiChat.loading") : t("aiChat.submit")}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
