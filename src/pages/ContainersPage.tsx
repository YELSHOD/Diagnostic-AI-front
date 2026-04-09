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
        {isLoading ? <div>Loading containers...</div> : null}
        {error ? <div style={{ color: "var(--danger)" }}>Failed to load containers.</div> : null}
        {!isLoading && !error && (data?.length ?? 0) === 0 ? (
          <div>No matching containers are visible from the backend right now.</div>
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
