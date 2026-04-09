import { Link } from "react-router-dom";
import { useMemo } from "react";
import { useRealtimeStore } from "@features/realtime/store";
import { PageIntro } from "@shared/ui/PageIntro";

export function AnalysisPage() {
  const clusters = useRealtimeStore((s) => s.clusters);
  const rows = useMemo(() => Object.values(clusters).sort((a, b) => b.count - a.count), [clusters]);
  const totalClusters = rows.length;
  const totalEvents = rows.reduce((sum, row) => sum + row.count, 0);
  const newClusters = rows.filter((row) => row.newCluster).length;

  return (
    <div>
      <PageIntro
        title="Analysis"
        description="This MVP analysis view is intentionally backed by the realtime cluster updates already emitted from the backend. It helps you inspect what the stream has surfaced without pretending there are richer incident endpoints yet."
        actions={<Link className="button" to="/logs">Open Live Logs</Link>}
      />
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 16 }}>
        <article className="card">
          <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Tracked Clusters</div>
          <div style={{ fontSize: 30, fontWeight: 700, marginTop: 8 }}>{totalClusters}</div>
        </article>
        <article className="card">
          <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Cluster Events</div>
          <div style={{ fontSize: 30, fontWeight: 700, marginTop: 8 }}>{totalEvents}</div>
        </article>
        <article className="card">
          <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Marked New</div>
          <div style={{ fontSize: 30, fontWeight: 700, marginTop: 8 }}>{newClusters}</div>
        </article>
      </section>
      {rows.length === 0 ? (
        <section className="card">
          <h3 style={{ marginTop: 0 }}>No cluster updates yet</h3>
          <p style={{ margin: "8px 0 0", color: "var(--text-muted)", maxWidth: 720 }}>
            Open a container in Live Logs and keep the websocket stream running. This page fills from realtime
            `CLUSTER_UPDATE` messages, so it stays empty until the backend emits them.
          </p>
        </section>
      ) : (
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
      )}
      <section className="card" style={{ marginTop: 16 }}>
        <h3 style={{ marginTop: 0 }}>Current Backend Scope</h3>
        <p style={{ margin: 0, color: "var(--text-muted)", maxWidth: 760 }}>
          Detailed incident lists and persisted AI diagnosis history are not exposed as frontend-ready REST read
          models yet. For this MVP, the page stays honest and shows the cluster state built from the live stream.
        </p>
      </section>
    </div>
  );
}
