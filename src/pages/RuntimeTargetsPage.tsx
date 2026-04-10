import { Link } from "react-router-dom";
import { useRuntimeTargets } from "@entities/runtime-target/api";
import { useI18n } from "@shared/i18n/useI18n";
import { PageIntro } from "@shared/ui/PageIntro";

function statusTone(status: string) {
  if (status === "UP") return "var(--ok)";
  if (status === "DOWN") return "var(--danger)";
  return "var(--warn)";
}

export function RuntimeTargetsPage() {
  const { t } = useI18n();
  const { data, isLoading, error } = useRuntimeTargets();

  return (
    <div>
      <PageIntro
        title={t("containers.title")}
        description="A unified list of Docker containers and local services the backend can observe right now."
      />
      <section className="card">
        <div style={{ marginBottom: 14, color: "var(--text-muted)", maxWidth: 760 }}>
          Use this page as the main runtime target chooser. Docker and configured local services meet here before the investigation continues in live logs.
        </div>
        {isLoading ? <div>{t("common.loadingContainers")}</div> : null}
        {error ? <div style={{ color: "var(--danger)" }}>{t("common.failedContainers")}</div> : null}
        {!isLoading && !error && (data?.length ?? 0) === 0 ? (
          <div className="empty-state">The backend does not currently see Docker targets or configured local services.</div>
        ) : null}
        <table className="table">
          <thead>
            <tr>
              <th>{t("containers.name")}</th>
              <th>Type</th>
              <th>Log Source</th>
              <th>{t("containers.status")}</th>
              <th>Endpoint</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((target) => (
              <tr key={target.id}>
                <td>{target.name}</td>
                <td><span className="badge">{target.type}</span></td>
                <td>{target.logSourceType}</td>
                <td>
                  <span className="badge" style={{ borderColor: statusTone(target.status), color: statusTone(target.status) }}>
                    {target.status}
                  </span>
                </td>
                <td>{target.host && target.port ? `${target.host}:${target.port}` : "—"}</td>
                <td>
                  <Link className="button" to={`/logs?runtimeTargetId=${encodeURIComponent(target.id)}`}>
                    {t("containers.action")}
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
