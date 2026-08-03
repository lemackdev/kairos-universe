export function formatUnknown(
  value: string | number | null | undefined,
  fallback = "Unknown",
): string {
  if (value === null || value === undefined || value === "" || value === "TBD") {
    return fallback;
  }
  return String(value);
}
