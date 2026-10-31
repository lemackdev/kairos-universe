import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CanonBadge, StatusBadge } from "@/components/Badges";
import { EntityInfobox } from "@/components/EntityInfobox";
import { EpisodeReferenceList } from "@/components/EpisodeReferenceList";
import { PageHeader } from "@/components/PageHeader";
import { SourceList } from "@/components/SourceList";
import { StaffPortrait } from "@/components/StaffPortrait";
import { TenureTimeline } from "@/components/TenureTimeline";
import { getCatalog } from "@/lib/canon/server";

const realWorldBackground: Record<string, { summary: string; source: string }> = {
  "jake-stewie2k-yip": {
    summary: "Real-world Counter-Strike player Stewie2K won the 2018 Major with Cloud9. Real-world sources list his name as Jacky Yip; the fictional Kairos record currently uses Jake Yip.",
    source: "https://liquipedia.net/counterstrike/Stewie2K",
  },
  "zaqueri-aphromoo-black": {
    summary: "Zaqueri Black is a retired professional League of Legends Support player. His Kairos coaching and mentorship roles belong to this fictional universe.",
    source: "https://liquipedia.net/leagueoflegends/Aphromoo",
  },
  "thinkcard-kairos-strategic-coach": {
    summary: "Thomas Slotkin has competed as a League of Legends player and worked as a coach. His Kairos strategic-coaching role belongs to this fictional universe.",
    source: "https://liquipedia.net/leagueoflegends/Thinkcard",
  },
};

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
  const isAdrian = person.id === "adrian-elias-vale";
  const background = realWorldBackground[person.id];

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
        description={isAdrian
          ? "Founder and CEO of Asterion Intelligence, founder and owner of Kairos Esports, and first-person narrator of the original episodes."
          : `${person.realName} is published in the role of ${person.role} for the Kairos ${person.division} project.`}
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
            <h2>{isAdrian ? "Canonical profile" : "Current responsibilities"}</h2>
            <ul className="entityList">
              {person.responsibilities.map((responsibility) => (
                <li key={responsibility}>{responsibility}</li>
              ))}
            </ul>
          </section>
          {background && (
            <section className="contentSection">
              <h2>Real-world background</h2>
              <p>{background.summary}</p>
              <p className="muted">This background is separate from the fictional Kairos appointment.</p>
              <a href={background.source} target="_blank" rel="noopener noreferrer">Read the real-world profile</a>
            </section>
          )}
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
          image={<StaffPortrait id={person.id} />}
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
