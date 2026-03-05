type Props = { title: string; value: string | number; hint?: string };

export function KpiCard({ title, value, hint }: Props) {
  return (
    <section className="card">
      <div style={{ color: "var(--text-muted)", fontSize: 13 }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>{value}</div>
      {hint ? <div style={{ marginTop: 8, color: "var(--text-muted)", fontSize: 12 }}>{hint}</div> : null}
    </section>
  );
}
