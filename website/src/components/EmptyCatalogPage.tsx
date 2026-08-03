import { Breadcrumbs } from "./Breadcrumbs";
import { EmptyState } from "./EmptyState";
import { PageHeader } from "./PageHeader";

export function EmptyCatalogPage({
  title,
  description,
  emptyTitle,
  emptyDescription,
}: {
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
}) {
  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Kairospedia", href: "/wiki" },
          { label: title },
        ]}
      />
      <PageHeader
        eyebrow="Global catalog"
        title={title}
        description={description}
        compact
      />
      <section className="contentSection">
        <EmptyState title={emptyTitle} description={emptyDescription} />
      </section>
    </>
  );
}
