import { notFound } from "next/navigation";
import { TournamentArticle } from "@/components/articles/TournamentArticle";
import { getCatalog } from "@/lib/canon/server";
import { csExternalTeams, csOrganizationSlugOf, csRoleOf, fieldCaptionFor, findTier2Team, groupStageFor, groupStandings, playoffsFor, nationalitiesOf, regionCodeOfLeague, regionalCompetitionSlugs, regionalFieldFor, rosterLeague, rosterSets } from "@/lib/external/worldState2027";
import { buildLeagueSchedule } from "@/lib/leagueSchedule";
import { buildTbdPattern, patternTeamCounts } from "@/lib/tournamentPattern";
import { externalLogoPath } from "@/lib/externalLogos";
import { BrandLogo } from "@/components/UniformPanel";
import { competitionLogo } from "@/lib/competitionLogos";
import { tier2LogoOrgSlug } from "@/lib/tier2Logos";
import { flagCountryFor } from "@/lib/nationalities";
import type { CompetitionParticipant, CompetitionRosterPlayer } from "@/components/articles/CompetitionParticipants";

function orgLogo(organizationSlug: string, teamName: string) {
  const path = externalLogoPath(organizationSlug);
  return path ? <img src={path} alt={`${teamName} logo`} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} /> : undefined;
}

export function generateStaticParams() {
  return getCatalog().competitions.map((competition) => ({ slug: competition.slug }));
}
export default async function TournamentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const catalog = getCatalog();
  const tournament = catalog.competitions.find((entry) => entry.slug === slug);
  if (!tournament) notFound();
  const worldState = catalog.worldState2027;
  const lineups = rosterSets(worldState);
  const addedPlayers = new Map(lineups.flatMap((set) => set.addedPlayers).map((player) => [player.playerId, player]));
  const scenePlayers = new Map((catalog.externalScene?.players ?? []).map((player) => [player.id, player]));
  const csTeams = csExternalTeams(worldState);
  const csPlayers = new Map((worldState?.csExternalRosters.players ?? []).map((player) => [player.playerId, player]));
  const rosterFor = (teamId: string): CompetitionRosterPlayer[] => {
    const csTeam = csTeams.find((team) => team.teamId === teamId);
    if (csTeam && worldState) return csTeam.starters.map((starter) => {
      const csPlayer = csPlayers.get(starter.playerId);
      const canonPlayer = catalog.players.find((player) => player.id === starter.playerId);
      const nationality = csPlayer?.nationality ?? canonPlayer?.nationality ?? nationalitiesOf(worldState, starter.playerId, "")[0] ?? null;
      const flag = nationality ? flagCountryFor(nationality) : undefined;
      return { name: starter.nickname, href: csPlayer ? `/wiki/players/${csPlayer.slug}` : canonPlayer ? `/wiki/players/${canonPlayer.slug}` : null, nationality, flagCode: flag?.code ?? null, role: csRoleOf(worldState, starter.playerId) };
    });

    const lineupSet = lineups.find((set) => set.teams.some((team) => team.teamId === teamId));
    const lineup = lineupSet?.teams.find((team) => team.teamId === teamId);
    if (lineup && lineupSet && worldState) return lineup.starters.map((starter) => {
      const added = addedPlayers.get(starter.playerId);
      const scenePlayer = scenePlayers.get(starter.playerId);
      const canonPlayer = catalog.players.find((player) => player.id === starter.playerId);
      const nationalities = nationalitiesOf(worldState, starter.playerId, rosterLeague(lineupSet), added?.nationality);
      const nationality = nationalities[0] ?? canonPlayer?.nationality ?? null;
      const flag = nationality ? flagCountryFor(nationality) : undefined;
      const playerSlug = added?.slug ?? scenePlayer?.slug ?? canonPlayer?.slug;
      return { name: starter.nickname, href: playerSlug ? `/wiki/players/${playerSlug}` : null, nationality, flagCode: flag?.code ?? null, role: starter.role };
    });

    const canonTeam = catalog.teams.find((team) => team.id === teamId);
    if (canonTeam) return canonTeam.roster.filter((player) => player.rosterStatus === "active").map((player) => {
      const nationality = player.nationality ?? player.nationalities?.[0] ?? null;
      const flag = nationality ? flagCountryFor(nationality) : undefined;
      const role = player.role.toLowerCase();
      if (canonTeam.gameName === "Counter-Strike") {
        const csRole = role.includes("awp") ? (role.includes("igl") ? "IGL / AWPer" : "AWPer") : role.includes("igl") ? "IGL / Rifler" : "Rifler";
        return { name: player.nickname, href: `/wiki/players/${player.slug}`, nationality, flagCode: flag?.code ?? null, role: csRole };
      }
      const roleIcon = role.includes("top") ? "top" : role.includes("jungle") ? "jungle" : role.includes("mid") ? "mid" : role.includes("bot") || role.includes("adc") ? "bot" : role.includes("support") ? "support" : null;
      return { name: player.nickname, href: `/wiki/players/${player.slug}`, nationality, flagCode: flag?.code ?? null, role: roleIcon };
    });
    return [];
  };
  const field = regionalFieldFor(catalog.worldState2027, slug);
  const regionalField2027: CompetitionParticipant[] | undefined = field?.map((team, index) => {
    const canonTeam = catalog.teams.find((entry) => entry.id === team.teamId);
    const externalTeam = catalog.externalScene?.teams.find((entry) => entry.id === team.teamId);
    const tier2Team = findTier2Team(catalog.worldState2027, team.teamId);
    const tier2Slug = tier2Team ? tier2LogoOrgSlug(catalog.externalScene, tier2Team) : null;
    const csTeam = csExternalTeams(catalog.worldState2027).find((entry) => entry.teamId === team.teamId);
    const href = canonTeam ? `/wiki/teams/${canonTeam.slug}` : externalTeam ? `/wiki/teams/${externalTeam.slug}` : csTeam ? `/wiki/teams/${csTeam.slug}` : team.teamId.startsWith("tier2-") ? `/wiki/teams/${team.teamId}` : null;
    const logo = canonTeam ? <BrandLogo organizationId={canonTeam.organizationId} width={56} />
      : externalTeam ? (() => {
        const org = catalog.externalScene?.organizations.find((entry) => entry.id === externalTeam.organizationId);
        return org ? orgLogo(org.slug, team.name) : undefined;
      })() : tier2Slug ? orgLogo(tier2Slug, team.name)
      : csTeam && catalog.worldState2027 ? (() => {
        return orgLogo(csOrganizationSlugOf(catalog.worldState2027!, csTeam), team.name);
      })() : undefined;
    const regionalExternalLogo = team.teamId === "external-lol-team-leviatan" || team.teamId === "external-lol-team-los"
      ? orgLogo(team.teamId === "external-lol-team-leviatan" ? "external-leviatan" : "external-los", team.name)
      : undefined;
    const logoTone = ["external-fluxo-w7m", "external-furia", "external-team-liquid"].includes(externalTeam?.slug ?? "")
      ? "dark" as const
      : undefined;
    return { key: `${team.teamId}-${index}`, name: team.name, href, logo: logo ?? regionalExternalLogo, logoTone, roster: rosterFor(team.teamId) };
  });
  const participantRosters = Object.fromEntries(tournament.participants.map((team) => [team.id, rosterFor(team.id)]));
  const isLeague = slug in regionalCompetitionSlugs;
  const leagueResults = isLeague && regionalField2027?.length && tournament.startDate && tournament.endDate ? (() => {
    const blackouts = catalog.competitions
      .filter((entry) => entry.gameName === "League of Legends" && !(entry.slug in regionalCompetitionSlugs) && entry.startDate && entry.endDate)
      .map((entry) => ({ start: entry.startDate!, end: entry.endDate! }));
    const teams = regionalField2027.map((team) => ({ key: team.key, name: team.name, href: team.href, logo: team.logo }));
    return { teams, weeks: buildLeagueSchedule(teams, tournament.startDate, tournament.endDate, blackouts) };
  })() : undefined;
  const drawn = groupStageFor(worldState, slug);
  const groupStage = drawn && regionalField2027 ? (() => {
    const teamOf = (teamId: string) => {
      const team = regionalField2027[(field ?? []).findIndex((entry) => entry.teamId === teamId)]!;
      return { key: team.key, name: team.name, href: team.href, logo: team.logo };
    };
    return {
      format: drawn.format, advancing: drawn.advancing,
      groups: drawn.groups.map((group) => ({
        name: group.name,
        teams: groupStandings(group, (teamId) => teamOf(teamId).name).map((row) => ({ ...teamOf(row.teamId), wins: row.wins, losses: row.losses, maps: row.maps, roundsWon: row.roundsWon, roundsLost: row.roundsLost, roundDiff: row.roundDiff })),
        matches: (group.matches ?? []).map((match) => ({ round: match.round, key: `${match.teamAId}-${match.teamBId}`, teamA: teamOf(match.teamAId), teamB: teamOf(match.teamBId), format: match.format, mapsA: match.mapsA, mapsB: match.mapsB })),
      })),
    };
  })() : undefined;
  const bracket = playoffsFor(worldState, slug);
  const playoffs = bracket && regionalField2027 ? {
    title: bracket.name,
    rounds: bracket.rounds.map((round) => ({ name: round.name, matchFormat: round.matchFormat, matches: round.matches.map((match) => {
      const slot = (teamId: string | null) => {
        if (!teamId) return null;
        const team = regionalField2027[(field ?? []).findIndex((entry) => entry.teamId === teamId)]!;
        return { key: team.key, name: team.name, href: team.href, logo: team.logo };
      };
      return { teamA: slot(match.teamAId), teamB: slot(match.teamBId) };
    }) })),
  } : undefined;
  const tbdPattern = !drawn && tournament.gameName === "Counter-Strike" && tournament.teamsCount !== null && (patternTeamCounts as readonly number[]).includes(tournament.teamsCount) ? buildTbdPattern(tournament.teamsCount) : null;
  return <TournamentArticle playoffs={playoffs ?? tbdPattern?.playoffs} groupStage={groupStage ?? tbdPattern?.groupStage} leagueResults={leagueResults} tournament={tournament} regionalField2027={regionalField2027} participantRosters={participantRosters} fieldCaption={fieldCaptionFor(worldState, slug)} logo={competitionLogo(slug, tournament.name)} />;
}


