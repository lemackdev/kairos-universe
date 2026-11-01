import { notFound } from "next/navigation";

import { GameArticle } from "@/components/articles/GameArticle";
import { getCatalog } from "@/lib/canon/server";

export function generateStaticParams() {
  return getCatalog().games.map((game) => ({ slug: game.slug }));
}

export default async function GamePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const catalog = getCatalog();
  const game = catalog.games.find((entry) => entry.slug === slug);
  if (!game) notFound();
  return <GameArticle game={game}
    teams={catalog.teams.filter((team) => game.activeTeamIds.includes(team.id))}
    players={catalog.players.filter((player) => game.activePlayerIds.includes(player.id))}
    nextMilestone={catalog.metadata.nextCompetitiveMilestone} />;
}
