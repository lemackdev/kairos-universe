import Link from "next/link";
import Image from "next/image";

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
      <Link className="wordmark" href="/wiki" aria-label="Kairospedia home">
        <Image src="/kairospedia-logo.svg" alt="Kairospedia" width={80} height={64} priority />
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
