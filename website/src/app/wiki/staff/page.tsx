import { Breadcrumbs } from "@/components/Breadcrumbs";
import { EntityCard } from "@/components/EntityCard";
import { PageHeader } from "@/components/PageHeader";
import { StaffPortrait } from "@/components/StaffPortrait";
import { getCatalog } from "@/lib/canon/server";

export const metadata = { title: "Staff" };

export default function StaffPage() {
  const catalog = getCatalog();

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Kairospedia", href: "/wiki" },
          { label: "Staff" },
        ]}
      />
      <PageHeader
        eyebrow="Global catalog"
        title="Staff"
        description="Published staff from the Kairos League and Counter-Strike projects. Mentorship alone does not imply full-time staff status."
        compact
      />
      <section className="contentSection">
        <div className="entityGrid">
          {catalog.staff.map((person) => (
            <EntityCard
              key={person.id}
              href={`/wiki/staff/${person.slug}`}
              image={<StaffPortrait id={person.id} compact />}
              kicker={person.role}
              title={person.nickname ?? person.realName}
              description={person.realName}
              meta={
                person.realWorldFigure
                  ? "Real-world figure in a fictional role"
                  : "Fictional character"
              }
            />
          ))}
        </div>
      </section>
    </>
  );
}
