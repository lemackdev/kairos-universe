import Image from "next/image";

const countries: Record<string, { code: string; country: string }> = {
  American: { code: "us", country: "United States" },
  Canadian: { code: "ca", country: "Canada" },
  Mexican: { code: "mx", country: "Mexico" },
  Chilean: { code: "cl", country: "Chile" },
  Brazilian: { code: "br", country: "Brazil" },
  Slovenian: { code: "si", country: "Slovenia" },
  Japanese: { code: "jp", country: "Japan" },
  Kosovan: { code: "xk", country: "Kosovo" },
  Lebanese: { code: "lb", country: "Lebanon" },
  Serbian: { code: "rs", country: "Serbia" },
  Chinese: { code: "cn", country: "China" },
};

export function NationalityFlags({ nationality, nationalities, compact = false }: {
  nationality?: string | null; nationalities?: string[]; compact?: boolean;
}) {
  const values = [...new Set(nationalities?.length ? nationalities : nationality ? [nationality] : [])]
    .filter((value) => value !== "TBD" && value !== "Unknown");
  if (!values.length) return compact ? null : <>TBD</>;
  return <span style={{ display: "inline-flex", gap: "0.4rem", alignItems: "center", flexWrap: "wrap" }}>
    {values.map((value) => {
      const country = countries[value];
      return <span key={value} style={{ display: "inline-flex", gap: "0.3rem", alignItems: "center" }}>
        {country && <Image src={`/flags/${country.code}.png`} width={24} height={18} unoptimized alt={country.country} title={value} />}
        {(!compact || !country) && <span>{value}</span>}
      </span>;
    })}
  </span>;
}
