import { Link } from "react-router-dom";
import { useContainers } from "@entities/container/api";
import { fmtDate } from "@shared/lib/time";

export function ContainersPage() {
  const { data, isLoading, error } = useContainers();

  return (
    <div>
      <div className="topbar"><h1 style={{ margin: 0 }}>Containers</h1></div>
      <section className="card">
        {isLoading ? <div>Loading containers...</div> : null}
        {error ? <div style={{ color: "var(--danger)" }}>Failed to load containers.</div> : null}
        <table className="table">
          <thead>
            <tr><th>Name</th><th>Image</th><th>Status</th><th>Created</th><th></th></tr>
          </thead>
          <tbody>
            {(data ?? []).map((c) => (
              <tr key={c.containerId}>
                <td>{c.name}</td>
                <td>{c.image}</td>
                <td><span className="badge">{c.status}</span></td>
                <td>{fmtDate(c.created)}</td>
                <td>
                  <Link className="button" to={`/logs?containerId=${encodeURIComponent(c.containerId)}`}>
                    Open Live Logs
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
