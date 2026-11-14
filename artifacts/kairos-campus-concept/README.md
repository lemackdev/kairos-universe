# Kairos Campus conceptual 3D model

**IMPLANTAÇÃO CONCEITUAL, SEM ESCALA. FUNÇÕES BASEADAS NO CÂNONE; GEOMETRIA NÃO CANONIZADA.**

A Blender scene of Kairos Campus, Los Angeles, as known at Episode 128
(2027-02-07). Room functions and a few relationships come from canon. Every
size, position and shape is a placeholder. This folder changes no canon file.

## Files

| File | What it is |
| --- | --- |
| `kairos_campus_master.blend` | Editable scene, organized in collections `00` to `13` |
| `build_kairos_campus.py` | Generator. Rebuilds the scene, validates it, saves the `.blend`, renders |
| `campus_inventory.json` | Every area: name, canon status, source, known contents, unknowns |
| `layout_proposal.json` | All geometry (room rectangles, doors, windows, paths, cameras). All proposed |
| `source_provenance.json` | What each source establishes and what it does not |
| `validation_report.json` | Result of the 16 checks from the last build |
| `UNCERTAINTIES.md` | Confirmed facts versus placeholders, and open questions |
| `renders/` | Seven stills at 3840 px wide |
| `renders/preview/` | The same seven at one third size |
| `preview.png` | Small isometric overview |

## Rebuild

```bash
blender -b --python build_kairos_campus.py -- --render final
```

Add `--export glb` to also write the web model (`website/public/campus/campus.glb`) and
its room data (`website/src/lib/campus/campus-viewer.json`) for the interactive viewer on
`/wiki/campus`.

Options: `--render preview` (fast, one third size), `--render none` (build and
save only), `--only 01,03` (chosen cameras). The build stops before saving if a
check fails. It uses only primitives and the Inter font bundled with Blender, so
no outside asset is needed.

To move or resize something, edit its rectangle in `layout_proposal.json` and
rebuild. Rectangles are `[x0, y0, x1, y1]` in schematic units. Openings are
`[position along the wall, width, door | window | open]`.

## Reading the scene

- Each room is a collection named like its object, for example
  `Commons_Maker_Lab`. The object with that name is an empty that parents the
  floor, walls and furniture and carries the custom properties `canon_status`,
  `canonical_name`, `functional_purpose`, `source_reference`,
  `layout_is_proposed`, `notes`.
- Roofs exist but are hidden so the cameras see inside. Enable the
  `*_Roof_Hidden_For_Cutaway` collections to see closed buildings. The
  residential volumes are always closed, because no interior is known.
- `Board_Masterplan_Only` holds the title, legend and disclaimer. It is shown
  only by camera 01.
- Floor colors mark zones for reading the plan. They are not team branding.

## Canon status values

`CONFIRMED`, `CONFIRMED_FUNCTION_LAYOUT_TBD`, `PROPOSED_VISUALIZATION`,
`PLANNED_NOT_BUILT`, `UNKNOWN`. Status describes the function. Geometry is
proposed for every object.

## Checks run on every build

Three League rooms and two CS rooms with five stations each; five Commons
rooms; Commons shared by both divisions; Recreation Center between residential
and performance; corridor to the gym with a door at each end; indoor and
outdoor courts separate; Arthur as a marker and no Casa Arthur building; future
zone empty; no restaurant, arena, dimension, address or parking text; exactly
two table-tennis tables; all metadata present; disclaimer on the board.

## Limits

- Furniture is built from boxes, cylinders and spheres. It is recognizable, not
  photoreal.
- Labels are 3D text in the scene (Portuguese), not a separate compositing pass.
- One level only. No floor counts are known.
