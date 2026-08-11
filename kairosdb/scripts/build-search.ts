import fs from "node:fs";
import path from "node:path";

import { generatedRoot } from "../src/lib/canon/paths";
import { foldAccents, type SearchEntry } from "../src/lib/search/search";
import type { KairosOriginalPlayer, KairosOriginalTeam } from "../src/lib/canon/loader";
import type {
  NormalizedOrganization,
  NormalizedPlayer,
  NormalizedStaff,
  NormalizedTeam,
} from "../src/types/external";

interface Catalog {
  kairos: { players: KairosOriginalPlayer[]; team: KairosOriginalTeam };
  external: {
    organizations: NormalizedOrganization[];
    teams: NormalizedTeam[];
    players: NormalizedPlayer[];
    staff: NormalizedStaff[];
  };
}

function keywordsOf(...values: Array<string | null | undefined>): string[] {
  return Array.from(
    new Set(
      values
        .filter((v): v is string => Boolean(v && v.trim().length > 0))
        .map((v) => foldAccents(v)),
    ),
  );
}

function main() {
  const catalogPath = path.join(generatedRoot, "catalog.json");
  const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8")) as Catalog;

  const entries: SearchEntry[] = [];

  for (const player of catalog.kairos.players) {
    entries.push({
      id: player.id,
      kind: "kairos-player",
      label: `${player.realName} "${player.nickname}"`,
      subtitle: `${player.role} — Kairos League of Legends`,
      href: `/players/${player.slug}`,
      keywords: keywordsOf(player.realName, player.nickname, player.slug, player.role),
    });
  }

  entries.push({
    id: catalog.kairos.team.id,
    kind: "kairos-team",
    label: catalog.kairos.team.name,
    subtitle: "Kairos Universe original",
    href: `/teams/${catalog.kairos.team.slug}`,
    keywords: keywordsOf(catalog.kairos.team.name, catalog.kairos.team.shortName, catalog.kairos.team.slug),
  });

  for (const org of catalog.external.organizations) {
    entries.push({
      id: org.id,
      kind: "organization",
      label: org.name,
      subtitle: org.region ? `Organization — ${org.region}` : "Organization",
      href: `/organizations/${org.slug}`,
      keywords: keywordsOf(org.name, org.shortName, org.slug),
    });
  }

  for (const team of catalog.external.teams) {
    entries.push({
      id: team.id,
      kind: "external-team",
      label: team.name,
      subtitle: team.region ? `Team — ${team.region}` : "Team",
      href: `/teams/${team.slug}`,
      keywords: keywordsOf(
        team.name,
        team.shortName,
        team.slug,
        team.leaguepediaOverviewPage,
        team.region,
      ),
    });
  }

  for (const player of catalog.external.players) {
    entries.push({
      id: player.id,
      kind: "external-player",
      label: player.nickname,
      subtitle: player.primaryRole ? `Player — ${player.primaryRole}` : "Player",
      href: `/players/${player.slug}`,
      keywords: keywordsOf(
        player.nickname,
        player.legalName,
        player.fullName,
        player.slug,
        player.leaguepediaPage,
        player.primaryRole,
        ...player.aliases,
      ),
    });
  }

  for (const staff of catalog.external.staff) {
    entries.push({
      id: staff.id,
      kind: "staff",
      label: staff.nickname,
      subtitle: "Staff",
      href: `/staff/${staff.slug}`,
      keywords: keywordsOf(
        staff.nickname,
        staff.legalName,
        staff.fullName,
        staff.slug,
        staff.leaguepediaPage,
        ...staff.aliases,
      ),
    });
  }

  fs.writeFileSync(
    path.join(generatedRoot, "search-index.json"),
    JSON.stringify(entries, null, 2),
    "utf8",
  );

  console.log(`Built KairosDB search index with ${entries.length} entries.`);
}

main();
