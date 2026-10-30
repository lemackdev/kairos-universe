import type { ExternalScene } from "@/types/external-scene";
import type { SearchRecord } from "@/types/catalog";

export function buildExternalSearch(scene: ExternalScene): SearchRecord[] {
  return [
    ...scene.teams.map((team): SearchRecord => ({ id: team.id, slug: team.slug, type: "team", name: team.name,
      subtitle: `${team.league} / pre-Worlds 2026 reference, needs review`, href: `/wiki/teams/${team.slug}`,
      terms: [team.name, team.id, team.slug, team.league, team.region, "League of Legends", "real-world-reference"] })),
    ...scene.players.map((player): SearchRecord => {
      const tenures = scene.rosterTenures.filter((t) => player.rosterTenureIds.includes(t.id));
      const teams = scene.teams.filter((t) => tenures.some((r) => r.teamId === t.id));
      return { id: player.id, slug: player.slug, type: "player", name: player.nickname,
        subtitle: `${teams.map((t) => t.name).join(" / ")} / event-roster reference`, href: `/wiki/players/${player.slug}`,
        terms: [player.nickname, player.id, player.slug, ...teams.flatMap((t) => [t.name, t.league]), ...tenures.map((t) => t.role)] };
    }),
    ...scene.organizations.map((org): SearchRecord => ({ id: org.id, slug: org.slug, type: "organization", name: org.name,
      subtitle: "Esports brand / real-world reference", href: `/wiki/organizations/${org.slug}`,
      terms: [org.name, org.id, org.slug, "real-world-reference"] })),
  ];
}
