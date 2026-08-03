# Story Structure

See [Future Canon Reservations](FUTURE_CANON_RESERVATIONS.md) for concepts that
are approved for possible later use but are not active story entities or
events.

**Document type:** Narrative planning rules

## Narrative frame

Kairos Universe uses Adrian Elias Vale, commonly known as Adrian Vale, as its
main protagonist and first-person narrator. He is:

- The founder and CEO of Asterion Intelligence.
- The founder and owner of Kairos Esports.

The original historical prose does not name the narrator. Current canon
metadata identifies him as Adrian. Future episodes may use his name naturally
when another character addresses or introduces him.

## Narrative horizon

Kairos is designed as a multi-year narrative. Long-term sustainability, player
development, and institutional growth matter more than immediate trophies, even
though competitive ambition remains extremely high.

The long-term competitive goals include winning Worlds and Counter-Strike
Majors. These are goals, not achieved results.

## Current story point

- Story start: early 2026.
- Current story date: 24/11/2026.
- Current story episode: Episode 75.
- Kairos is training and has not officially debuted.
- The next League of Legends and Counter-Strike competitive milestone is
  planned for February 2027.
- Caleb "Atlas" Mercer is the signed Counter-Strike IGL / Rifler and Founding
  Captain.
- Owen "Glacier" Fletcher and Emiliano "MoteConHuesillo" Navarro are signed.
- Cameron "Mold" Ruiz and Vincente "FLACOGOMEZ" Galán are signed, completing
  the Counter-Strike main roster.
- The five-player Counter-Strike Academy roster is complete without permanent
  playing positions, captaincy, or an IGL.
- League Phase Two external practice is planned for December.
- The Kairos Thanksgiving gathering is planned for 25/11/2026 and has not
  occurred.

The complete current snapshot is maintained in
[CURRENT_WORLD_STATE.md](../world-state/CURRENT_WORLD_STATE.md).

## Episode Record Model

Episodes 1 through 75 now have structured records in `data/episodes/`. The
record model includes:

- Stable ID, slug, episode number, and publication order
- Nullable title, summary, and exact date
- Record, canon, and reconstruction statuses
- Approximate story period
- Narrator, protagonist, divisions, locations, characters, organizations, and
  teams
- First appearances
- Historical titles and immutable archive page ranges
- Key events, consequences, introduced canon, and changed canon
- Continuity dependencies and notes
- Historical notes and real-world references
- Retcons
- Structured source references and confidence
- Missing information, confirmed facts, and unconfirmed details

The current story episode is 75. Episodes 1 through 29 are reconstructed from
the immutable historical PDF. Episodes 30 through 56 are reconstructed from
their authoritative normalized source package. Episodes 57 through 75 are
reconstructed from the preserved supplied DOCX and normalized searchable
source. Episodes 1 through 24 retain
**TBD** current titles while preserving their historical Portuguese titles.
Episodes 25 through 29 retain their current English working titles and
historical titles.

See the [episode documentation guide](../episodes/EPISODE_DOCUMENTATION.md).

## Documentation Phase Status

- Organization foundation: complete
- League of Legends characters and teams: complete
- Shared infrastructure: complete
- Counter-Strike staff and scouting: complete
- Episode Reconstruction Phase A: complete
- Historical source recovery: complete
- Counter-Strike Founding Captain canonization: complete
- Canon Batch 36-42: complete
- Canon Batch 43-53: complete
- Canon Batch 54-56: complete
- Episodes 30-56 source normalization and canonization: complete
- Player roles, birth dates, and current Counter-Strike status: complete
- Episodes 57-75 source normalization and canonization: complete
- Thanksgiving break and December preparation: next

The source-integration phase reconstructs every episode record while keeping
historical conflicts separate from current canon. It does not promote every
historical detail to living canon.

## Continuity workflow

After every future episode:

1. Create or update the structured episode record.
2. Update the current world state.
3. Add confirmed events to the
   [master timeline](../timeline/MASTER_TIMELINE.md).
4. Update affected character, team, organization, competition, and contract
   records.
5. Add a [retcon entry](../retcons/RETCON_HISTORY.md) if established canon is
   removed or replaced.
6. Check all changes against the [canon rules](../canon/CANON_RULES.md).

## Narrative constraints

- Do not turn plans into completed events.
- Do not create results, contracts, salaries, rankings, or statistics to fill
  gaps.
- Do not use real-world background as proof of fictional involvement.
- Do not assign exact dates when only event order or a relative period is known.
- Do not sacrifice canon consistency for narrative convenience.

## Related Documents

- [Counter-Strike division](../counter-strike/COUNTER_STRIKE_DIVISION.md)
- [IGL scouting](../counter-strike/IGL_SCOUTING.md)
- [Episode index](../episodes/EPISODE_INDEX.md)
- [Episode reconstruction status](../episodes/EPISODE_RECONSTRUCTION_STATUS.md)
- [Episode source audit](../episodes/EPISODE_SOURCE_AUDIT.md)
- [Episode continuity rules](../episodes/EPISODE_CONTINUITY_RULES.md)
- [Current world state](../world-state/CURRENT_WORLD_STATE.md)
