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
        description="Start here to see current container activity, recent error volume, and the exception patterns your backend is already surfacing. This page should be enough to explain the system state before diving into a specific service."
        actions={<div style={{ display: "flex", gap: 8 }}><Link className="button" to="/containers">Open Containers</Link><Link className="button secondary" to="/logs">Open Live Logs</Link></div>}
      />
      <div className="topbar">
        <div style={{ color: "var(--text-muted)", fontSize: 14 }}>
          Current window: last 60 minutes
        </div>
        <input className="input" placeholder="Service filter" value={service} onChange={(e) => setService(e.target.value)} />
      </div>
      <div className="grid-3">
        <KpiCard title="Errors In Window" value={totalErrors} hint="Aggregated from the current 60 minute analytics range." />
        <KpiCard title="Exception Types" value={analytics.data?.topExceptionTypes.length ?? 0} hint="Distinct exception patterns currently surfaced by the backend." />
        <KpiCard title="Visible Containers" value={containers.data?.length ?? 0} hint="Services you can jump into for live inspection right now." />
      </div>
      {analytics.isLoading ? <section className="card" style={{ marginTop: 16 }}>Loading analytics...</section> : null}
      {analytics.error ? <section className="card" style={{ marginTop: 16, color: "var(--danger)" }}>Failed to load analytics.</section> : null}
      {containers.isLoading ? <section className="card" style={{ marginTop: 16 }}>Loading containers...</section> : null}
      {containers.error ? <section className="card" style={{ marginTop: 16, color: "var(--danger)" }}>Failed to load containers.</section> : null}
      {!analytics.isLoading && !analytics.error && errors.length === 0 ? (
        <section className="card empty-state" style={{ marginTop: 16 }}>
          No recent error activity for the selected window.
        </section>
      ) : null}
      <section className="card" style={{ marginTop: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Investigation Flow</div>
            <div style={{ marginTop: 6 }}>Overview gives the current picture. Containers picks the target. Live Logs handles the investigation.</div>
          </div>
          <Link className="button" to="/containers">Choose A Service</Link>
        </div>
      </section>
      <div style={{ marginTop: 16 }}>
        <LineChart title="Errors per minute" points={errors.map((e) => ({ x: e.bucket, y: e.count }))} />
      </div>
      <div className="grid-2" style={{ marginTop: 16 }}>
        <section className="card">
          <h3 style={{ marginTop: 0 }}>Top Exceptions</h3>
          {(analytics.data?.topExceptionTypes ?? []).length === 0 ? <div style={{ color: "var(--text-muted)" }}>No exception types captured for this window.</div> : null}
          <table className="table">
            <thead><tr><th>Type</th><th>Count</th></tr></thead>
            <tbody>
              {(analytics.data?.topExceptionTypes ?? []).map((x) => <tr key={x.key}><td>{x.key}</td><td>{x.count}</td></tr>)}
            </tbody>
          </table>
        </section>
        <section className="card">
          <h3 style={{ marginTop: 0 }}>Top Clusters</h3>
          {(analytics.data?.topClusters ?? []).length === 0 ? <div style={{ color: "var(--text-muted)" }}>No cluster activity captured for this window.</div> : null}
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
