import Link from "next/link";

const LINKS = [
  { href: "/organizations", label: "Organizations" },
  { href: "/teams", label: "Teams" },
  { href: "/players", label: "Players" },
  { href: "/staff", label: "Staff" },
  { href: "/transfers", label: "Transfers" },
  { href: "/competitions", label: "Competitions" },
  { href: "/matches", label: "Matches" },
  { href: "/regions", label: "Regions" },
  { href: "/snapshot", label: "Snapshot" },
];

export function TopNavigation() {
  return (
    <header
      style={{
        borderBottom: "1px solid var(--border)",
        background: "var(--surface)",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1.5rem",
          padding: "0.85rem 1.5rem",
          flexWrap: "wrap",
        }}
      >
        <Link
          href="/"
          className="mono"
          style={{ fontWeight: 700, fontSize: "1.05rem", color: "var(--accent-strong)" }}
        >
          KairosDB
        </Link>
        <nav
          aria-label="Primary"
          style={{ display: "flex", gap: "1.1rem", flexWrap: "wrap", fontSize: "13.5px" }}
        >
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} style={{ color: "var(--text-muted)" }}>
              {link.label}
            </Link>
          ))}
        </nav>
        <form
          action="/search"
          role="search"
          style={{ marginLeft: "auto", display: "flex" }}
        >
          <input
            type="search"
            name="q"
            placeholder="Search KairosDB…"
            aria-label="Search KairosDB"
            style={{
              background: "var(--surface-raised)",
              border: "1px solid var(--border-strong)",
              borderRadius: "var(--radius)",
              color: "var(--text)",
              padding: "0.4rem 0.7rem",
              fontSize: "13.5px",
              minWidth: "200px",
            }}
          />
        </form>
      </div>
    </header>
  );
}
