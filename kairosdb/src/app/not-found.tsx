import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container" style={{ padding: "3rem 1.5rem" }}>
      <h1>Not found</h1>
      <p style={{ color: "var(--text-muted)" }}>
        This page doesn&apos;t exist in KairosDB.
      </p>
      <Link href="/" style={{ color: "var(--accent)" }}>
        Return to KairosDB home
      </Link>
    </div>
  );
}
