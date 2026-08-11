import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";

export const metadata = { title: "Competitions" };

export default function CompetitionsPage() {
  return (
    <>
      <PageHeader title="Competitions" subtitle="Leagues and tournaments" />
      <div className="container" style={{ padding: "1.5rem" }}>
        <EmptyState
          title="No competition data imported yet"
          detail="This release establishes current roster membership only. Competition and standings import is planned for a future, explicitly authorized expansion."
        />
      </div>
    </>
  );
}
