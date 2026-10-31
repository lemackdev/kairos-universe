const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

export function formatDate(value: string | null | undefined): string {
  if (!value || !isoDatePattern.test(value)) return value ?? "TBD";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}
