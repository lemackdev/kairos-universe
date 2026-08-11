/**
 * Stable-ID and slug generation for external (real-world-reference) entities.
 *
 * Stable IDs are namespaced (`external-lol-<kind>-<slug>`) so they can never
 * collide with a fictional Kairos Universe record, which never carries the
 * `external-` prefix. User-facing KairosDB slugs may be shorter, but the
 * internal stable ID always stays namespaced.
 */

const KIND_PREFIX: Record<string, string> = {
  player: "external-lol-player",
  team: "external-lol-team",
  organization: "external-lol-org",
  staff: "external-lol-staff",
};

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export interface SlugRegistry {
  taken: Map<string, string>;
}

export function createSlugRegistry(): SlugRegistry {
  return { taken: new Map() };
}

/**
 * Reserves a user-facing slug for an entity ID within a single kind's
 * namespace. On collision, appends a disambiguator derived from the source
 * page rather than silently merging two different entities.
 */
export function reserveSlug(
  registry: SlugRegistry,
  kind: string,
  desired: string,
  entityId: string,
  disambiguator: string,
): string {
  const key = `${kind}:${desired}`;
  const existingOwner = registry.taken.get(key);
  if (!existingOwner || existingOwner === entityId) {
    registry.taken.set(key, entityId);
    return desired;
  }

  const disambiguated = `${desired}-${slugify(disambiguator)}`;
  const disambiguatedKey = `${kind}:${disambiguated}`;
  registry.taken.set(disambiguatedKey, entityId);
  return disambiguated;
}

/**
 * Builds the globally namespaced stable ID for an external entity. Uses the
 * Leaguepedia OverviewPage / page title (not the display nickname) as the
 * source-page identity, so disambiguated pages
 * (e.g. "PlayerName (page-disambiguator)") produce distinct stable IDs even
 * when their display nicknames collide.
 */
export function buildStableId(
  kind: "player" | "team" | "organization" | "staff",
  sourcePageTitle: string,
): string {
  const prefix = KIND_PREFIX[kind];
  return `${prefix}-${slugify(sourcePageTitle)}`;
}
