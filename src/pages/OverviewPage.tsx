import { useMemo, useState } from "react";
import { useAnalytics } from "@entities/analytics/api";
import { useContainers } from "@entities/container/api";
import { KpiCard } from "@shared/ui/KpiCard";
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
      <div className="topbar">
        <h1 style={{ margin: 0 }}>Overview</h1>
        <input className="input" placeholder="Service filter" value={service} onChange={(e) => setService(e.target.value)} />
      </div>
      <div className="grid-3">
        <KpiCard title="Errors (1h)" value={totalErrors} />
        <KpiCard title="Unique Exception Types" value={analytics.data?.topExceptionTypes.length ?? 0} />
        <KpiCard title="Active Containers" value={containers.data?.length ?? 0} />
      </div>
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
