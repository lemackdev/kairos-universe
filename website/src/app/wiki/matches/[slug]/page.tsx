import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import { ProvenanceBadge } from "@/components/matches/ProvenanceBadge";
import { getCatalog } from "@/lib/canon/server";
import { formatDate } from "@/lib/formatting/date";
import { CsRoleIcons } from "@/components/CsRoleIcons";
import { RoleIcon } from "@/components/RoleIcon";
import type { MatchView } from "@/types/catalog";

export function generateStaticParams() {
  const catalog = getCatalog();
  return (catalog.matches ?? []).map((match) => ({ slug: match.slug }));
}

function playerHref(catalog: ReturnType<typeof getCatalog>, playerId: string | null): string | null {
  if (!playerId) return null;
  const player = catalog.players.find((p) => p.id === playerId);
  return player ? `/wiki/players/${player.slug}` : null;
}

function teamHref(catalog: ReturnType<typeof getCatalog>, teamId: string): string | null {
  const team = catalog.teams.find((t) => t.id === teamId);
  return team ? `/wiki/teams/${team.slug}` : null;
}

function PlayerCell({
  catalog,
  playerId,
  displayName,
}: {
  catalog: ReturnType<typeof getCatalog>;
  playerId: string | null;
  displayName: string;
}) {
  const href = playerHref(catalog, playerId);
  return href ? <Link href={href}>{displayName}</Link> : <>{displayName}</>;
}

type CsPlayerStat = {
  playerId: string;
  displayName: string;
  team: string;
  kills: number;
  deaths: number;
  assists: number;
  adr: number;
  rating: number;
  ratingLabel?: string;
};

type CsGame = {
  number: number;
  map: string;
  mainRounds: number;
  academyRounds: number;
  winnerTeamId: string;
  provenance: string;
  provenanceNote?: string;
  players: CsPlayerStat[];
};

function CsSeriesDetail({
  catalog,
  games,
  seriesAggregate,
}: {
  catalog: ReturnType<typeof getCatalog>;
  games: CsGame[];
  seriesAggregate: CsPlayerStat[];
}) {
  return (
    <>
      <nav aria-label="Maps in this series" className="contentSection" style={{ paddingBottom: 0 }}>
        <h2 className="sectionKicker">Jump to map</h2>
        <ul style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", listStyle: "none", padding: 0 }}>
          {games.map((g) => (
            <li key={g.number}>
              <a href={`#game-${g.number}`}>{g.number}. {g.map}</a>
            </li>
          ))}
          <li><a href="#series-aggregate">Series aggregate</a></li>
        </ul>
      </nav>
      {games.map((g) => (
        <section className="contentSection" id={`game-${g.number}`} key={g.number}>
          <h2 className="sectionKicker">
            Map {g.number} &middot; {g.map} &middot; Main {g.mainRounds}–{g.academyRounds} Academy{" "}
            <ProvenanceBadge provenance={g.provenance} />
          </h2>
          {g.provenanceNote && <p className="muted">{g.provenanceNote}</p>}
          <div className="tableWrap">
            <table className="dataTable">
              <caption className="srOnly">Map {g.number} box score</caption>
              <thead>
                <tr>
                  <th scope="col">Team</th>
                  <th scope="col">Player</th>
                  <th scope="col">K/D/A</th>
                  <th scope="col">ADR</th>
                  <th scope="col">Rating*</th>
                </tr>
              </thead>
              <tbody>
                {g.players.map((p) => (
                  <tr key={p.playerId}>
                    <td data-label="Team">{teamHref(catalog, p.team) ? <Link href={teamHref(catalog, p.team)!}>{catalog.teams.find((t) => t.id === p.team)?.name}</Link> : p.team}</td>
                    <td data-label="Player"><PlayerCell catalog={catalog} playerId={p.playerId} displayName={p.displayName} /></td>
                    <td data-label="K/D/A">{p.kills}/{p.deaths}/{p.assists}</td>
                    <td data-label="ADR">{p.adr.toFixed(1)}</td>
                    <td data-label="Rating*">{p.rating.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
      <section className="contentSection" id="series-aggregate">
        <h2 className="sectionKicker">Series aggregate (round-weighted)</h2>
        <p className="muted">
          * Rating is a synthetic, simulated statistic on an HLTV-like scale. It is not the official HLTV Rating 2.0/3.0
          and is not calculated by any real proprietary formula. The series aggregate below uses the provided
          round-weighted totals across all maps, not an unweighted average of per-map ratios.
        </p>
        <div className="tableWrap">
          <table className="dataTable">
            <caption className="srOnly">Series aggregate</caption>
            <thead>
              <tr>
                <th scope="col">Team</th>
                <th scope="col">Player</th>
                <th scope="col">K/D/A</th>
                <th scope="col">ADR</th>
                <th scope="col">Rating*</th>
              </tr>
            </thead>
            <tbody>
              {seriesAggregate.map((p) => (
                <tr key={p.playerId}>
                  <td data-label="Team">{catalog.teams.find((t) => t.id === p.team)?.name ?? p.team}</td>
                  <td data-label="Player"><PlayerCell catalog={catalog} playerId={p.playerId} displayName={p.displayName} /></td>
                  <td data-label="K/D/A">{p.kills}/{p.deaths}/{p.assists}</td>
                  <td data-label="ADR">{p.adr.toFixed(1)}</td>
                  <td data-label="Rating*">{p.rating.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

type LolSidePlayer = {
  playerId: string | null;
  displayName: string;
  role: string;
  champion: string;
  kills: number;
  deaths: number;
  assists?: number;
  cs: number;
  gold: number;
  items?: number[];
  summoners?: string[];
  kda?: string;
  kdaRatio?: number;
  pickProvenance?: string;
  statProvenance?: string;
};

type LolSide = {
  teamId: string;
  teamName: string;
  kills: number;
  deaths: number;
  assists?: number;
  gold: number;
  towers: number;
  dragons: number;
  barons: number;
  heralds: number;
  bans: string[];
  players: LolSidePlayer[];
};

type LolGame = {
  number: number;
  winnerTeamId: string;
  durationMinutes: number | null;
  narrative?: string;
  mvpNickname?: string;
  knownEvents?: string[];
  provenance: string;
  provenanceNote?: string;
  sides: LolSide[];
};

function LolSeriesDetail({ catalog, games }: { catalog: ReturnType<typeof getCatalog>; games: LolGame[] }) {
  return (
    <>
      <nav aria-label="Games in this series" className="contentSection" style={{ paddingBottom: 0 }}>
        <h2 className="sectionKicker">Jump to game</h2>
        <ul style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", listStyle: "none", padding: 0 }}>
          {games.map((g) => <li key={g.number}><a href={`#game-${g.number}`}>Game {g.number}</a></li>)}
          <li><a href="#series-rollup">Series rollup</a></li>
        </ul>
      </nav>
      {games.map((g) => (
        <section className="contentSection" id={`game-${g.number}`} key={g.number}>
          <h2 className="sectionKicker">
            Game {g.number}{g.durationMinutes ? ` · ${g.durationMinutes}m` : ""} <ProvenanceBadge provenance={g.provenance} />
          </h2>
          {g.narrative && <p>{g.narrative}</p>}
          {g.provenanceNote && <p className="muted">{g.provenanceNote}</p>}
          {g.knownEvents && g.knownEvents.length > 0 && (
            <ul>{g.knownEvents.map((e, i) => <li key={i}>{e}</li>)}</ul>
          )}
          {g.sides.map((side) => (
            <div key={side.teamId} style={{ marginBottom: "1rem" }}>
              <h3>
                {teamHref(catalog, side.teamId) ? <Link href={teamHref(catalog, side.teamId)!}>{side.teamName}</Link> : side.teamName}
                {g.winnerTeamId === side.teamId ? " — Winner" : ""}
                {" "}· {side.kills}/{side.deaths} kills/deaths · {side.towers} towers · {side.dragons} dragons · {side.barons} barons
                {side.heralds ? ` · ${side.heralds} heralds` : ""} · {side.gold.toLocaleString()} gold
              </h3>
              <p className="muted">Bans: {side.bans.join(", ")}</p>
              <div className="tableWrap">
                <table className="dataTable">
                  <caption className="srOnly">{side.teamName} game {g.number} box score</caption>
                  <thead>
                    <tr>
                      <th scope="col">Player</th>
                      <th scope="col">Role</th>
                      <th scope="col">Champion</th>
                      <th scope="col">K/D/A</th>
                      <th scope="col">CS</th>
                      <th scope="col">Gold</th>
                      <th scope="col">Pick</th>
                    </tr>
                  </thead>
                  <tbody>
                    {side.players.map((p, i) => (
                      <tr key={i}>
                        <td data-label="Player"><PlayerCell catalog={catalog} playerId={p.playerId} displayName={p.displayName} /></td>
                        <td data-label="Role"><span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}><CsRoleIcons role={p.role} /><RoleIcon role={p.role} />{p.role}</span></td>
                        <td data-label="Champion">{p.champion}</td>
                        <td data-label="K/D/A">{p.kills}/{p.deaths}/{p.assists ?? "—"}</td>
                        <td data-label="CS">{p.cs}</td>
                        <td data-label="Gold">{p.gold?.toLocaleString() ?? "—"}</td>
                        <td data-label="Pick">
                          <ProvenanceBadge provenance={p.pickProvenance === "narrated-canon" ? "narrated-canon" : (p.pickProvenance ?? "authored-reconstruction")} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </section>
      ))}
      <section className="contentSection" id="series-rollup">
        <h2 className="sectionKicker">Series rollup</h2>
        <p className="muted">Kills/deaths/assists are summed across games; CS/farm is a weighted average per game played, not a simple sum.</p>
        <div className="tableWrap">
          <table className="dataTable">
            <caption className="srOnly">Series rollup</caption>
            <thead><tr><th scope="col">Team</th><th scope="col">Kills</th><th scope="col">Deaths</th><th scope="col">Avg. CS/game</th><th scope="col">Total gold</th></tr></thead>
            <tbody>
              {[...new Map(games.flatMap((g) => g.sides).map((s) => [s.teamId, s.teamId])).keys()].map((teamId) => {
                const sides = games.flatMap((g) => g.sides).filter((s) => s.teamId === teamId);
                const kills = sides.reduce((sum, s) => sum + s.kills, 0);
                const deaths = sides.reduce((sum, s) => sum + s.deaths, 0);
                const gold = sides.reduce((sum, s) => sum + s.gold, 0);
                const avgCs = sides.reduce((sum, s) => sum + s.players.reduce((a, p) => a + p.cs, 0), 0) / sides.length;
                const name = sides[0]?.teamName ?? teamId;
                return (
                  <tr key={teamId}>
                    <td data-label="Team">{teamHref(catalog, teamId) ? <Link href={teamHref(catalog, teamId)!}>{name}</Link> : name}</td>
                    <td data-label="Kills">{kills}</td>
                    <td data-label="Deaths">{deaths}</td>
                    <td data-label="Avg. CS/game">{(avgCs / 5).toFixed(0)}</td>
                    <td data-label="Total gold">{gold.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

export default async function MatchDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const catalog = getCatalog();
  const match: MatchView | undefined = (catalog.matches ?? []).find((m) => m.slug === slug);
  if (!match) notFound();

  const result = match.result as Record<string, unknown> | null;
  const games = (result?.games as unknown[] | undefined) ?? [];
  const isCs = match.game === "Counter-Strike" && games.length > 0 && games[0] && "players" in (games[0] as object);
  const isLol = match.game === "League of Legends" && games.length > 0 && games[0] && "sides" in (games[0] as object);

  return (
    <>
      <Breadcrumbs items={[
        { label: "Kairospedia", href: "/wiki" },
        { label: "Matches", href: "/wiki/matches" },
        { label: `${match.teamAName} vs ${match.teamBName}` },
      ]} />
      <PageHeader
        eyebrow={`${match.game} · ${match.matchType.replaceAll("-", " ")}`}
        title={`${match.teamAName} vs ${match.teamBName}`}
        description={`${match.date ? formatDate(match.date) : match.scheduledDate ? `Scheduled: ${match.scheduledDate}` : "Date unknown"}${match.bestOf ? ` · Best of ${match.bestOf}` : ""}${typeof match.teamAScore === "number" ? ` · Final: ${match.teamAScore}–${match.teamBScore}` : ""}`}
        badges={<>
          <ProvenanceBadge provenance={match.provenance} />
          <span className="badge badgeStatus">{match.officialStatus}</span>
          {!match.affectsStandings && <span className="badge">Does not affect standings</span>}
        </>}
        compact
      />

      <section className="contentSection">
        <h2 className="sectionKicker">Confirmed facts</h2>
        <ul>{match.confirmedFacts.length > 0 ? match.confirmedFacts.map((f, i) => <li key={i}>{f}</li>) : <li>None recorded.</li>}</ul>
        {match.unconfirmedDetails.length > 0 && (
          <>
            <h2 className="sectionKicker">Unconfirmed / not narrated</h2>
            <ul>{match.unconfirmedDetails.map((f, i) => <li key={i}>{f}</li>)}</ul>
          </>
        )}
        {match.canonNotes.length > 0 && (
          <>
            <h2 className="sectionKicker">Notes</h2>
            <ul>{match.canonNotes.map((f, i) => <li key={i}>{f}</li>)}</ul>
          </>
        )}
        {match.episodeIds.length > 0 && (
          <p>
            Source episode{match.episodeIds.length > 1 ? "s" : ""}: {match.episodeIds.map((id) => id.replace("episode-", "Episode ")).join(", ")}
          </p>
        )}
      </section>

      {isCs && (
        <CsSeriesDetail
          catalog={catalog}
          games={games as CsGame[]}
          seriesAggregate={(result?.seriesAggregate as CsPlayerStat[] | undefined) ?? []}
        />
      )}
      {isLol && <LolSeriesDetail catalog={catalog} games={games as LolGame[]} />}
      {!isCs && !isLol && (
        <section className="contentSection">
          <h2 className="sectionKicker">Status</h2>
          <p>
            {match.status === "planned"
              ? "This scrim block is scheduled but has not been played as of the current narrative date. No result exists to report."
              : "This series was played or partially played, but a full box score was never narrated and is not invented here."}
          </p>
          {result?.knownPartialGame ? (
            <div>
              <h3>Known partial game</h3>
              <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(result.knownPartialGame, null, 2)}</pre>
            </div>
          ) : null}
          {result?.knownMaps ? (
            <ul>{(result.knownMaps as string[]).map((m, i) => <li key={i}>{m}</li>)}</ul>
          ) : null}
        </section>
      )}

      <section className="contentSection">
        <h2 className="sectionKicker">Sources</h2>
        <ul>{match.sources.map((s, i) => <li key={i}>{s}</li>)}</ul>
      </section>
    </>
  );
}
