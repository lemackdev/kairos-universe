import snapshot from "./canon-snapshot.json";

export const canon = snapshot;

const TBD = /^tbd$/i;

export function isUnknown(value: string | null | undefined): boolean {
  return !value || TBD.test(value.trim());
}

/** Human label for a Kairos organization status key. */
export function kairosStatusLabel(status: string): string {
  switch (status) {
    case "active-pre-debut":
      return "Active, pre-debut";
    case "active":
      return "Active";
    default:
      return status.replace(/-/g, " ");
  }
}

export function divisionStatusLabel(status: string): string {
  return status === "training-pre-debut" ? "Training, pre-debut" : status.replace(/-/g, " ");
}
