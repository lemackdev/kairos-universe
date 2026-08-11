import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";

export const metadata = { title: "Matches" };

export default function MatchesPage() {
  return (
    <>
      <PageHeader title="Matches" subtitle="Results and match history" />
      <div className="container" style={{ padding: "1.5rem" }}>
        <EmptyState
          title="No match data imported yet"
          detail="No official Kairos match has occurred, and external match history has not been imported in this release. Match import is planned for a future, explicitly authorized expansion."
        />
      </div>
    </>
  );
}
