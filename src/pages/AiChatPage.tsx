import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useRuntimeTargets } from "@entities/runtime-target/api";
import { diagnoseLogsWithGemini, type AiDiagnosisResponse } from "@features/ai/api";
import { useI18n } from "@shared/i18n/useI18n";
import { PageIntro } from "@shared/ui/PageIntro";

type ChatMode = "diagnosis" | "product_help";

const DEFAULT_TIME_RANGE = {
  mode: "all" as const,
  label: "Showing: All streamed",
  from: null,
  to: null
};

export function AiChatPage() {
  const { t } = useI18n();
  const runtimeTargets = useRuntimeTargets();
  const [mode, setMode] = useState<ChatMode>("product_help");
  const [runtimeTargetId, setRuntimeTargetId] = useState("");
  const [question, setQuestion] = useState("");
  const [logContext, setLogContext] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answer, setAnswer] = useState<AiDiagnosisResponse | null>(null);

  const selectedTargetName = useMemo(() => {
    return runtimeTargets.data?.find((target) => target.id === runtimeTargetId)?.name ?? "";
  }, [runtimeTargets.data, runtimeTargetId]);

  async function handleSubmit() {
    if (!question.trim()) {
      return;
    }

    const logLines = mode === "diagnosis"
      ? logContext
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
      : [];

    if (mode === "diagnosis" && logLines.length === 0) {
      return;
    }

    setPending(true);
    setError(null);

    try {
      const response = await diagnoseLogsWithGemini({
        mode,
        service: selectedTargetName,
        question: question.trim(),
        logLines,
        timeRange: DEFAULT_TIME_RANGE,
        levelFilter: "",
        textFilter: ""
      });
      setAnswer(response);
    } catch (nextError) {
      setAnswer(null);
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

      <section className="ai-chat-shell">
        <div className="ai-chat-card card">
          <div className="ai-chat-mode-switch" role="tablist" aria-label={t("aiChat.modeLabel")}>
            <button
              type="button"
              className={`ai-chat-mode-chip${mode === "product_help" ? " is-active" : ""}`}
              onClick={() => setMode("product_help")}
            >
              {t("aiChat.modeProductHelp")}
            </button>
            <button
              type="button"
              className={`ai-chat-mode-chip${mode === "diagnosis" ? " is-active" : ""}`}
              onClick={() => setMode("diagnosis")}
            >
              {t("aiChat.modeDiagnosis")}
            </button>
          </div>

          <div className="ai-chat-helper">{mode === "diagnosis" ? t("aiChat.diagnosisHelper") : t("aiChat.productHelpHelper")}</div>

          <label className="field">
            <span>{t("aiChat.targetLabel")}</span>
            <select
              aria-label={t("aiChat.targetLabel")}
              className="select"
              value={runtimeTargetId}
              onChange={(event) => setRuntimeTargetId(event.target.value)}
            >
              <option value="">{t("aiChat.noTarget")}</option>
              {(runtimeTargets.data ?? []).map((target) => (
                <option key={target.id} value={target.id}>{target.name}</option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>{t("aiChat.questionLabel")}</span>
            <textarea
              aria-label={t("aiChat.questionLabel")}
              className="textarea ai-chat-textarea"
              rows={5}
              value={question}
              placeholder={mode === "diagnosis" ? t("aiChat.questionPlaceholderDiagnosis") : t("aiChat.questionPlaceholderProductHelp")}
              onChange={(event) => setQuestion(event.target.value)}
            />
          </label>

          {mode === "diagnosis" ? (
            <label className="field">
              <span>{t("aiChat.logContextLabel")}</span>
              <textarea
                aria-label={t("aiChat.logContextLabel")}
                className="textarea ai-chat-textarea"
                rows={8}
                value={logContext}
                placeholder={t("aiChat.logContextPlaceholder")}
                onChange={(event) => setLogContext(event.target.value)}
              />
            </label>
          ) : null}

          {error ? <div className="card-error ai-chat-error">{error}</div> : null}

          <div className="ai-chat-actions">
            <button
              type="button"
              className="button"
              disabled={!question.trim() || (mode === "diagnosis" && logContext.trim().length === 0) || pending}
              onClick={handleSubmit}
            >
              {pending ? t("aiChat.loading") : t("aiChat.submit")}
            </button>
          </div>
        </div>

        <div className="ai-chat-card card">
          {answer ? (
            <div className="ai-chat-answer">
              <div className="ai-chat-answer-meta">
                <span className="badge">{answer.provider}</span>
                <span className="badge">{answer.model}</span>
                <span className="badge">{mode === "diagnosis" ? t("aiChat.modeDiagnosis") : t("aiChat.modeProductHelp")}</span>
              </div>
              <div className="ai-chat-section">
                <h3>{t("aiChat.summaryTitle")}</h3>
                <p>{answer.summary}</p>
              </div>
              {answer.probableRootCause ? (
                <div className="ai-chat-section">
                  <h3>{t("aiChat.rootCauseTitle")}</h3>
                  <p>{answer.probableRootCause}</p>
                </div>
              ) : null}
              {answer.timeline.length > 0 ? (
                <div className="ai-chat-section">
                  <h3>{t("aiChat.timelineTitle")}</h3>
                  <ul className="ai-chat-list">
                    {answer.timeline.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
                  </ul>
                </div>
              ) : null}
              {answer.evidence.length > 0 ? (
                <div className="ai-chat-section">
                  <h3>{t("aiChat.evidenceTitle")}</h3>
                  <ul className="ai-chat-list">
                    {answer.evidence.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
                  </ul>
                </div>
              ) : null}
              {answer.nextChecks.length > 0 ? (
                <div className="ai-chat-section">
                  <h3>{t("aiChat.nextChecksTitle")}</h3>
                  <ul className="ai-chat-list">
                    {answer.nextChecks.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="empty-state">{t("aiChat.emptyState")}</div>
          )}
        </div>
      </section>
    </div>
  );
}
