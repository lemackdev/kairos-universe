import { getCollection } from "@/lib/canon/loader";
import type { CanonUniverse, RawAward, RawCompetition, RawStanding } from "@/types/canon";
import type { CompetitionView, PlayerView, PublicationManifest, SourceView, TeamView } from "@/types/catalog";

const known = (value?: string | null) => value && value !== "TBD" ? value : null;

interface RawOrganizer { id: string; name: string }
interface RawSeries { id: string; name: string }
interface RawRuleset { id: string; maps?: string[] }

export function buildCompetitionViews(
  universe: CanonUniverse,
  publication: PublicationManifest,
  teams: TeamView[],
  players: PlayerView[],
  sourceViews: (ids: string[]) => SourceView[],
): CompetitionView[] {
  const records = getCollection<RawCompetition>(universe, "competitions");
  const standings = getCollection<RawStanding>(universe, "standings");
  const awards = getCollection<RawAward>(universe, "awards");
  const organizers = getCollection<RawOrganizer>(universe, "organizers");
  const seriesRecords = getCollection<RawSeries>(universe, "competition-series");
  const rulesets = getCollection<RawRuleset>(universe, "rulesets");
  const byTeam = new Map(teams.map((team) => [team.id, team]));

  return publication.enabledCompetitions.map((id) => {
    const record = records.find((entry) => entry.id === id);
    if (!record || record.canonStatus !== "confirmed") throw new Error(`Tournament is not confirmed: ${id}`);
    const game = (universe.shared.games ?? []).find((entry) => entry.id === record.gameId);
    if (!game || !publication.enabledGames.includes(record.gameId)) throw new Error(`Tournament game is unpublished: ${id}`);
    if (known(record.startDate) && known(record.endDate) && record.endDate! < record.startDate!) {
      throw new Error(`Tournament ends before it starts: ${id}`);
    }
    const participants = (record.participantTeamIds ?? []).map((teamId) => {
      const team = byTeam.get(teamId);
      if (!team || team.gameId !== record.gameId) throw new Error(`Tournament participant is unpublished or uses another game: ${teamId}`);
      return { id: team.id, name: team.name, slug: team.slug };
    });
    const results = standings.filter((entry) => entry.competitionId === id && entry.canonStatus === "confirmed")
      .map((entry) => {
        const team = byTeam.get(entry.teamId);
        if (!team || !participants.some((participant) => participant.id === team.id)) {
          throw new Error(`Result team is not a published participant: ${entry.teamId}`);
        }
        return { id: entry.id, competitionName: record.name, competitionSlug: record.slug,
          teamName: team.name, teamSlug: team.slug, place: entry.position, date: known(record.endDate) };
      });
    const organizerRecord = record.organizerId ? organizers.find((entry) => entry.id === record.organizerId) : null;
    const seriesRecord = record.seriesId ? seriesRecords.find((entry) => entry.id === record.seriesId) : null;
    const mapPool = (record.rulesetIds ?? []).flatMap((id) => {
      const ruleset = rulesets.find((entry) => entry.id === id);
      return ruleset?.maps ?? [];
    });

    return {
      id, slug: record.slug, name: record.name, gameId: record.gameId, gameName: String(game.name),
      status: record.status, overview: known(record.overview), format: record.format ?? [],
      organizer: known(record.organizer), location: known(record.location),
      startDate: known(record.startDate), endDate: known(record.endDate), prizePool: known(record.prizePool),
      participants, results,
      organizerName: organizerRecord?.name ?? null,
      seriesName: seriesRecord?.name ?? null,
      tier: known(record.tier ?? null),
      region: known(record.region ?? null),
      teamsCount: typeof record.teamsCount === "number" ? record.teamsCount : null,
      eventType: known(record.eventType ?? null),
      inviteDate: known(record.inviteDate ?? null),
      rankingDate: known(record.rankingDate ?? null),
      mapPool,
      kairosParticipating: participants.length > 0,
      relatedEvents: record.seriesId
        ? records.filter((other) => other.seriesId === record.seriesId && other.id !== record.id
            && publication.enabledCompetitions.includes(other.id))
          .map((other) => ({ name: other.name, slug: other.slug }))
        : [],
      prizes: (record.prizeDistribution ?? []).map((prize) => {
        const team = prize.teamId && prize.teamId !== "TBD" ? byTeam.get(prize.teamId) : null;
        if (prize.teamId && prize.teamId !== "TBD" && (!team || !participants.some((p) => p.id === team.id))) {
          throw new Error(`Prize recipient is not a published participant: ${prize.teamId}`);
        }
        return { place: prize.place, prize: known(prize.prize), teamName: team?.name ?? null };
      }),
      awards: awards.filter((entry) => entry.competitionId === id && entry.canonStatus === "confirmed")
        .map((award) => {
          const player = players.find((entry) => entry.id === award.recipientId);
          const team = byTeam.get(award.recipientId);
          if (!player && !team) throw new Error(`Award recipient is unpublished: ${award.recipientId}`);
          return { id: award.id, name: award.name, date: known(award.date),
            recipientName: player?.nickname ?? team!.name,
            recipientHref: player ? `/wiki/players/${player.slug}` : `/wiki/teams/${team!.slug}`,
            competitionName: record.name, sources: sourceViews(award.sourceIds) };
        }),
      sources: sourceViews([...record.sourceIds,
        ...standings.filter((entry) => entry.competitionId === id && entry.canonStatus === "confirmed").flatMap((entry) => entry.sourceIds),
        ...awards.filter((entry) => entry.competitionId === id && entry.canonStatus === "confirmed").flatMap((entry) => entry.sourceIds)]),
    };
  });
}
