import Link from "next/link";

export function StatTile({
  label,
  value,
  href,
}: {
  label: string;
  value: number | string;
  href?: string;
}) {
  const content = (
    <div className="card" style={{ minWidth: "140px" }}>
      <div
        className="mono"
        style={{ fontSize: "1.7rem", fontWeight: 700, color: "var(--accent-strong)" }}
      >
        {value}
      </div>
      <div style={{ fontSize: "12.5px", color: "var(--text-muted)", marginTop: "0.2rem" }}>
        {label}
      </div>
    </div>
  );
  if (!href) return content;
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      {content}
    </Link>
  );
}
