import Link from "next/link";
import Image from "next/image";

import type { SearchRecord } from "@/types/catalog";
import { NavMenu } from "./NavMenu";
import { NavSearch } from "./NavSearch";

const links = [
  ["Games", "/wiki/games"],
  ["Organizations", "/wiki/organizations"],
  ["Teams", "/wiki/teams"],
  ["Players", "/wiki/players"],
  ["Calendar", "/wiki/calendar"],
  ["Competitions", "/wiki/competitions"],
  ["Publications", "/wiki/publications"],
  ["Campus", "/wiki/campus"],
  ["Matches", "/wiki/matches"],
  ["Transfers", "/wiki/transfers"],
  ["Ranking", "/wiki/rankings/counter-strike"],
  ["Kairoswitter", "/wiki/kairoswitter"],
] as const;

export function TopNavigation({ searchRecords }: { searchRecords: SearchRecord[] }) {
  return (
    <nav className="topNav" aria-label="Primary navigation">
      <Link className="wordmark" href="/wiki" aria-label="Kairospedia home">
        <Image src="/kairospedia-logo.svg" alt="" width={48} height={48} priority />
        <span className="wordmarkType" aria-hidden="true">
          <span className="wordmarkName">Kairospedia</span>
          <span className="wordmarkDescriptor">The esports encyclopedia</span>
        </span>
      </Link>
      <NavMenu links={links} />
      <NavSearch records={searchRecords} />
    </nav>
  );
}
