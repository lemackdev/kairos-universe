import type {
  KairospediaCatalog,
  SearchRecord,
} from "@/types/catalog";

export function buildSearchRecords(
  catalog: KairospediaCatalog,
): SearchRecord[] {
  const records: SearchRecord[] = [];
  const teamById = new Map(catalog.teams.map((team) => [team.id, team]));
  const organizationById = new Map(
    catalog.organizations.map((organization) => [
      organization.id,
      organization,
    ]),
  );

  for (const game of catalog.games) {
    records.push({
      id: game.id,
      slug: game.slug,
      type: "game",
      name: game.name,
      subtitle: "Game",
      href: `/wiki/games/${game.slug}`,
      terms: [game.id, game.slug, game.name],
    });
  }

  for (const organization of catalog.organizations) {
    records.push({
      id: organization.id,
      slug: organization.slug,
      type: "organization",
      name: organization.name,
      subtitle: "Organization",
      href: `/wiki/organizations/${organization.slug}`,
      terms: [
        organization.id,
        organization.slug,
        organization.name,
        organization.shortName,
      ],
    });
  }

  for (const team of catalog.teams) {
    const organization = organizationById.get(team.organizationId);
    records.push({
      id: team.id,
      slug: team.slug,
      type: "team",
      name: team.name,
      subtitle: `${team.gameName} · ${organization?.name ?? team.organizationId}`,
      href: `/wiki/teams/${team.slug}`,
      terms: [
        team.id,
        team.slug,
        team.name,
        team.shortName,
        team.gameName,
        organization?.name ?? "",
      ],
    });
  }

  for (const player of catalog.players) {
    const team = teamById.get(player.currentTeamId);
    records.push({
      id: player.id,
      slug: player.slug,
      type: "player",
      name: player.displayName,
      subtitle: `${player.role} · ${team?.shortName ?? player.currentTeamName}`,
      href: `/wiki/players/${player.slug}`,
      terms: [
        player.id,
        player.slug,
        player.realName,
        player.nickname,
        player.role,
        player.gameName,
        player.currentTeamName,
        ...player.historicalAliases.map((alias) => alias.nickname),
      ],
    });
  }

  for (const person of catalog.staff) {
    records.push({
      id: person.id,
      slug: person.slug,
      type: "staff",
      name: person.displayName,
      subtitle: person.role,
      href: `/wiki/staff/${person.slug}`,
      terms: [
        person.id,
        person.slug,
        person.realName,
        person.nickname ?? "",
        person.role,
        person.division,
      ],
    });
  }

  for (const competition of catalog.competitions) {
    records.push({
      id: competition.id, slug: competition.slug, type: "competition",
      name: competition.name, subtitle: `${competition.gameName} tournament`,
      href: `/wiki/competitions/${competition.slug}`,
      terms: [competition.id, competition.slug, competition.name, competition.gameName],
    });
  }
  return records.sort((a, b) => a.name.localeCompare(b.name));
}

export function searchRecords(
  records: SearchRecord[],
  query: string,
): SearchRecord[] {
  const normalizedQuery = normalizeSearch(query.trim());
  if (!normalizedQuery) return records;

  return records
    .map((record) => {
      const terms = record.terms.map(normalizeSearch);
      const score = Math.max(
        ...terms.map((term, index) => {
          const primary = index <= 2;
          if (term === normalizedQuery) return primary ? 6 : 3;
          if (term.startsWith(normalizedQuery)) return primary ? 5 : 2;
          if (term.includes(normalizedQuery)) return primary ? 4 : 1;
          return 0;
        }),
      );
      return { record, score };
    })
    .filter((result) => result.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score || a.record.name.localeCompare(b.record.name),
    )
    .map((result) => result.record);
}

export function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("en-US");
}
