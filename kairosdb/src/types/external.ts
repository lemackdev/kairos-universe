export type {
  ReviewStatus,
  SourceRecord,
  NormalizedOrganization,
  NormalizedTeam,
  NormalizedPlayer,
  NormalizedStaff,
  NormalizedRosterTenure,
  NormalizedStaffTenure,
  AliasRecord,
  CanonicalRole,
} from "../../scripts/leaguepedia/types";

export interface SnapshotDescriptor {
  snapshotId: string;
  source: string;
  capturedDate: string;
  cutoffLocal: string;
  cutoffUtc: string;
  effectiveUniversePeriod: string;
  status: "frozen" | "partial" | "empty";
  automaticUpdatesEnabled: boolean;
  nextReviewPeriod: string;
  changesRequireExplicitApproval: boolean;
  importerVersion: string;
  builtAt: string;
  recordCounts: Record<string, number>;
  modernTenureRows: number;
  approvedThisRun: number;
  needsReview: number;
  notes: string[];
}
