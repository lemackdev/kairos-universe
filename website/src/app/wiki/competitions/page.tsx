import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { CompetitionsIndexView } from "@/components/CompetitionsIndexView";
import { getCatalog } from "@/lib/canon/server";
export const metadata = { title: "Tournaments" };
export default function CompetitionsPage() {
  const { competitions } = getCatalog();
  return <>
    <Breadcrumbs items={[{ label: "Kairospedia", href: "/wiki" }, { label: "Tournaments" }]} />
    <PageHeader title="Tournaments" eyebrow="Competition directory" compact
      description="Tournament formats, participants, prize pools, results, and MVPs across the Kairos Universe. See the Calendar for a chronological view." />
    <section className="contentSection">
      {competitions.length ? <CompetitionsIndexView competitions={competitions} /> : <EmptyState title="No tournaments published yet"
        description="Confirmed tournaments will appear here with Overview, Tournament Information, Prize Pool, Participants, Results, and MVPs. Planned team participation alone does not establish a tournament record." />}
    </section>
  </>;
}
