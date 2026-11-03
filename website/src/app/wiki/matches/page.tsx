import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import { ProvenanceBadge, provenanceLabel } from "@/components/matches/ProvenanceBadge";
import { getCatalog } from "@/lib/canon/server";
import { formatDate } from "@/lib/formatting/date";
import type { MatchView } from "@/types/catalog";

export const metadata = { title: "Matches" };

function statusLabel(match: MatchView): string {
  if (match.status === "planned") return "Scheduled";
  if (match.status === "unconfirmed") return "Partial / unconfirmed";
  if (match.result === null) return "Result not recorded";
  return "Confirmed";
}

export default async function MatchesPage({
  searchParams,
}: {
  searchParams: Promise<{
    game?: string;
    team?: string;
    scope?: string;
    status?: string;
    opponent?: string;
  }>;
}) {
  const { game, team, scope, status, opponent } = await searchParams;
  const catalog = getCatalog();
  const matches = catalog.matches ?? [];

  const games = [...new Set(matches.map((m) => m.game))].sort();
  const teamOptions = catalog.teams.map((t) => ({ id: t.id, name: t.name }));
  const opponentOptions = [
    ...new Set(
      matches
        .filter((m) => !m.isInternal)
        .map((m) => (catalog.teams.some((t) => t.id === m.teamAId) ? m.teamBName : m.teamAName)),
    ),
  ].sort();

  const filtered = matches.filter((m) => {
    if (game && m.game !== game) return false;
    if (team && m.teamAId !== team && m.teamBId !== team) return false;
    if (scope === "internal" && !m.isInternal) return false;
    if (scope === "external" && m.isInternal) return false;
    if (status && statusLabel(m) !== status) return false;
    if (opponent && m.teamAName !== opponent && m.teamBName !== opponent) return false;
    return true;
  });

  const statusOptions = [...new Set(matches.map((m) => statusLabel(m)))];

  return (
    <>
      <Breadcrumbs items={[{ label: "Kairospedia", href: "/wiki" }, { label: "Matches" }]} />
      <PageHeader
        eyebrow="Match center"
        title="Matches"
        description="Private scrims, internal training blocks, and external practice series across Kairos's five rosters. Every box score is labeled by provenance: narrated story canon, an author-approved retrospective reconstruction, a proposed opponent draft, or unknown. None of these affect any official standing."
        compact
      />

      <section className="contentSection">
        <form method="get" style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "end" }}>
          <label>
            Game
            <select name="game" defaultValue={game ?? ""}>
              <option value="">All</option>
              {games.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </label>
          <label>
            Kairos team
            <select name="team" defaultValue={team ?? ""}>
              <option value="">All</option>
              {teamOptions.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </label>
          <label>
            Opponent
            <select name="opponent" defaultValue={opponent ?? ""}>
              <option value="">All</option>
              {opponentOptions.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
          <label>
            Scope
            <select name="scope" defaultValue={scope ?? ""}>
              <option value="">Internal + external</option>
              <option value="internal">Internal (Kairos vs Kairos)</option>
              <option value="external">External</option>
            </select>
          </label>
          <label>
            Status
            <select name="status" defaultValue={status ?? ""}>
              <option value="">All</option>
              {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <button type="submit" className="badge badgeCanon" style={{ cursor: "pointer" }}>Filter</button>
          {(game || team || scope || status || opponent) && (
            <Link href="/wiki/matches" className="muted">Clear filters</Link>
          )}
        </form>
      </section>

      <section className="contentSection">
        <h2 className="sectionKicker">{filtered.length} match{filtered.length === 1 ? "" : "es"}</h2>
        <div className="tableWrap">
          <table className="dataTable">
            <caption className="srOnly">Match index</caption>
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Game</th>
                <th scope="col">Matchup</th>
                <th scope="col">Format</th>
                <th scope="col">Result</th>
                <th scope="col">Status</th>
                <th scope="col">Provenance</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id}>
                  <td data-label="Date">{m.date ? formatDate(m.date) : m.scheduledDate ? `Scheduled: ${m.scheduledDate}` : "TBD"}</td>
                  <td data-label="Game">{m.game}</td>
                  <td data-label="Matchup">
                    <Link href={`/wiki/matches/${m.slug}`}>{m.teamAName} vs {m.teamBName}</Link>
                  </td>
                  <td data-label="Format">{m.bestOf ? `Bo${m.bestOf}` : "—"}</td>
                  <td data-label="Result">
                    {typeof m.teamAScore === "number" && typeof m.teamBScore === "number"
                      ? `${m.teamAScore}–${m.teamBScore}`
                      : "—"}
                  </td>
                  <td data-label="Status">{statusLabel(m)}</td>
                  <td data-label="Provenance"><ProvenanceBadge provenance={m.provenance} /></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7}>No matches found for this filter combination.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="muted" style={{ marginTop: "0.75rem" }}>
          Provenance key: <strong>{provenanceLabel("narrated-canon")}</strong> is confirmed story dialogue/events;{" "}
          <strong>{provenanceLabel("authored-reconstruction")}</strong> is an author-approved retrospective simulation
          of unconfirmed stats around a canon result;{" "}
          <strong>{provenanceLabel("proposed-opponent-draft")}</strong> extends that reconstruction to an
          experimental, not-finalized opponent roster; <strong>{provenanceLabel("unknown")}</strong> means no stats
          exist yet (a scheduled or never-narrated block).
        </p>
      </section>
    </>
  );
}
