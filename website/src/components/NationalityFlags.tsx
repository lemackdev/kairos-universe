import Image from "next/image";
import { flagCountryFor } from "@/lib/nationalities";

export function NationalityFlags({ nationality, nationalities, compact = false }: {
  nationality?: string | null; nationalities?: string[]; compact?: boolean;
}) {
  const values = [...new Set(nationalities?.length ? nationalities : nationality ? [nationality] : [])]
    .filter((value) => value !== "TBD" && value !== "Unknown");
  if (!values.length) return compact ? null : <>TBD</>;
  return <span style={{ display: "inline-flex", gap: "0.4rem", alignItems: "center", flexWrap: "wrap" }}>
    {values.map((value) => {
      const country = flagCountryFor(value);
      return <span key={value} style={{ display: "inline-flex", gap: "0.3rem", alignItems: "center" }}>
        {country && <Image src={`/flags/${country.code}.${country.code === "pr" ? "svg" : "png"}`} width={24} height={18} unoptimized alt={country.country} title={value} />}
        {(!compact || !country) && <span>{value}</span>}
      </span>;
    })}
  </span>;
}
