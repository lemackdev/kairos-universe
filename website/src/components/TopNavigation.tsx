import Link from "next/link";

const links = [
  ["Games", "/wiki/games"],
  ["Organizations", "/wiki/organizations"],
  ["Teams", "/wiki/teams"],
  ["Players", "/wiki/players"],
  ["Competitions", "/wiki/competitions"],
  ["Matches", "/wiki/matches"],
  ["Transfers", "/wiki/transfers"],
  ["Search", "/wiki/search"],
] as const;

export function TopNavigation() {
  return (
    <nav className="topNav" aria-label="Primary navigation">
      <Link className="wordmark" href="/wiki">
        <span className="wordmarkMark" aria-hidden="true">
          K
        </span>
        <span className="wordmarkText">Kairospedia</span>
      </Link>
      <div className="topNavLinks">
        {links.map(([label, href]) => (
          <Link key={href} href={href}>
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
