# Shady Acres location import

## Scope and current status

Location only, standard mode, film `s4-rotten-harvest`, module `shady-acres`. Related killer: [Grimlash](grimlash.md), already merged separately in PR #156. No new killer, Final Girl abilities, secret personal Items, Epic rules, inventory engine or unrelated layout changes. Source batch is complete: six owner photographs. User approved implementation of the critically reviewed plan on October 31, 2026.

Base: `LeviJohnsonNC/finalgirl` main `cf36d8a779c9862da874253b89bf59c97e3de9f3`. Implementation branch: `codex/shady-acres-location`. Stage: implemented and visually reviewed; final automated results are attached to [PR #157](https://github.com/LeviJohnsonNC/finalgirl/pull/157). Deployment remains pending.

The [module standard](../MODULE_STANDARD.md), [actual UI references](../reference/module-standard/README.md), [control contracts](../module-controls.md), [import playbook](../MODULE_IMPORT_PLAYBOOK.md) and [identity direction](../IDENTITY_PHOTOS.md) govern presentation. Preserve the existing photographic location identity, film selection/ownership, Collection art, killer behavior, six-tile death form, anchored dialog actions and complete ending poster.

## Evidence ledger

Original JPEG bytes were successfully materialized and all six 1536×2048 originals inspected, including rotated diagrams and icon crops. Earlier planning-only download uncertainty is resolved. Original photos and private Library identifiers are excluded from public Git. Printed component quantities do not prove the distribution of the twelve miscellaneous tokens.

| Source | Verified contents | Expected / supplied | Canonical destination |
| --- | --- | --- | --- |
| S1 corn1.jpeg | Children’s Toys, Cornhusk Effigy, Moonshine Jug, Bag of Feed, Locus of Insanity, Mechanic’s Toolbox, Pilgrim’s Hat, Pilgrim’s Musket, Farmer’s Almanac, Sickle, Corn Cob Pipe, Cowboy Boots, Scythe, Rusty Pitchfork, Combine Keys, Decrepit Plow | 16 / 16 Item faces | `SHADY_ITEMS`; Rules, Item observations and death references |
| S2 corn2.jpeg | Children card and location Terrors | 1 / 1 Children card; 8 / 8 physical Terrors, 7 / 7 distinct faces | Children 1 Health / 1 Attack / 1 Movement; `SHADY_TERRORS` records duplicate Kids quantity 2 |
| S3 corn3.jpeg top | Eight Ancient Curses | 8 / 8 faces | `SHADY_CURSES`; Rules, chooser, active/removed observations and narrative references |
| S3 corn3.jpeg middle | Ten Events | 10 / 10 faces | `SHADY_EVENTS`; searchable Rules/death causes; three adult role observations; relevant ongoing effects |
| S3 corn3.jpeg bottom | Harvest Season, Demands of the Earth, Final Crop, Reap What You Sow, Dusk Sacrifice | 5 / 5 Setup faces | `SHADY_SETUPS`; exact Final Girl/Killer/Victim placements, each 14 Victims |
| S4 corn4.jpeg | Special Setup; Children, Abduction, Ancient Curses and Field spaces | Complete two-page spread | Rules, source-backed limits and observation semantics |
| S5 corn5.jpeg | Component counts and credits | One complete component page | Cross-check: location board, 10 Events, 5 Setups, 16 Items, 8 Terrors, 8 Curses, 3 Child meeples, 1 Children card, 1 Action token, 12 miscellaneous tokens |
| S6 corn6.jpeg | Board and named/unnamed spaces | 1 / 1 board | Six named places, six natural Fields and four roads: `SHADY_SPACES` / `SHADY_TERRAIN` |
| Publisher | [Official Shady Acres rules PDF](https://cdn.shopify.com/s/files/1/0593/6984/8897/files/FG_FF17_ShadyAcres_Rules.pdf?v=1752170949) | Supplemental complete rules | Corroborates the small Children Action token: nearest Final Girl or Victim → movement → Abduction |

All card names, effects, Item properties and Setup placements live once in `supabase/functions/_shared/play/shadyAcres.ts`, re-exported to the frontend. Rules, feature-film setup/event details and Play catalogs derive from that data. Unnamed board regions receive explicit descriptive coordinate labels, never invented canonical place names.

## Verified mechanics and corrections

| Mechanic | Verified facts and legal observations | Source / correction |
| --- | --- | --- |
| Children | Three reusable Enemies, not Minions or Victims. One starts at Altar, two on card. Each observed on-board / on-card / unknown. Upkeep spawn requires available Child and Victims. Activate closest to Altar first, before Minions/Killer. Return to card never adds a Victim casualty | S2, S4; retains physical movement, attacks and spawning |
| Abduction | Roll 1–2: sacrifice the Victim, return Child to Altar, increase Bloodlust; 3–6: no abduction. No Victim: Attack instead | S4; replaced incorrect “increase Terror” wording |
| Curses | Three physical sacrifices lead to physical reveal. Record name or unknown, with optional explicit marker clearing in one save. Multiple Curses coexist. Cornhusk Effigy removes an active Curse from the game. Re-entry requires correction/Undo, never casual reactivation | S1, S3, S4; name correction cannot reset sacrifices |
| Curse icons | Decaying Earth loses 1 Health on Field entry; Omen of Blood loses 1 Health once per Killer phase after Killer kill; Malevolent Aura increases Horror; Gnarled Stalks loses 2 Time | S3; Health loss is distinct from attack damage |
| Acres of Hatred | Increase Bloodlust per Field containing Victims, maximum 2 | S3; replaced incorrect Health loss in existing feature-film data |
| Sally / Ralph / Cultist | Record role and explicit in-play / saved / killed / left status. Sally save finds keys, or +1 Time if already held. Cultist save reduces Horror twice. Cultist is an existing Victim’s role, never an automatic extra spawn | S3; statuses do not write casualties, rewards or Item use |
| Ravens | Physical markers 0–3 or unknown; zero can record discarded/inactive atomically. No automatic damage absorption or Killer Health change | S3; preserves printed marker wording without inventing prevention |
| Field / harvested tokens | Six natural Fields; Hayfield and Cow Pasture can gain Field tokens. Harvesting persists independently. Record added and harvested tokens separately; conflicting tokens leave effective Field status explicitly unknown until observed | S1, S3, S4, S6; no inferred regrowth or precedence |
| Combine | Explicit presence and optional observed space. Optional physically harvested set records with placement atomically. Keys found alone never activate, move or harvest | S1; no path simulation or Time spending |
| Finish | Optional Children on board at finish, 0–3 / Not recorded. Complete roster or explicit prior finish observation supplies default. Legacy “Children survived” text is preserved historically | Replaces previous fabricated default of 0 survived; no new survival/death statistic |

No unverified deck-exhaustion rule, token-type quantity, crop-regrowth rule or authoritative Ravens damage interpretation is added. All dice, targets, attacks, movement, panic, rewards, Horror, Bloodlust, Time, Health, casualties and card resolution remain player-controlled.

## Interaction and state map

| Operation | Controls and legal transitions | Atomicity / unknown / correction |
| --- | --- | --- |
| Children | Stable Child 1–3 photographs, picture adds; active exposes Return to card | Reusable, no dead-state portraits; quiet Clear presence, owner-ordered Undo |
| Sacrifices / reveal | Illustrated 0–3 track; small muted alphabetical Curse chooser; vivid recorded cards | Explicit linked reset preview; unknown count retained unless clearing requested; stable unnamed record may be named later |
| Remove Curse | Quiet Remove from game on active record | Cannot ordinary-reactivate removed cards; explicit correction or Undo |
| Adults | Shared compact `CharacterControl` with Rules/status editor omitted | Distinct saved/killed photographs; re-add only from left/not-in-play; no casualty or reward writes |
| Festering Rot / Ravens / Shadow / Combine | Picture toggles; count/placement shown only when necessary | Optional unknown counts/positions; no manufactured marker counts or map positions; Combine + harvested set one save |
| Terrain | Eight per-space scenes; known Field picture records harvested; quiet field/token correction selectors | Retains token conflicts and unknown effective status; no Event/Item lifecycle coupling |
| One-shots | Existing owner-filtered searches, observation and death entry points | No redundant one-shot toggles, Item inventory or galleries |

Uses `ModulePanel`, `IllustratedTile`, `ModuleArtwork`, `CharacterControl`, `HealthTokens` and `useModuleRecord`. Mechanic-specific exceptions are the reusable Children actions, multiple removed-from-game Curse observations, sacrifice/reveal preview, and explicit terrain/placement observations; each follows a verified physical distinction. Detailed effects stay in Rules/physical media.

Every location command carries the preceding active location event ID. The shared resolver recomputes canonical snapshots at the durable boundary and validates replay, rejecting forged changes, duplicate cards, no-ops, stale parents and wrong owners. Undo/restore follows location order; unrelated killer observations remain independent. No panel expansion writes gameplay. Fresh setup is inserted with the first durable Play action; legacy logs are never backfilled. Blocked/conflicted saves disable the entire fieldset and durable command callback.

## Integration coverage

| Surface | Implementation / evidence |
| --- | --- |
| Selection, IDs and casting | Extend existing `s4-rotten-harvest`; no duplicate film or killer requirement. Location works with all eight implemented killers |
| Rules, setup and search | Existing module extended with complete canonical 8/10/7/16/5 catalogs and 16 space names; tags include every supplied card |
| Play | Registered location-only header, compact summary, source-backed controls; selected killer panel stays first |
| New / legacy sessions | `shadySetupVersion:1` only for new Shady Acres; all seven stateful starting Events seeded; legacy absence stays unknown |
| Death | Location-owned Terror/Event/Item/space/mechanism suggestions; seven Terror and ten Event images; selected Children only when explicitly named. Six causes and existing transport/cache protocol preserved |
| Historical context | Shared death builder captures state at event time; later Curse removal cannot rewrite signature. Wrong-location replay is rejected |
| Opening / ending | Retained location identity and corrected board-backed lore; opening reference Storage unchanged. Bounded whole facts from both owners reach story and non-Grimlash Shady poster requests |
| Outcomes / archive | Explicit optional finish count persists as observation/highlight; no synthetic zeros or Child casualty totals. Historical wording unchanged |
| Artwork | [58-source manifest and README](../../src/assets/play/photos/shady-acres/README.md), eight chooser thumbnails; source IDs, actual dimensions, digests, budgets and no orphan assets checked |
| Backend | Shared events/modules/catalog/death code, native Deno replay test and CI; no SQL changes or new dependency |

## Artwork decisions and review

58 independent source scenes: banner 1; Children 3; sacrifices 4; Curses 8; adults 9; other Events 7; Terrors 7; Combine 1; six natural Fields before/after 12; Hayfield and pasture base/Field/harvested 6. The three character Events intentionally map to their own portraits; duplicate physical Kids Terror uses the same face. All required visible named/state destinations are covered. Ordinary Item search is text-only, so no unused Item gallery/images were added.

Each original is at least 1536×1024; runtime scenes are center-cropped 1280×720 WebP ≤160 KiB; chooser thumbnails 320×180 ≤35 KiB. Crops/subject positions, muted unknown/removed/reserve states, adult identity continuity and terrain landmarks are inspected. Labels and authoritative counts remain HTML. Existing location identity, Collection preferences and ending-poster medium are retained.

First reviewed the hardest linked sacrifice → Curse reveal → marker clear → Undo → reload → failed save journey. Initial screenshot inspection found tile captions anchored to the whole panel; corrected local containing blocks and added bounds assertions. Phone Child tiles use wide rows so faces and state names remain readable. No horizontal overflow at 320px; 44px targets and visible focus retained. Final source reconciliation also caught the continuing Festering Rot Event: added its simple picture toggle and starting-Event observation using its already planned photograph, with no automatic Horror/casualty writes. Phone CI screenshot inspection caught the shared Raven hearts rendering at full image size outside the Minor Power container; owner-scoped 44px marker styling and bounds assertions correct this without changing shared modules. Final verification entry points and limitations follow below.

## Verification evidence

Local evidence: 15 Shady Acres domain tests pass; `npm run check:assets` verifies all 58 independent originals and 66 derivatives, actual pixel dimensions, hashes and byte budgets (7,602,338 bytes total). Production build passes. All generated scenes were visually inspected, including consistent adult identities and standing/harvested terrain landmarks. Earlier complete `npm run check` passed 602 app tests and 116 Node edge tests; the final two domain additions and final artwork are covered by the exact-head Reliability run. Fresh setup, legacy finish and the non-Grimlash ending/poster request passed 16 desktop/phone checks before final artwork integration. The full Shady suite passed all 26 desktop/phone journeys on code revision `74b1e57ce23209cc31e5743f3b7ab176134fbab3`, alongside all 604 app tests, 116 Node edge tests, database replay, native Deno checks and all shared browser shards (Reliability run [41223378773](https://github.com/LeviJohnsonNC/finalgirl/actions/runs/41223378773)). Exact-commit CI phone screenshots were retrieved and inspected at 320px/390px, including the complete ending poster and chooser. The final marker-size correction is covered by the succeeding exact-head run; final checks are authoritative on the PR head. Existing eleven lint warnings and build chunk/Browserslist warnings predate this module.

After the workspace reconnect, concurrent local runs hit timing failures across unrelated existing tests. An isolated Shady domain run passed. Production build completed in 3m25s; local slow-host timeouts are not treated as passing release checks. Final-head GitHub frontend, database, native Deno edge and both-device browser checks must all succeed before the completed handoff. CI artifacts are the reproducible screenshot/report evidence for the submitted revision.

Required browser evidence: all named Death causes with Hans; seven stateful fresh starting Events; legacy unknown finish; all Curse/adult/terrain variants; linked save/Undo/reload/quota rejection; all five standard sizes (1280×640, 1366×768, 1440×900, 390×844, 320×568). Existing shared-module, Rules, death/cache/narration and ending-poster journeys remain required in Reliability CI.

## Release and handoff

Ready-for-review target is a PR with final-head frontend/assets/build, database replay, native edge and both-device browser checks passing. No merge or production deployment is claimed. Re-deploy affected shared-code consumers before the frontend: `generate-death-scene` and `narrate-story` (the only edge entry points with runtime imports of the changed Play domain; ending/poster payloads are assembled by the frontend). No migration, new secret or private opening-reference object is needed; selected identities and manifest remain unchanged.

After merge/release, perform an authorized signed-in live smoke test: fresh Shady Acres with Hans and with Grimlash, source-backed starting Event, offline/reload/conflict recovery, one optional generated death/ending/poster with real provider, archive reopen. Automated browser fixtures mock Supabase/providers and are not a paid-provider/live-device verification. Deployment/live smoke remain explicitly pending at PR handoff.

## Play simplification — October 31, 2026

This user-requested pass supersedes the earlier control details above:
- Remove the entire sacrifice-marker/next-Curse section and its reset controls. **Record revealed Curse** is directly inside **Ancient Curses**, with the existing small alphabetical chooser, active/removed cards and unknown-name entry retained. Recording a Curse does not alter hidden sacrifice counts.
- Remove **Observed markers** and Raven marker controls. Ravens is a simple presence picture toggle. Prior counts remain in immutable observations and owner-ordered Undo.
- Remove **Fields physically harvested with this placement** and its linked placement/harvest action. Shadow/Combine presence and placement remain independent.
- Replace terrain bookkeeping with eight accessible picture toggles: vivid **Field · On**, dim **Field · Off**, and explicit dim **Not recorded · Click to turn on** for unknown legacy values. Each click records only effective Field presence through the existing terrain command, preserving known/unknown added/harvested flags. It never applies an Item/Event, adds tokens, regrows crops, moves the Combine, changes casualties or changes killer state. Undo/reload/rejected-save semantics remain unchanged.
- Remove **Record Field tokens in Hayfield and Cow Pasture** and **Correct location observations**, including their field/token/Child/removed-Curse editors. Existing Rules, historical snapshots and Undo are retained.
- The shared facts formatter now includes explicit Field presence that differs from the natural terrain default, so new toggles reach narrative/death facts even when neither token is recorded. Initial default facts remain unchanged; old token details retain their wording.

No new command, schema, migration, image or reference-storage object is required. Source imports identify `generate-death-scene` and `narrate-story` as the two runtime edge consumers of the changed shared facts formatter; publish compatible copies with the frontend. Existing backends already accept the unchanged terrain observation shape. No production merge/deployment or paid provider check is part of this implementation handoff.

Verification uses the existing Shady Acres domain/shared-control and compiled-browser suites. Updated journeys cover unknown→on→Undo, every field on/off and back, preservation of token flags, keyboard activation, reload, save rejection, Curse recording without marker writes, legacy Raven observations/Undo, all stateful starting Events, non-Grimlash death/ending ownership and the five standard laptop/phone viewports. Exact final-head CI/capture results for this pass are recorded in [PR #160](https://github.com/LeviJohnsonNC/finalgirl/pull/160/checks), branch `codex/shady-acres-picture-toggles`; local preview sockets are restricted. Captures are synthetic compiled-app evidence, not production/provider verification.

## Quiet removal and correctable people — October 31, 2026

An active Ancient Curse has a small underlined `remove` action with keyboard activation and a 44px target. Successful removal records the existing `removed` status and hides its picture; the record remains available to history, replay, deck uniqueness and owner-ordered Undo. Rendering never deletes observations. A rejected save retains the picture and prior state.

Sally, Ralph and the Cultist keep Saved, Killed and Left play actions enabled after any of those outcomes, so a mistake can be corrected directly. The selected action remains visibly pressed; repeating it creates no new observation. Unknown/not-in-play states retain their previous activation rules. This is a Shady-only opt-in on CharacterControl; all other owners keep their default behavior. Separate victim totals are never changed by these person observations.

The compiled journey covers each outcome correction, no-op repeats, image selection, rejected writes, durable removal/reload, Undo restoration and all five standard viewport captures. This frontend-only pass requires no new observation shape, function, schema or Storage reference; full final-head CI and actual screenshot review are required before handoff. Earlier release requirements above remain separate.
