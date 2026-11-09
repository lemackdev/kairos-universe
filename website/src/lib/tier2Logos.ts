import type { ExternalScene } from "@/types/external-scene";

export const tier2LogoParentByTeamId: Record<string, string> = {
  "tier2-emea-masters-movistar-koi-fenix": "external-lol-team-movistar-koi",
  "tier2-emea-masters-g2-nord": "external-lol-team-g2-esports",
  "tier2-emea-masters-karmine-corp-blue": "external-lol-team-karmine-corp",
};

export const tier2LogoSlugByTeamId: Record<string, string> = {
  "tier2-circuito-desafiante-estral-esports": "external-estral-esports",
  "tier2-circuito-desafiante-kabum-idl": "external-kabum-idl",
  "tier2-circuito-desafiante-vks-academy": "external-keyd-stars",
  "tier2-circuito-desafiante-intz": "external-intz",
  "tier2-circuito-desafiante-rmd-gaming": "external-rmd-gaming",
  "tier2-circuito-desafiante-ei-nerd-esports": "external-ei-nerd-esports",
  "tier2-circuito-desafiante-7rex": "external-7rex",
  "tier2-emea-masters-galions": "external-galions",
  "tier2-emea-masters-solary": "external-solary",
  "tier2-emea-masters-anubis-gaming": "external-anubis-gaming",
  "tier2-emea-masters-kaufland-hangry-knights": "external-kaufland-hangry-knights",
  "tier2-emea-masters-tln-pirates": "external-tln-pirates",
  "tier2-lcp-challengers-frank-esports": "external-frank-esports",
  "tier2-lcp-challengers-sillysilly-gaming": "external-sillysilly-gaming",
  "tier2-lcp-challengers-reignfall": "external-reignfall",
  "tier2-lcp-challengers-sponge-gaming": "external-sponge-gaming",
  "tier2-lcp-challengers-ewh": "external-embrace-whatever-happens",
  "tier2-lcp-challengers-rogersama": "external-rogersama",
};

export function tier2LogoOrgSlug(scene: ExternalScene | undefined, team: { teamId: string; parentTeamId: string | null }): string | null {
  const parentId = team.parentTeamId ?? tier2LogoParentByTeamId[team.teamId];
  const parent = parentId ? scene?.teams.find((entry) => entry.id === parentId) : undefined;
  const organization = parent ? scene?.organizations.find((entry) => entry.id === parent.organizationId) : undefined;
  return organization?.slug ?? tier2LogoSlugByTeamId[team.teamId] ?? null;
}
