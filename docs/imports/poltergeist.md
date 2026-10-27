# Poltergeist import record

## Scope and status

Implemented the Poltergeist killer module for `s1-creech-manor`, using the approved [module standard](../MODULE_STANDARD.md) and Groves UI references. Standard mode and the supplied Epic Dark Power are covered. Creech Manor location mechanics, Alice/Selena abilities/items and the wiki-only Epic Finale remain outside this killer-first scope. Existing Collection/casting identities and selected-image preferences are retained.

Sources reviewed 2026-10-27: five owner photographs, including the native-resolution originals. The re-uploaded batch contains the same components. All 16 Terror faces are present (rows 5/6/5); the earlier 15-card count and “Inescapable Fate” reading were corrected to 16 and **Unstoppable Evil**. No missing Terror card is currently identified.

Implementation is prepared for PR review; merge, production Storage upload, backend/frontend deployment and live provider smoke testing have not occurred. Final-head CI status is reported on the implementation PR.

## Evidence ledger

| Component | Expected | Supplied | Source | Status/destination |
| --- | --- | --- | --- | --- |
| Killer board | 1 | 1 | polter1(1).jpeg; libfile_9f7a13816e9081918f66bfb82a6bff16; original libfile_073a23c5b8908191a1f57922bba5f4bf | Verified at native resolution; starting Horror 3 and nine Bloodlust positions transcribed |
| Component sheet | 1 face | 1 | polter2(1).jpeg; libfile_9a47c394bd8c8191b9247169144573a2; original libfile_f6ba156530a0819190f2d0ddc850e997 | Establishes 3 regular Powers, 1 Epic Power, 3 Finales, 2 Items, 16 Terrors, 2 Final Girl cards |
| Setup / special rules | 1 face | 1 | polter3(1).jpeg; libfile_b94e29e18d0c8191bdef7d6e80d89aa1; original libfile_5c6f3e32ae208191b1ca99ebde7002c2 | Killer-owned Item setup, immunity, rescue victory, Carolyn protection, Mr. Floppy restrictions |
| Dark Powers | 3 regular + 1 Epic | 4 | polter4(1).jpeg; libfile_2166388e7cb481919ed359b84bd8fb2d; original libfile_ddaf85ac44a08191a8b19fccc94dc567 | Stiff Wind, Eternal Despair, Invisible Barrier, Forgetting Something? |
| Finales | 3 | 3 | Same polter4 source, right column | Relentless Assault, Nothing Is Easy, She Will Soon Be Lost |
| Killer-owned Items | 2 | 2 | Same polter4 source, lower-right cards | Carolyn and Mr. Floppy; not ordinary location inventory or victim records |
| Terror cards | 16 | 16 | polter5(1).jpeg; libfile_bc78126bda8c81919c2f030e39b888ad; original libfile_f2e1addc3d908191b59909e11168231d | 12 named cards including two ongoing Minor Powers and four additional duplicate faces; preserve quantities |
| Final Girl cards | 2 in component list | Not part of this batch | polter2 component list | Out of this killer-only import scope; no inferred abilities/items |

Persistent source links use https://chatgpt.com/library?file_id=<exact-library-id>&account_id=personal. Do not commit raw photos or private references.

### Terror reconciliation

- Psychic Confusion ×1 (Minor Dark Power)
- Unseen Forces ×1 (Minor Dark Power)
- Carolyn? Where are you?!?!? ×2
- Corporeal Form ×1
- Did that clown... just move? ×1
- Everything was flying around! ×2
- I have to kill you! It told me to kill you! ×1
- Nothing Is As It Seems ×1
- The ground is shaking! ×2
- The shadows are closing in ×2
- Unstoppable Evil ×1
- Where the hell did this storm come from? ×1

Levi supplied https://finalgirl.fandom.com/wiki/Poltergeist#Terror_Cards as a supplemental source. Its list matches the reconciled names/counts. Read the individual Unstoppable Evil page: roll a die, take that much defendable damage or choose that many Victims to die; if insufficient Victims, choose the damage. The wiki's additional Epic Finale is not evidence it is part of this supplied standard deck. User photos govern their printing. Native-resolution icon, numeric and wording review is complete for the supplied faces.

## Verified facts and source corrections

- No killer Health: the Poltergeist cannot be attacked, damaged or killed. Certain Terror encounters still permit damage-inflicting Action cards against temporary attackers. New Health/revival controls and writes are unavailable; legacy numerical observations remain loadable and are omitted from new Poltergeist narrative facts.
- Starting Horror **3**, Bloodlust **0**. The board has nine positions **0–8**. Attack/Movement by position: 1/2, 1/2, 1/2, 1/2, 2/2, 2/3, 2/3, 2/4, 3/4. Horror increases occur at 1 (+1), 4 (+2), 7 (+1); position 2 reveals the Dark Power. Overflow: take 1 damage, discard the next Terror. The top instruction is not another position or an inferred pre-Finale action.
- Killer setup uses 10 selected-Location Items plus Carolyn/Mr. Floppy; neither begins faceup. These rules and Items follow the killer in mixed films.
- Win by escaping with Carolyn; **Forgetting Something?** requires both Carolyn and Mr. Floppy. **Invisible Barrier** requires full Final Girl Health to enter an Exit with Carolyn. Finding Carolyn is not an automatic victory.
- Carolyn cannot be killed, discarded, removed by an effect or put in the backpack. She may be shuffled back into an Item deck. Joining removes both Minor Powers from the game atomically; later separation does not restore them.
- Psychic Confusion and Unseen Forces are healthless ongoing effects. Psychic Confusion reduces Search dice by 1, with an optional **3 Time** payment before playing Search to ignore its penalty. Unseen Forces makes the first space moved in each Action phase panicked.
- Mr. Floppy is a **pink stuffed rabbit**, with long ears, dark button eyes and a grey-blue cloth body. His protective use removes him to cancel the **Carolyn Terror**, never a Dark Power. The printed game-effect discard restrictions apply before Power reveal and while the Epic Power is in play. Play conservatively offers protective removal/discard only after a known ordinary Power; clearing its name restores uncertainty. The permanent reveal remains recorded.
- Corporeal Form's 2-Health Behemoth and the 1-Health Clown Doll are temporary encounters, not persistent Minions/Victims. Lightning causes Health loss, distinct from defendable attack damage. Full timing, quantities and effects live in the shared catalog and searchable Rules.

## Integration coverage

| Surface | Implemented result |
| --- | --- |
| Selection/Collection | Reuses existing IDs, casting, ownership and retained Poltergeist portrait; no duplicate film or identity replacement |
| Canonical data/Rules | Shared Powers (4), Finales (3), Minors (2), Items (2), Terrors (12 names/16 cards), all board positions/overflow; independent killer setup, attribution and searchable effects |
| Play | Registered photographic killer panel before Location; Carolyn/Mr. Floppy objective controls; healthless ongoing Minors; shared Power/Finale reveals and quiet name corrections |
| Durable state | Explicit action resolver at latest durable append; stale/duplicate/foreign-owner rejection; Carolyn joining plus both Minor removals in one immutable event and one Undo |
| Fresh/legacy | `poltergeistSetupVersion: 1` only for new casts; first save seeds known setup atomically. Existing logs stay unknown without provenance; expanding a panel writes nothing |
| Item entry | Selection-aware suggestions include both killer Items in every Location. Exact named objective actions share the same resolver. Historical/free-text Item moments do not infer current possession |
| Outcome/archive | Existing outcome review now distinguishes **Rescued Carolyn** and **Escaped with Mr. Floppy** from old finding-only draft fields. Drafts persist; reviewed ending snapshot overrides earlier tracking. Manual/no-Play results remain possible; unknown is not failure |
| Story/death/narration | Rescue-first bounded owner context, protected Carolyn, rabbit identity, healthless spirit and temporary attackers. Context freezes at each death; unaffected historical signatures/cache remain compatible. Both owners retained in mixed summaries |
| Opening imagery | Retained approved spirit identity has a staged, digest-pinned private reference derivative. Existing Final Girl references and ending poster medium unchanged |
| Artwork | Twelve individual photographs: banner, four Powers, three Finales, two Minors and two objective images. [Asset manifest](../../src/assets/play/photos/poltergeist/README.md) records sources, mappings, crops and budgets |
| Bloodlust | Verified max 8 maps nine physical positions to distinct existing track photographs; no number/effect automation |
| Backend/storage | Bounded review validation and canonical Play facts updated; no SQL migration or new bucket required. Exact release requirements below |

## Interaction and compatibility decisions

- The objective precedes Minors, then shared reveals. Carolyn/Mr. Floppy each open explicit legal actions; one objective disclosure is open at a time. Required linked cleanup and unknown/conditional eligibility stay visible. Routine rules remain in Rules.
- New `objective` and `minor-effect` capabilities describe genuine mechanics. `HealthlessMinorControl` reuses Minor frames/dimming/wide active photographs, without fabricated hearts. Multiple recorded effects are retained; Add another only exposes alternatives. Active picture ends the effect; explicit corrections change observations without replaying cleanup or spending Items.
- Carolyn rescue does not change ordinary saved/killed totals. Play does not shuffle decks, resolve attacks, apply movement/Time, auto-win, or auto-kill the spirit. The player confirms physical escape conditions.
- Power reveal/name, Epic escape requirement and Floppy consumption are distinct facts. Name corrections preserve permanent reveal and consumed Item history. An unnamed Power does not imply an ordinary Power.
- New reviewed ending keys are `rescuedCarolyn` and `escapedWithMrFloppy`; old `foundCarolyn`/`foundMrFloppy` remain historical, without silently asserting escape. The bounded `poltergeistReview` request uses true/null for confirmations and a nullable Epic condition, preserving uncertain no-Play results.
- Old Poltergeist deaths without explicit module observations do not acquire a new context object or changed cache signature. New death facts use observations at the death, not later rescue.

## Verification evidence

- Local complete `npm run check`: 65 unit files / 485 tests and 110 edge/handler tests passed; lint has 11 existing warnings, no errors. Node 25 locally required `NODE_OPTIONS=--no-experimental-webstorage`; CI uses the repository's Node 22.
- Asset validation: 492 images passed, including all 12 new loaded derivatives. Production build passed.
- Domain/hook coverage includes all physical counts, starting values, selection-aware Items, explicit setup versus legacy unknown, legal/stale/duplicate actions, linked cleanup, atomic Undo/restore, wrong-owner rejection, failed local persistence/retry, Epic gates, name corrections, historical cache stability and bounded mixed-owner context.
- Browser verification covers all six location pairings (Camp, Buddyland, Carnival, Maple, Groves, Creech), both reveal entry points, all seven named selected heroes, both active Minors, unknown state, failed save/reload/retry/Undo, outcome draft compatibility and separate victim totals. Additional Rules, contextual death/cache/narration and ending request journeys are included.
- Actual compiled-app crops inspected at 1280×640, 1366×768, 1440×900, 390×844 and 320×568. Loaded selected/unselected/Epic/Minor/objective/error states are captured by `tests/browser/poltergeist.spec.ts`. The shallow header initially cropped the spirit's face; the derivative/focal crop was corrected. Artwork scenes are decorative and never establish actual injuries, victims, props or inventory.
- Local edge bundle estimates (esbuild with external runtime packages): generate-ending 35,037 bytes; generate-scene-image 189,115; generate-death-scene 182,203; narrate-story 120,343. New shared domain source is 14,032 bytes; no image collection is embedded. These estimates are not deployed-bundle measurements. Native Deno checking is delegated to required CI because Deno is unavailable locally.
- Browser services and audio are mocked. These checks do not establish live AI generation/audio quality, production sync or deployed compatibility. Final CI checks must pass on the implementation PR's final head.

## Release requirements and remaining live checks

1. Upload the exact reviewed `supabase/reference-assets/poltergeist.jpg` to the existing private `opening-references` bucket at key `poltergeist.jpg`. Download and verify SHA-256 **c3dfc0ebaef9ed040b85d59b0f8cfde02b82dd42fd38ae4cb6a4097015045331** against `openingReferenceManifest.ts` before releasing the changed image function. Staged bytes are 59,368 bytes. Do not regenerate unrelated references or upload raw owner photos.
2. Deploy **generate-ending**, **generate-scene-image**, **generate-death-scene**, and **narrate-story** before the new frontend. They consume the changed rescue review, trusted manifest or canonical Play/death facts. `generate-story` and `generate-visual-bible` were assessed: new killer direction travels through their existing bounded request fields; their implementation contract is unchanged.
3. Release the frontend/assets. No SQL migration is needed; observations and setup provenance use existing JSON state.
4. After authorized deployment, smoke-test signed-in mixed casting, save/reload, Carolyn joining/removal, one contextual death/cached narration, reviewed rescue ending, and an opening with the Poltergeist/selected Final Girl references. Verify exact Storage bytes and deployed function revisions; a merged PR alone proves neither.

Production upload, merge, deployment and paid live generation were not authorized as part of this implementation handoff and remain pending. Native Deno checks, database tests and complete sharded browser regressions run in the PR's required Reliability workflow. No card-source gap blocks this killer scope; Creech Manor's own location module is a separate next import.
