# Sacred Groves import record

## Scope and current status

- Location: Sacred Groves; existing film ID `s1-sacred-groves`, module ID `groves`.
- Standard location import. Related [Inkanyamba import](inkanyamba.md), merged PR #121. Final Girl abilities, personal items, scenarios and Extreme Horror are outside scope.
- Implemented and locally verified on `feat/sacred-groves-location`, 2026-10-25. Review/CI status belongs to the implementation PR; not deployed or live-provider verified.
- Implementation PR: [#122](https://github.com/LeviJohnsonNC/finalgirl/pull/122).
- Retains existing selection, ownership, film identity and good location painting. Replaces generic Setup descriptions and incomplete Event data with shared verified references. Adds the missing illustrated location panel and visual/narrative guidance.
- Six photos reconcile the supplied standard location components. No additional photo is currently needed. Raw photographs remain at their persistent references and are not committed or shipped.

## Evidence ledger

| Source | Persistent reference | Verified coverage / destination |
| --- | --- | --- |
| IMG_9368.jpg | libfile_00e6ead02ccc81919de278e4cc1754bf | Board: six official named spaces, 19 spaces and 30 connections. Shared `groves.ts` space/edge registry; exact-connection SVG in `GrovesBoard.tsx`. Directional labels/A–S are navigation aliases for unnamed spaces, not official names. |
| IMG_9369.jpg | libfile_53a4c393b1808191ae56347cb1c39c00 | Lore, counts, special setup, five token faces and Finale token. Design Evan Derrick; art Tumo Mere. |
| IMG_9370.jpg | libfile_6a2aee459cec81919cec24bbddcfcf26 | Bounds, Sacred spaces, Bloodlust strip and ordered recurring Finale extension. |
| IMG_9371.jpg | libfile_0d8754f7bd08819187ae44a40e60613b | Eight Terror faces, all ten Divine Wrath rows and the seven bottom-aligned Bloodlust-strip rows. |
| IMG_9372.jpg | libfile_38ae746dd9848191a9aad144244d6854 | All ten Events and five Setup diagrams. Each diagram was rotated to board orientation for transcription and shares the same space registry. |
| IMG_9373.jpg | libfile_505df16235888191825e2c336e824212 | All seventeen Item faces, icons, Time costs, ranges, hands and charges; full reference effects in shared catalog. |
| Inkanyamba IMG_9366.jpg | libfile_9c601b5707e08191a854e42684dc316e | Both identical Atonements, already verified in the killer import; shared helper now supports the selected owners' tracks. |
| Final Girl OFFICIAL FAQ | https://docs.google.com/document/d/1-W15lbbHdLvR3gMQZpUFWfuBczfHRZxTdH7PafDt24g/edit | Public text export read 2026-10-25. Clarifies Tour Guide's whole-movement requirement, Rage of the Gods' empty-Sacred-space fallback, and starting Bloodlust 0. Does not answer the Holy Man allocation without Inkanyamba. |

### Reconciled names and quantities

- Board ×1; Divine Wrath card ×1; Bloodlust strip ×1; Finale token ×1 (full effect shown in the supplied rules).
- Five tokens: Closed ×1, Out of Order ×2, Fire and Brimstone ×1, Hallowed Ground ×1.
- Sacred spaces: Burial Ground, Sacred Shrine, Holy Groves. “Burial Grounds” on cards identifies the same Burial Ground.
- Search spaces: Welcome Center, Lost & Found, Groundskeeper's Shed.
- Setups ×5: Dueling Tour Guides, Family Day, Mob O' Tourists, Swamp Thing, Worship Service. Recorded victim totals are 12/12/11/12/12 respectively; do not replace the photographed Mob count with an assumed universal total.
- Events ×10: The Tour Guide; Closed for Maintenance; Loud and Obnoxious; The Uber Tourist; Flash Photography; Fire and Brimstone; Unholy Bloodshed; Hallowed Ground; The Holy Man; The Gods Hate Failure.
- Terrors ×8, one each: “If I Climb on Top of That Statue I Can Get a Killer Selfie!”; Rage of the Gods; “No One Will Notice if I Break Off One of These Pretty Branches...” ; Tourist Trap; Fury of the Gods; “Let Me Just Carve My Initials Right Here...” ; Fickleness of the Gods; Punishment of the Gods.
- Items ×17, one each: Prayer Book; Aluminum Bat; Incense; Ceremonial Dagger; Energy Drink; Shaman's Bones; Airhorn; Out of Order Signs; Tribal Mask; Whip; First Aid Kit; Pepper Spray; War Club; Trashcan Lid; Old Rifle; Map; Mysterious Pills.

## Verified mechanics and corrections

| Mechanic | Implemented rule / boundary |
| --- | --- |
| Divine Wrath | Fresh-game starting value 2, range 1–10. Excess changes ignored. Unknown legacy state stays unknown. A correction is not an Unleash. |
| Ten Unleash rows | Ordered penalties: 1 loses 1 Time then increases Wrath 1; 2 loses 2 Time; 3 increases Horror 1; 4 discards a random Action; 5 loses 4 Time; 6 increases Horror 2; 7 discards a random Action, increases Horror 1, loses 2 Time; 8 discards two random Actions then loses 5 Time; 9 increases Horror 2 then loses 4 Time; 10 discards all Actions except Atonement and decreases Wrath by the number discarded. Full shared table is read-only physical guidance. |
| Bloodlust strip | Seven photographed rows, bottom aligned starting at 0: increase by Sacred Victims / no effect / Unleash / increase by Sacred Victims / no effect / Unleash / increase by Sacred Victims then Unleash. The strip is not the chosen killer's maximum. Guidance refers to the physical killer track for maximum/repeated effects; counter corrections never execute it. |
| Finale extension | After completing the Finale's Killer Action each Killer phase, Unleash Divine Wrath, THEN increase it 1. Existing shared permanent Finale reveal enables guidance, including unnamed and legacy reveal evidence. No duplicate reveal or one-time resolution flag for this recurring effect. |
| Atonement | One chosen track per action. Final successes already include Prayer Book/rerolls/conversions. 3+ sets it to 1; 2 reduces it by half with the reduction rounded up; 1 reduces it 1. Failure's Horror/Time costs stay physical. One shared helper is in the Sacred Groves panel when selected; Inkanyamba retains it at other locations. |
| Sacred-space count aid | Transient inputs for the three sites; known Fire and Brimstone placement doubles its site's count. Incense applicability is explicitly confirmed, never inferred from an Item find. Active Loud and Obnoxious adds 1. Preview precedes a durable change. Unknown data and ambiguous zero-base interactions do not become guessed arithmetic; direct observed-level correction remains available. |
| Closed | Optional Action-card discard when revealed, except Atonement. Choose one Sacred space, redistribute Victims evenly to adjacent spaces. Victims cannot enter it for any reason; Final Girl/Enemies can. Declining and token placement are separate observations. Ending/clearing an Event does not erase a physical placement. |
| Fire and Brimstone | Die 1–2 Burial Ground, 3–4 Sacred Shrine, 5–6 Holy Groves. Each Victim there counts twice for Divine increases. Corrects the former placement-only Event text. No automatic fire damage, wildfire or casualty. |
| Hallowed Ground | Same die-to-site mapping. End the Action phase there to gain 2 Time. Placement and active reminders are tracked; Time is physical. |
| Out of Order | Two reusable tokens on actual connections between the player's space and an adjacent space. Spend 1 Time to place/retrieve. Victims may not pass unless following. Not Search-space closures. Shared diagram plus full-size list selection; player adjacency/Time payment stay physical. |
| Roles | Guide/Uber Tourist/Holy Man identify existing Victims; activation never adds to victim totals. Shared character controls distinguish an outcome from a status correction. Explicit outcome resolution ends the linked role Event and records any chosen Wrath effects as one event. Ordinary status corrections do not reapply rewards/penalties. |
| Tour Guide | Closest Victim to Final Girl; once per turn can extend movement if accompanying the entire move. Killed: Divine Wrath +6, with applicable explicit modifiers. |
| Uber Tourist | Farthest Victim from Killer; overrides target choice. Saved: chosen Wrath −4; killed: Divine +4. Outcome target is chosen before the one-step record. |
| Holy Man with Inkanyamba | Will not follow; moves toward Killer each Upkeep. Meeting Killer removes him. Final Girl present sets both Wraths TO 1; absent allocates a TOTAL increase of 10 before clamping each track. No overflow redistribution. Ritual removal is not a kill. Both owners and the role/Event save and undo together. |
| Holy Man without Inkanyamba | **Provisional interpretation explicitly approved by Levi on 2026-10-25:** apply all 10 points to Divine Wrath, capped at 10. This is labelled provisional in the outcome preview and Rules and recorded with provenance. No Killer Wrath track is created. No explicit official ruling was found; do not present this interpretation as publisher-confirmed. Replaces the proposed manual-only fallback. |
| Fickleness of the Gods | An ongoing Terror, not an Event. End of Upkeep Horror roll: 2+ reduces a chosen Wrath 1; 1 no effect; 0 Unleashes Divine, then increases by Sacred Victims. May pay 3 Time in Action phase to discard. Active/ended/unknown state plus physical guidance; no deck or dice simulator. |
| Other ongoing Events | Loud and Obnoxious, Flash Photography, Unholy Bloodshed and Gods Hate Failure have exact conditional timing, read-only Rules and concise active reminders. No inferred die result, hand discard or casualty. |
| Rage of the Gods | FAQ: its placement fallback uses an absence of Victims at Sacred spaces, even if Victims remain elsewhere. Not an empty-board condition. |
| Items | Full rules and owner-filtered references; Prayer Book charges/success bonus, Incense minimum increase, Dagger/War Club/Mask reductions and physical-use requirements preserved. Found Items remain observations rather than inferred inventory/equipment/use/charges. |

## Integration coverage

| Surface | Implementation / evidence |
| --- | --- |
| Selection, IDs, ownership | Existing film retained; separate registered `groves` location. Killer panel stays first. Wrong-location writes, foreign linked owners and unearned/stale/repeated commands rejected. Tested with five imported killers and selectable generic Poltergeist. |
| Rules/setup/search | Shared `groves.ts` feeds `grovesRules.ts`, searchable card/rule text, five clean Setup diagrams, the legacy film details and visual guidance. Rules block rendering and search both support diagrams; search has an exhaustive block check. |
| Canonical catalogs | Eight Terrors, ten Events, seventeen Items, five Setups, six official names, nineteen diagram spaces and thirty connections. `catalog.ts` supplies owner-filtered cards/rooms/Items/roles. |
| Play/shared controls | Illustrated location panel, Divine Wrath, shared Atonement, count aid, Sacred-site placements, connection signs, shared role/Event controls and ongoing Terror. Full effects under Rules, concise active consequences in normal view. |
| New sessions/legacy/recovery | `grovesSetupVersion:1` is stamped at genuine casting. Setup is persisted once with the first log write: Wrath 2 and verified unplaced tokens. Selected starting Event appears as an activation entry point; optional/rolled outcomes stay explicit. Older sessions are not backfilled. |
| Atomicity/Undo | `grovesAction` includes a parent observation precondition; durable append recomputes from latest state. Only verified actions may attach one `linkedModule` for Inkanyamba Wrath. Schema validation, both reducers, timeline, Undo/restore and death JSONB normalization understand the same event. No generic batch/rules engine or database schema change. |
| Death/history/narration | Owner-filtered references, historical cutoff and both owners' facts. New Finale provenance avoids changing old generic death cache identities. Companion observations canonicalize across JSONB; real generation/narration handler tests and browser cache/replay pass. No role removal, token or Wrath level manufactures a casualty. |
| Opening/ending/images | Dedicated board-backed visual guidance, existing good location art, full shared catalog facts and a bounded owner-aware ending summary. Fire and Brimstone is explicitly not proof of fire/injury. Mixed casting reaches ending/history. |
| Outcomes/archive/stats | Existing IDs and serialization preserved; no unrelated Final Girl health/abilities or statistic formula changes. Ending/archive journey exercises the new observations. |
| Artwork | Two reviewed original atlases plus existing location painting; [art mapping/provenance](../../src/assets/play/groves/README.md). Meaningful present/saved/departed portraits, stored/placed/retrieved sign motifs and separate Event/site illustrations. HTML owns all names and states. |
| Compatibility | All five registered killers plus generic Poltergeist. Inkanyamba elsewhere and shared module/death/ending regression journeys are run separately; current-head CI covers the full suites. |
| Release | `generate-death-scene` and `narrate-story` require deployment before frontend. Other generation/image callers use existing frontend-supplied contracts. No SQL migration, new dependency or new model. Production deployment/live smoke remain pending. |

## Interaction and artwork decisions

- Shared CharacterControl's optional `onOutcome` permits collection/preview before a real resolution; `onChange` remains correction-only for Groves and unchanged for existing callers.
- Physical costs, movements, rolls, hand contents, inventory and global victim totals remain separate. No automatic phase progression or Bloodlust/Finale execution.
- Unknown is distinct from unplaced/ended/saved/killed/removed. Event activation never chooses a die result or optional closure. Ending an effect does not reset a physical token. Clearing an Event cannot resurrect a departed role.
- Linked actions save with one immutable event; local write rejection leaves all displayed states unchanged and retryable. Parent preconditions reject races; undo/restore covers both owners.
- Original cinematic styling, HTML labels, dimmed unselected/Epic treatment, death-dialog footer/prose behavior and complete ending poster fit are retained. Expanded sections may scroll; controls are not shrunk or clipped to fit.
- All primary controls have at least 44px targets, focus treatment and readable contrast; no page overflow at 320px. Connection selection uses a list rather than tiny interactive SVG edges.
- During visual/browser review, fixed escaped site captions caused by missing shared tile styling, and a Rules search crash caused by the new diagram block lacking a text projection. Added regression coverage for caption containment and full Rules navigation. An already-unknown Divine Wrath record cannot be cleared again, avoiding a misleading failed-save message; the legacy recovery journey covers this boundary.

## Verification evidence

| Check | Result / coverage |
| --- | --- |
| `npm run check` | Lint (existing warnings, no errors), both TypeScript projects, 444 Vitest tests and 104 Node edge/handler tests pass locally. |
| `npm run check:assets` | Validates the original artwork files, including both new atlases; actual browser decode/crops checked separately. |
| `npm run build` | Passes. No new dependency or model required. |
| Native Deno validation | 25 tests pass. Native check passes for generate-death-scene, narrate-story, generate-story, generate-ending, generate-scene-image and generate-visual-bible. Broad all-entry-point local check could not download the unrelated migrate-legacy-images npm dependency under shell DNS restrictions; CI supplies the full native gate. |
| Source/domain | Exact ordered Wrath rows, strip bounds/zero index, component counts, Setup figures/counts, valid edges/token limits, modifier boundaries, role outcomes, Atonement rounding and independent owners. |
| Durable session | Unknown/fresh setup, stale/repeat/wrong-owner rejection, one-step linked Undo/restore, no victim-count inference, failed writes/retry/reload and both Finale provenance markers. |
| Edge handlers | Real generation handler receives both historical owners without mutating gameplay. Canonical owned narration accepts linked historical facts. Existing auth/provider/error/canonical tests retained. |
| `tests/browser/groves.spec.ts` | 26 passing desktop/mobile journeys after source/UI fixes: six killers, both Atonement targets, linked Holy Man outcomes, provisional non-Inkanyamba path, corrections without effects, persistent tokens, signs, read-only diagrams, Fickleness, unknown/rejected-write/offline reload, loaded art, historical JSONB death/cache/audio and fresh mixed casting through ending/archive/Rules. |
| Actual screenshot review | 1280×640, 1366×768, 1440×900; 320×568, 390×844. Track, site labels/crops, unknown/present/saved/departed roles, Events, connection diagram, provisional choice and Rules. Final screenshots emitted by browser specs/CI artifacts. Material caption/search findings corrected before handoff. |
| Regression/CI | 80 selected desktop/mobile journeys pass across Groves, Inkanyamba, shared modules, reveal layout, death completion and story requests; four additional focused journeys pass for starting Events, count modifiers and both Finale entry points. Implementation PR's current-head Reliability checks are the authoritative full-suite status. |

Mocks cannot establish production deployment or live model/audio quality. No paid generation, signed-in production mutation or live-provider verification is claimed.

## Release and remaining checks

1. Review/merge the implementation PR after its current-head Reliability checks pass.
2. Deploy **`generate-death-scene` and `narrate-story`** from the merged revision before publishing the frontend: both import the changed shared Play validators/context/death logic. Generation/narration must recognize `groves`, linked observations and new Finale provenance before the UI sends them.
3. Publish the frontend. No SQL migration: save_play_session stores bounded JSONB and does not enumerate module types; existing revision/ownership transactions are unchanged. Opening/ending/visual-bible/image request contracts remain compatible.
4. Signed-in production smoke after deployment: mixed game, Divine/Killer Wrath or role outcome, save/reload, contextual death, cached reopening and saved narration. Deployment and this live check are pending, not implied by merge/CI.
5. The only rule interpretation still unconfirmed by an explicit official ruling is the Holy Man's absent-Killer-Wrath allocation. The user-approved Divine-only interpretation is implemented and labelled provisional; this is not an implementation blocker or an undisclosed automation omission.

## Play presentation follow-up, 2026-10-26

User-approved simplification replaces the Wrath presentation with the shared `WrathTrack`, themed separately for this owner. Power/Finale cards are compact and stable across selection; Minor Powers precede them and preserve full artwork motifs/health semantics. Shared atlas framing now clips each source cell explicitly. Source facts, validators, setup provenance, immutable historical observations and story/death context are unchanged.

Play removes the requested reference/correction panels. The dedicated Rules page retains mechanics and source attribution; obsolete references to retired UI helpers are corrected. Existing observations from hidden controls remain compatible and are not migrated or erased. Special-victim Rules disclosures are omitted while outcome actions and consequential reminders remain. Holy Man allocation remains provisional as previously approved. Sacred-space image cycling, explicit combined/unknown editing and Fickleness presence toggling use existing fields only. These UI conveniences never execute physical board effects, alter totals or infer Event/token state from one another.

Release: frontend/artwork only; no new SQL or edge deployment. Current-head CI and the final PR record verification results separately from production publication.


### Cinematic Play follow-up, 2026-10-26

Approved visual-only follow-up: compact muted choices with large revealed Power/Finale panels across all applicable killers; independent active Minor panels with original health limits; Rules disclosures removed from Power/Finale chooser. Five Wrath background bands per owner replace static backgrounds; Play Unleash text and Inkanyamba Wrath reference removed. Sacred spaces use transformed environment images for all eight combinations, preserving actual placement/unknown/correction logic. Fickleness keeps its original artwork, loses reminder text and becomes 195px high. Shared presentation applies only to equivalent controls; linked Events and other owner mechanics retain their workflows.

Source/art mappings and symbolic interpretation are recorded in the owner artwork READMEs. Raw rules, canonical validation, historical observations, narrative context, token limits, separate victim totals and provisional Holy Man allocation remain unchanged. No backfill or migration. Release: frontend/artwork only; CI/merge/publication are tracked on the PR separately.


## Wide photographic selection follow-up, 2026-10-26

User-requested: remove Inkanyamba's duplicate Power/Minor reminder beneath Wrath, hide unused choices after a named Power/Finale/Minor is recorded, retain explicit Change/Add another actions, and replace affected images with wide candid photographic motifs. Shared selection behavior applies to Inkanyamba, Hans, Billy, Geppetto and Dr. Fright, including Hans's second power. Sacred Groves uses all 24 separately cropped 16:9 environmental-state photos, with unchanged token limits and atomic observations. Exact provenance/mappings: `src/assets/play/photos/README.md`. Several Minor Powers remain supported; unknown, zero, correction, failed writes and permanent reveal history remain distinct. The chosen photo stays stable through Minor health changes. Original source-backed rules, canonical IDs, compatibility, narrative/death context and provisional Holy Man allocation remain unchanged. No SQL, backfill, function or secret changes; frontend/artwork release only. Verification and publication status are recorded in the PR.


## Banner and correction follow-up, 2026-10-26

Replace this owner's illustrated module banner with an original owner-specific candid photograph, alongside all ten existing Play headers after visual audit. Native crops/focal points/provenance are in `src/assets/play/banners/README.md`; supplied identity pictures and gameplay imagery remain intact. Dark Power uses left-aligned Clear card name without a Change button, preserving its permanent reveal. Minor Powers replace Details & corrections with the existing Clear record action as a quiet link; live heart controls, Undo and historical observations remain. Sacred spaces suppress only the known-empty No tokens caption; unknown/mixed/live states retain their labels. Canonical facts, compatibility, context and provisional Holy Man allocation are unchanged. Frontend/artwork only; no SQL, function or secret changes. Verification/publication are tracked in the PR.
