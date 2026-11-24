# <Killer or location> import record

Copy to `docs/imports/<owner-slug>.md`. Replace placeholders; update in place across photo batches and sessions. Keep a separate record for each killer/location owner and cross-link related imports. Do not include private personal-item identities, secrets or raw card photos in public Git.

Read [the approved standard](../MODULE_STANDARD.md), [actual references](../reference/module-standard/README.md) and [import playbook](../MODULE_IMPORT_PLAYBOOK.md) before filling this in. The baseline governs equivalent UI, not the new owner's mechanics.

## Scope and current status

- Owner/type, canonical name, film ID, stable module ID:
- Edition/mode and variant exclusions:
- Requested scope; related import record:
- Source batch complete or more photos expected; next owner/batch boundary:
- Stage: source review / partial implementation / implemented / verified / deployed:
- Relevant branch/PR/commit and last reviewed date. For stacked imports, give each PR’s target branch and the verified integrated `main` revision when landed.
- Existing support audited; verified parts to retain:

## Evidence ledger

Use stable source IDs/filenames and the relevant face/region. Record unknown expected counts honestly; check duplicates and reverse faces. Group rows only when provenance and verification status are unambiguous.

| Component/card(s)                                                                                     | Owner | Expected count/faces | Supplied count/faces | Source and region | Verified / unclear / conflicting | Canonical destination or missing evidence |
| ----------------------------------------------------------------------------------------------------- | ----- | -------------------- | -------------------- | ----------------- | -------------------------------- | ----------------------------------------- |
| <board, rule sheet, Powers, Finales, Terror, Setups, Events, Items, special components as applicable> |       |                      |                      |                   |                                  |                                           |

## Verified mechanics and corrections

| Mechanic/card | Verified facts, timing and conditions | Legal states/actions and limits | Source | Prior claim replaced / affected surfaces |
| ------------- | ------------------------------------- | ------------------------------- | ------ | ---------------------------------------- |
|               |                                       |                                 |        |                                          |

Record icon interpretations, setup order, once-per-turn/round boundaries, permanent versus temporary effects, and conflicts resolved by edition/errata. Keep uncertainties below, outside verified rule data.

## Integration coverage

Mark each row done with evidence, inapplicable with a reason, or partial/blocked with the actual gap. Missing requested work is not inapplicable.

| Surface                                                               | Status and implementation/evidence |
| --------------------------------------------------------------------- | ---------------------------------- |
| Box contents, stable IDs, ownership, casting picker and shuffle       |                                    |
| Rules, setup and search                                               |                                    |
| Canonical card/space/entity catalogs                                  |                                    |
| Registered illustrated Play panel and mechanics                       |                                    |
| Shared controls and Remember This                                     |                                    |
| New-session setup and legacy recovery                                 |                                    |
| Death suggestions, historical context, signatures/cache and narration |                                    |
| Opening/ending prompt and visual guidance                             |                                    |
| Relevant character facts, outcomes, scrapbook and stats               |                                    |
| Final artwork and atlas README                                        |                                    |
| Mixed killer/location combinations                                    |                                    |
| Tests and actual screenshot review                                    |                                    |
| Backend/frontend rollout and live smoke test                          |                                    |

## Interaction and artwork decisions

- Shared controls/capabilities used:
- Mechanic-specific exceptions and rules justification:
- Whole-card lifecycle: legal inactive/unknown/active/multiple/resolved/restored states, stable size/order, explicit outcome corrections, Left play restoration and Undo:
- For each Play control, complete “When [event] happens on the board, I use [control] to [result].” Include the smallest fact worth recording, its linked consequences, and any lookup left in Rules. For objectives, show the goal, progress, next action, and how players confirm completion tracked on the board.
- Assets/atlas mapping and reviewed crops (link art README):
- Name the shipped control used for comparison. Record what you saw side by side on laptop and phone across entry points, including choice size, revealed art and actions. Note any mechanic-specific difference and check the death dialog and ending against their existing standards when affected.

### Interaction/state map

| Source-backed operation | Legal states/transitions, limits and linked writes | Existing component or justified new capability | Visible UI / quiet correction / omitted redundancy | Unknown, zero, multiple and combined states | Source |
| ----------------------- | -------------------------------------------------- | ---------------------------------------------- | -------------------------------------------------- | ------------------------------------------- | ------ |
|                         |                                                    |                                                |                                                    |                                             |        |

- Hardest new interaction implemented/reviewed first after approval; baseline comparison and findings:
- Mechanic-specific exceptions to the baseline and source justification:
- Narrative truth/selected Final Girl identity contract; decorative imagery excluded from facts:
- Provisional interpretations, owner/scope and label (never publisher-confirmed by implication):

### Artwork manifest

Link the owner's asset README; use rows for every required image/state or unambiguous group. No placeholders at completion.

| Stable entity/state ID | Medium and identity reference | Ratio / native pixels / rendered size | Crop/focal point, phone behavior and state order | Source/provenance, file/budget and reviewed output |
| ---------------------- | ----------------------------- | ------------------------------------- | ------------------------------------------------ | -------------------------------------------------- |
|                        |                               |                                       |                                                  |                                                    |

- Verified physical track range and state-image mapping; unverified fallback/legacy handling:
- For stateful artwork, identify the owner and entity, the trigger and appearance, the Undo result, and any nearby portraits that should keep their own treatment.
- Existing art deliberately retained and reason:
- Complete visible state-art set (as applicable: held/available, recipe/crafted, saved/killed, active/deactivated/sprung); identity continuity and female Final Girl hands/body constraints:
- Actual loaded laptop/phone comparison to the approved pack: every distinct image in each named surface, including shallow crops; complete-panel review for tiny images, duplicate controls, inconsistent sizing and clipped internal bounds; fixes and remaining gaps:

## Verification evidence

| Check/journey                                    | Exact command or scenario | Commit/result | Screenshot/report link and visual findings |
| ------------------------------------------------ | ------------------------- | ------------- | ------------------------------------------ |
| Catalog accuracy and rule corrections            |                           |               |                                            |
| Domain/legacy/setup/Undo/failure/retry/ownership |                           |               |                                            |
| Shared controls and a mixed-owner interaction    |                           |               |                                            |
| Rules, Play, death/cache/narration, ending       |                           |               |                                            |
| Laptop: 1280×640, 1366×768, 1440×900             |                           |               |                                            |
| Phone: 320×568, 390×844                          |                           |               |                                            |
| Source/asset/build/CI gates                      |                           |               |                                            |

Describe the mid-game scenario actually played, from the active starting state through an action, an unrelated action, reload, and correction or Undo. Record the linked totals or outcomes and whether the intervening action survived.

Keep CI mocks separate from any live provider or physical-device verification. Link evidence for the final committed implementation, not only an earlier iteration. Wait for final-head required CI before the completed handoff; do not silently omit related starting-event expectations when shared interactions change. Record intentional skips and limitations.

## Release and handoff

- Exact migrations/functions/frontend deployment needed, with order and rationale (or why none):
- Reference manifest/private Storage objects/digests and source-size checks if affected (or inapplicable):
- Actually deployed revision/functions; how verified, or explicitly pending:
- Authorized signed-in live smoke test and outcome, or precise pending check:
- Unclear/missing sources and the smallest requested clarification/crop:
- Consequential unresolved decisions and independent work already completed:
- Remaining next steps, in execution order:

Do not mark complete with a missing required banner, name-only rules standing in for verified effects, absent Play wiring, unreviewed screenshots or an undisclosed deployment mismatch. Distinguish ready-for-review from deployed and live-verified.
