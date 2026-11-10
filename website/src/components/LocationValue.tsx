import { flagCountryFor } from "@/lib/nationalities";

// A place name with the country's flag in front of it.
export function LocationValue({ city, country }: { city?: string | null; country: string }) {
  const flag = flagCountryFor(country);
  const label = city && city !== country ? `${city}, ${country}` : country;
  return <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
    {flag && <img src={`/flags/${flag.code}.png`} width={24} height={18} alt="" style={{ display: "block" }} />}
    {label}
  </span>;
}
