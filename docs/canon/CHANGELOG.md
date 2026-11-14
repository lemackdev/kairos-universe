# Canon Changelog

## 0.33.0 - Kairoswitter

- Added Kairoswitter, the in-universe feed (/wiki/kairoswitter): one JSON file per post in data/kairoswitter/posts/, accounts and profiles derived from the authors, posts limited to 280 characters and shown once the story date reaches them. Rules for writing posts are in docs/kairoswitter/README.md.
- Added five sample posts from Episode 117 (the CCT North America #1 invite and Tarik joining Kairos Academy Green).
- Rebuilt the home page: a short hero, the next event with a day count, upcoming events, the Counter-Strike top 8, the latest Kairoswitter posts and the Kairos teams. The top bar now shows six main links and a "More" menu, and uses the hamburger below 1180px.
- Kairoswitter: new handles (real-world people use their own, executives NameLastname, players mix @KG_nick, nicknames and invented ones, the organization is @KairosGaming), @tags inside posts link to the account, the time sits at the bottom of each post, and a Portuguese post by Sofia Alvarez was rewritten in English.
- Home page restyled flat (no gradients, one radius, one accent); the Natus Vincere logo is visible in the ranking.
- Phone layout: hamburger menu, search box empties after navigating, capped infobox logos.

## 0.32.0 - Counter-Strike world ranking

- Added a hand-maintained Counter-Strike world ranking page (/wiki/rankings/counter-strike) seeded with the 2026-11-09 HLTV positions of all 50 repository teams; see docs/canon/CS_WORLD_RANKING_2027.md.
- Replaced 22 low-quality Counter-Strike team logos (website preview images and logos with solid backgrounds) with the HLTV team logos, with white variants for dark mode; both Kairos Counter-Strike teams are listed last on the ranking page.
- Drew the IEM Dallas 2027 group stage at random: 4 groups of 4, the two best of each group advance; added round-robin Bo3 matches, a Bo3/Bo5 playoff bracket and a calculated prize split. CCT North America #1 (the other 16-team Counter-Strike event) follows the same pattern.
- Applied the 16-team page pattern (groups, matches, bracket, prize split, all teams TBD) to every non-Major Counter-Strike tournament: Tier 1 and Tier 2 have 16 teams, Tier 3 has 8; see docs/canon/CS_TOURNAMENT_PATTERN_2027.md. Kairos Gaming and Without a Roof are in different CCT North America #1 groups.
- Completed nationalities and legal names for the remaining flagless League roster players; Music is retired and hidden from the Cupid eSports roster.

## 0.31.0 - Episodes 115-118

- Canonized Episodes 115-118 from 107-118.docx (prose archived in archive/episode-sources/kairos_115_118_import/); Episodes 107-114 were verified against the document and left unchanged.
- Registered the 2027-01-28 IEM Dallas and CCT North America #1 announcements (invite date) and Kairos Gaming's first confirmed Counter-Strike event.
- Added Tarik as Head Coach of Kairos Academy Green; corrected the Stewie2K record's episode and date metadata (Episode 117, 2027-01-28).
- Added four private League scrim records (2027-01-28 and 2027-01-29); none affects standings.
- Extended timelines for Kairos coaches, mentors and players.

## 0.30.0 - Organization overviews

- Added overviews for 107 external organizations and 21 Tier 2 teams, written from Wikipedia and public esports reporting.
- Team pages now open with the organization overview in place of the generated scope text; the CS Roster freeze section was removed.

## 0.29.0 - Counter-Strike player roles

- Added roles for 250 Counter-Strike 2 players from the HLTV role icons: 46 AWPers, 41 IGL / Riflers, 4 IGL / AWPers and 159 Riflers.
- External CS team pages now use the standard roster table (NAT, Player, Name, Role).

## 0.28.0 - Leaguepedia legal names

- Added 227 legal names for nickname-only 2027 players from Leaguepedia (data/competitive-world-overrides/player-legal-names-2027.json).
- Added Leaguepedia nationalities for EMEA Masters, Circuito Desafiante, LCP Challengers, CBLOL and NACL players.
- Every nickname-only player now has a legal name.

## 0.27.0 - Roster table regions and nationalities

- Region column now shows the league's code: KR (LCK, LCK Challengers), CH (LPL, LDL), SA (CBLOL, Circuito Desafiante), PCS (LCP, LCP Challengers), EU (LEC, EMEA Masters), NA (LCS, NACL).
- NAT column shows each player's real-world nationality: South Korea and China for the Korean and Chinese leagues, and individual nationalities for CBLOL, LCP and LEC.
- Added 104 nationalities (Curse Brazil, Shad0w Taiwan and Hizto Vietnam by author directive). Popp (Vietnam) and SamiKin (Cambodia) by author directive.
- No contract, signing date or announcement date is established.

## 0.26.0 - Circuito Desafiante 2027 rosters

- Registered the 2027 Circuito Desafiante lineups for Estral Esports, 7REX, KaBuM! IDL, VKS Academy, INTZ, RMD Gaming, Ei Nerd Esports and paiN Academy (40 starters).
- Estral Esports and 7REX field only Spanish-speaking players (Argentina, Chile, Peru); the other six teams field Brazilian players.
- Excluded Bwipo (not eligible), nine players who already start in CBLOL 2027, and the Peruvian Relax (nickname collision). Surplus players were not created.
- Manel (2026 RED Canids) receives a transfer departure; 39 starters are nickname-only identities with flag nationality.
- No contract, signing date or announcement date is established.

## 0.25.0 - LCP Challengers 2027 rosters

- Registered the 2027 LCP Challengers lineups for CFO Academy, Ground Zero Academy, SillySilly Gaming, Frank Esports, EWH, Reignfall, RogerSaMa and Sponge Gaming (40 starters).
- Excluded players with a mainland China or South Korea flag, and Leaky, Yuhe and Chain1 who already start in LCP 2027. Added Nern, nTnT, Vin, HRK, Jericho and chico to fill the open slots.
- All 40 are nickname-only identities. Nationality comes from the flags in the author's screenshots (Taiwan, Hong Kong, Vietnam, Japan); three players have no flag and no nationality.
- Hong Kong now maps to its own HK region code on roster tables.
- No contract, signing date or announcement date is established.

## 0.24.0 - LDL 2027 rosters

- Registered the 2027 LDL lineups for BLG Junior, TES Challenger, Oh My God, EDG Youth Team, WBG Youth Team, LGD Young Team, WE Academy and AL Young (40 starters).
- Players already starting or retired in LPL 2027 (ZUIAN, Nia, Erha, Moham, sinian) were excluded. Heru and Tyrion left the free-agent list; Heru, Tyrion, re0 and Starry receive transfer departures from their 2026 tenures.
- Retired thirteen surplus players as nickname-only identities; 36 starters are nickname-only identities.
- No contract, signing date or announcement date is established.

## 0.23.0 - LCK Challengers 2027 rosters

- Registered the 2027 LCK Challengers lineups for T1 Esports Academy, Dplus Kia Challengers, KT Rolster Challengers, Nongshim Esports Academy, DN SOOPers Challengers, Kiwoom DRX Challengers, BNK FEARX Youth and Hanwha Life Esports Challengers (40 starters).
- Players already starting or retired in LCK 2027 were excluded. Ghost and Pollu (2026 KT Rolster) receive transfer departures; 38 starters are nickname-only identities.
- Retired five surplus players (Ripple, DDahyuk, Courage, Kemish, Tempester) as nickname-only identities.
- No contract, signing date or announcement date is established.

## 0.22.0 - EMEA Masters 2027 rosters

- Registered the 2027 EMEA Masters lineups for Galions, Solary, Movistar KOI Fénix, Anubis Gaming, TLN Pirates, Kaufland Hangry Knights, G2 NORD and Karmine Corp Blue (40 starters).
- Added 40 nickname-only identities. Guli moves from Jungle to Mid, as approved by the author; every team received a mixed lineup.
- Carlsen, Aetinoth, HARPOON, Zoelys and Kamiloo stay in LEC 2027 and are not part of this set.
- No contract, signing date or announcement date is established.

## 0.21.0 - NACL 2027 rosters

- Registered the 2027 NACL lineups for Blue Otter, Dorado Gaming, Maryville University, NRG, Sentinels (NACL), University of Mississippi and Winthrop University (35 starters), with Kairos Academy Blue unchanged.
- Author-approved role changes: Wilson and Will (Jungle to Top), Sushee (ADC) and Aeon Crystal (Jungle to Support).
- Added two nickname-only identities (Dcoy, Nordik) and cleared 13 free-agent records, kept as prior status. Only35 and Cody Sun fill the two slots the author's pool could not.
- Closed the seven NACL vacancies on NRG, Maryville University and Winthrop University.
- Sentinels (NACL) now lists its roster on its team page.
- No contract, signing date or announcement date is established.

## 0.20.0 - Tier 3 events and 2027 CCT North America #1 invites

- Added a new competition tier, `tier-3`, below Tier 2, and a `south-america` region value.
- Added fifteen 2027 Counter-Strike events: Americas LAN #1-#5 (Tier 3 LAN, USA, Canada, Mexico), ZOTAC Cup Masters in Cordoba, Curitiba, Calgary and Columbus (Tier 2 LAN), EPICENTER 2027 #1 and #2 (Tier 3 online) and DreamHack Open #1-#4 (Tier 3 online).
- Every new event starts in March 2027 or later, none runs in July, none overlaps a Major, and none overlaps another new event. Three March and April events overlap Premier or Tier 2 events because those months are full. Prize pools run from USD 15,000 to USD 50,000.
- Added organizers Americas LAN, ZOTAC, EPICENTER and DreamHack, and one series for each.
- Registered the sixteen CCT North America #1 2027 invited teams, including Kairos Gaming. No team is also an IEM Dallas 2027 invitee.
- No participants, format, seeding, results or qualification are established for any of these events.

## 0.19.0 - 2027 LCK and LCP rosters, retirements, and corrections

- Registered the author-approved 2027 LCK and LCP starting lineups (8 teams and 40 starters each) as overlay files (`lck-rosters-2027.json`, `lcp-rosters-2027.json`) in the existing 2027 roster mechanism. The LCK directive supersedes all earlier LCK drafts.
- Registered 32 LCK and 9 LCP retirements. Faker is retired; Diable is retired once. Historical 2026 tenures are preserved and superseded, never edited.
- Reversed two earlier statuses: Loki's LCS retirement was removed (he starts Mid for BRION; Cloud9's lineup is unchanged) and Taeyoon's free-agent record was cleared (he starts ADC for Nongshim RedForce).
- TheShy, BuLLDoG, Kael, kyeahoo and Poby moved from the Korean market lists to LCK starting slots; JunJia moved from the LPL market list to SoftBank HAWKS gaming. Burdol and Viper remain unassigned.
- Twelve overlay identities were added: Chain1, Leaky and retirees Bluffing, Enosh and DDoiV match Leaguepedia records; Quantum, Painter, Popp, Yuhe and retirees Slayer and Pleata are nickname-only with no invented biography.
- Twelve free-agent records that contradicted confirmed statuses were removed and kept as prior status. No announcement date is established.

## 0.18.0 - 2027 LPL and CBLOL rosters, retirements, and market players

- Registered the author-approved 2027 LPL and CBLOL starting lineups (8 teams and 40 starters each) as overlay files (`lpl-rosters-2027.json`, `cblol-rosters-2027.json`) using the existing 2027 roster mechanism.
- Registered 13 LPL and 10 CBLOL retirements. Xiaohao, Zdz and Tangyuan stay active. Historical 2026 tenures are preserved and superseded, never edited.
- Nine LPL players (Keshi, Feather, fengyue, Burdol, TheShy, BuLLDoG, Viper, Kael, JunJia) are available for later Chinese, Korean (LCK) and PCS (LCP) decisions and are not assigned.
- Nine overlay identities were added: five matched to Leaguepedia records (Brance, Envy, frosty, Grevthar, Leleko) and four named by the author with no source record (Viciun, Telas, Yupps, Netuno); no biography is invented for the latter. JD Gaming Top ZUIAN reuses the existing 2026 record.
- Free-agent records that contradicted a confirmed 2027 status were removed from `free-agents-2027.json` and kept as prior status on the new records. No announcement date is established.

## 0.17.0 - 2027 external Counter-Strike 2 organizations and rosters

- Imported the author-approved external Counter-Strike 2 rosters from `hltv_team_rosters.xlsx` (HLTV reference snapshot researched 2026-11-06) as a fictional-universe roster directive: 50 teams, 250 starting players, five per team. Chicken Coop (HLTV 13107) is excluded completely. The workbook is unmodified.
- Reused eleven existing League of Legends organization identities (NRG, FURIA, paiN Gaming, Team Vitality, Natus Vincere, G2 Esports, Team Liquid, Ninjas in Pyjamas, Fnatic, FlyQuest, Fluxo W7M) and created only their separate Counter-Strike team records; 39 new organizations were created. Fluxo (HLTV 11837) is the same organization as Fluxo W7M, author-confirmed.
- HLTV team IDs are stored as external references on the Counter-Strike team records, not on organizations. 249 player identities were created; Stewie2K reuses `jake-stewie2k-yip`.
- Recorded the 2027-01-29 Without a Roof offer to Jake Yip: sporting proposal accepted; he is listed on the Without a Roof roster as a former Kairos employee, with no end date recorded on his coach tenure. Tarik is only a contacted candidate and is not registered.
- Extended the existing Counter-Strike roster freeze (through 2027-05-23) to the 50 rosters instead of creating a second directive. No roles, contracts, results, rankings or qualification were created; Kairos rosters and frozen 2026 data are unchanged.

## 0.16.0 - 2027 LEC rosters, retirements, and departures

- Registered the eight 2027 LEC starting lineups in the Kairos Universe overlay without modifying the frozen 2026 reference data. All 40 positions resolve to player identities; the Karmine Corp and Team Vitality supports (Zoelys, Myrtus) were added as overlay identities from author-supplied Leaguepedia pages.
- Added seven author-approved overlay identities: Harpoon, Kamiloo, Carlsen, Aetinoth and Fresskowy (Leaguepedia 2026-08-03 snapshot) plus Zoelys and Myrtus (author-supplied Leaguepedia pages).
- Added the fourteen author-confirmed named retirements (ISMA, Skeanz and Sheo resolved from their existing team histories), preserving career history.
- Registered kyeahoo and Poby as available for the Korean market (unassigned); Busio (Cloud9) and jojopyun (Team Liquid) keep their LCS assignments.
- Superseded the previous active 2027 memberships of every transferred, retired or departing player; 2026 tenures are preserved. No collective announcement date is established, so former-team Left dates stay unknown.
- Free agents reduced 74 to 64; the Karmine Corp support and Movistar KOI mid LCS-era vacancies are resolved by the LEC lineups.

## 0.15.0 - 2027 LCS rosters, retirements, and Counter-Strike roster freeze

- Confirmed the eight 2027 LCS starting lineups (as of 2027-01-27) in the Kairos Universe overlay without modifying the frozen 2026 reference data. Kairos Gaming is unchanged.
- Added the twelve author-confirmed named retirements, preserving career history.
- Reconciled the 2027 free-agent list: players with a confirmed assignment or retirement are no longer current free agents; the earlier period is kept as prior status.
- Identity decisions: KyRa is the existing KryRa record; eXyu is added as a sourced 2027-overlay identity.
- Established the external Counter-Strike 2 roster freeze through 2027-05-23 (earliest later change date 2027-05-24). No external CS2 roster, transfer, or qualification was created.

## 0.14.0 - Episodes 107-114 and 2027 League eligibility and calendar revision

- Canonized Episodes 107-114 (2027-01-20 through 2027-01-27) from the author-supplied prose, archived under archive/episode-sources/kairos_107_114_import/.
- Added four private practice records for the Counter-Strike Main and Academy sessions against unnamed independent groups (Episode 112); none affect standings or statistics.
- Added the Competitive Ledger opinion article published 2027-01-27 (Episode 114) as its own publication, leaving the 2027-01-15 interview untouched.
- Added the 2027 League regional player eligibility ruleset (import ban), announced 2027-01-26.
- Revised League Tier 1 Stage 1 to 2027-02-15 through 2027-03-14 and set the roster registration deadline to 2027-02-12. First Stand, Tier 2, Counter-Strike, the July break, and the frozen 2026 reference data are unchanged.
- Not included: 2027 external rosters, named retirements, transfers, ratings, or Counter-Strike roster changes.

## 0.11.0 - Episodes 76-90 and December 2026

- Reconstructed Episodes 76-90 from the preserved 186-page PDF, with documented searchable-source normalizations and no alteration to the PDF or Episodes 1-75.
- Established New Balance as Kairos' signed fictional-universe official technical apparel partner (2026-12-04), publicly announced with the 2027 uniforms (2026-12-07). Contract terms remain unknown.
- Canonized Hai Du Lam as Academy Blue Head Coach and Miles "Sable" Warren as Academy White Head Coach. Added staff records, tenures, portraits, and Kairospedia profile publication.
- Added Dr. Maya Torres and Dr. Evelyn Park to Kairos' confidential wellbeing program from 2026-12-16. Private disclosures are not public profile facts.
- Updated Arthur Fletcher's current residence to the campus residential area while preserving the earlier Mackenzie state as history.
- Recorded the fictional Riot policy and 2027 competitive direction; no official result, standings, or first-match date was fabricated.
- Set the current episode to 90 (2026-12-18) and the primary competitive debut window start to 2027-02-08, explicitly not a first-match date.

## Unreleased - Kairos Leadership Identities and Portraits

- Established the full names Claire Whitcomb, Ethan Calder, Sofia Alvarez, and Marcus Bell by direct author instruction.
- Kept all four stable IDs, roles, and first-appearance records unchanged; archived episode prose remains unchanged.
- Added distinct illustrative staff portraits to their existing Kairospedia profiles. Appearance does not establish age, ancestry, or other biographical canon.

## Unreleased - Main-Roster Portraits and Counter-Strike Publication

- Added ten illustrative portraits in the new black kit: five revised League
  portraits and five CS portraits, preserving original image versions.
- Enabled Kairospedia pages for the existing Counter-Strike main team, its five
  signed players and Head Coach Luk. Added source-linked current roster and
  coaching tenures without inventing unknown start dates.
- Atlas remains captain; FLACOGOMEZ remains 17. No signing, official result,
  story episode or narrative date changed. All academies remain unpublished.
- Appearance details are art proposals, not new biography. Portrait provenance:
  [version 2 notes](../../assets/players/portraits-v2/PORTRAIT_NOTES.md).

## Unreleased - Approved 2027 Visual Identity

- Preserved the original Kairos and Asterion logos and reconstructed eight
  complete jersey assets from author-approved references, retaining originals.
- Added four indexed uniform records, ten indexed visual-asset records, schemas,
  hash/reference validation, and publication-filtered branding for both apps.
- Black is shared by both main teams; Blue and White are League academies;
  Green is Counter-Strike Academy. No roster or promotion rule was changed.
- New Balance remains pending formal narrative canonization. Asterion is the
  parent company and Principal Institutional Partner, not an external sponsor.
- No episode, story date, contract, announcement or match result was added.
- Details: [uniform system](../branding/2027_UNIFORM_SYSTEM.md) and
  [asset cleanup notes](../branding/ASSET_CLEANUP_NOTES.md).

## Unreleased - Nationality Clarification

- Author confirmation on 2026-10-30 establishes American nationality for rkN,
  Vanta, Moss and Mold, and Canadian nationality for 404 and Aster, using their
  established home-country backgrounds.
- MoteConHuesillo is Mexican and Chilean; FLACOGOMEZ is American and Brazilian.
- Added optional nationalities arrays while retaining the existing primary
  nationality scalar for backward compatibility.
- Temporary training locations do not change nationality. Unknown academy
  hometowns and unverified external-player nationalities remain unknown.
- No historical episode text, story date, roster or contract was changed.

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
