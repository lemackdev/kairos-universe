# Canon Changelog

## 0.10.0

This is an architecture and competitive-world data release, not a new
narrative episode. It does not advance `storyEpisode`, `currentNarrativeDate`,
`storyPeriod`, `storyYear`, `reconstructedThroughEpisode`, or
`episodeRecordsCreatedThrough`.

- Introduced **KairosDB** (`kairosdb/`) as a separate product from
  Kairospedia: an independent Next.js App Router application, its own
  `package.json`, routes, generated catalogs, validation scripts, visual
  identity, and README. Kairospedia remains the narrative canon encyclopedia
  and is unchanged in scope or behavior by this release.
- Added a reusable Leaguepedia API client
  (`kairosdb/scripts/leaguepedia/`) with Cargo and MediaWiki query support,
  pagination, rate limiting, exponential-backoff retry, raw-response caching,
  and resumable imports.
- Established the frozen **`leaguepedia-2026-08-03`** external snapshot
  policy: source `leaguepedia`, effective Kairos Universe period
  end-of-2026-season, frozen with automatic updates disabled, next review
  window 2027 midseason. See
  [SNAPSHOT_POLICY.md](../kairosdb/SNAPSHOT_POLICY.md).
- Added the normalized external data model (organizations, teams, players,
  staff, roster tenures, staff tenures, sources) with namespaced stable IDs
  (`external-lol-*`) that can never collide with fictional Kairos IDs, plus a
  review/approval pipeline (`imported` → `validated` → `approved` /
  `needs-review` / `rejected`).
- Added a two-layer frozen-world resolver
  (`kairosdb/src/lib/resolver/`) supporting future Kairos Universe overrides
  layered on top of the frozen snapshot. No override was created in this
  release — `data/competitive-world-overrides/` remains empty.
- Added cross-links between Kairospedia and KairosDB for the five published
  Kairos League players and the Kairos League team only. No external player
  or team gained a Kairospedia page.
- Added `external-data/leaguepedia/` (raw responses, normalized records,
  indexes, and import reports) and `data/competitive-world-overrides/`, kept
  entirely separate from `data/players/*.json` and `data/teams/*.json`.
- Added no Counter-Strike content to KairosDB, no imported images, no
  long-form biography text, no match history, no fictional transfer, and no
  tournament result not explicitly imported.
- Updated `kairos-version.json`: `canonVersion` 0.9.0 → 0.10.0,
  `competitiveDatabaseImplemented: true`, and documentation-phase notes
  describing the KairosDB/Kairospedia product split.

## 0.9.0

- Activated Kairospedia as the repository's Next.js presentation and indexing
  layer without advancing the story beyond Episode 75 or 2026-11-24.
- Added a build-time canon loader, Draft 2020-12 schema validation, stable-ID
  reference resolution, publication filtering, local search, and generated
  route catalogs.
- Published only Kairos Esports, the Kairos League of Legends main team, its
  five active players, directly associated League staff, and confirmed
  mentorship relationships.
- Added first-class roster tenure, staff tenure, source, and continuity
  records for the published scope.
- Added future-ready schemas and empty indexes for transfers, competitions,
  stages, match games, maps, lineups, standings, statistics, and awards.
- Added narrative-date age calculation and historical roster, staff, and
  lineup resolution.
- Added safe entity-draft tooling, Kairospedia workflow documentation, tests,
  production-build validation, and internal-link validation.
- Preserved all hidden canonical divisions and entities without publishing
  their routes or search records.
- Added no match, transfer, competition, statistic, contract term, salary,
  ranking, result, achievement, external organization, or unsupported fact.

## 0.8.0

- Canonized Episodes 57 through 75 from the complete supplied DOCX and created
  continuous structured episode records through Episode 75.
- Preserved the supplied Episodes 57-75 DOCX byte-for-byte and created a
  searchable normalized Markdown source with a separate correction log.
- Normalized Academy recruitment scenes so decisions remain with Adrian,
  Emily, Luk, Trace, management, analysts, and scouting personnel rather than
  Counter-Strike main-roster players.
- Preserved Arthur Fletcher as Owen's grandfather and removed the source
  conflict that placed Arthur in campus staff or Academy recruitment roles.
- Completed the Counter-Strike main roster on 16/11/2026 when Cameron "Mold"
  Ruiz and Vincente "FLACOGOMEZ" Galán accepted offers and signed.
- Registered the 18/11/2026 Dust2 campus interview as editorial media coverage,
  not sponsorship or commercial partnership.
- Registered the 20/11/2026 fictional-universe Team Liquid series as a private,
  non-public, non-official, non-ranking, non-tournament practice scrim and kept
  its partial statistics separate from official career statistics.
- Created the complete five-player Counter-Strike Academy roster without
  assigning positions, captaincy, an IGL, substitutes, or starter hierarchy.
- Established Jake "Stewie2K" Yip as Academy Head Coach and Ethan "Trace"
  Miller as Development Coach, both effective 23/11/2026.
- Added the December League Phase Two plan without changing any League roster
  or Moss's captaincy.
- Advanced the narrative endpoint to Episode 75 on 24/11/2026.
- Preserved the 25/11/2026 Kairos Thanksgiving gathering as planned and not
  completed.
- Added no official match, achievement, ranking, salary, unsupported contract
  term, Academy position, or Team Liquid player identity.

## 0.7.0

- Confirmed the exact date of birth and role of every established League of
  Legends and Counter-Strike player, using 07/11/2026 as the age-reference
  date.
- Confirmed complete positional rosters for League Main, Academy Blue, and
  Academy White while preserving Moss as the only League captain and 404 as a
  non-captain Mid laner.
- Confirmed all League Academy players are between 16 and 18 years old.
- Updated Caleb "Atlas" Mercer to IGL / Rifler, Owen "Glacier" Fletcher to
  Primary AWPer, Emiliano "MoteConHuesillo" Navarro to Rifler, Cameron "Mold"
  Ruiz to Entry, and Vincente "FLACOGOMEZ" Galán to Support / Anchor.
- Confirmed Glacier and MoteConHuesillo as signed Counter-Strike main-roster
  players while preserving Atlas as the first signing and Founding Captain.
- Confirmed Mold has received an invitation but remains unsigned until
  acceptance is established.
- Promoted FLACOGOMEZ from a future reservation to an active structured
  prospect after his interview, while preserving that no formal offer,
  acceptance, contract, or roster place is confirmed.
- Retconned Owen Fletcher's previous age-16 claim to 18 based on his confirmed
  02/12/2007 birth date.
- Retconned Cameron Ruiz's previous age-19 claim to 18 based on his confirmed
  11/01/2008 birth date.
- Retconned Vincente Galán's previous reserved age of 18 to 17 based on his
  confirmed 29/07/2009 birth date.
- Retconned the Counter-Strike Academy age range from 15-17 to 16-18 and
  removed age-19 main-roster eligibility.
- Confirmed that main-team players do not participate in Academy recruitment
  and that Stewie2K is not a canonical Academy coach.
- Added the five empty planned Counter-Strike Academy role slots without
  creating Academy players.
- Added compound Counter-Strike role values, the teammate relationship value,
  and ISO date validation for player birth dates.
- Preserved Episode 56 and 07/11/2026 as the current narrative endpoint.
- Added no official match, result, ranking, statistic, salary, unsupported
  contract term, or Academy player.

## 0.6.0

- Added authoritative normalized prose for Episodes 30 through 56.
- Normalized formatting across all 27 episodes and preserved source
  provenance and SHA-256 checksums.
- Completed source recovery and structured reconstruction through Episode 56.
- Preserved the supplied DOCX byte-for-byte and added a searchable Markdown
  source plus a generated PDF reading copy.
- Confirmed Caleb Mercer as the Counter-Strike Atlas identity while preserving
  Mason "404" Brooks as the League Mid laner.
- Confirmed Glacier as Owen Fletcher's nickname and MoteConHuesillo as Emiliano
  Navarro's nickname.
- Removed Cameron "Mold" Ruiz's unsupported trial state, set his role to Entry,
  moved his first appearance to Episode 38, and left nationality as TBD.
- Kept the candidate in Episodes 48 through 53 anonymous and outside entity,
  relationship, timeline, roster, and pipeline records.
- Restored first-person narration in Episodes 53, 55, and 56 metadata and
  normalized three residual Episode 53 sentences in the searchable source and
  rendered PDF.
- Normalized Episode 54 chronology and established Project Casa Arthur as
  conditional and unbuilt.
- Confirmed 07/11/2026 as Saturday and the exact date of Episodes 55 and
  56.
- Preserved Aphromoo and Thinkcard's roles in Episode 56 and explicitly
  identified 404 and Moss without changing League roles or captaincy.
- Anchored Atlas's signing and Founding Captain appointment to Episode 39.
- Preserved Glacier and MoteConHuesillo as unsigned evaluation players and Mold
  as an unsigned scouted Entry.
- Added Arthur Fletcher and Richard Collins with source-backed first
  appearances and relationships.
- Recorded the first internal Counter-Strike scrim in Episode 49 and clarified
  that Episode 51 contains no scrim.
- Added the "recruit the person before the player" philosophy and related
  communication, character, and cultural-fit evaluation rules.
- Added the organization-wide food-service vote and policy: 143 voters, 126
  yes, 17 no, with three chains selected for invitations and negotiations
  only.
- Added the `early-november-2026` story period plus the Entry and Rifler role
  values.
- Preserved FLACOGOMEZ only in future planning, with no active player entity or
  narrative linkage.
- Added no unsupported contract, salary, statistic, ranking, official match
  result, partnership, construction, or relocation.

## 0.5.6

- Added structured canon records for Episodes 43 through 53.
- Registered the titles "O Convite," "A Resposta," "A Ligação," "Chegadas,"
  "Primeiro Contato," "O Arquivo Sem Nome," "Primeira Scrim," "Um Lugar à
  Mesa," "Teste de Pressão," "Além da Demo," and "A Pergunta."
- Advanced Owen Fletcher and Emiliano Navarro into active evaluation while
  preserving their unsigned status.
- Preserved Cameron Ruiz as an unsigned prospect under active scouting without
  an invitation.
- Recorded Caleb Mercer's tactical leadership, captaincy practice, teammate
  evaluation, and participation in the first internal Counter-Strike scrim.
- Added the people-first, communication, character-reference, cultural-fit,
  and internal-scrim recruitment principles.
- Updated Adrian Vale, Luk, Trace, Emily Chen, Counter-Strike relationships,
  the current world state, and the master timeline.
- Reserved Vincente "FLACOGOMEZ" Galán as one isolated future character without
  an episode appearance, timeline event, roster position, scouting record,
  relationship, contact, invitation, evaluation, or contract.
- Preserved Caleb as the only signed Counter-Strike player and only Founding
  Captain.
- Preserved the archived PDF and Episodes 1 through 42 without alteration.
- Added no unsupported prose, exact dates, contracts, salaries, rankings,
  statistics, results, or future-character involvement.

**Repository note:** The source requested a change from `0.5.3` to `0.5.4`,
but the living repository was already at `0.5.5`. This additive batch therefore
advances canon to `0.5.6`.

## 0.5.5

- Added structured canon records for Episodes 36 through 42.
- Registered the titles "Até o Fim da Estrada," "A Pergunta Certa," "O
  Primeiro Convite," "Capitão," "Primeiro Round," "Mold," and
  "MoteConHuesillo."
- Anchored Caleb Mercer's signing and Founding Captain appointment to Episode
  39 without changing his biography, role, or first appearance.
- Confirmed Owen Fletcher's non-binding three-week evaluation invitation while
  preserving his unsigned status.
- Added the then-current Cameron Ruiz Entry Fragger profile and Episode 41
  first-appearance metadata; both are superseded by the source-backed 0.6.0
  correction.
- Completed Emiliano Navarro's identity, Rifler profile, Episode 42 first
  appearance, canonical MoteConHuesillo nickname, and unsigned evaluation
  state.
- Updated Adrian Vale, Luk, Trace, Emily Chen, Counter-Strike relationships,
  the prospect pipeline, and League Academy development state.
- Preserved Caleb as the only signed Counter-Strike player and only confirmed
  Counter-Strike captain.
- Preserved the archived PDF and Episodes 1 through 35 without alteration.
- Added no unsupported prose, exact dates, contract terms, salaries, rankings,
  statistics, or results.

**Repository note:** The source requested a change from `0.5.2` to `0.5.3`,
but the living repository was already at `0.5.4`. This additive batch therefore
advances canon to `0.5.5`.

## 0.5.4

- Renamed the Counter-Strike character Mason Brooks to Caleb Mercer.
- Preserved the nickname Atlas.
- Resolved the duplicate-name conflict with League of Legends Mid laner Mason
  "404" Brooks.
- Preserved Atlas's biography, IGL role, relationships, Episode 30 first
  appearance, signed status, and Founding Captain position.
- Migrated active roster, captain, episode metadata, timeline, relationship,
  scouting, organization, and index references to `caleb-atlas-mercer`.
- Removed the obsolete Counter-Strike player entity after reference migration.
- Preserved the archived PDF and historical Episodes 1 through 29 without
  alteration.
- Added no unsupported biography, contract term, salary, statistic, ranking,
  result, or exact date.

**Repository note:** The checked-in version before this update was `0.5.1`; no
`0.5.3` version artifact existed. The approved target version is `0.5.4`.

## 0.5.1

- Canonically identified the previously unnamed narrator as Adrian Elias Vale,
  commonly known as Adrian Vale.
- Added one canonical character record establishing Adrian as the main
  protagonist and first-person narrator.
- Migrated narrator, founder, owner, and CEO references to the
  `adrian-elias-vale` stable ID.
- Preserved the historical episode prose and archived PDF without alteration.
- Added no unsupported age, birth, family, relationship, education, ethnicity,
  physical appearance, or personal-history details.
- Confirmed Adrian's relationship to Asterion Intelligence and Kairos Esports.
