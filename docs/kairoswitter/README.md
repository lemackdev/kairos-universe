# Kairoswitter

Kairoswitter is the in-universe feed of the Kairos organization, teams, players and staff. It reads like a short-post timeline (author, handle, time, text) with no retweets, likes, replies or mentions. **A post's text is canon.**

- Feed: `/wiki/kairoswitter` - account pages: `/wiki/kairoswitter/accounts/<handle>` - single post: `/wiki/kairoswitter/posts/<slug>`
- One file per post in `data/kairoswitter/posts/`, named `<id>-<slug>.json`. Nothing else has to be edited: `npm run canon:prepare` (in `website/`) validates the posts and builds the pages.
- Every published player, staff member, team and the organization has an account, including accounts with no posts. Handles are chosen in `data/kairoswitter/accounts.json` (`"key": "player:<id>"`, `"handle"`): 3-20 letters, digits or `_`, unique ignoring case, shown as written. Real-world people use their well-known handle (`@Aphromoo`, `@Doublelift`, `@tarik`); executives and some staff use NameLastname (`@AdrianVale`, `@EmilyChen`); Kairos Gaming players mix `@KG_Atlas`, plain nicknames (`@Vanta`) and invented ones (`@soup_crimes`); the organization is `@KairosGaming`. The display name is the person's real name (the nickname when it is TBD). A new published entity needs a handle there or the build stops. Avatars use `/kairoswitter/avatars/<id>.png` when present, then the player or staff portrait, then an initial.

## Post file

```json
{
  "id": "post-20270128-001",
  "slug": "kairos-esports-cct-invite",
  "continuityId": "kairos-universe",
  "authorType": "organization",
  "authorId": "kairos-esports",
  "text": "Kairos Gaming has been invited to CCT North America #1, which starts on 8 February.",
  "postedAt": "2027-01-28T17:40",
  "timeZone": "PT",
  "storyDate": "2027-01-28",
  "episodeIds": ["episode-117"],
  "sourceIds": ["source-episodes-115-118"],
  "relatedTeamIds": ["kairos-cs-main"],
  "relatedPlayerIds": [],
  "relatedStaffIds": [],
  "relatedCompetitionIds": ["cct-north-america-1-2027"],
  "pinned": false,
  "canonStatus": "confirmed",
  "notes": []
}
```

| Field | Rule |
| --- | --- |
| `authorType` / `authorId` | `organization`, `team`, `player` or `staff`, and the id of a published entity (for example `kairos-esports`, `kairos-cs-main`, `caleb-atlas-mercer`, `tarik-kairos-cs-academy-head-coach`). |
| `text` | At most 280 characters. Plain text. |
| `postedAt` + `timeZone` | Local time of the post, `YYYY-MM-DDTHH:MM`, and its zone label (`PT`). The date must equal `storyDate`. |
| `storyDate` | The story day of the post. A post is shown only when `storyDate` is on or before `currentNarrativeDate` in `kairos-version.json`; later posts stay in the data and appear when the story reaches that date. It cannot be earlier than any of its episodes. |
| `episodeIds` / `sourceIds` | At least one of them. Every id must exist. |
| `related*Ids` | Source relationships retained in data, not repeated beneath every post. Published entities and competitions only. |
| `media` | Optional `{ src, alt }` image in `/kairoswitter/media/` (PNG, descriptive alt text required). While the file does not exist the post is shown without the image and the build prints a warning; it appears as soon as the file is added. |
| `pinned` | Pinned posts come first on the account page. |

## Writing rules

1. Report or react to what canon already says; never create a result, signing, date, score, injury or roster change. Facts come from the episodes, matches, rosters and tournaments.
2. Scrims are private practice and are never posted. Kairos Gaming is the public Counter-Strike Main team name.
3. Keep the voice of the author: an organization is formal, a team is short and hyped, a player or coach is personal but stays inside what the episodes show.
4. One post, one source of truth: cite the episode (and source) that supports it.
5. Do not copy or imitate real people's real posts; the feed is fictional.

## November 13 author expansion

The author explicitly commissioned 50 posts using episodes 79-118, informal everyday details and original images using existing character portraits as references. The 45 new campus-life posts supplement the five original announcement posts. Their incidental jokes, captions and photos are newly authored social vignettes, not quotations from the episodes. Private scrim scores, opponents and tactical details remain excluded. Seventeen posts carry generated images. The profile directory is collapsed by default so it does not displace the timeline.

The build stops with a clear error when a post breaks a rule.

## Tags and layout

- Write `@Handle` in a post's `text` to tag another account. The tag is shown as a link to that account's page and must match an existing handle (ignoring case), otherwise the build stops.
- Each post shows the author's name and handle on top, the text and image, and the time and date at the bottom.
