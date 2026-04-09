type Props = { title: string; value: string | number; hint?: string };

export function KpiCard({ title, value, hint }: Props) {
  return (
    <section className="card kpi-card">
      <div style={{ color: "var(--text-muted)", fontSize: 12, letterSpacing: "0.04em", textTransform: "uppercase" }}>{title}</div>
      <div style={{ fontSize: 30, fontWeight: 700, marginTop: 8 }}>{value}</div>
      {hint ? <div style={{ marginTop: 8, color: "var(--text-muted)", fontSize: 12 }}>{hint}</div> : null}
    </section>
  );
}
