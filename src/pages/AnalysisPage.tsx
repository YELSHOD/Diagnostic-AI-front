import { Link } from "react-router-dom";
import { useMemo } from "react";
import { useRealtimeStore } from "@features/realtime/store";
import { useI18n } from "@shared/i18n/useI18n";
import { PageIntro } from "@shared/ui/PageIntro";

export function AnalysisPage() {
  const { t } = useI18n();
  const clusters = useRealtimeStore((s) => s.clusters);
  const rows = useMemo(() => Object.values(clusters).sort((a, b) => b.count - a.count), [clusters]);
  const totalClusters = rows.length;
  const totalEvents = rows.reduce((sum, row) => sum + row.count, 0);
  const newClusters = rows.filter((row) => row.newCluster).length;

  return (
    <div>
      <PageIntro
        title={t("analysis.title")}
        description={t("analysis.description")}
        actions={<div style={{ display: "flex", gap: 8 }}><Link className="button" to="/logs">{t("common.openLiveLogs")}</Link><Link className="button secondary" to="/runtime-targets">{t("common.chooseService")}</Link></div>}
      />
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 16 }}>
        <article className="card kpi-card">
          <div style={{ color: "var(--text-muted)", fontSize: 12, letterSpacing: "0.04em", textTransform: "uppercase" }}>{t("analysis.trackedClusters")}</div>
          <div style={{ fontSize: 30, fontWeight: 700, marginTop: 8 }}>{totalClusters}</div>
        </article>
        <article className="card kpi-card">
          <div style={{ color: "var(--text-muted)", fontSize: 12, letterSpacing: "0.04em", textTransform: "uppercase" }}>{t("analysis.clusterEvents")}</div>
          <div style={{ fontSize: 30, fontWeight: 700, marginTop: 8 }}>{totalEvents}</div>
        </article>
        <article className="card kpi-card">
          <div style={{ color: "var(--text-muted)", fontSize: 12, letterSpacing: "0.04em", textTransform: "uppercase" }}>{t("analysis.markedNew")}</div>
          <div style={{ fontSize: 30, fontWeight: 700, marginTop: 8 }}>{newClusters}</div>
        </article>
      </section>
      <section className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{t("analysis.noteTitle")}</div>
        <div style={{ marginTop: 6, maxWidth: 760 }}>
          {t("analysis.noteText")}
        </div>
      </section>
      {rows.length === 0 ? (
        <section className="card empty-state">
          <h3 style={{ marginTop: 0 }}>{t("analysis.noUpdates")}</h3>
          <p style={{ margin: "8px 0 0", color: "var(--text-muted)", maxWidth: 720 }}>
            {t("analysis.noUpdatesText")}
          </p>
        </section>
      ) : (
      <section className="card">
        <div style={{ marginBottom: 14, color: "var(--text-muted)" }}>
          {t("analysis.highestVolume")}
        </div>
        <table className="table">
          <thead>
            <tr><th>{t("analysis.clusterKey")}</th><th>{t("analysis.service")}</th><th>{t("analysis.count")}</th><th>{t("analysis.new")}</th><th>{t("analysis.firstSeen")}</th><th>{t("analysis.lastSeen")}</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.clusterKey}>
                <td>{r.clusterKey}</td>
                <td>{r.service}</td>
                <td>{r.count}</td>
                <td>{r.newCluster ? t("common.yes") : t("common.no")}</td>
                <td>{new Date(r.firstSeen).toLocaleString()}</td>
                <td>{new Date(r.lastSeen).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      )}
      <section className="card" style={{ marginTop: 16 }}>
        <h3 style={{ marginTop: 0 }}>{t("analysis.currentScope")}</h3>
        <p style={{ margin: 0, color: "var(--text-muted)", maxWidth: 760 }}>
          {t("analysis.currentScopeText")}
        </p>
      </section>
    </div>
  );
}
