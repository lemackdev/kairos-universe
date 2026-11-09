import Link from "next/link";
import { CsRoleIcons } from "@/components/CsRoleIcons";
import { RoleIcon } from "@/components/RoleIcon";

import { EpisodeReferenceList } from "@/components/EpisodeReferenceList";
import type { GameView, PlayerView, TeamView } from "@/types/catalog";
import { ArticleInfobox, ArticleSection, WikiArticle, WikiTable } from "./WikiArticle";

const sections = [
  { id: "overview", title: "Overview" },
  { id: "roles", title: "Roles" },
  { id: "teams", title: "Teams" },
  { id: "players", title: "Players" },
  { id: "competitions", title: "Competitions and Matches" },
  { id: "episodes", title: "Relevant Episodes" },
];

export function GameArticle({ game, teams, players, nextMilestone }: {
  game: GameView; teams: TeamView[]; players: PlayerView[]; nextMilestone: string;
}) {
  const officialMatchCount = teams.reduce((count, team) => count + team.officialMatchCount, 0);
  return <WikiArticle title={game.name} kind="Games" game="Kairos Universe" sections={sections}
    infobox={<ArticleInfobox title={game.name} monogram={game.name.slice(0, 2)} groups={[
      { title: "Publication", rows: [
        { label: "Published teams", value: teams.length },
        { label: "Published players", value: players.length },
        { label: "Next milestone", value: nextMilestone },
      ] },
    ]} />}>
    <ArticleSection {...sections[0]!}>
      <p>This game record indexes published Kairos teams and players. The separately labeled <Link href="/wiki/world">pre-Worlds 2026 reference scene</Link> does not alter Kairos canon.</p>
    </ArticleSection>
    <ArticleSection {...sections[1]!}>
      {game.roleVocabulary.length
        ? <ul>{game.roleVocabulary.map((role) => <li key={role}>{role}</li>)}</ul>
        : <p>No published role vocabulary yet.</p>}
    </ArticleSection>
    <ArticleSection {...sections[2]!}>
      <WikiTable caption="Published Kairos teams" columns={["Team", "Level", "Competitive state"]}
        empty="No teams published." rows={teams.map((team) => ({ key: team.id, cells: [
          <Link key="team" href={`/wiki/teams/${team.slug}`}>{team.name}</Link>,
          team.rosterLevel, team.competitiveState,
        ] }))} />
    </ArticleSection>
    <ArticleSection {...sections[3]!}>
      <WikiTable caption="Published Kairos players" columns={["ID", "Name", "Role", "Team"]}
        empty="No players published." rows={players.map((player) => ({ key: player.id, cells: [
          <Link key="player" href={`/wiki/players/${player.slug}`}>{player.nickname}</Link>,
          player.realName, <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}><CsRoleIcons role={game.name === "Counter-Strike 2" ? player.role : null} /><RoleIcon role={game.name === "League of Legends" ? player.role : ""} />{player.role}</span>, player.currentTeamName,
        ] }))} />
    </ArticleSection>
    <ArticleSection {...sections[4]!}>
      <p>Intended competition is not confirmed participation. The next competitive milestone is {nextMilestone}.</p>
      <p>{officialMatchCount === 0 ? "No official matches recorded for the published Kairos teams." : `${officialMatchCount} official team-match records are published.`}</p>
    </ArticleSection>
    <ArticleSection {...sections[5]!}>
      <details><summary>Relevant episodes ({game.latestEpisodes.length})</summary><EpisodeReferenceList episodes={game.latestEpisodes} /></details>
    </ArticleSection>
  </WikiArticle>;
}
