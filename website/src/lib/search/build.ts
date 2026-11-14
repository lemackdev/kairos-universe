import type {
  KairospediaCatalog,
  SearchRecord,
} from "@/types/catalog";
import { nationalityCountries } from "@/lib/nationalities";
import { articleTypeLabels, formatLongDate } from "@/lib/publications/labels";
import { assetUrl, findBrandLogo, readPublishedBranding, readPublishedPortraits } from "../../../../shared/branding";

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
  const portraitIds = new Set(readPublishedPortraits().map((portrait) => portrait.playerId));
  const branding = readPublishedBranding();
  const teamLogoUrl = (organizationId: string, teamId: string) => {
    const asset = findBrandLogo(branding, organizationId, teamId);
    return asset ? assetUrl(asset) : null;
  };

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
    const nameParts = player.realName.trim().split(/\s+/);
    const firstName = nameParts[0] ?? player.realName;
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
    const flag = player.nationality ? nationalityCountries[player.nationality] : undefined;
    records.push({
      id: player.id,
      slug: player.slug,
      type: "player",
      name: lastName ? `${firstName} "${player.nickname}" ${lastName}` : `${firstName} "${player.nickname}"`,
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
      portraitUrl: portraitIds.has(player.id) ? `/portraits/${player.id}.png` : null,
      flagCode: flag?.code ?? null,
      flagLabel: flag?.country ?? player.nationality ?? null,
      playingFor: team?.shortName ?? (player.currentTeamName !== "TBD" ? player.currentTeamName : null),
      teamLogoUrl: team ? teamLogoUrl(team.organizationId, team.id) : null,
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
  for (const article of catalog.publications?.articles ?? []) {
    records.push({
      id: article.id,
      slug: article.slug,
      type: "publication",
      name: article.title,
      subtitle: `${article.publisherName} · ${articleTypeLabels[article.articleType]} · ${formatLongDate(article.publicationDate)}`,
      href: `/wiki/publications/${article.slug}`,
      terms: [
        article.title,
        article.id,
        article.slug,
        article.publisherName,
        article.bylineText,
        article.summary,
        ...article.tags,
        ...article.entities.map((entity) => entity.label),
      ],
    });
  }
  return records.sort((a, b) => a.name.localeCompare(b.name));
}
