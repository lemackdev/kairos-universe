import fs from "node:fs";
import path from "node:path";

import Ajv2020, { type ErrorObject } from "ajv/dist/2020.js";

import type {
  CanonRelationship,
  RawEpisode,
  RawPlayer,
  RawStaff,
  RawTeam,
  RosterTenure,
  SourceRecord,
  StaffTenure,
} from "@/types/canon";
import type { PublicationManifest } from "@/types/catalog";
import {
  byId,
  getCollection,
  indexedCollections,
} from "@/lib/canon/loader";
import { readJson } from "@/lib/canon/json";
import { repositoryRoot } from "@/lib/canon/paths";

import type { CanonUniverse } from "@/types/canon";

const schemaByCollection: Record<string, string> = {
  awards: "award.schema.json",
  characters: "character.schema.json",
  coaches: "coach.schema.json",
  competitions: "competition.schema.json",
  continuities: "continuity.schema.json",
  episodes: "episode.schema.json",
  games: "game.schema.json",
  lineups: "lineup.schema.json",
  maps: "map.schema.json",
  matches: "match.schema.json",
  organizations: "organization.schema.json",
  players: "player.schema.json",
  "roster-tenures": "roster-tenure.schema.json",
  seasons: "season.schema.json",
  sources: "source.schema.json",
  "staff-tenures": "staff-tenure.schema.json",
  stages: "stage.schema.json",
  standings: "standing.schema.json",
  statistics: "statistic.schema.json",
  teams: "team.schema.json",
  tournaments: "tournament.schema.json",
  transfers: "transfer.schema.json",
};

export interface ValidationReport {
  parsedFiles: number;
  schemasChecked: number;
  entitiesValidated: number;
  idsChecked: number;
  referencesChecked: number;
  indexesChecked: number;
  warnings: string[];
}

export function validateCanonUniverse(
  universe: CanonUniverse,
  publication?: PublicationManifest,
): ValidationReport {
  const warnings: string[] = [];
  validateVersion(universe);
  const schemaReport = validateSchemas(universe);
  const indexCount = validateIndexes(universe);
  const { idCount, referenceCount } = validateReferences(universe);
  validateDates(universe);
  validateEpisodes(universe);
  validateRosterInvariants(universe);

  if (publication) {
    validatePublication(universe, publication);
  }

  const entityCount = Object.values(universe.collections).reduce(
    (total, records) => total + records.length,
    0,
  );

  return {
    parsedFiles:
      entityCount +
      Object.values(universe.shared).reduce(
        (total, records) => total + records.length,
        0,
      ) +
      indexedCollections.length +
      1,
    schemasChecked: schemaReport.schemas,
    entitiesValidated: schemaReport.records,
    idsChecked: idCount,
    referencesChecked: referenceCount,
    indexesChecked: indexCount,
    warnings,
  };
}

function validateVersion(universe: CanonUniverse): void {
  const version = universe.version;
  assert(
    /^\d+\.\d+\.\d+$/.test(version.canonVersion),
    `Invalid canon version: ${version.canonVersion}`,
  );
  assert(
    version.storyEpisode >= 75 &&
      version.reconstructedThroughEpisode >= 75 &&
      version.episodeRecordsCreatedThrough >= 75,
    "Kairospedia requires canon reconstructed through Episode 75.",
  );
  assert(
    version.currentNarrativeDate === "2026-11-24",
    `Unexpected narrative date: ${version.currentNarrativeDate}`,
  );
}

function validateSchemas(universe: CanonUniverse): {
  schemas: number;
  records: number;
} {
  const schemaRoot = path.join(repositoryRoot, "schemas");
  const schemaFiles = fs
    .readdirSync(schemaRoot)
    .filter((name) => name.endsWith(".schema.json"));
  const schemas = schemaFiles.map((name) =>
    readJson<Record<string, unknown>>(path.join(schemaRoot, name)),
  );
  const ajv = new Ajv2020({
    allErrors: true,
    strict: false,
    allowUnionTypes: true,
  });

  for (const schema of schemas) {
    ajv.addSchema(schema);
  }

  let checked = 0;
  let schemasChecked = 0;
  for (const [collection, records] of Object.entries(universe.collections)) {
    const schemaName = schemaByCollection[collection];
    assert(schemaName, `No schema mapping for data/${collection}.`);
    const schema = schemas.find(
      (candidate) =>
        typeof candidate.$id === "string" &&
        candidate.$id.endsWith(`/${schemaName}`),
    );
    assert(schema, `Missing schema: schemas/${schemaName}`);
    const validate = ajv.getSchema(schema.$id as string);
    assert(validate, `Schema did not compile: schemas/${schemaName}`);
    schemasChecked += 1;

    records.forEach((record, index) => {
      if (!validate(record)) {
        throw new Error(
          `Schema validation failed for ${collection}[${index}]: ${formatAjvErrors(validate.errors)}`,
        );
      }
      checked += 1;
    });
  }

  return { schemas: schemasChecked, records: checked };
}

function validateIndexes(universe: CanonUniverse): number {
  let checked = 0;

  for (const collection of indexedCollections) {
    const entries = universe.indexes[collection] ?? [];
    const expected = [...entries].sort((a, b) => a.localeCompare(b));
    assert(
      JSON.stringify(entries) === JSON.stringify(expected),
      `index/${collection}.json is not sorted.`,
    );
    assert(
      new Set(entries).size === entries.length,
      `index/${collection}.json contains duplicate paths.`,
    );

    for (const entry of entries) {
      assert(
        entry === entry.replaceAll("\\", "/"),
        `Index path must use forward slashes: ${entry}`,
      );
      assert(
        entry.startsWith(`data/${collection}/`),
        `Index path is in the wrong collection: ${entry}`,
      );
      assert(
        fs.existsSync(path.join(repositoryRoot, entry)),
        `Indexed file does not exist: ${entry}`,
      );
      checked += 1;
    }

    const dataDirectory = path.join(repositoryRoot, "data", collection);
    if (fs.existsSync(dataDirectory)) {
      const actual = fs
        .readdirSync(dataDirectory)
        .filter((name) => name.endsWith(".json"))
        .map((name) => `data/${collection}/${name}`)
        .sort((a, b) => a.localeCompare(b));
      assert(
        JSON.stringify(entries) === JSON.stringify(actual),
        `index/${collection}.json does not exactly match data/${collection}.`,
      );
    } else {
      assert(
        entries.length === 0,
        `data/${collection} is missing for a non-empty index.`,
      );
    }
  }

  return checked;
}

function validateReferences(universe: CanonUniverse): {
  idCount: number;
  referenceCount: number;
} {
  const allEntityRecords = Object.values(universe.collections).flat();
  const sharedRecords = Object.values(universe.shared).flat();
  const allRecords = [...allEntityRecords, ...sharedRecords];
  const ids = new Set<string>();
  const slugs = new Set<string>();

  for (const record of allRecords) {
    if (typeof record.id === "string") {
      assert(!ids.has(record.id), `Duplicate stable ID: ${record.id}`);
      assert(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.id),
        `Invalid stable ID: ${record.id}`,
      );
      ids.add(record.id);
    }
    if (typeof record.slug === "string") {
      assert(!slugs.has(record.slug), `Duplicate canonical slug: ${record.slug}`);
      slugs.add(record.slug);
    }
  }

  let references = 0;
  const expectRef = (id: unknown, context: string): void => {
    if (id === null || id === "TBD") {
      return;
    }
    assert(typeof id === "string" && ids.has(id), `Broken reference ${context}: ${String(id)}`);
    references += 1;
  };

  for (const team of getCollection<RawTeam>(universe, "teams")) {
    expectRef(team.organization.id, `${team.id}.organization`);
    team.roster.forEach((id) => expectRef(id, `${team.id}.roster`));
    team.coachingStaff.forEach((id) =>
      expectRef(id, `${team.id}.coachingStaff`),
    );
    team.mentors.forEach((id) => expectRef(id, `${team.id}.mentors`));
    expectRef(team.captain, `${team.id}.captain`);
  }

  for (const player of getCollection<RawPlayer>(universe, "players")) {
    expectRef(player.currentTeam, `${player.id}.currentTeam`);
    expectRef(player.firstAppearance, `${player.id}.firstAppearance`);
    validateRelationships(player.id, player.relationships, expectRef);
  }

  for (const staff of getCollection<RawStaff>(universe, "coaches")) {
    expectRef(staff.currentOrganization, `${staff.id}.currentOrganization`);
    expectRef(staff.currentTeam, `${staff.id}.currentTeam`);
    expectRef(staff.firstAppearance, `${staff.id}.firstAppearance`);
    validateRelationships(staff.id, staff.relationships, expectRef);
  }

  for (const episode of getCollection<RawEpisode>(universe, "episodes")) {
    episode.characters.forEach((id) => expectRef(id, `${episode.id}.characters`));
    episode.organizations.forEach((id) =>
      expectRef(id, `${episode.id}.organizations`),
    );
    episode.teams.forEach((id) => expectRef(id, `${episode.id}.teams`));
  }

  for (const tenure of getCollection<RosterTenure>(
    universe,
    "roster-tenures",
  )) {
    expectRef(tenure.continuityId, `${tenure.id}.continuityId`);
    expectRef(tenure.playerId, `${tenure.id}.playerId`);
    expectRef(tenure.organizationId, `${tenure.id}.organizationId`);
    expectRef(tenure.teamId, `${tenure.id}.teamId`);
    expectRef(tenure.gameId, `${tenure.id}.gameId`);
    expectRef(tenure.roleId, `${tenure.id}.roleId`);
    tenure.sourceIds.forEach((id) => expectRef(id, `${tenure.id}.sourceIds`));
  }

  for (const tenure of getCollection<StaffTenure>(universe, "staff-tenures")) {
    expectRef(tenure.continuityId, `${tenure.id}.continuityId`);
    expectRef(tenure.personId, `${tenure.id}.personId`);
    expectRef(tenure.organizationId, `${tenure.id}.organizationId`);
    expectRef(tenure.teamId, `${tenure.id}.teamId`);
    expectRef(tenure.divisionId, `${tenure.id}.divisionId`);
    tenure.responsibilityIds.forEach((id) =>
      expectRef(id, `${tenure.id}.responsibilityIds`),
    );
    tenure.sourceIds.forEach((id) => expectRef(id, `${tenure.id}.sourceIds`));
  }

  for (const source of getCollection<SourceRecord>(universe, "sources")) {
    expectRef(source.continuityId, `${source.id}.continuityId`);
    assert(
      fs.existsSync(path.join(repositoryRoot, source.path)),
      `Source path does not exist: ${source.path}`,
    );
  }

  for (const collection of ["competitions", "standings", "awards"]) {
    for (const record of universe.collections[collection] ?? []) {
      for (const field of ["continuityId", "gameId", "competitionId", "seasonId", "stageId", "teamId", "recipientId"]) {
        if (field in record) expectRef(record[field], `${record.id}.${field}`);
      }
      for (const field of ["sourceIds", "seasonIds", "participantTeamIds"]) {
        if (Array.isArray(record[field])) record[field].forEach((id) => expectRef(id, `${record.id}.${field}`));
      }
      if (Array.isArray(record.prizeDistribution)) {
        record.prizeDistribution.forEach((prize: { teamId: string | null }) => expectRef(prize.teamId, `${record.id}.prizeDistribution`));
      }
    }
  }

  return { idCount: ids.size, referenceCount: references };
}

function validateRelationships(
  ownerId: string,
  relationships: CanonRelationship[],
  expectRef: (id: unknown, context: string) => void,
): void {
  relationships.forEach((relationship) =>
    expectRef(relationship.subjectId, `${ownerId}.relationships`),
  );
}

function validateDates(universe: CanonUniverse): void {
  for (const competition of universe.collections.competitions ?? []) {
    validateDateRange(competition.startDate as string | null, competition.endDate as string | null, String(competition.id));
  }
  for (const tenure of getCollection<RosterTenure>(
    universe,
    "roster-tenures",
  )) {
    validateDateRange(tenure.joinedDate, tenure.leftDate, tenure.id);
  }
  for (const tenure of getCollection<StaffTenure>(universe, "staff-tenures")) {
    validateDateRange(tenure.startedDate, tenure.endedDate, tenure.id);
  }
}

function validateDateRange(
  start: string | null,
  end: string | null,
  id: string,
): void {
  if (isIsoDate(start) && isIsoDate(end)) {
    assert(start <= end, `${id} ends before it begins.`);
  }
}

function validateEpisodes(universe: CanonUniverse): void {
  const episodes = getCollection<RawEpisode>(universe, "episodes").sort(
    (a, b) => a.episodeNumber - b.episodeNumber,
  );
  assert(
    episodes.length === universe.version.episodeRecordsCreatedThrough,
    "Episode record count does not match version metadata.",
  );
  episodes.forEach((episode, index) => {
    assert(
      episode.episodeNumber === index + 1,
      `Episode chronology gap at ${episode.id}.`,
    );
  });
}

function validateRosterInvariants(universe: CanonUniverse): void {
  const teams = byId(getCollection<RawTeam>(universe, "teams"));
  const players = byId(getCollection<RawPlayer>(universe, "players"));
  const tenures = getCollection<RosterTenure>(universe, "roster-tenures");
  const activeKeys = new Set<string>();

  for (const tenure of tenures.filter(
    (record) => record.rosterStatus === "active",
  )) {
    const key = `${tenure.playerId}:${tenure.teamId}`;
    assert(!activeKeys.has(key), `Duplicate active roster tenure: ${key}`);
    activeKeys.add(key);
  }

  const kairos = teams.get("kairos-lol-main");
  assert(kairos, "Missing Kairos League main team.");
  const active = tenures.filter(
    (tenure) =>
      tenure.teamId === kairos.id && tenure.rosterStatus === "active",
  );
  assert(active.length === 5, "Kairos League must have exactly five active tenures.");
  assert(
    new Set(active.map((tenure) => tenure.roleId)).size === 5,
    "Kairos League active roles must be unique.",
  );
  const captains = active.filter((tenure) => tenure.isCaptain);
  assert(
    captains.length === 1 && captains[0]?.playerId === "daniel-moss-reyes",
    "Moss must be the only Kairos League captain.",
  );
  const mid = players.get("mason-404-brooks");
  assert(mid?.role === "Mid" && mid.isCaptain === false, "404 must remain a non-captain Mid.");
  assert(
    kairos.competitiveHistory.length === 0 &&
      Object.keys(kairos.statistics).length === 0,
    "Kairos League cannot have official results or statistics before debut.",
  );
}

export function validatePublication(
  universe: CanonUniverse,
  manifest: PublicationManifest,
): void {
  const collectionMap: Array<[keyof PublicationManifest, string]> = [
    ["enabledOrganizations", "organizations"],
    ["enabledTeams", "teams"],
    ["enabledPlayers", "players"],
    ["enabledStaff", "coaches"],
    ["enabledCompetitions", "competitions"],
    ["enabledMatches", "matches"],
    ["enabledTransfers", "transfers"],
  ];

  for (const [manifestKey, collection] of collectionMap) {
    const available = new Set(
      getCollection<{ id: string }>(universe, collection).map(
        (record) => record.id,
      ),
    );
    const enabled = manifest[manifestKey];
    assert(
      new Set(enabled).size === enabled.length,
      `${manifestKey} contains duplicates.`,
    );
    enabled.forEach((id) =>
      assert(available.has(id), `${manifestKey} references missing ID: ${id}`),
    );
  }

  const games = new Set(
    (universe.shared.games ?? []).map((record) => record.id as string),
  );
  manifest.enabledGames.forEach((id) =>
    assert(games.has(id), `enabledGames references missing ID: ${id}`),
  );

  assert(
    manifest.enabledTeams.length === 1 &&
      manifest.enabledTeams[0] === "kairos-lol-main",
    "Initial publication may expose only Kairos League main.",
  );
  assert(
    manifest.enabledPlayers.length === 5,
    "Initial publication must expose exactly five players.",
  );
  assert(
    manifest.enabledMatches.length === 0 &&
      manifest.enabledTransfers.length === 0,
    "Initial publication cannot expose matches or transfers.",
  );
}

function formatAjvErrors(errors: ErrorObject[] | null | undefined): string {
  return (errors ?? [])
    .map((error) => `${error.instancePath || "/"} ${error.message ?? "invalid"}`)
    .join("; ");
}

function isIsoDate(value: string | null): value is string {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}
