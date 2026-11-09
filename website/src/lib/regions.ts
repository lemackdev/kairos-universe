import { nationalityCountries } from "@/lib/nationalities";

const byRegion: Record<string, string[]> = {
  NA: ["United States", "Canada", "Mexico", "Puerto Rico", "Dominican Republic", "Cuba", "Costa Rica", "Panama", "Guatemala", "Honduras", "El Salvador", "Jamaica", "Nicaragua", "Trinidad and Tobago", "Bahamas", "Haiti"],
  BR: ["Brazil"],
  SA: ["Argentina", "Chile", "Uruguay", "Colombia", "Peru", "Venezuela", "Ecuador", "Bolivia", "Paraguay"],
  EU: ["Albania", "Andorra", "Austria", "Belarus", "Belgium", "Bosnia and Herzegovina", "Bulgaria", "Croatia", "Cyprus", "Czech Republic", "Czechia", "Denmark", "Estonia", "Finland", "France", "Georgia", "Germany", "Greece", "Hungary", "Iceland", "Ireland", "Italy", "Kosovo", "Latvia", "Liechtenstein", "Lithuania", "Luxembourg", "Malta", "Moldova", "Montenegro", "Netherlands", "North Macedonia", "Norway", "Poland", "Portugal", "Romania", "Russia", "Serbia", "Slovakia", "Slovenia", "Spain", "Sweden", "Switzerland", "Türkiye", "Turkey", "Ukraine", "United Kingdom", "England", "Scotland", "Wales", "Northern Ireland", "Armenia", "Azerbaijan"],
  KR: ["South Korea"],
  CN: ["China"],
  HK: ["Hong Kong", "Macau"],
  JP: ["Japan"],
  TW: ["Taiwan"],
  SEA: ["Vietnam", "Thailand", "Philippines", "Indonesia", "Malaysia", "Singapore", "Cambodia", "Myanmar", "Laos"],
  OCE: ["Australia", "New Zealand", "Fiji"],
  MENA: ["Israel", "Lebanon", "Palestine", "Egypt", "Morocco", "Tunisia", "Algeria", "Saudi Arabia", "United Arab Emirates", "Jordan", "Iraq", "Iran", "Kuwait", "Qatar", "Syria", "Libya", "Oman", "Bahrain", "Yemen"],
  AF: ["South Africa", "Nigeria", "Kenya", "Ghana", "Senegal", "Ethiopia", "Tanzania"],
  AS: ["Kazakhstan", "Mongolia", "India", "Uzbekistan", "Pakistan", "Bangladesh", "Sri Lanka", "Nepal", "Kyrgyzstan"],
};

const regionOfCountry = new Map<string, string>();
for (const [region, countries] of Object.entries(byRegion)) for (const country of countries) regionOfCountry.set(country, region);

const demonymExtras: Record<string, string> = {
  Korean: "South Korea", Swedish: "Sweden", Danish: "Denmark", German: "Germany", French: "France", Polish: "Poland", Russian: "Russia",
  Ukrainian: "Ukraine", Spanish: "Spain", British: "United Kingdom", Turkish: "Türkiye", Argentine: "Argentina", Argentinian: "Argentina",
  Vietnamese: "Vietnam", Taiwanese: "Taiwan", Australian: "Australia", Mongolian: "Mongolia",
};

export function regionCodeFor(nationality: string | null | undefined): string | null {
  if (!nationality || nationality === "TBD" || nationality === "Unknown") return null;
  const country = nationalityCountries[nationality]?.country ?? demonymExtras[nationality] ?? nationality;
  return regionOfCountry.get(country) ?? null;
}

export function regionCodesFor(nationality: string | null | undefined, nationalities?: string[]): string[] {
  const values = nationalities?.length ? nationalities : nationality ? [nationality] : [];
  return [...new Set(values.map(regionCodeFor).filter((code): code is string => Boolean(code)))];
}
