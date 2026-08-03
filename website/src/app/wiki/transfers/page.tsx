import { EmptyCatalogPage } from "@/components/EmptyCatalogPage";

export const metadata = { title: "Transfers" };

export default function TransfersPage() {
  return (
    <EmptyCatalogPage
      title="Transfers"
      description="The transfer model supports signings, releases, loans, promotions, demotions, benching, activation, retirement, and staff appointments."
      emptyTitle="No transfer events published"
      emptyDescription="Initial Kairos membership is represented through roster tenures with unknown dates. No signing date, fee, contract term, or previous team is invented."
    />
  );
}
