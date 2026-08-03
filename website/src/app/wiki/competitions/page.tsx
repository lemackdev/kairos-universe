import { EmptyCatalogPage } from "@/components/EmptyCatalogPage";

export const metadata = { title: "Competitions" };

export default function CompetitionsPage() {
  return (
    <EmptyCatalogPage
      title="Competitions"
      description="The architecture supports competitions, seasons, splits, stages, groups, rounds, series, standings, and qualification paths."
      emptyTitle="No competition records published"
      emptyDescription="Kairos has an intended competitive destination, but Kairospedia does not convert that intention into a fictional season, schedule, participant list, or standing."
    />
  );
}
