import { Link } from "react-router-dom";
import { PageIntro } from "@shared/ui/PageIntro";

export function AiChatPage() {
  return (
    <div>
      <PageIntro
        title="AI Chat"
        description="This screen is kept in the product shell on purpose, but the backend chat endpoint is not part of the current MVP. It stays as a clearly marked next-wave feature instead of pretending to work."
        actions={<Link className="button secondary" to="/analysis">Back To Analysis</Link>}
      />
      <section className="card" style={{ minHeight: 420, display: "grid", alignContent: "start", gap: 18 }}>
        <div>
          <div style={{ display: "inline-flex", padding: "6px 10px", borderRadius: 999, border: "1px solid var(--border)", color: "var(--text-muted)", fontSize: 12, letterSpacing: "0.04em", textTransform: "uppercase" }}>
            Planned Feature
          </div>
          <h2 style={{ margin: "16px 0 8px" }}>What this page will do later</h2>
          <p style={{ margin: 0, color: "var(--text-muted)", maxWidth: 760 }}>
            The future chat assistant will answer questions about cluster spikes, error traces, service health, and AI diagnoses once the backend exposes persisted incidents and a chat endpoint.
          </p>
        </div>
        <div style={{ display: "grid", gap: 12 }}>
          <div className="card" style={{ background: "var(--bg-soft)" }}>
            Ask why a cluster started growing and what changed around that time.
          </div>
          <div className="card" style={{ background: "var(--bg-soft)" }}>
            Compare noisy services and summarize the most frequent exception patterns.
          </div>
          <div className="card" style={{ background: "var(--bg-soft)" }}>
            Pull together logs, incidents, and AI diagnosis into one explanation for review.
          </div>
        </div>
        <div style={{ color: "var(--text-muted)", maxWidth: 760 }}>
          Until those backend contracts exist, use <Link to="/logs">Live Logs</Link> for streaming data and <Link to="/analysis">Analysis</Link> for the current cluster view.
        </div>
      </section>
    </div>
  );
}
