const labels: Record<string, string> = {
  "narrated-canon": "Narrated canon",
  "narrated-canon-score-synthetic-stats": "Canon score, synthetic stats",
  "narrated-canon-partial": "Canon partial, synthetic remainder",
  "authored-reconstruction": "Authored reconstruction",
  "proposed-opponent-draft": "Proposed opponent draft",
  unknown: "Unknown",
};

const titles: Record<string, string> = {
  "narrated-canon": "Directly confirmed by episode narration or dialogue.",
  "narrated-canon-score-synthetic-stats":
    "The map/game score and winner are story canon. Individual player statistics are an author-approved synthetic retrospective simulation, not confirmed in-episode dialogue.",
  "narrated-canon-partial":
    "Some picks/events in this game are confirmed by episode narration; everything else is an authored reconstruction.",
  "authored-reconstruction":
    "An author-approved retrospective simulation built around a confirmed canon result. Not claimed to be part of the episode prose.",
  "proposed-opponent-draft":
    "A full proposed box score for an experimental, not-finalized opponent roster. Opponent identities are placeholders, not real players.",
  unknown: "No statistical or narrative detail exists yet for this block.",
};

export function provenanceLabel(provenance: string): string {
  return labels[provenance] ?? provenance.replaceAll("-", " ");
}

export function ProvenanceBadge({ provenance }: { provenance: string }) {
  return (
    <span className="badge badgeStatus" title={titles[provenance] ?? ""}>
      {provenanceLabel(provenance)}
    </span>
  );
}
