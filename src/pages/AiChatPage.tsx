import { Link } from "react-router-dom";
import { useI18n } from "@shared/i18n/useI18n";
import { PageIntro } from "@shared/ui/PageIntro";

export function AiChatPage() {
  const { t } = useI18n();
  return (
    <div>
      <PageIntro
        title={t("aiChat.title")}
        description={t("aiChat.description")}
        actions={<Link className="button secondary" to="/analysis">{t("aiChat.backToAnalysis")}</Link>}
      />
      <section className="card" style={{ minHeight: 420, display: "grid", alignContent: "start", gap: 18 }}>
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "inline-flex", padding: "6px 10px", borderRadius: 999, border: "1px solid var(--border)", color: "var(--text-muted)", fontSize: 12, letterSpacing: "0.04em", textTransform: "uppercase" }}>
            {t("aiChat.planned")}
          </div>
          <h2 style={{ margin: "16px 0 8px" }}>{t("aiChat.futureTitle")}</h2>
          <p style={{ margin: 0, color: "var(--text-muted)", maxWidth: 760 }}>
            {t("aiChat.futureText")}
          </p>
          <div className="card" style={{ background: "color-mix(in srgb, var(--bg-soft) 92%, transparent)", maxWidth: 760 }}>
            {t("aiChat.dissertationNote")}
          </div>
        </div>
        <div style={{ display: "grid", gap: 12 }}>
          <div className="card" style={{ background: "var(--bg-soft)" }}>
            {t("aiChat.prompt1")}
          </div>
          <div className="card" style={{ background: "var(--bg-soft)" }}>
            {t("aiChat.prompt2")}
          </div>
          <div className="card" style={{ background: "var(--bg-soft)" }}>
            {t("aiChat.prompt3")}
          </div>
        </div>
        <div style={{ color: "var(--text-muted)", maxWidth: 760 }}>
          {t("aiChat.untilReady")}
        </div>
      </section>
    </div>
  );
}
