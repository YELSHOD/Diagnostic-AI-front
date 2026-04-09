import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAnalytics } from "@entities/analytics/api";
import { useContainers } from "@entities/container/api";
import { KpiCard } from "@shared/ui/KpiCard";
import { PageIntro } from "@shared/ui/PageIntro";
import { LineChart } from "@widgets/LineChart";

export function OverviewPage() {
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
        title="Overview"
        description="Start here to see current container activity, recent error volume, and the exception patterns your backend is already surfacing."
        actions={<Link className="button" to="/containers">Open Containers</Link>}
      />
      <div className="topbar">
        <div style={{ color: "var(--text-muted)", fontSize: 14 }}>
          Current window: last 60 minutes
        </div>
        <input className="input" placeholder="Service filter" value={service} onChange={(e) => setService(e.target.value)} />
      </div>
      <div className="grid-3">
        <KpiCard title="Errors (1h)" value={totalErrors} />
        <KpiCard title="Unique Exception Types" value={analytics.data?.topExceptionTypes.length ?? 0} />
        <KpiCard title="Active Containers" value={containers.data?.length ?? 0} />
      </div>
      {analytics.isLoading ? <section className="card" style={{ marginTop: 16 }}>Loading analytics...</section> : null}
      {analytics.error ? <section className="card" style={{ marginTop: 16, color: "var(--danger)" }}>Failed to load analytics.</section> : null}
      {containers.isLoading ? <section className="card" style={{ marginTop: 16 }}>Loading containers...</section> : null}
      {containers.error ? <section className="card" style={{ marginTop: 16, color: "var(--danger)" }}>Failed to load containers.</section> : null}
      {!analytics.isLoading && !analytics.error && errors.length === 0 ? (
        <section className="card" style={{ marginTop: 16 }}>
          No recent error activity for the selected window.
        </section>
      ) : null}
      <div style={{ marginTop: 16 }}>
        <LineChart title="Errors per minute" points={errors.map((e) => ({ x: e.bucket, y: e.count }))} />
      </div>
      <div className="grid-2" style={{ marginTop: 16 }}>
        <section className="card">
          <h3 style={{ marginTop: 0 }}>Top Exceptions</h3>
          <table className="table">
            <thead><tr><th>Type</th><th>Count</th></tr></thead>
            <tbody>
              {(analytics.data?.topExceptionTypes ?? []).map((x) => <tr key={x.key}><td>{x.key}</td><td>{x.count}</td></tr>)}
            </tbody>
          </table>
        </section>
        <section className="card">
          <h3 style={{ marginTop: 0 }}>Top Clusters</h3>
          <table className="table">
            <thead><tr><th>Cluster</th><th>Count</th></tr></thead>
            <tbody>
              {(analytics.data?.topClusters ?? []).map((x) => <tr key={x.key}><td>{x.key}</td><td>{x.count}</td></tr>)}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
