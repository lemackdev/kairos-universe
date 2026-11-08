# Author Directive: Counter-Strike 2 External Organizations and Rosters (2027)

**Canon status:** CONFIRMED
**Source type:** Direct author-confirmed canon directive (not sourced from episode prose)

Backs `data/competitive-world-overrides/counter-strike-external-rosters-2027.json`
and extends the existing freeze in
`data/competitive-world-overrides/counter-strike-roster-freeze-2027.json`
(no second freeze directive exists).

## Nature of the data

The roster list is a **fictional-universe roster directive based on a historical
HLTV reference snapshot**. The author-supplied workbook `hltv_team_rosters.xlsx`
dates the HLTV research to **2026-11-06**; that date is not a fictional signing
date. No contract start dates, transfer announcements, roles, ages, birth dates,
salaries, results, rankings, qualifications or tournament participation are
established. The workbook lists the active five only (no coaches, stand-ins or
benched players) and does not state in-game roles; none is inferred and roster
order is not a role. The data must not be presented as a verified report of
real-world 2027 rosters.

## Scope

50 organizations, 50 Counter-Strike 2 teams, 250 starting assignments, five per
team. The workbook's 51st team (Chicken Coop, HLTV 13107) is excluded completely:
no organization, team, player, roster association or freeze entry exists for it.
The source workbook is not modified.

## Identity model

HLTV team IDs identify Counter-Strike team records, not corporate organizations;
they are stored as external references on the Counter-Strike team entities.

- **One global organization, several game divisions.** Where an organization
  already exists through League of Legends, its identity is reused and only a
  separate Counter-Strike team record is created (`external-cs-team-<key>`,
  slug `external-cs-<key>`). A League team ID is never reused as a Counter-Strike
  team ID, and frozen 2026 records are not edited.
- Reused organizations (11): NRG, FURIA, paiN (paiN Gaming), Vitality (Team
  Vitality), Natus Vincere, G2 (G2 Esports), Liquid (Team Liquid), Ninjas in
  Pyjamas, fnatic (Fnatic), FlyQuest, Fluxo (Fluxo W7M).
- New organizations (39): created with the minimum fields (name, source, team).
- Fluxo (HLTV 11837) is confirmed by the author as the same organization as
  `external-lol-org-fluxo-w7m`: the League division is named Fluxo W7M, the
  Counter-Strike division is named Fluxo.
- Organization identity for Counter-Strike is checked against HLTV, not
  Leaguepedia. BIG is the German organization; OG exists only in Counter-Strike 2.
- Same-name disambiguation follows the workbook note: Imperial is the Brazilian
  organization; OG is the European organization (HLTV 10503); Alliance is the
  Swedish organization; HEROIC is the Swedish-based organization; Liquid is the
  North American team.
- Players: 249 new identities (`external-cs-player-<nickname>`) plus the reused
  Jake "Stewie2K" Yip (`jake-stewie2k-yip`). Players are never merged by
  nickname alone. Nickname-only matches with unrelated League records are
  recorded as separate people (see the import report).

## Stewie2K and Without a Roof

Stewie2K is the same Jake Yip who is Head Coach of Kairos Academy Green. His
existing identity is reused; no second Stewie2K exists.

On 2027-01-29 Jake receives an offer from Without a Roof to return as a
professional player. He accepts the sporting proposal and is listed on the
Without a Roof roster as a former Kairos employee. Kairos begins searching for a replacement and Tarik has been contacted
as a prospective candidate.

- His Kairos coach tenure is preserved and still has no end date; no exact
  contractual departure date is invented. Accepting the proposal is kept
  distinct from completing the administrative transition.
- Tarik is **not** appointed and has not accepted any role.
- The Without a Roof roster belongs to the post-announcement 2027 continuity;
  Stewie2K is not shown as a Without a Roof player in earlier episodes.
- Kairos Academy's player roster is unchanged.

## Freeze

All 50 rosters are frozen through **2027-05-23, inclusive** (PGL Copenhagen Major,
2027-05-07 to 2027-05-23). The earliest author-approved change date is
2027-05-24; nothing changes automatically on that date. The freeze does not imply
that any imported team qualified for the Major.

## Preserved

Kairos Counter-Strike Main (Atlas, Glacier, MoteConHuesillo, Mold, FLACOGOMEZ)
and Academy (RAMENSOUP, velcroDAWG, p4rkingl0t, dentalplan, wrongnumber) are
unchanged. Existing League organizations, teams and rosters, frozen 2026 data,
episodes and results are unchanged. No ratings, rankings or tournament data are
created.
