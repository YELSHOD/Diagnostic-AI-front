import { useMemo } from "react";
import { useRealtimeStore } from "@features/realtime/store";

export function AnalysisPage() {
  const clusters = useRealtimeStore((s) => s.clusters);
  const rows = useMemo(() => Object.values(clusters).sort((a, b) => b.count - a.count), [clusters]);

  return (
    <div>
      <div className="topbar"><h1 style={{ margin: 0 }}>Analysis</h1></div>
      <section className="card">
        <table className="table">
          <thead>
            <tr><th>Cluster Key</th><th>Service</th><th>Count</th><th>New</th><th>First Seen</th><th>Last Seen</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.clusterKey}>
                <td>{r.clusterKey}</td>
                <td>{r.service}</td>
                <td>{r.count}</td>
                <td>{r.newCluster ? "Yes" : "No"}</td>
                <td>{new Date(r.firstSeen).toLocaleString()}</td>
                <td>{new Date(r.lastSeen).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="card" style={{ marginTop: 16 }}>
        <h3 style={{ marginTop: 0 }}>AI Diagnosis Data Source</h3>
        <p style={{ margin: 0, color: "var(--text-muted)" }}>
          Backend does not expose REST endpoints for reading ai_diagnosis or incidents list yet.
        </p>
      </section>
    </div>
  );
}
