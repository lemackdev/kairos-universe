export function EmptyState({
  title,
  detail,
}: {
  title: string;
  detail?: string;
}) {
  return (
    <div className="empty-state">
      <p style={{ margin: 0, fontWeight: 600, color: "var(--text)" }}>{title}</p>
      {detail ? (
        <p style={{ margin: "0.4rem 0 0", fontSize: "13.5px" }}>{detail}</p>
      ) : null}
    </div>
  );
}
