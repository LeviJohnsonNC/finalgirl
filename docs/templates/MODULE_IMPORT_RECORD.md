# <Killer or location> import record

Copy to `docs/imports/<owner-slug>.md`. Replace placeholders; update in place across photo batches and sessions. Keep a separate record for each killer/location owner and cross-link related imports. Do not include private personal-item identities, secrets or raw card photos in public Git.

Read [the approved standard](../MODULE_STANDARD.md), [actual references](../reference/module-standard/README.md) and [import playbook](../MODULE_IMPORT_PLAYBOOK.md) before filling this in. The baseline governs equivalent UI, not the new owner's mechanics.

## Scope and current status

- Owner/type, canonical name, film ID, stable module ID:
- Edition/mode and variant exclusions:
- Requested scope; related import record:
- Source batch complete or more photos expected; next owner/batch boundary:
- Stage: source review / partial implementation / implemented / verified / deployed:
- Relevant branch/PR/commit; last reviewed date:
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
| Selection, IDs, ownership and casting                                 |                                    |
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
- Meaningful visible states, corrections and Undo behavior:
- Required consequences/linked previews retained and reason; redundant Rules/setup/reminders omitted:
- Assets/atlas mapping and reviewed crops (link art README):
- Fit with the current card, death-dialog and ending standards:

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
- Existing art deliberately retained and reason:
- Actual loaded laptop/phone comparison to the approved pack; fixes and remaining gaps:

## Verification evidence

| Check/journey                                    | Exact command or scenario | Commit/result | Screenshot/report link and visual findings |
| ------------------------------------------------ | ------------------------- | ------------- | ------------------------------------------ |
| Catalog accuracy and rule corrections            |                           |               |                                            |
| Domain/legacy/setup/Undo/failure/retry/ownership |                           |               |                                            |
| Shared controls and mixed films                  |                           |               |                                            |
| Rules, Play, death/cache/narration, ending       |                           |               |                                            |
| Laptop: 1280×640, 1366×768, 1440×900             |                           |               |                                            |
| Phone: 320×568, 390×844                          |                           |               |                                            |
| Source/asset/build/CI gates                      |                           |               |                                            |

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
