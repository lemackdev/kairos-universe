import { EmptyCatalogPage } from "@/components/EmptyCatalogPage";

export const metadata = { title: "Matches" };

export default function MatchesPage() {
  return (
    <EmptyCatalogPage
      title="Matches"
      description="Official matches, showmatches, evaluation games, scrims, and practice blocks use separate visibility and official-status fields."
      emptyTitle="No official matches recorded"
      emptyDescription="Kairos League is training and pre-debut. The site does not present the absence of matches as a 0-0 record."
    />
  );
}
