import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";

export const metadata = { title: "Transfers" };

export default function TransfersPage() {
  return (
    <>
      <PageHeader title="Transfers" subtitle="Roster change history" />
      <div className="container" style={{ padding: "1.5rem" }}>
        <EmptyState
          title="No transfer history imported yet"
          detail="This release imports current roster tenures only, not historical transfer chains. Transfer history import is planned for a future, explicitly authorized expansion."
        />
      </div>
    </>
  );
}
