import logos from "../../../assets/branding/competitions/manifest.json";

const files = new Map(logos.logos.map((logo) => [logo.slug, logo.file]));

const prefixes: Array<[string, string]> = [
  ["lck-challengers-", "lck"], ["lck-", "lck"], ["lcp-challengers-", "lcp"], ["lcp-", "lcp"],
  ["lcs-", "lcs"], ["nacl-", "lcs"], ["lec-", "lec"], ["emea-masters-", "lec"],
  ["lpl-", "lpl"], ["ldl-", "lpl"], ["cblol-", "cblol"], ["circuito-desafiante-", "cblol"],
  ["blast-", "blast"], ["cct-", "cct"], ["dreamhack-open-", "dreamhack-open"],
  ["elisa-masters-", "elisa-masters"], ["epicenter-", "epicenter"],
  ["esl-challenger-league-", "esl-challenger-league"], ["esl-pro-league-", "esl-pro-league"],
  ["esports-world-cup-", "esports-world-cup"], ["first-stand-", "first-stand"],
  ["fissure-", "fissure"], ["fragadelphia-", "fragadelphia"], ["iem-", "iem"],
  ["mid-season-invitational-", "mid-season-invitational"], ["pgl-", "pgl"],
  ["starladder-", "starladder"], ["thunderpick-", "thunderpick"],
  ["world-championship-", "world-championship"], ["zotac-cup-masters-", "zotac-cup-masters"],
];

export function competitionLogo(slug: string, name: string) {
  const key = prefixes.find(([prefix]) => slug.startsWith(prefix))?.[1];
  const file = key ? files.get(key) : undefined;
  return file ? <img src={`/branding/competitions/${file}`} alt={`${name} logo`} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} /> : undefined;
}
