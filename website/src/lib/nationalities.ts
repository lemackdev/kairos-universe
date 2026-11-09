export const nationalityCountries: Record<string, { code: string; country: string }> = {
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
  "Puerto Rican": { code: "pr", country: "Puerto Rico" },
  "South Korean": { code: "kr", country: "South Korea" },
};

const countryByName = new Map(Object.values(nationalityCountries).map((entry) => [entry.country, entry]));

const extraFlags: Record<string, string> = {
  Argentina: "ar", Australia: "au", Cambodia: "kh", Colombia: "co", "Czech Republic": "cz", Denmark: "dk", France: "fr", Germany: "de", Greece: "gr", "Hong Kong": "hk",
  Lithuania: "lt", Morocco: "ma", Peru: "pe", Poland: "pl", Spain: "es", Sweden: "se", Taiwan: "tw", Turkey: "tr", "Türkiye": "tr", Ukraine: "ua",
  Venezuela: "ve", Vietnam: "vn", Algeria: "dz", Belgium: "be", Croatia: "hr", Egypt: "eg", Italy: "it", Netherlands: "nl", "North Macedonia": "mk", Syria: "sy", Tunisia: "tn", Russia: "ru", Mongolia: "mn", Israel: "il", Portugal: "pt", Kazakhstan: "kz", "South Africa": "za", Bulgaria: "bg", "United Kingdom": "gb", Romania: "ro", Norway: "no", Belarus: "by", Hungary: "hu", Finland: "fi", "Bosnia and Herzegovina": "ba", Slovakia: "sk", Latvia: "lv", Uruguay: "uy", Estonia: "ee", Guatemala: "gt", Iraq: "iq", Palestine: "ps", "New Zealand": "nz",
};

export function flagCountryFor(value: string): { code: string; country: string } | undefined {
  const extra = extraFlags[value];
  return nationalityCountries[value] ?? countryByName.get(value) ?? (extra ? { code: extra, country: value } : undefined);
}
