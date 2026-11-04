import Link from "next/link";
import { getCatalog } from "@/lib/canon/server";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ExternalSources, ReferenceNotice } from "@/components/articles/ExternalArticles";
import { WikiTable } from "@/components/articles/WikiArticle";
import { formatDate } from "@/lib/formatting/date";

export const metadata = { title: "The competitive world" };
export default function WorldPage() {
  const catalog = getCatalog();
  const scene = catalog.externalScene;
  const worldState = catalog.worldState2027;
  return <article><Breadcrumbs items={[{ label: "Kairospedia", href: "/wiki" }, { label: "Competitive world" }]} />
    <h1>The competitive world</h1>
    <p>The Kairos Universe 2027 competitive world, and the frozen pre-Worlds 2026 reference it is layered on top of.</p>

    <section className="contentSection" id="2027-world">
      <h2>Current competitive world: 2027</h2>
      {worldState && (() => {
        const tier1Leagues = ["LCK", "LPL", "LEC", "LCS", "LCP", "CBLOL"];
        const tier2RegionLeague = "NACL";
        const tier1TeamCount = tier1Leagues.reduce((sum, league) => sum + worldState.membership.regions[league]!.active.length, 0);
        const tier2LeagueTeamTotal = Object.values(worldState.tier2Leagues).reduce((sum, league) => sum + league.teams.length, 0) + worldState.membership.regions[tier2RegionLeague]!.active.length;
        return <>
        <p>{worldState.membership.rule}</p>
        <section className="contentSection" id="2027-tier-1">
          <h3>Tier 1 &mdash; {tier1TeamCount} active teams</h3>
          <nav aria-label="2027 Tier 1 regions" className="statusRow">{tier1Leagues.map((league) => <a className="badge" href={`#2027-${league.toLowerCase()}`} key={league}>{league}</a>)}</nav>
          {tier1Leagues.map((league) => { const region = worldState.membership.regions[league]!; return <section className="contentSection" id={`2027-${league.toLowerCase()}`} key={league}>
            <h4>{league} 2027 &mdash; Tier 1, {region.active.length} active teams</h4>
            <WikiTable caption={`${league} 2027 active teams`} columns={["Team", "Note"]} rows={region.active.map((team) => ({
              key: team.teamId, cells: [team.teamId === "kairos-lol-main" ? <Link key="team" href="/wiki/teams/kairos-lol-main">{team.name}</Link> : <Link key="team" href={`/wiki/teams/${scene?.teams.find((t) => t.id === team.teamId)?.slug ?? ""}`}>{team.name}</Link>, team.note ?? ""],
            }))} empty="No active teams recorded." />
            {region.inactive.length > 0 && <>
              <h5>Not participating in 2027</h5>
              <WikiTable caption={`${league} organizations not participating in 2027`} columns={["Team", "Last active Tier 1 season", "Effective exit"]} rows={region.inactive.map((team) => ({
                key: team.teamId, cells: [<Link key="team" href={`/wiki/teams/${scene?.teams.find((t) => t.id === team.teamId)?.slug ?? ""}`}>{team.name}</Link>, team.lastActiveTier1Season, formatDate(team.effectiveExitDate)],
              }))} empty="" />
            </>}
          </section>; })}
        </section>
        <section className="contentSection" id="2027-tier-2">
          <h3>Tier 2 &mdash; {tier2LeagueTeamTotal} active teams</h3>
          <nav aria-label="2027 Tier 2 ecosystems" className="statusRow">
            <a className="badge" href="#2027-nacl">NACL</a>
            {Object.entries(worldState.tier2Leagues).map(([key, league]) => <a className="badge" href={`#2027-tier2-${key.toLowerCase().replace(/\s+/g, "-")}`} key={key}>{league.name}</a>)}
          </nav>
          {(() => { const nacl = worldState.membership.regions[tier2RegionLeague]!; return <section className="contentSection" id="2027-nacl">
            <h4>NACL 2027 &mdash; Tier 2, North America, {nacl.active.length} active teams</h4>
            <WikiTable caption="NACL 2027 active teams" columns={["Team", "Note"]} rows={nacl.active.map((team) => {
              const linkedTeam = scene?.teams.find((t) => t.id === team.teamId);
              const href = team.teamId === "kairos-lol-academy-blue" ? "/wiki/teams/kairos-lol-academy-blue" : `/wiki/teams/${linkedTeam?.slug ?? ""}`;
              return { key: team.teamId, cells: [<Link key="team" href={href}>{team.name}</Link>, team.note ?? ""] };
            })} empty="No active teams recorded." />
            {nacl.inactive.length > 0 && <>
              <h5>Not participating in 2027</h5>
              <WikiTable caption="NACL organizations not participating in 2027" columns={["Team", "Last active season", "Effective exit"]} rows={nacl.inactive.map((team) => ({
                key: team.teamId, cells: [<Link key="team" href={`/wiki/teams/${scene?.teams.find((t) => t.id === team.teamId)?.slug ?? ""}`}>{team.name}</Link>, team.lastActiveTier1Season, formatDate(team.effectiveExitDate)],
              }))} empty="" />
            </>}
          </section>; })()}
          {Object.entries(worldState.tier2Leagues).map(([key, league]) => <section className="contentSection" id={`2027-tier2-${key.toLowerCase().replace(/\s+/g, "-")}`} key={key}>
            <h4>{league.name} 2027 &mdash; Tier 2, {league.region}, {league.teams.length} active teams</h4>
            <WikiTable caption={`${league.name} 2027 teams`} columns={["Team", "Parent organization"]} rows={league.teams.map((team) => {
              const parent = team.parentTeamId ? scene?.teams.find((t) => t.id === team.parentTeamId) : null;
              return { key: team.teamId, cells: [team.name, parent ? <Link key="parent" href={`/wiki/teams/${parent.slug}`}>{parent.name}</Link> : ""] };
            })} empty="No teams recorded." />
          </section>)}
        </section>
        <section className="contentSection" id="2027-free-agents">
          <h3>Free Agents (2027)</h3>
          <p>{worldState.freeAgents.players.length} players whose Kairos Universe 2027 team status is Free Agent, unless another destination is already confirmed in Kairos canon.</p>
          <WikiTable caption="2027 free agents" columns={["Player", "Previous team", "League", "Effective"]} rows={worldState.freeAgents.players.map((player) => ({
            key: player.playerId, cells: [<Link key="player" href={`/wiki/players/${scene?.players.find((p) => p.id === player.playerId)?.slug ?? ""}`}>{player.nickname}</Link>,
              <Link key="team" href={`/wiki/teams/${scene?.teams.find((t) => t.id === player.previousTeamId)?.slug ?? ""}`}>{player.previousTeamName}</Link>, player.league, formatDate(player.effectiveDate)],
          }))} empty="No free agents recorded." />
        </section>
        <section className="contentSection"><h3>Sources</h3><p>Kairos Universe canon record: &ldquo;2027 League of Legends regional restructuring.&rdquo; Regional membership and free-agent status reference the frozen pre-Worlds 2026 reference records below by ID; it does not source or modify them.</p></section>
        </>;
      })()}
    </section>

    <section className="contentSection" id="2026-reference">
      <h2>Historical reference: Pre-Worlds 2026 snapshot</h2>
      <p>Pre-Worlds 2026 / League of Legends. This is the frozen historical reference the 2027 competitive world above is layered on top of. It is not modified by the 2027 restructuring and remains accurate as a historical record of the competitive world before it.</p>
      <ReferenceNotice />
      {scene && <>
        <section className="contentSection"><h3>Coverage</h3><p>{scene.teams.length} teams. {scene.players.length} unique players. {scene.rosterTenures.length} roster observations, including substitutes. All participants are included, not only Worlds qualifiers.</p>
          <nav aria-label="Regional references" className="statusRow">{[...new Set(scene.teams.map((t) => t.league))].map((league) => <a className="badge" href={`#${league.toLowerCase()}`} key={league}>{league}</a>)}</nav>
        </section>
        {[...new Set(scene.teams.map((t) => t.league))].map((league) => <section className="contentSection" id={league.toLowerCase()} key={league}>
          <h3>{league}</h3><WikiTable caption={`${league} roster coverage`} columns={["Team", "Players listed", "Basis"]} rows={scene.teams.filter((t) => t.league === league).map((t) => ({ key: t.id, cells: [<Link key="team" href={`/wiki/teams/${t.slug}`}>{t.name}</Link>, t.rosterTenureIds.length, t.basis === "last-available-domestic-tournament" ? "Older tournament fallback" : "Final domestic cycle"] }))} empty="No teams published." />
        </section>)}
        <section className="contentSection"><h3>Research Limitations</h3><ul>{scene.notes.map((note) => <li key={note}>{note}</li>)}</ul><p>Maryville University versus DarkZero Dragonsteel is an unresolved NACL brand-label discrepancy across directories. This snapshot retains the tournament-page label, not a guessed corporate rename. OMG and Ultra Prime use Split 2 because they did not enter Split 3. Multiple main-role listings are preserved without selecting a starter.</p></section>
        <section className="contentSection"><h3>Sources</h3><ExternalSources scene={scene} ids={scene.sources.map((s) => s.id)} /></section>
      </>}
    </section>
  </article>;
}
