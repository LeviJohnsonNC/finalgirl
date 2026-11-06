# Sunnydaze Mall import

Owner: Sunnydaze Mall, location `sunnydaze-mall`, standard The Killer from Tomorrow (`s3-killer-from-tomorrow`). Branch `feat/sunnydaze-mall`, based on main after Hunter PR #186. Implemented and locally verified; final-head required CI is tracked on the branch PR. Not deployed. Current scope: all eight supplied photos, complete searchable source data, illustrated Play, generation/death/ending contracts and compatibility. No alternate rules or Final Girl abilities. Current standards and recent compact controls apply.

## Sources and reconciliation

| ID / owner photo | Coverage | Destination |
| --- | --- | --- |
| M1 · IMG_9491 | Location board, six stores, separate Food Courts, five railing spaces, two Exits, Security/Atrium/escalators | Shared room catalog, rules and mall photography |
| M2 · IMG_9492 | Components: 10 Events, 5 Setups, 2 Build Trust, 8 Terror, 10 Savior, 18 Items; 4 cubes, Savior Ally and Trust card | Count reconciliation |
| M3 · IMG_9493 | Setup, Savior/targeting/loss, Trust, Upkeep, exit rewards, railing rules | State transitions, Rules, ending |
| M4 · IMG_9494 | Store knockback, eligible walls, Ally targeting, action/reaction/Upkeep | Rules and separate action-cube semantics |
| M5 · IMG_9495 | Savior Ally 4 Health, five two-slot actions but four cubes; four Trust levels; eight distinct Savior faces with two duplicates | Shared catalogs and Trust/action UI |
| M6 · IMG_9496 | Build Trust ×2, Twisted Bond (2 HP) and seven ordinary Terrors | Rules, Minor control, cause catalog |
| M7 · IMG_9497 | Five Setup maps; all ten Events | Searchable setups, Events/people/state and starting Event |
| M8 · IMG_9498 | Eighteen Items (Giftcard ×2, Boomstick ×2; fourteen other singles) | Rules, items, contextual suggestions |

No raw source photos are committed. Compass/concourse labels identify unnamed board spaces rather than invent printed names. Hidden rolls, physical adjacency, wall placement and casualties are never inferred. Bart and the Girl are source-backed roles with representative photographic identities, not newly named canonical people.

## Interaction decisions

The Savior is a separate Ally with explicit presence/escape/death, Health 0–4, four Trust positions and five independent two-slot action rows sharing four physical cubes. Lower Trust does not reset occupied cubes. Cube Upkeep is explicit; opening/expanding the panel never writes. A recovered legacy game preserves unknown Health/Trust/cubes until explicitly recorded. New setup seeds four Health, lowest Trust, ready cubes, parked Chopper and known inactive ongoing Events once, including the chosen starting Event where its presence is certain. The Girl’s starting Event still needs an actual eligible Victim; no person is invented.

Savior exit has its printed Trust/Lockdown gates and an explicit physical Exit/Action confirmation. It records the chosen unlock versus already-unlocked reward without increasing ordinary victim totals. Savior death records immediate loss, not an ordinary Victim casualty. Correct observed-state recovery is quiet and explicit.

Bart and the Girl use shared CharacterControl, stable image dimensions, distinct saved/killed photos and grey Left play portrait reactivation. Outcome corrections remain available and do not repeat linked effects. Resolving the Girl’s death from present links Trust down two and Horror up one atomically. Victim totals stay manual/separate.

Wet Floors, Food Fight, Lockdown, Busted Escalators and Rise of the Nerds use picture toggles. Twisted Bond uses shared jeweled Minor health. The Chopper keeps parked/riding/destroyed states and source-specific photographs. One-shot card resolution, damage, Time, actual movement, Item inventory and wall token locations stay with the physical board. Detailed rules remain searchable, not duplicated below every tile.

## Integration / verification

| Surface / gate | Evidence and result |
| --- | --- |
| Catalog/Rules/selection | Complete M1–M8 reconciliation. Five rotated Setup maps reviewed against the board: 12 starting Victims each, separate Food Courts, five Railing spaces, exact Savior/Killer/Final Girl placements. Search exposes all card effects/Trust rows/knockback. Selection descriptions use the same canonical catalogs. |
| Domain/persistence | `src/lib/play/sunnydaze.test.ts`: Trust gates, four-cube limit across five rows, lower-Trust retention, Health cap/recovery, exit gates/rewards/Ultimate observation, one-time Girl consequence, zero/unknown, forged/stale history, latest-only Undo/Restore, frozen new-death facts and legacy signature compatibility. |
| Main checks | `npm run check`: 987 frontend/domain tests and 142 Node edge-harness tests passed, lint and both TS projects passed; 11 pre-existing fast-refresh warnings. Native schema test also runs in Deno CI. |
| Assets/build | `npm run check:assets`: 19 independent photographs, manifest/digests, actual dimensions and byte budgets passed. `npm run build` passed; existing large-bundle advisory remains. |
| Real UI | `npx playwright test tests/browser/sunnydaze.spec.ts tests/browser/hunter.spec.ts --workers=1`: 72 passed (38 Mall plus 34 Hunter). All 12 implemented Killer pairings preserve owner isolation. Savior + repaired Mark V use independent Health/cubes. |
| Durable/cloud failure | Browser journey rejects a local write without advancing state, retries successfully, retains offline changes after reload and reconnects to the cloud without duplicate observations. New-session setup does not backfill resumed games. |
| Death/endings | Real UI hazard scene, saved cached replay and narration; immediate Savior loss enforced even if Won was initially chosen. Typed owner-scoped Mall review reaches prose/poster, rejects impossible Health or won-with-dead-Savior requests, and never equates Savior death with the Final Girl’s death. Exit unlock updates the existing Ultimate display/Health maximum without a second history write or Victim count. |
| Visual inspection | Actual 1280×640, 1366×768, 1440×900, 390×844 and 320×568 captures. Reviewed every distinct named photo in its actual header/person/Minor/Event/Chopper/Savior surface on laptop and phone, including saved/killed/left/restored, full/depleted, unknown, escaped and lost. Complete populated panel reviewed for duplicate controls and internal clipping. |
| Final visual fixes | Event captions were correctly anchored; disabled action labels remain legible; Savior’s full-width image box and top-safe crop eliminate letterboxing and preserve hair/head; display-only active character portraits remain vivid. Killed portrait focal positions keep faces above captions. A coverage assertion catches image-box gaps. Re-ran affected desktop/mobile lifecycle/photo journeys after final sizing/color changes. |
| Final-head CI | Wait for all required Reliability checks on the branch PR before completed handoff: native edge tests/type checks, Postgres, frontend, eight browser shards, two complete reports and overall gate. CI result/link is recorded on that PR. |

Screenshot evidence is attached to CI Playwright artifacts: `mall-complete-{1280,1366,1440,390,320}.jpg`, `mall-pilot-*.jpg` and `mall-art-<state>-{1366,390,320}.jpg`. Provider/browser mocks do not prove live provider quality, deployed compatibility or physical-device performance.

## Artwork

Pilot: independent original photographic Savior in a dark sleeveless hoodie/grey sleeves, short tousled blond hair, source M5 and approved Inkanyamba material reference. Actual laptop and phone pilot reviewed before remaining generation. Warm real indoor mall light, human proportions, modest 35mm reproduction. All 19 independent scene/state sources, prompt set, digests, dimensions, budgets and focal points are recorded in `src/assets/play/photos/sunnydaze/README.md`. Existing Collection/casting location picture and painted ending-poster medium retained.

## Release

No SQL migration planned. Changes to shared Play validation/facts require compatible `generate-death-scene` and `narrate-story`; opening/ending/visual prompts also require `generate-story`, `generate-ending`, `generate-scene-image`, `generate-visual-bible`. No reference manifest/private Storage objects change in this import. No new identity uploads are required. Shared TypeScript function source totals about 1.21 MB; Mall shared source is about 23 KB, with no embedded image collection or arbitrary reference URLs. Native Deno type checks run in CI; production packaging/deployed-bundle verification remains a release check. Deploy backends before publishing new callers in Lovable. No deployment or live provider verification claimed. Final deployment and signed-in mixed-game smoke remain separate.

Release order: (1) deploy compatible six function bundles; (2) publish the frontend in Lovable; (3) signed-in mixed-game smoke covering opening, save/reload, both Allies, Savior exit/death, contextual death/cache/audio and prose/painted poster. No merge, deployment or paid provider generation was performed by this implementation task. No SQL migration or new Storage upload. Existing Hunter reference uploads from its own import remain a separate precondition if not already released.
