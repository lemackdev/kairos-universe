# Content and Source Policy

## Source hierarchy

1. Canonical structured files under `data/`.
2. Current human-readable canon under `docs/`.
3. Current world state and master timeline.
4. Normalized episode sources.
5. Archived historical sources.

The website does not override this hierarchy.

## No duplicated facts

Components must receive names, roles, dates, roster state, captaincy,
relationships, and sources from generated view models. They must not embed
separate player biographies or roster facts.

Short summaries may be generated from confirmed structured fields. They must
not add unsupported motivation, personality, history, or achievement.

## Unknown information

- Required unknown scalar: use the repository convention, commonly `TBD`.
- Optional unknown scalar: use `null` or omit it when the schema permits.
- No entries: use an empty array or object.
- UI output: display `Unknown`, `TBD`, or hide the row.

Never infer nationality from city, birth date from age, team history from
reputation, or contract terms from roster membership.

## Sources

Every new Kairospedia-era entity or event requires source IDs.

Source registry records include a readable public label and a repository path.
Public pages expose the label, type, origin, and canon status without exposing
unnecessary filesystem details.

## Protected material

- Historical episode prose and archived PDFs remain unchanged.
- Retconned aliases may appear only in clearly labeled historical contexts.
- Private events remain separate from public and official records.
- Publication filtering cannot delete, confirm, or retcon canon.

## Review checklist

1. Verify the canonical record and source.
2. Check stable IDs and aliases for duplication.
3. Resolve every reference.
4. Confirm unknown fields remain unknown.
5. Confirm hidden entities do not appear in generated pages or search.
6. Confirm real-world references carry fictional-event clarity.
7. Run `npm run validate`.
