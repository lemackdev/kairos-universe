import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CanonBadge, StatusBadge } from "@/components/Badges";
import { EntityInfobox } from "@/components/EntityInfobox";
import { EpisodeReferenceList } from "@/components/EpisodeReferenceList";
import { PageHeader } from "@/components/PageHeader";
import { SourceList } from "@/components/SourceList";
import { TenureTimeline } from "@/components/TenureTimeline";
import { getCatalog } from "@/lib/canon/server";

export function generateStaticParams() {
  return getCatalog().staff.map((person) => ({ slug: person.slug }));
}

export default async function StaffProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const catalog = getCatalog();
  const person = catalog.staff.find((entry) => entry.slug === slug);
  if (!person) notFound();

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Kairospedia", href: "/wiki" },
          { label: "Staff", href: "/wiki/staff" },
          { label: person.nickname ?? person.realName },
        ]}
      />
      <PageHeader
        eyebrow="Staff record"
        title={person.nickname ?? person.realName}
        description={`${person.realName} is published in the role of ${person.role} for the Kairos ${person.division} project.`}
        badges={
          <>
            <CanonBadge />
            <StatusBadge status={person.status} />
          </>
        }
        compact
      />
      <div className="entityLayout">
        <div className="entityBody">
          <section className="contentSection">
            <h2>Current responsibilities</h2>
            <ul className="entityList">
              {person.responsibilities.map((responsibility) => (
                <li key={responsibility}>{responsibility}</li>
              ))}
            </ul>
          </section>
          <section className="contentSection">
            <h2>Staff history</h2>
            <TenureTimeline entries={person.tenures} />
            <p className="muted">
              Exact appointment dates remain TBD unless a tenure record states
              otherwise.
            </p>
          </section>
          <section className="contentSection">
            <h2>First appearance</h2>
            {person.firstAppearance ? (
              <EpisodeReferenceList episodes={[person.firstAppearance]} />
            ) : (
              "TBD"
            )}
          </section>
          <section className="contentSection">
            <h2>Episode appearances</h2>
            <EpisodeReferenceList episodes={person.episodeAppearances} limit={12} />
          </section>
          <section className="contentSection">
            <h2>Sources</h2>
            <SourceList sources={person.sources} />
          </section>
        </div>
        <EntityInfobox
          title={person.displayName}
          monogram={(person.nickname ?? person.realName).slice(0, 1)}
          rows={[
            { label: "Stable ID", value: person.id },
            { label: "Role", value: person.role },
            { label: "Division", value: person.division },
            { label: "Status", value: person.status },
            {
              label: "Origin",
              value: person.realWorldFigure
                ? "Real-world reference"
                : "Fictional",
            },
            { label: "Nationality", value: person.nationality ?? "Unknown" },
            {
              label: "First appearance",
              value: person.firstAppearance
                ? `Episode ${person.firstAppearance.number}`
                : "TBD",
            },
          ]}
        />
      </div>
    </>
  );
}
