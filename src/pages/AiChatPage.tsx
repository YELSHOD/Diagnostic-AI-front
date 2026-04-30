import { useMemo, useState, type KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import { useRuntimeTargets } from "@entities/runtime-target/api";
import { chatWithAiAssistant, type AiChatResponse } from "@features/ai/api";
import { useRealtimeStore } from "@features/realtime/store";
import { useI18n } from "@shared/i18n/useI18n";
import { PageIntro } from "@shared/ui/PageIntro";

type ChatMessage =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "assistant"; response: AiChatResponse; contextLabel: string | null };

function buildLogLines(logs: Array<{ ts: string; service: string; payload: { message: string; level?: string | null } }>) {
  return logs.slice(-40).map((line) => {
    const level = line.payload.level ?? "INFO";
    return `${line.ts} ${level} [${line.service}] ${line.payload.message}`;
  });
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
      const response = await chatWithAiAssistant({
        message: trimmed,
        history: messages.map((message) => ({
          role: message.role,
          content: message.role === "user" ? message.text : message.response.answer
        })),
        context: diagnosisContext.logLines.length > 0
          ? {
              service: diagnosisContext.service,
              logLines: diagnosisContext.logLines
            }
          : null
      });

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          response,
          contextLabel: diagnosisContext.label
        }
      ]);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : t("aiChat.failed"));
    } finally {
      setPending(false);
    }
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSubmit();
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
                  <div className="ai-chat-summary">{message.response.answer}</div>
                  {message.response.suggestions.length > 0 ? (
                    <div className="ai-chat-section">
                      <h3>{t("aiChat.suggestionsTitle")}</h3>
                      <ul className="ai-chat-list">
                        {message.response.suggestions.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
                      </ul>
                    </div>
                  ) : null}
                  {message.response.relatedPages.length > 0 ? (
                    <div className="ai-chat-section">
                      <h3>{t("aiChat.relatedPagesTitle")}</h3>
                      <ul className="ai-chat-list">
                        {message.response.relatedPages.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
                      </ul>
                    </div>
                  ) : null}
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
              onKeyDown={handleComposerKeyDown}
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
