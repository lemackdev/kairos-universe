# Kairospedia Publications

The media archive at `/wiki/publications`. It simulates the press that surrounds
Kairos Esports, Asterion Intelligence, and the competitive world: news,
interviews, features, announcements, and so on. It is **fiction**, kept apart
from real journalism.

**Current content:** none. The collections are empty on purpose. The foundation
(schemas, validation, loaders, routes, search, UI) is in place and waits for
approved content.

Not to be confused with [PUBLICATION_WORKFLOW.md](PUBLICATION_WORKFLOW.md), which
covers which canon entities Kairospedia publishes.

## Data model

Three indexed collections, each with a JSON Schema in `/schemas`:

| Collection | Folder | Index | Schema |
| --- | --- | --- | --- |
| Publishers | `data/publishers/` | `index/publishers.json` | `schemas/publisher.schema.json` |
| Authors | `data/authors/` | `index/authors.json` | `schemas/author.schema.json` |
| Publications | `data/publications/` | `index/publications.json` | `schemas/publication.schema.json` |

Index files list every record path, sorted, exactly like the other collections.
Blank starting points live in `website/templates/` (`PUBLISHER`, `AUTHOR`,
`PUBLICATION`). `npm run entity:new-publication|publisher|author` creates a
scaffold under `.generated/drafts/`.

### Publication fields

| Field | Notes |
| --- | --- |
| `id`, `slug` | Stable kebab-case. The slug `publishers` is reserved. |
| `title`, `subtitle` | Headline and deck. |
| `publisherId`, `authorIds`, `byline` | A byline is required when there are no authors, for example "Staff report". |
| `publicationDate` | **In-universe** publication date. `TBD` is allowed only on drafts. |
| `fictionalWorldDate` | The story date the piece is anchored to. May differ for retrospectives. |
| `articleType` | `news`, `interview`, `editorial`, `feature`, `investigation`, `press-release`, `announcement`, `competition-coverage`, `analysis`, `historical`. |
| `classification` | See below. |
| `canonStatus` | `confirmed`, `soft-canon`, `unconfirmed`, `retconned`, `non-canonical`. |
| `publicationStatus` | `draft`, `published`, `archived`. |
| `featured` | Chooses the front-page lead. Otherwise the newest story leads. |
| `summary` | Up to 360 characters. Used in listings, search, and metadata. |
| `content` | Typed blocks. See below. Never put article text in React components. |
| `cover` | `null`, or `{ path, alt, width, height, credit }`. Files live in `website/public/publications/`. |
| `related*Ids` | Organizations, teams, players, staff, competitions, games, episodes, other publications. |
| `sourceIds` | Source records. At least one for anything public. |
| `realWorldCitation`, `rumorAuthorization` | Required for those classifications, forbidden otherwise. |
| `corrections` | `{ date, kind: correction | update | editors-note, text }`. Shown after the body. |
| `notes` | Continuity notes for authors. Never rendered. |
| `lastUpdated` | Real-world date the record was last edited. Not a canon date. |

### Content blocks

`paragraph`, `heading` (level 2 or 3), `pullQuote`, `list`, `image`, `embed`,
`factBox`. Level-2 headings feed the in-article table of contents when there are
three or more.

**Inline entity links.** Any text field may contain
`[[kind:id|label]]`, where kind is `organization`, `team`, `player`, `staff`,
`competition`, or `game`. Example: `[[team:kairos-lol-main|Kairos Gaming]]`
becomes a link to the team page. IDs are validated, and entities named inline or
in `related*Ids` appear in the article's "In Kairospedia" rail.

**Embeds** never use an iframe. `availability` is `available` (needs a `url`,
opens in a new tab), `unavailable`, or `not-yet-published` (must have no `url`).

## Classification

| Value | Meaning | Rules enforced |
| --- | --- | --- |
| `in-universe-publication` | Original fiction | No real-world byline; no citation. |
| `official-announcement` | A fictional official statement | Same as above. |
| `real-world-reference` | A pointer to real published material | Needs `realWorldCitation`; publisher must be `real-world-reference`; body capped at 400 words (summarize and cite, do not reproduce). |
| `rumor` | Unconfirmed speculation | Needs `rumorAuthorization` and `canonStatus: unconfirmed`. Only with explicit author approval. |

Every article page opens with a disclosure bar stating its classification.

**Real-world publishers.** If a publisher portrays a real entity (for example a
real esports outlet or a game company), set `originType: real-world-reference`,
name it in `realWorldEntity`, and write a `coverageDisclosure`. The disclosure is
printed on every article. Fictional coverage under such a publisher can never be
bylined to a real person, and quotations must not be attributed to real
journalists.

## Status workflow

1. **Draft.** Date may be `TBD`. Not in the catalog, routes, search, or build
   output. Private-internal sources are allowed while drafting.
2. **Published.** Needs a concrete `publicationDate` that is not after the
   current narrative date (`kairos-version.json`), a summary, a paragraph, at
   least one source, and no private-internal or retconned sources. Cannot be
   `retconned` or `non-canonical`.
3. **Archived.** Still public and listed, for superseded or historical pieces.

Do not invent a publication date. Keep a piece as a draft until the story
establishes one.

### Previewing drafts locally

```bash
cd website
KAIROSPEDIA_PREVIEW_DRAFTS=1 npm run canon:build && npm run search:build
npx next dev
```

Drafts then render with a "Draft preview" banner and `noindex`. **Never deploy a
build made with this flag.** Re-run `npm run canon:prepare` afterwards.

## Guardrails from canon

- A private or internal event is not public reporting. Private scrims, internal
  tournaments, and similar are `private-internal-record` sources, and validation
  refuses to let a published piece rest on one. Do not create competition
  records for them.
- A planned or private development is not announced until the story says it was.
  An interview that took place has not necessarily been released; use an embed
  with `availability: not-yet-published` and no `url`.
- Do not invent results, qualifications, transfers, or contracts.
- Published articles may link only to entities that are published on Kairospedia.
  If an article names an unpublished entity, the build fails with the entity ID.
  Either add it to `website/kairospedia-publication.json` (an author decision) or
  remove the reference.

## Pending author decisions

- **Asterion Intelligence page.** `asterion-intelligence` is not in
  `enabledOrganizations`, so there is no `/wiki/organizations/asterion-intelligence`
  and publications cannot link to it yet. Enabling it is a one-line manifest
  change, plus updating the organizations expectation in
  `website/tests/catalog.test.ts`. Not done, because it changes the wiki's
  publication scope.
- **Asterion's website URL** is not canon. It is read from
  `NEXT_PUBLIC_ASTERION_URL`; when unset, no link is shown.

## Where things live

| Concern | Path |
| --- | --- |
| Types | `website/src/types/publications.ts` |
| Inline links, outline, labels, filters | `website/src/lib/publications/` |
| Validation | `website/src/lib/publications/validate.ts` |
| Catalog build and routes | `website/src/lib/publications/build.ts`, called from `website/scripts/build-canon.ts` |
| UI | `website/src/components/publications/` |
| Pages | `website/src/app/wiki/publications/` |
| Tests | `website/tests/publications.test.ts` (fixtures are in memory; nothing is written to `data/`) |

## Routes

- `/wiki/publications`: archive with featured story, search, category, publisher,
  entity, and date filters. Filters persist in the URL.
- `/wiki/publications/[slug]`: article.
- `/wiki/publications/publishers/[slug]`: publisher archive. Publishers and
  authors with no public article are not shown.
