export function PageHeader({
  title,
  subtitle,
  meta,
}: {
  title: string;
  subtitle?: string;
  meta?: React.ReactNode;
}) {
  return (
    <div style={{ padding: "2rem 0 1.5rem", borderBottom: "1px solid var(--border)" }}>
      <div className="container">
        <h1 style={{ fontSize: "1.6rem" }}>{title}</h1>
        {subtitle ? (
          <p style={{ color: "var(--text-muted)", margin: "0.25rem 0 0" }}>{subtitle}</p>
        ) : null}
        {meta ? <div style={{ marginTop: "0.75rem" }}>{meta}</div> : null}
      </div>
    </div>
  );
}
