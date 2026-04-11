import { FormEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  useCreateRuntimeTarget,
  useDeleteRuntimeTarget,
  useRuntimeTargets,
  useUpdateRuntimeTarget
} from "@entities/runtime-target/api";
import type { RuntimeTargetDto, UpsertRuntimeTargetRequest } from "@entities/runtime-target/types";
import { useI18n } from "@shared/i18n/useI18n";
import { PageIntro } from "@shared/ui/PageIntro";

function statusTone(status: string) {
  if (status === "UP") return "var(--ok)";
  if (status === "DOWN") return "var(--danger)";
  return "var(--warn)";
}

const emptyForm: UpsertRuntimeTargetRequest = {
  name: "",
  host: "localhost",
  port: 8080,
  healthUrl: "",
  logSourceType: "FILE_TAIL",
  logSourceRef: "",
  enabled: true
};

function toFormValue(target: RuntimeTargetDto): UpsertRuntimeTargetRequest {
  return {
    name: target.name,
    host: target.host ?? "localhost",
    port: target.port ?? 8080,
    healthUrl: target.healthUrl ?? "",
    logSourceType: target.logSourceType === "HTTP_INGEST" ? "HTTP_INGEST" : "FILE_TAIL",
    logSourceRef: target.logSourceRef ?? "",
    enabled: true
  };
}

export function RuntimeTargetsPage() {
  const { t } = useI18n();
  const { data, isLoading, error } = useRuntimeTargets();
  const createMutation = useCreateRuntimeTarget();
  const updateMutation = useUpdateRuntimeTarget();
  const deleteMutation = useDeleteRuntimeTarget();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTargetId, setEditingTargetId] = useState<string | null>(null);
  const [form, setForm] = useState<UpsertRuntimeTargetRequest>(emptyForm);
  const [formError, setFormError] = useState("");

  const localTargets = useMemo(
    () => (data ?? []).filter((target) => target.type === "LOCAL_SERVICE"),
    [data]
  );

  function openCreateForm() {
    setEditingTargetId(null);
    setForm(emptyForm);
    setFormError("");
    setIsFormOpen(true);
  }

  function openEditForm(target: RuntimeTargetDto) {
    setEditingTargetId(target.id);
    setForm(toFormValue(target));
    setFormError("");
    setIsFormOpen(true);
  }

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim() || !form.host.trim() || !form.healthUrl.trim() || !form.logSourceRef.trim()) {
      setFormError("Fill in all local service fields before saving.");
      return;
    }

    setFormError("");

    if (editingTargetId) {
      await updateMutation.mutateAsync({ id: editingTargetId, payload: form });
    } else {
      await createMutation.mutateAsync(form);
    }

    setIsFormOpen(false);
    setEditingTargetId(null);
    setForm(emptyForm);
  }

  async function removeTarget(target: RuntimeTargetDto) {
    await deleteMutation.mutateAsync(target.id);
  }

  return (
    <div>
      <PageIntro
        title={t("containers.title")}
        description="A unified list of Docker containers and local services the backend can observe right now."
        actions={<button className="button" onClick={openCreateForm}>Add local service</button>}
      />
      {isFormOpen ? (
        <section className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", marginBottom: 14 }}>
            <div>
              <h3 style={{ margin: 0 }}>{editingTargetId ? "Edit local service" : "Add local service"}</h3>
              <div style={{ color: "var(--text-muted)", marginTop: 6 }}>
                Register a local service so it appears next to Docker targets and can stream logs through the same product flow.
              </div>
            </div>
            <button className="button secondary" onClick={() => setIsFormOpen(false)}>Cancel</button>
          </div>
          <form onSubmit={submitForm} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            <label className="field">
              <span>Name</span>
              <input className="input" value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} />
            </label>
            <label className="field">
              <span>Host</span>
              <input className="input" value={form.host} onChange={(e) => setForm((current) => ({ ...current, host: e.target.value }))} />
            </label>
            <label className="field">
              <span>Port</span>
              <input className="input" type="number" value={form.port} onChange={(e) => setForm((current) => ({ ...current, port: Number(e.target.value) || 0 }))} />
            </label>
            <label className="field">
              <span>Health URL</span>
              <input className="input" value={form.healthUrl} onChange={(e) => setForm((current) => ({ ...current, healthUrl: e.target.value }))} />
            </label>
            <label className="field">
              <span>Log source</span>
              <select className="select" value={form.logSourceType} onChange={(e) => setForm((current) => ({ ...current, logSourceType: e.target.value as UpsertRuntimeTargetRequest["logSourceType"] }))}>
                <option value="FILE_TAIL">FILE_TAIL</option>
                <option value="HTTP_INGEST">HTTP_INGEST</option>
              </select>
            </label>
            <label className="field">
              <span>Log reference</span>
              <input className="input" value={form.logSourceRef} onChange={(e) => setForm((current) => ({ ...current, logSourceRef: e.target.value }))} />
            </label>
            <label className="field" style={{ justifyContent: "end" }}>
              <span>Enabled</span>
              <input type="checkbox" checked={form.enabled} onChange={(e) => setForm((current) => ({ ...current, enabled: e.target.checked }))} />
            </label>
            <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
              <div style={{ color: "var(--danger)" }}>{formError}</div>
              <button className="button" type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingTargetId ? "Save changes" : "Save local service"}
              </button>
            </div>
          </form>
        </section>
      ) : null}
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
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
                    <Link className="button" to={`/logs?runtimeTargetId=${encodeURIComponent(target.id)}`}>
                      {t("containers.action")}
                    </Link>
                    {target.type === "LOCAL_SERVICE" ? (
                      <>
                        <button className="button secondary" onClick={() => openEditForm(target)}>Edit</button>
                        <button className="button secondary" onClick={() => void removeTarget(target)} disabled={deleteMutation.isPending}>Delete</button>
                      </>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      {localTargets.length > 0 ? (
        <section className="card" style={{ marginTop: 16 }}>
          <h3 style={{ marginTop: 0, marginBottom: 10 }}>Local services</h3>
          <div style={{ color: "var(--text-muted)" }}>
            {localTargets.length} configured local service{localTargets.length > 1 ? "s" : ""} can now share the same live-log and investigation flow as Docker targets.
          </div>
        </section>
      ) : null}
    </div>
  );
}
