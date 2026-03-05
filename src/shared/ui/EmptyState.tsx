export function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="card" style={{ textAlign: "center", padding: "32px 16px" }}>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      <div style={{ color: "var(--text-muted)" }}>{subtitle}</div>
    </div>
  );
}
