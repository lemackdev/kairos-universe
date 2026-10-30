import { notFound } from "next/navigation";
import { ExternalTeamArticle } from "@/components/articles/ExternalArticles";
import { TeamArticle } from "@/components/articles/TeamArticle";
import { getCatalog } from "@/lib/canon/server";
export function generateStaticParams() {
  const catalog = getCatalog();
  return [...catalog.teams, ...(catalog.externalScene?.teams ?? [])].map((team) => ({ slug: team.slug }));
}
export default async function TeamPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const catalog = getCatalog();
  const team = catalog.teams.find((entry) => entry.slug === slug);
  const reference = catalog.externalScene?.teams.find((entry) => entry.slug === slug);
  if (!team && reference && catalog.externalScene) return <ExternalTeamArticle team={reference} scene={catalog.externalScene} />;
  if (!team) notFound();
  return <TeamArticle team={team} organization={catalog.organizations.find((entry) => entry.id === team.organizationId)} />;
}
