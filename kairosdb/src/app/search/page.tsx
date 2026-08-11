import { PageHeader } from "@/components/PageHeader";
import { SearchBox } from "@/components/SearchBox";
import { getSearchIndex } from "@/lib/canon/server";

export const metadata = { title: "Search" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const index = getSearchIndex();

  return (
    <>
      <PageHeader title="Search" />
      <div className="container" style={{ padding: "1.5rem", maxWidth: "70ch" }}>
        <SearchBox index={index} initialQuery={q ?? ""} />
      </div>
    </>
  );
}
