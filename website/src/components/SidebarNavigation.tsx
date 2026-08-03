import Link from "next/link";

export interface SidebarLink {
  label: string;
  href: string;
}

const defaultLinks: SidebarLink[] = [
  { label: "Start here", href: "/wiki" },
  { label: "League overview", href: "/wiki/games/league-of-legends" },
  { label: "Teams", href: "/wiki/teams" },
  { label: "Players", href: "/wiki/players" },
  { label: "Matches", href: "/wiki/matches" },
  { label: "Competitions", href: "/wiki/competitions" },
  { label: "About the archive", href: "/wiki/about" },
];

export function SidebarNavigation({
  links = defaultLinks,
}: {
  links?: SidebarLink[];
}) {
  return (
    <aside className="sideNav" aria-label="Context navigation">
      <span className="railLabel">Field guide</span>
      <ul>
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href}>{link.label}</Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
