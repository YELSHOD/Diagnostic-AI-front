import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAnalytics } from "@entities/analytics/api";
import { useContainers } from "@entities/container/api";
import { useI18n } from "@shared/i18n/useI18n";
import { KpiCard } from "@shared/ui/KpiCard";
import { PageIntro } from "@shared/ui/PageIntro";
import { LineChart } from "@widgets/LineChart";

export function OverviewPage() {
  const { t } = useI18n();
  const [service, setService] = useState("");
  const to = new Date().toISOString();
  const from = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const analytics = useAnalytics({ from, to, service: service || undefined });
  const containers = useContainers();

  const errors = analytics.data?.errorsPerMinute ?? [];
  const totalErrors = useMemo(() => errors.reduce((sum, x) => sum + x.count, 0), [errors]);

  return (
    <div>
      <PageIntro
        title={t("overview.title")}
        description={t("overview.description")}
        actions={<div style={{ display: "flex", gap: 8 }}><Link className="button" to="/containers">{t("common.openContainers")}</Link><Link className="button secondary" to="/logs">{t("common.openLiveLogs")}</Link></div>}
      />
      <div className="topbar">
        <div style={{ color: "var(--text-muted)", fontSize: 14 }}>
          {t("overview.window")}
        </div>
        <input className="input" placeholder={t("overview.serviceFilter")} value={service} onChange={(e) => setService(e.target.value)} />
      </div>
      <div className="grid-3">
        <KpiCard title={t("overview.errorsInWindow")} value={totalErrors} hint={t("overview.errorsHint")} />
        <KpiCard title={t("overview.exceptionTypes")} value={analytics.data?.topExceptionTypes.length ?? 0} hint={t("overview.exceptionHint")} />
        <KpiCard title={t("overview.visibleContainers")} value={containers.data?.length ?? 0} hint={t("overview.containersHint")} />
      </div>
      {analytics.isLoading ? <section className="card" style={{ marginTop: 16 }}>{t("common.loadingAnalytics")}</section> : null}
      {analytics.error ? <section className="card" style={{ marginTop: 16, color: "var(--danger)" }}>{t("common.failedAnalytics")}</section> : null}
      {containers.isLoading ? <section className="card" style={{ marginTop: 16 }}>{t("common.loadingContainers")}</section> : null}
      {containers.error ? <section className="card" style={{ marginTop: 16, color: "var(--danger)" }}>{t("common.failedContainers")}</section> : null}
      {!analytics.isLoading && !analytics.error && errors.length === 0 ? (
        <section className="card empty-state" style={{ marginTop: 16 }}>{t("overview.noRecentErrors")}</section>
      ) : null}
      <section className="card" style={{ marginTop: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{t("overview.flowTitle")}</div>
            <div style={{ marginTop: 6 }}>{t("overview.flowText")}</div>
          </div>
          <Link className="button" to="/containers">{t("common.chooseService")}</Link>
        </div>
      </section>
      <div style={{ marginTop: 16 }}>
        <LineChart title={t("overview.errorsPerMinute")} points={errors.map((e) => ({ x: e.bucket, y: e.count }))} />
      </div>
      <div className="grid-2" style={{ marginTop: 16 }}>
        <section className="card">
          <h3 style={{ marginTop: 0 }}>{t("overview.topExceptions")}</h3>
          {(analytics.data?.topExceptionTypes ?? []).length === 0 ? <div style={{ color: "var(--text-muted)" }}>{t("overview.noExceptions")}</div> : null}
          <table className="table">
            <thead><tr><th>{t("overview.type")}</th><th>{t("overview.count")}</th></tr></thead>
            <tbody>
              {(analytics.data?.topExceptionTypes ?? []).map((x) => <tr key={x.key}><td>{x.key}</td><td>{x.count}</td></tr>)}
            </tbody>
          </table>
        </section>
        <section className="card">
          <h3 style={{ marginTop: 0 }}>{t("overview.topClusters")}</h3>
          {(analytics.data?.topClusters ?? []).length === 0 ? <div style={{ color: "var(--text-muted)" }}>{t("overview.noClusters")}</div> : null}
          <table className="table">
            <thead><tr><th>{t("overview.cluster")}</th><th>{t("overview.count")}</th></tr></thead>
            <tbody>
              {(analytics.data?.topClusters ?? []).map((x) => <tr key={x.key}><td>{x.key}</td><td>{x.count}</td></tr>)}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
