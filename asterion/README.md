# Asterion Intelligence

Standalone corporate site for the fictional parent company of Kairos Esports.
Independent of `/website` (Kairospedia): its own `package.json`, build, and
deployment. Next.js 16, React 19, Tailwind CSS 4, shadcn/ui (Radix), Three.js
through React Three Fiber and Drei.

## Commands

```bash
cd asterion
npm install
npm run dev          # http://localhost:3001
npm run typecheck
npm run lint
npm test             # snapshot drift + content guard tests
npm run build
npm start            # production server on :3001
npm run canon:sync   # refresh src/content/canon-snapshot.json from /data
```

## Canon versus proposal

| Source | Contains | Rule |
| --- | --- | --- |
| `src/content/canon-snapshot.json` | Confirmed facts copied from `data/organizations/*.json` | Generated. Never edit by hand. `npm test` fails if it drifts from `/data`. |
| `src/content/proposed.ts` | Proposed principles and disciplines | Not canon. Always shown with a **Proposed** tag. |

See `docs/organization/ASTERION_PROPOSED_POSITIONING.md` for the author review
document and the steps for promoting an item to canon.

## Cross-links

`NEXT_PUBLIC_KAIROSPEDIA_URL` (see `.env.example`) is the public origin of the
Kairospedia deployment. It is inlined at build time. When unset, every
Kairospedia link is omitted rather than pointing at a guess.

## The 3D homepage

- `src/lib/assembly.ts`: part data, scroll steps, and pure easing helpers. Shared by
  the 3D scene, the static fallback, and the text index.
- `src/components/assembly/AssemblyScene.tsx`: the R3F scene. Client-only, loaded with
  `next/dynamic` after idle. Demand-rendered: it draws only while a value is moving.
- `src/components/assembly/AssemblyStage.tsx`: pins one canvas while step panels scroll.
  Scroll and pointer are written into a mutable controls object and the scene is woken
  with `invalidate()`, so React does not re-render on scroll.
- `src/components/assembly/AssemblyFallback.tsx`: static SVG elevation used when WebGL is
  unavailable, the context is lost, `Save-Data` is on, or the scene throws.

Reduced motion: no pointer parallax and no damping. Scroll still drives the view,
because the reader is the one moving it.

## Independent deployment

Deploy only this folder.

- **Vercel / Netlify:** set the root directory to `asterion`. Build command
  `npm run build`, output is the Next.js default. Set `NEXT_PUBLIC_KAIROSPEDIA_URL`.
- **Docker / Node host:** `npm ci && npm run build && npm start` (set `PORT` as needed,
  or pass `--port`).
- Nothing outside `/asterion` is read at build time. The canon snapshot is checked in.

## Not done

- No contact form. There is no in-universe mailbox or process to submit to, so a form
  would be decorative.
- No GLB assets. The assembly is built from Three.js geometry at runtime.
