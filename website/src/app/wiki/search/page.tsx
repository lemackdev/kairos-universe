import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import { SearchBox } from "@/components/SearchBox";
import { getSearchIndex } from "@/lib/canon/server";

export const metadata = { title: "Search" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const records = getSearchIndex();
  const { q } = await searchParams;

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Kairospedia", href: "/wiki" },
          { label: "Search" },
        ]}
      />
      <PageHeader
        eyebrow="Local index"
        title="Search published canon"
        description="Find entities by legal name, nickname, historical alias, role, game, team, stable ID, or slug."
        compact
      />
      <section className="contentSection">
        <SearchBox records={records} initialQuery={q ?? ""} />
      </section>
    </>
  );
}
