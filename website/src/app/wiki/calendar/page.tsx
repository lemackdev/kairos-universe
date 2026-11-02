import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import { CalendarView } from "@/components/CalendarView";
import { getCatalog } from "@/lib/canon/server";

export const metadata = { title: "Competitive Calendar" };

export default function CalendarPage() {
  const { competitions } = getCatalog();
  const year2027 = competitions.filter((competition) => (competition.startDate ?? "").startsWith("2027")
    || (!competition.startDate && competition.id.endsWith("-2027")));

  return <>
    <Breadcrumbs items={[{ label: "Kairospedia", href: "/wiki" }, { label: "Calendar" }]} />
    <PageHeader title="Competitive Calendar 2027" eyebrow="Season schedule" compact
      description="Every confirmed 2027 League of Legends and Counter-Strike tournament, whether or not Kairos has qualified. A tournament existing here does not mean Kairos is attending." />
    <section className="contentSection">
      <CalendarView competitions={year2027} />
    </section>
  </>;
}
