import Link from "next/link";
import { getCatalog } from "@/lib/canon/server";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ExternalSources, ReferenceNotice } from "@/components/articles/ExternalArticles";
import { WikiTable } from "@/components/articles/WikiArticle";

export const metadata = { title: "Pre-Worlds 2026 reference scene" };
export default function WorldPage() {
  const scene = getCatalog().externalScene;
  return <article><Breadcrumbs items={[{ label: "Kairospedia", href: "/wiki" }, { label: "Competitive world" }]} />
    <h1>The competitive world</h1><p>Pre-Worlds 2026 / League of Legends</p><ReferenceNotice />
    {scene && <>
      <section className="contentSection"><h2>Coverage</h2><p>{scene.teams.length} teams. {scene.players.length} unique players. {scene.rosterTenures.length} roster observations, including substitutes. All participants are included, not only Worlds qualifiers.</p>
        <nav aria-label="Regional references" className="statusRow">{[...new Set(scene.teams.map((t) => t.league))].map((league) => <a className="badge" href={`#${league.toLowerCase()}`} key={league}>{league}</a>)}</nav>
      </section>
      {[...new Set(scene.teams.map((t) => t.league))].map((league) => <section className="contentSection" id={league.toLowerCase()} key={league}>
        <h2>{league}</h2><WikiTable caption={`${league} roster coverage`} columns={["Team", "Players listed", "Basis"]} rows={scene.teams.filter((t) => t.league === league).map((t) => ({ key: t.id, cells: [<Link key="team" href={`/wiki/teams/${t.slug}`}>{t.name}</Link>, t.rosterTenureIds.length, t.basis === "last-available-domestic-tournament" ? "Older tournament fallback" : "Final domestic cycle"] }))} empty="No teams published." />
      </section>)}
      <section className="contentSection"><h2>Research Limitations</h2><ul>{scene.notes.map((note) => <li key={note}>{note}</li>)}</ul><p>Maryville University versus DarkZero Dragonsteel is an unresolved NACL brand-label discrepancy across directories. This snapshot retains the tournament-page label, not a guessed corporate rename. OMG and Ultra Prime use Split 2 because they did not enter Split 3. Multiple main-role listings are preserved without selecting a starter.</p></section>
      <section className="contentSection"><h2>Sources</h2><ExternalSources scene={scene} ids={scene.sources.map((s) => s.id)} /></section>
    </>}
  </article>;
}
