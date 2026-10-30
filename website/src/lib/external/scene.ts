import fs from "node:fs";
import path from "node:path";
import Ajv from "ajv";
import { repositoryRoot } from "@/lib/canon/paths";
import type { ExternalScene, SceneEntity, ScenePlayer, SceneResearch, SceneRole, SceneSource } from "@/types/external-scene";

export const sceneRoot = path.join(repositoryRoot, "external-data", "pre-worlds-2026");
const roles: SceneRole[] = ["top", "jungle", "mid", "bot", "support"];
export const leagueCounts: Record<string, number> = { LCK: 10, LPL: 14, LEC: 10, CBLOL: 8, LCS: 8, LCP: 8, NACL: 10 };
const read = <T,>(file: string): T => JSON.parse(fs.readFileSync(file, "utf8")) as T;
const slugify = (value: string) => value.normalize("NFKD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
function assert(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(message); }

export function normalizeScene(research: SceneResearch[]): ExternalScene {
  const manifest = read<Pick<ExternalScene, "snapshotId" | "researchDate" | "scope" | "notes">>(path.join(sceneRoot, "manifest.json"));
  const scene: ExternalScene = { ...manifest, sources: [], organizations: [], teams: [], players: [], rosterTenures: [] };
  const players = new Map<string, ScenePlayer>();
  const provenance = (id: string, sourceId: string): SceneEntity => ({
    id, slug: id.replace(/^external-lol-(player|team|org|tenure)-/, "external-"),
    originType: "real-world-reference", reviewStatus: "researched-needs-review", sourceIds: [sourceId],
  });
  const source = (id: string, title: string, page: string, eventEndDate: string): SceneSource => ({
    id, title, url: `https://liquipedia.net/leagueoflegends/${page}`, eventEndDate,
    retrievedDate: manifest.researchDate, retrievalMethod: "indexed-tournament-page", revisionId: null,
  });
  scene.sources.push(source("source-pre-worlds-2026-lpl-split-2", "LPL 2026 Split 2", "LPL/2026/Split_2", "2026-06-14"));
  scene.sources.push(source("source-pre-worlds-2026-lpl-regional-finals", "LPL 2026 Regional Finals", "LPL/2026/Regional_Finals", "2026-09-19"));
  for (const league of research) {
    scene.sources.push({ ...source(league.sourceId, league.eventName, "", league.eventEndDate), url: league.sourceUrl });
    for (const input of league.teams) {
      const teamId = `external-lol-team-${input.key}`;
      const organizationId = `external-lol-org-${input.key}`;
      const event = scene.sources.find((s) => s.id === input.sourceId);
      assert(event, `Missing source: ${input.sourceId}`);
      const tenureIds: string[] = [];
      for (const member of input.members) {
        const playerId = `external-lol-player-${slugify(member.nickname)}`;
        const tenureId = `external-lol-tenure-${input.key}-${slugify(member.nickname)}-${manifest.snapshotId}`;
        const player = players.get(playerId) ?? {
          ...provenance(playerId, input.sourceId), nickname: member.nickname, legalName: null,
          nationality: null, dateOfBirth: null, rosterTenureIds: [],
        };
        assert(player.nickname === member.nickname, `Nickname identity collision: ${member.nickname}`);
        player.sourceIds = [...new Set([...player.sourceIds, input.sourceId])];
        player.rosterTenureIds.push(tenureId);
        players.set(playerId, player);
        tenureIds.push(tenureId);
        scene.rosterTenures.push({ ...provenance(tenureId, input.sourceId), playerId, teamId,
          role: member.role, designation: member.designation, observedAtEventEnd: event.eventEndDate,
          joinedDate: null, leftDate: null, isCurrent: null, isCaptain: null });
      }
      scene.teams.push({ ...provenance(teamId, input.sourceId), name: input.name, organizationId,
        gameId: "league-of-legends", league: league.league, region: league.region, tier: league.tier,
        rosterTenureIds: tenureIds, basis: input.basis, notes: input.notes });
      scene.organizations.push({ ...provenance(organizationId, input.sourceId), name: input.name,
        teamIds: [teamId], legalCompanyName: null, headquarters: null });
    }
  }
  scene.players = [...players.values()];
  for (const collection of [scene.sources, scene.teams, scene.players, scene.organizations, scene.rosterTenures]) collection.sort((a, b) => a.id.localeCompare(b.id));
  validateScene(scene);
  return scene;
}

export function readSceneResearch(): SceneResearch[] {
  const ajv = new Ajv({ allErrors: true });
  const validate = ajv.compile(read<Record<string, unknown>>(path.join(sceneRoot, "research.schema.json")));
  return Object.keys(leagueCounts).map((league) => {
    const input = read<SceneResearch>(path.join(sceneRoot, "research", `${league.toLowerCase()}.json`));
    assert(validate(input), `Invalid ${league} research: ${ajv.errorsText(validate.errors)}`);
    assert(input.league === league && input.teams.length === leagueCounts[league], `Incorrect coverage: ${league}`);
    return input;
  });
}

export function validateScene(scene: ExternalScene): void {
  const ids = new Set<string>();
  for (const collection of [scene.sources, scene.organizations, scene.teams, scene.players, scene.rosterTenures]) {
    const slugs = new Set<string>();
    for (const record of collection) {
      assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.id), `Invalid ID: ${record.id}`);
      assert(!ids.has(record.id), `Duplicate ID: ${record.id}`); ids.add(record.id);
      if ("slug" in record) {
        assert(!slugs.has(record.slug), `Duplicate slug: ${record.slug}`); slugs.add(record.slug);
        assert(record.originType === "real-world-reference" && record.reviewStatus === "researched-needs-review", `Unsafe provenance: ${record.id}`);
      }
    }
  }
  const sources = new Map(scene.sources.map((s) => [s.id, s]));
  const teams = new Map(scene.teams.map((t) => [t.id, t]));
  const players = new Map(scene.players.map((p) => [p.id, p]));
  const organizations = new Map(scene.organizations.map((o) => [o.id, o]));
  const tenures = new Map(scene.rosterTenures.map((t) => [t.id, t]));
  for (const record of [...scene.organizations, ...scene.teams, ...scene.players, ...scene.rosterTenures]) {
    assert(record.sourceIds.length > 0 && record.sourceIds.every((id) => sources.has(id)), `Broken source: ${record.id}`);
  }
  for (const source of scene.sources) {
    assert(/^https:\/\/liquipedia\.net\/leagueoflegends\//.test(source.url), `Invalid source URL: ${source.id}`);
    assert(/^2026-\d{2}-\d{2}$/.test(source.eventEndDate) && source.eventEndDate < "2026-10-15", `Not pre-Worlds: ${source.id}`);
  }
  for (const team of scene.teams) {
    assert(organizations.get(team.organizationId)?.teamIds.includes(team.id), `Broken organization: ${team.id}`);
    assert(team.league in leagueCounts && team.tier === (team.league === "NACL" ? 2 : 1), `Out-of-scope league: ${team.id}`);
    const roster = team.rosterTenureIds.map((id) => tenures.get(id));
    assert(roster.every((r) => r?.teamId === team.id), `Broken roster: ${team.id}`);
    assert(new Set(roster.map((r) => r?.playerId)).size === roster.length, `Duplicate roster member: ${team.id}`);
    for (const role of roles) assert(roster.some((r) => r?.role === role && r.designation === "main"), `Missing role ${role}: ${team.id}`);
  }
  for (const player of scene.players) {
    assert(player.rosterTenureIds.length > 0 && player.rosterTenureIds.every((id) => tenures.get(id)?.playerId === player.id), `Broken player history: ${player.id}`);
    assert(player.legalName === null && player.nationality === null && player.dateOfBirth === null, `Unsupported biography: ${player.id}`);
  }
  for (const tenure of scene.rosterTenures) {
    assert(teams.has(tenure.teamId) && players.has(tenure.playerId), `Orphan tenure: ${tenure.id}`);
    assert(teams.get(tenure.teamId)?.rosterTenureIds.includes(tenure.id) && players.get(tenure.playerId)?.rosterTenureIds.includes(tenure.id), `Unindexed tenure: ${tenure.id}`);
    assert(roles.includes(tenure.role), `Unknown role: ${tenure.id}`);
    assert(tenure.joinedDate === null && tenure.leftDate === null && tenure.isCurrent === null && tenure.isCaptain === null, `Inferred contract or captaincy: ${tenure.id}`);
  }
  for (const [league, count] of Object.entries(leagueCounts)) assert(scene.teams.filter((t) => t.league === league).length === count, `Incomplete ${league}`);
}

export function sceneRoutes(scene: ExternalScene): string[] {
  return ["/wiki/world", ...scene.teams.map((t) => `/wiki/teams/${t.slug}`),
    ...scene.players.map((p) => `/wiki/players/${p.slug}`), ...scene.organizations.map((o) => `/wiki/organizations/${o.slug}`)];
}

export function filterScene(scene: ExternalScene, enabledLeagues: string[]): ExternalScene {
  assert(new Set(enabledLeagues).size === enabledLeagues.length && enabledLeagues.every((l) => l in leagueCounts), "Invalid external league allowlist");
  const teams = scene.teams.filter((t) => enabledLeagues.includes(t.league));
  const teamIds = new Set(teams.map((t) => t.id));
  const rosterTenures = scene.rosterTenures.filter((t) => teamIds.has(t.teamId));
  const tenureIds = new Set(rosterTenures.map((t) => t.id));
  const players = scene.players.filter((p) => p.rosterTenureIds.some((id) => tenureIds.has(id))).map((p) => ({
    ...p, rosterTenureIds: p.rosterTenureIds.filter((id) => tenureIds.has(id)),
    sourceIds: [...new Set(rosterTenures.filter((t) => t.playerId === p.id).flatMap((t) => t.sourceIds))],
  }));
  const organizations = scene.organizations.filter((o) => o.teamIds.some((id) => teamIds.has(id)));
  const usedSources = new Set([...teams, ...players, ...organizations, ...rosterTenures].flatMap((r) => r.sourceIds));
  return { ...scene, teams, players, organizations, rosterTenures, sources: scene.sources.filter((s) => usedSources.has(s.id)) };
}

export function loadExternalScene(): ExternalScene {
  const expected = normalizeScene(readSceneResearch());
  for (const kind of ["organizations", "teams", "players", "rosterTenures", "sources"] as const) {
    const folder = kind === "rosterTenures" ? "roster-tenures" : kind;
    const index = read<string[]>(path.join(sceneRoot, "index", `${folder}.json`));
    const diskPaths = fs.readdirSync(path.join(sceneRoot, "records", folder)).filter((file) => file.endsWith(".json")).map((file) => `records/${folder}/${file}`).sort();
    assert(JSON.stringify(diskPaths) === JSON.stringify([...index].sort()), `Unindexed or missing scene record: ${folder}`);
    const records = index.map((relative) => {
      assert(/^records\/[a-z-]+\/[a-z0-9-]+\.json$/.test(relative), `Unsafe scene path: ${relative}`);
      return read(path.join(sceneRoot, relative));
    });
    assert(JSON.stringify(records) === JSON.stringify(expected[kind]), `Scene records differ from source research: ${kind}. Run scene:materialize after reviewing the source change.`);
  }
  return expected;
}
