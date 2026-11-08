import { notFound } from "next/navigation";

import { CsOrganizationArticle, ExternalOrganizationArticle } from "@/components/articles/ExternalArticles";
import { OrganizationArticle } from "@/components/articles/OrganizationArticle";
import { getCatalog } from "@/lib/canon/server";

export function generateStaticParams() {
  const catalog = getCatalog();
  return [...catalog.organizations, ...(catalog.externalScene?.organizations ?? []), ...(catalog.worldState2027?.csExternalRosters.organizations ?? [])]
    .map((organization) => ({ slug: organization.slug }));
}

export default async function OrganizationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const catalog = getCatalog();
  const organization = catalog.organizations.find((entry) => entry.slug === slug);
  const reference = catalog.externalScene?.organizations.find((entry) => entry.slug === slug);
  if (!organization && reference && catalog.externalScene) {
    return <ExternalOrganizationArticle organization={reference} scene={catalog.externalScene} worldState={catalog.worldState2027} />;
  }
  const csOrganization = catalog.worldState2027?.csExternalRosters.organizations.find((entry) => entry.slug === slug);
  if (!organization && csOrganization && catalog.worldState2027) return <CsOrganizationArticle organization={csOrganization} worldState={catalog.worldState2027} />;
  if (!organization) notFound();
  return <OrganizationArticle organization={organization}
    teams={catalog.teams.filter((team) => organization.teamIds.includes(team.id))} />;
}
