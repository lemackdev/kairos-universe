# Asterion Intelligence: Proposed Positioning

**Canon status:** PROPOSED. Awaiting author approval. Nothing in this document is canon.

This file is deliberately separate from [ASTERION_INTELLIGENCE.md](ASTERION_INTELLIGENCE.md)
and `data/organizations/asterion-intelligence.json`, which remain the only
sources of confirmed company facts. The standalone website in `/asterion`
presents the material below, always labelled **Proposed**, and presents
confirmed facts only from a snapshot of the canon records.

## What is confirmed (for reference, not proposed)

- Asterion Intelligence is a parent company.
- Adrian Elias Vale (Adrian Vale) founded it and is its CEO.
- It is the parent company of Kairos Esports and provides its financial and
  organizational foundation.

Everything else is **TBD** in canon: founding date, headquarters, detailed
corporate structure, business beyond Kairos, finances, valuation, and funding.
Historical Episode 1 company details remain historical notes.

## Proposed positioning

**Working line:** "Engineered for the long term."

Asterion presents itself as an engineering-led holding company whose interests
are long-lived systems rather than products with a launch date. The tone is
exact and unhurried. The site avoids claims of scale, revenue, clients, or
achievement, because none exist in canon.

### Proposed principles

| # | Principle | Statement |
| --- | --- | --- |
| 1 | Long-term systems | Plan for the third year, not the next announcement. |
| 2 | Reliability | A system people depend on should be uneventful to operate. |
| 3 | Precision | Measure the thing you intend to change. |
| 4 | Practical implementation | A design is finished when someone else can run it. |
| 5 | Research and experimentation | Keep experiments small, labelled, and apart from production. |

These are consistent with, and go no further than, the confirmed Kairos
philosophy (player development over superteams, long-term infrastructure over
short-term publicity, coaching and analytics as core advantages).

### Proposed technical disciplines

| Index | Discipline | Purpose |
| --- | --- | --- |
| S-01 | Computational systems | Software and hardware designed together around a defined workload. |
| S-02 | Simulation and modeling | Models of processes too slow, costly, or risky to test directly. |
| S-03 | Decision-support technology | Tools that put evidence in front of the decision-maker. |
| S-04 | Infrastructure software | Scheduling, storage, and access control other teams build on. |
| S-05 | Applied machine intelligence | Narrow, reviewable learned models with an accountable person. |
| S-06 | Research and systems engineering | Documented experiments that decide what is worth building. |

The only link to existing canon is S-03: Kairos treats coaching and analytics as
core competitive advantages. Whether Asterion builds any of these systems is
undecided.

### The reference assembly

The homepage 3D object is a **reference assembly**: an illustrative engineered
object (spindle, carrier plate, two bearings, inner and outer frames, orbital
ring). It is a design study, not a product, and the site says so.

## Decisions requested from the author

Each can be answered independently. Until answered, the site keeps the
corresponding item marked **Proposed** or "Not yet defined".

1. Approve, edit, or reject the five principles above.
2. Approve, edit, or reject each of the six disciplines. Approved items can be
   promoted into `data/organizations/asterion-intelligence.json` as confirmed
   business activities.
3. Choose a founding date, or confirm it stays TBD.
4. Choose a headquarters, or confirm it stays TBD. It must not be inferred from
   the Kairos campus in Los Angeles.
5. Decide whether Asterion has any business beyond supporting Kairos.
6. Decide whether the public Asterion website exists in-universe, and its
   canonical URL (currently an environment setting, not canon).

## How to promote an item to canon

1. Record the decision in a source record under `data/sources/`.
2. Update `data/organizations/asterion-intelligence.json` (confirmed facts and
   the matching `unconfirmedDetails` entry).
3. In `/asterion`, run `npm run canon:sync`, move the item out of
   `src/content/proposed.ts`, and remove its **Proposed** tag.
4. `npm test` in `/asterion` fails if the snapshot drifts from canon.

## Constraints carried over from canon

- Do not infer headquarters from the Kairos campus.
- Do not invent departments, clients, products, investors, revenue, valuation,
  or corporate history.
- Do not invent Adrian Vale's biography, offices, or headcount.
