export function calculateAge(
  dateOfBirth: string | null | "TBD",
  referenceDate: string,
): number | null {
  if (!dateOfBirth || dateOfBirth === "TBD") {
    return null;
  }

  const birth = parseIsoDate(dateOfBirth);
  const reference = parseIsoDate(referenceDate);
  let age = reference.year - birth.year;

  if (
    reference.month < birth.month ||
    (reference.month === birth.month && reference.day < birth.day)
  ) {
    age -= 1;
  }

  return age;
}

function parseIsoDate(value: string): {
  year: number;
  month: number;
  day: number;
} {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    throw new Error(`Expected an ISO calendar date, received: ${value}`);
  }

  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
}
