import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { getCatalog } from "@/lib/canon/server";
export const metadata = { title: "Tournaments" };
export default function CompetitionsPage() {
  const { competitions } = getCatalog();
  return <>
    <Breadcrumbs items={[{ label: "Kairospedia", href: "/wiki" }, { label: "Tournaments" }]} />
    <PageHeader title="Tournaments" eyebrow="Competition directory" compact
      description="Tournament formats, participants, prize pools, results, and MVPs across the Kairos Universe." />
    <section className="contentSection">
      {competitions.length ? <ul className="entityList">{competitions.map((competition) => <li key={competition.id}>
        <Link href={`/wiki/competitions/${competition.slug}`}>{competition.name}</Link>
        <p>{competition.gameName} / {competition.status}</p>
      </li>)}</ul> : <EmptyState title="No tournaments published yet"
        description="Confirmed tournaments will appear here with Overview, Tournament Information, Prize Pool, Participants, Results, and MVPs. Planned team participation alone does not establish a tournament record." />}
    </section>
  </>;
}
