import { Link } from "react-router-dom";
import { useContainers } from "@entities/container/api";
import { PageIntro } from "@shared/ui/PageIntro";
import { fmtDate } from "@shared/lib/time";

export function ContainersPage() {
  const { data, isLoading, error } = useContainers();

  return (
    <div>
      <PageIntro
        title="Containers"
        description="Choose the running service you want to inspect. This page is the handoff point into the live log stream."
      />
      <section className="card">
        <div style={{ marginBottom: 14, color: "var(--text-muted)", maxWidth: 760 }}>
          If a service is visible here, the backend can already stream its logs. Use this page as the investigation handoff instead of treating it like a passive inventory table.
        </div>
        {isLoading ? <div>Loading containers...</div> : null}
        {error ? <div style={{ color: "var(--danger)" }}>Failed to load containers.</div> : null}
        {!isLoading && !error && (data?.length ?? 0) === 0 ? (
          <div className="empty-state">No matching containers are visible from the backend right now. This usually means Docker is quiet, the backend cannot see your services, or you need to start the target project first.</div>
        ) : null}
        <table className="table">
          <thead>
            <tr><th>Name</th><th>Image</th><th>Status</th><th>Created</th><th></th></tr>
          </thead>
          <tbody>
            {(data ?? []).map((c) => (
              <tr key={c.containerId}>
                <td>{c.name}</td>
                <td>{c.image}</td>
                <td><span className="badge" style={{ borderColor: c.status.toLowerCase().includes("up") || c.status.toLowerCase().includes("running") ? "var(--ok)" : "var(--warn)" }}>{c.status}</span></td>
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
