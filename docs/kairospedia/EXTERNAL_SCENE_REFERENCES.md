# External Competitive Scene References

The user authorized expanding Kairospedia with the pre-Worlds 2026 League
scene: LCK, LPL, LEC, CBLOL, LCS, LCP and NACL only. This adds historical
reference pages without changing the Kairos story or approving a new fictional
competitive-world baseline.

## Data Boundary

Canonical `data/`, episode archives, narrative version and story date remain
unchanged. The new [snapshot](../../external-data/pre-worlds-2026/README.md)
holds individual reference entities and event-scoped roster observations.
IDs use `external-lol-*`; public slugs use `external-*` to avoid collisions
with existing Kairos routes.

The [external manifest](../../website/kairospedia-external-publication.json)
controls enabled leagues separately from the canonical publication manifest.
Hiding a league removes its teams, brand pages, players without another
enabled observation, roster rows and search entries. Shared players retain
only published observations. Hidden Kairos divisions remain hidden.

## Build Pipeline

1. Validate each league research file against its JSON schema.
2. Normalize deterministic identities and resolve source/team/player links.
3. Compare every individual record and path-only index with the reviewed inputs.
4. Validate region coverage, roles, distinct identities and unknown fields.
5. Filter using the external publication manifest.
6. Append separate reference view models, routes and search entries to the
   generated catalog without modifying the canonical catalog collections.

External pages use the team and player article structure. They prominently
identify their review status, snapshot basis and sources. They do not reuse
Kairos's pre-debut claims: missing imported results do not mean a real team
has played no matches.

## Review Before Fictional Adoption

Check official final registrations or dated, revision-stable tournament
sources before declaring this the frozen fictional competitive ecosystem.
Resolve the Maryville brand-label discrepancy and role ambiguities. Preserve
OMG/UP's older fallback labels. Do not invent contracts or merge observed
event membership with active employment. Apply any future approved fictional
deviations through the existing override workflow, not silent source edits.

Kairospedia exposes reference articles at `/wiki/world`, team, organization and
player routes. KairosDB remains a separate application and retains its old
selected snapshot until explicitly migrated. No competitions, match results,
transfers or statistics were populated by this task.
