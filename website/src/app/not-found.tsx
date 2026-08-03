import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";

export default function NotFound() {
  return (
    <>
      <PageHeader
        eyebrow="Not published"
        title="This record is outside the current release."
        description="The canonical repository may contain more entities than Kairospedia currently publishes. Visibility is controlled independently from canon."
        compact
      />
      <section className="contentSection">
        <EmptyState
          title="No public route"
          description="This URL does not resolve to an entity enabled by the Kairospedia publication manifest."
        />
      </section>
    </>
  );
}
