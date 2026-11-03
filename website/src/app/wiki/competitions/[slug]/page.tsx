import { notFound } from "next/navigation";
import { TournamentArticle } from "@/components/articles/TournamentArticle";
import { getCatalog } from "@/lib/canon/server";
import { regionalFieldFor } from "@/lib/external/worldState2027";
export function generateStaticParams() {
  return getCatalog().competitions.map((competition) => ({ slug: competition.slug }));
}
export default async function TournamentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const catalog = getCatalog();
  const tournament = catalog.competitions.find((entry) => entry.slug === slug);
  if (!tournament) notFound();
  const field = regionalFieldFor(catalog.worldState2027, slug);
  const regionalField2027 = field?.map((team) => {
    const canonTeam = catalog.teams.find((entry) => entry.id === team.teamId);
    const externalTeam = catalog.externalScene?.teams.find((entry) => entry.id === team.teamId);
    const href = canonTeam ? `/wiki/teams/${canonTeam.slug}` : externalTeam ? `/wiki/teams/${externalTeam.slug}` : team.teamId.startsWith("tier2-") ? `/wiki/teams/${team.teamId}` : null;
    return { name: team.name, href };
  });
  return <TournamentArticle tournament={tournament} regionalField2027={regionalField2027} />;
}
