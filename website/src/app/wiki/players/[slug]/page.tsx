import { notFound } from "next/navigation";
import { AddedPlayerArticle, CsPlayerArticle, ExternalPlayerArticle } from "@/components/articles/ExternalArticles";
import { PlayerArticle } from "@/components/articles/PlayerArticle";
import { getCatalog } from "@/lib/canon/server";
import { allAddedPlayers, csExternalPlayers } from "@/lib/external/worldState2027";
export function generateStaticParams() {
  const catalog = getCatalog();
  return [...catalog.players, ...(catalog.externalScene?.players ?? []), ...allAddedPlayers(catalog.worldState2027), ...csExternalPlayers(catalog.worldState2027)].map((player) => ({ slug: player.slug }));
}
export default async function PlayerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const catalog = getCatalog();
  const player = catalog.players.find((entry) => entry.slug === slug);
  const reference = catalog.externalScene?.players.find((entry) => entry.slug === slug);
  if (!player && reference && catalog.externalScene) return <ExternalPlayerArticle player={reference} scene={catalog.externalScene} worldState={catalog.worldState2027} />;
  const added = allAddedPlayers(catalog.worldState2027).find((entry) => entry.slug === slug);
  if (!player && added && catalog.worldState2027) return <AddedPlayerArticle player={added} worldState={catalog.worldState2027} />;
  const csPlayer = csExternalPlayers(catalog.worldState2027).find((entry) => entry.slug === slug);
  if (!player && csPlayer && catalog.worldState2027) return <CsPlayerArticle player={csPlayer} worldState={catalog.worldState2027} />;
  if (!player) notFound();
  return <PlayerArticle player={player} team={catalog.teams.find((entry) => entry.id === player.currentTeamId)}
    narrativeDate={catalog.metadata.currentNarrativeDate} />;
}
