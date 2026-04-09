import { Link } from "react-router-dom";
import { useContainers } from "@entities/container/api";
import { useI18n } from "@shared/i18n/useI18n";
import { PageIntro } from "@shared/ui/PageIntro";
import { fmtDate } from "@shared/lib/time";

export function ContainersPage() {
  const { t } = useI18n();
  const { data, isLoading, error } = useContainers();

  return (
    <div>
      <PageIntro
        title={t("containers.title")}
        description={t("containers.description")}
      />
      <section className="card">
        <div style={{ marginBottom: 14, color: "var(--text-muted)", maxWidth: 760 }}>
          {t("containers.helper")}
        </div>
        {isLoading ? <div>{t("common.loadingContainers")}</div> : null}
        {error ? <div style={{ color: "var(--danger)" }}>{t("common.failedContainers")}</div> : null}
        {!isLoading && !error && (data?.length ?? 0) === 0 ? (
          <div className="empty-state">{t("containers.empty")}</div>
        ) : null}
        <table className="table">
          <thead>
            <tr><th>{t("containers.name")}</th><th>{t("containers.image")}</th><th>{t("containers.status")}</th><th>{t("containers.created")}</th><th></th></tr>
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
