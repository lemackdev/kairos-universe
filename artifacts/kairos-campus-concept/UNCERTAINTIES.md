# Uncertainties and visualization assumptions

This model shows what Kairos Campus is known to contain as of Episode 128
(2027-02-07). Canon fixes functions and a few relationships. It fixes no
geometry. Everything below was needed to make a 3D scene and is **not canon**.
None of it was written back to any canon file.

## What is confirmed and preserved

| Fact | Source | How the model keeps it |
| --- | --- | --- |
| Separate League of Legends and Counter-Strike buildings | CAMPUS.md | Two detached buildings |
| Sala Black, Blue, White; CS Main, CS Academy Green | CAMPUS.md, masterplan.ts, Ep. 100, brief | One room each, five stations each |
| Recreation Center between dormitories and performance center | Ep. 86 | Residential, Recreation Center, Performance in one row |
| Recreation Center directly connected to the gym by a corridor | Ep. 86 | Corridor object with a door at each end |
| Covered court (basketball, futsal, volleyball), two table-tennis tables, mobility area, no stands | Ep. 86 | Modeled; exactly two tables; no seating tiers |
| Kairos Commons in the west wing, shared by both divisions | Ep. 100 | One wing, one lounge, no per-division split |
| Commons tour order: Maker Lab, Music, Photo & Film, Kitchen, then Kairos Community at the end of the corridor | Ep. 100 | Rooms in that order along one corridor |
| Contents of each Commons room | Ep. 100 | Every listed item is modeled |
| Outdoor area: multipurpose court, half basketball court, futsal space, smooth skate strip, tables, covered area | Ep. 100 | Modeled next to the Commons, separate from the indoor court |
| Kitchen Studio is much smaller than the professional dining kitchen | Ep. 100 | Two different rooms in two buildings |
| Arthur lives in the residential area | Ep. 86, CAMPUS.md | Marker on the residential massing, tagged LAYOUT_TBD |
| Future divisions not built | CAMPUS.md, brief | Empty plot with dashed outline |

## Open questions the model had to answer provisionally

Each row is a decision an author would have to make. The model's answer is a
placeholder.

| Unknown | Placeholder used | Where to change it |
| --- | --- | --- |
| Site shape, size, orientation | Rectangle; no north; "west wing" drawn on the left by convention | `layout_proposal.json` `site` |
| What the Commons is the west wing of | A wing next to the dining building, joined by a short covered link | `rooms`, `commons_dining_link` |
| Which side of the corridor the Commons rooms are on | All on one side | `rooms` |
| Sizes of every room and building | Schematic units, furniture-driven | `rooms` rects |
| Number of floors | One level everywhere | generator |
| Where the League and CS buildings sit, and the distance between them and the Commons | Side by side in the middle of the site | `rooms` |
| Whether dedicated coaching, VOD or tactical rooms exist | One proposed support room per building, tagged PROPOSED_VISUALIZATION | inventory |
| Station arrangement, hardware, coach tables, screens | One row of five, one table | generator `training_room` |
| Location and layout of the dining hall and professional kitchen | Own building; table count is not a capacity | `rooms` |
| Location and layout of administration, Adrian's office, meeting and media rooms | One small building, tagged proposed placement | `rooms` |
| How health functions are split into rooms | Four rooms beside the gym; psychology room without windows | `rooms` |
| Whether the gym and health rooms share one "performance center" building | Yes, one building | `rooms` |
| Number, shape and capacity of residential buildings | Three closed volumes around a garden court; no interior, no unit count; facade glazing is rhythm only | `residential_masses` |
| Arthur's unit: position and configuration; whether Project Casa Arthur was built | Marker only, arbitrary position | `arthur_marker` |
| Whether "espaço para futsal" is its own pitch or the multipurpose court | Goals and lines on the multipurpose court | generator `outdoor` |
| Where the skateboard cabinet is | Under the covered area | generator `outdoor` |
| Type of outdoor cover | Timber pergola | generator `outdoor` |
| How many microphones in the Music Room | Two | generator `commons` |
| Where karaoke, TV, tabletop and group meals happen in the Commons | All in the main room, karaoke on a movable cart | generator `commons` |
| Location and size of the future expansion space | Empty plot on one side | `future_zone` |
| Materials and style | Plaster, wood, glass, metal; diagram tint on floors | generator materials |
| Paths, trees, hedges, lamps, benches, terraces | Illustrative | `paths`, generator `landscape` |
| Sun direction | Arbitrary | generator |

## Deliberately absent

No street address or street frontage, no gates, no parking, no north arrow, no
scale bar, no areas or lengths, no restaurant premises or brands, no arena or
spectator stands, no rooms for Street Fighter 6, Rocket League, F1 sim racing or
EA Sports FC, no pet-therapy facility, no hospital, no separate Casa Arthur, no
residential interiors.

## Source gaps

- Episodes 107 to 128 are not all in the repository world state. Facts taken
  only from the brief are marked `project brief` in `campus_inventory.json`
  (Academy Green name, later Commons uses, health staff, future-game interest).
- "Performance center" is named in Episode 86 but its contents beyond the gym
  are not described.
- `masterplan.ts` lists a "reception", "cafeteria" and "staff accommodation" as
  proposals. They have no canon support and are not modeled as rooms.
