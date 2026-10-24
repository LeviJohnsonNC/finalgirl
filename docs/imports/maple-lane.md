# Maple Lane import record

## Scope and current status

- Owner: Location, canonical name **Maple Lane**, existing film `s1-maple-lane`, planned stable module ID `maple`.
- Standard mode, supplied physical printing. Extreme Horror, scenarios, new Final Girl/personal-item content and new Dr. Fright mechanics are outside this import. See [Dr. Fright](dr-fright.md) for the independently owned killer.
- Requested result: complete source-backed location Rules, illustrated Play, canonical references, contextual death/story integration, recovery and mixed-film support under [the import playbook](../MODULE_IMPORT_PLAYBOOK.md).
- Stage: **pre-code source review and implementation specification complete for the verified companion scope; app implementation not started**. This is not an implemented, tested, deployed or full-physical-box-verified module.
- Reviewed 2026-10-24 against main `3e0ebac5aad55741e00a522e6f3900a8d0d53601`. Preparation branch: `docs/maple-lane-source-audit`. No application code, assets, functions or production data changed.
- Six original photos visually inspected at original resolution, with temporary rotation/crops for inspection. Reuploads are duplicates, not additional components. Raw photos remain outside Git.
- Current support: reuse existing selection/ownership and location artwork where good. Maple Lane has no registered Rules module or illustrated location Play panel; shared room/item/special-victim selectors lack its catalog. Existing `Fire!` effect in `_shared/play/catalog.ts` agrees with the photographed card; replace its provenance with the owner photo and deduplicate when moving it into the new catalog.
- Read: root AGENTS, MODULE_IMPORT_PLAYBOOK, module-controls, PLAYTEST_POLISH, import template and existing Dr. Fright record; inspected current selection/registry, Rules registration, shared catalog/module validation, durable setup boundary and mixed-module browser matrix.

## Evidence ledger

Original stable references; these identifiers are access references, not public image URLs.

| ID | Filename / persistent Library ID | Face / coverage | Status |
| --- | --- | --- | --- |
| P1 | IMG_9351.jpg / `libfile_49a6665ec40c8191956435fea18f87a7` | Front of location sheet: credits, components, special setup | Verified visually |
| P2 | IMG_9352.jpg / `libfile_ea8f2c343f4481918c198b9f06f40b7a` | Reverse: Streets, Houses/quadrants, Search, occupied-house entry/Convince | Verified visually |
| P3 | IMG_9353.jpg / `libfile_2db66a7a09b081919c2e74fe4d3d0906` | Complete location board, quadrants, space boundaries and two named houses | Verified visually |
| P4 | IMG_9354.jpg / `libfile_a79c6016c8e4819186bcb2f144740851` | All eight location Terror faces, two rows | Verified visually |
| P5 | IMG_9355.jpg / `libfile_06b0f4078d04819195b639c3f056f4c1` | Five Setup diagrams and ten Event faces | Verified visually |
| P6 | IMG_9356.jpg / `libfile_39d2d7b510b48191a7a71149e5bff0ca` | Sixteen Item faces; three Crucifix copies | Verified visually; Trashcan Lid damage icon also inspected in a close crop |

Credits from P1: design A.J. Porfirio; art Roland MacDonald; additional Item art Tumo Mere. Supporting symbol definitions: current core Rules, plus the publisher-authored [core rulebook, icon reference on final PDF page](https://cdn.svc.asmodee.net/production-asmodeeca/uploads/2025/10/Final-Girl-Rules.pdf). Supplied photos govern location effects.

| Component | Expected from P1 | Supplied | Reconciliation |
| --- | --- | --- | --- |
| Location board | 1 | 1 complete face, P3 | Verified |
| Location sheet | Front and reverse | P1/P2 | Verified |
| Setup cards | 5 | 5 faces, P5 | Block Party, Playtime, A Quiet Place, Maple Lane, Revenge; diagrams visible. Keep physical positioning manual; no automatic board population. |
| Events | 10 | 10 faces, P5 | Verified, catalog below |
| Location Terror cards | 8 | 8 faces, P4 | Verified, catalog below |
| Items | 16 | 16 faces, P6 | 14 distinct names; Crucifix has three physical copies. Deduplicate suggestions while retaining copy count. |
| Convince Action cards | 2 | No standalone readable faces | P1 thumbnail is not a verified outcome table. P2 fully supports the general entry rules. Do not invent success/failure costs/rewards. |
| Various tokens | 21 total | Sheet illustrations, not an itemized punchboard/front-back inventory | Total verified; per-type quantities and reverse-face mapping remain unknown. Do not infer a token stock limit from thumbnail examples. |

## Verified rules and board model

- Four quadrant Item decks, three cards each, normal faceup top card. Both Convince cards enter the Action Tableau. Do not invent a different house-specific Item deck.
- Twelve Houses, three each in NW, NE, SW and SE. Every House is a Search space. After a successful search, take cards from that quadrant's deck and put an X on that particular House; it cannot be searched again. Multiple-item choices/returns follow P2.
- If an Item must return to a quadrant with all Houses already searched, use the closest quadrant with an unsearched House. This is reference guidance, not an automated adjacency calculation.
- Streets include ordinary spaces, Exit spaces and the Intersection. Board has four outer Exit Streets, four inner Streets and the central Intersection.
- Only two Houses have printed names: The Boyfriend's House (NE) and The Smalley's House (SW). Others need clearly positional UI labels, never invented family names.
- Occupied House means at least one Victim. The Final Girl cannot use ordinary movement to enter it; Convince works from its adjacent Street. Exiting any House uses normal movement. Enemies and panicking Victims are exempt from the entry restriction. Unoccupied Houses use ordinary movement. Convince has an additional 3+-success line, but its exact outcomes are not verified.
- Planned stable house slots: NW west/north/inner; NE boyfriend/inner/east; SW west/smalley/south; SE inner/south/east. Use the P3 spatial arrangement and confirm UI labels against it when creating artwork. Fixed spatial ordering, not state-dependent sorting.
- Planned Street IDs: west-exit, west-inner, north-exit, north-inner, intersection, east-inner, east-exit, south-inner, south-exit. These are app labels/IDs, not printed street names.

## Event catalog and control consequences (P5)

| Event | Faithful factual paraphrase | Planned treatment |
| --- | --- | --- |
| What's Going on Over There? | Put one new Victim on each Exit, then discard. | Instant reference; no persistent activate/end widget or inferred rescues. |
| Officer Kopp | Put the Cop Car at a chosen Exit. Each Upkeep move it one space toward the opposite Exit. Victims in its space travel with it and are saved on reaching that Exit. Remove car/discard Event when it reaches the exit. | Dedicated Cop Car route/position control; never generic saved/killed character buttons. No automatic victim totals. |
| Fire! | Die 1–3 selects Boyfriend's House; 4–6 Smalley's House. Victims there or panicking into it die; the Final Girl/Enemies there take one damage. House cannot subsequently be entered or searched. | Explicit fire-house choice after physical roll. Burning status separate from searched/trapped. No repeated damage from reopening/reselecting. |
| It's the 4th of July! | Move Victims in Houses to their adjacent Streets, then discard. | Instant reference. |
| Party in the Burbs! | Add four Victims to a House already containing a Victim; if none, use Intersection. Discard. | Instant reference; conditional destination retained. |
| It's Raining | Panic Intersection Victims; then move every Victim on a Street into its adjacent House. Discard. | Instant reference; preserve order and Intersection condition. |
| Under Construction | Die 1 West, 2 East, 3 North, 4 South, 5 East/West choice, 6 North/South choice. Place Roadblock at selected Exit; Victims cannot be saved there. | Explicit blocked-Exit observation. A Roadblock blocks rescue; no invented movement restriction. Effect also possible from Terror without this Event. |
| Friendly Neighbors | Roll one additional die for Convince. | Shared ongoing Event control; visible active bonus, full effect under Rules. It is a die, not an automatic success. |
| The Smalleys | Place two Special Victims in Smalley's House. Each killed Smalley adds one extra Bloodlust. Discard when neither remains on board. | Two independent shared CharacterControls. Explicit activation adds both atomically; last departure and Event ending linked atomically. Status never updates victim totals/Bloodlust implicitly. |
| Boyfriend | Put Special Victim in Boyfriend's House. Killer targeting the Final Girl instead targets Boyfriend. During Upkeep he moves two spaces toward her; then if sharing her space, lose two Time. Discard when he leaves play. | Shared CharacterControl; visible restrictions/reminders. No automatic position/Time changes or unrecorded targeting in narration. |

The Smalleys' additional Bloodlust is separate from normal victim-death Bloodlust. Boyfriend loses Time, not Health. Card viewing never resolves effects. Opening an Event's Details must not restore departed victims or repeat initial placement.

## Terror catalog (P4)

Resolve physical cards in printed order. Below are catalog references, not automatic actions. A Move icon uses the killer's Movement value, not one space; preserve doubled Move/Attack icons.

| Card | Verified sequence |
| --- | --- |
| It's Too Quiet... | Increase Horror; target Final Girl and move with two Move icons; if Killer shares her space, increase Horror again. |
| It Came Right Through the Yard! | Target closest Final Girl/Victim, Move, Attack; if Killer is in a House, move it to another House in that quadrant with a Victim; target closest Final Girl/Victim and Attack; draw Event. |
| I Said Don't Look Back! | If no Exit contains Victims, replace this Terror card. Otherwise place Killer on an Exit containing a Victim; target closest Final Girl/Victim and Attack. |
| They Told Us to Hide! | Increase Horror; add one Victim to each House not connected to an Exit; draw Event. |
| Road Closed for Construction | Roadblock at Exit closest to Final Girl; Victims cannot be saved at that Exit; draw Event. |
| They Just Got Hit by a Car! | If no Street Victims, replace Terror card. Otherwise kill one chosen Street Victim; target closest Victim, Move, Attack. |
| We Are All Gonna Die! | Two sequences of target closest Victim, Move, Attack; if no Victims killed, increase Bloodlust twice. |
| Did You Hear What Happened on Maple Lane? | Draw Event, draw another Event, then draw next Terror card. |

## Item catalog (P6)

All are Maple Lane-owned references. Finding an item is an observation, not proof it is held, used, discarded or has placed its prop. Preserve printed limits in Rules; do not build inventory/combat/roll simulation.

| Item / copies | Verified effect and relevant printed limit |
| --- | --- |
| Crucifix / 3 | Discard to ignore a Horror increase OR end an Enemy's movement when adjacent. |
| Archery Bow / 1 | Range 1–2, one damage, three uses. Use without an Action card; spend two Time to fire at a Street space in range. |
| Rifle / 1 | Range 1–3, two damage, two uses. Use without an Action card; spend one Time for a Horror Roll; success deals two damage to one Enemy on a Street in range. |
| Pitchfork / 1 | Range 0, one damage; may discard at any time to prevent damage from one attack. Not unpreventable Health loss. |
| Trashcan Lid / 1 | Three uses; ignore one damage. Damage icon checked in a close crop, not two damage. |
| Megaphone / 1 | Once per Action phase move any Victim one space, then target Final Girl and Move the Killer. No Attack icon. |
| Machete / 1 | Range 0, two damage; Victims do not follow while it is in hand. |
| Energy Drink / 1 | Discard in Action phase for three Time OR move one space. |
| Lucky Dice / 1 | Discard to reroll any/all dice. |
| Fireworks / 1 | Spend two Time to put its token in current/adjacent non-House space. Killer chooses Fireworks instead whenever selecting a target; remove token when Killer enters its space. |
| Odds and Ends / 1 | Three uses. While in a House, may place a Booby Trap there, at most one per House. When an Enemy moves into it, discard trap token and Enemy takes two damage. |
| Knife / 1 | Range 0, one damage. |
| Bicycle / 1 | On taking card put Bicycle in adjacent Street. With empty hands while sharing Bicycle's space, may move self and Bicycle to any other Street once per turn. |
| Bible / 1 | Two additional dice for Convince; not two automatic successes. |

## Settled interaction/state specification

- Register owner location/match Maple Lane, module `maple`, dedicated location banner, summary and shared capabilities character/event. Keep selected killer's panel first. No Maple Lane Power/Finale chooser or Minor Power controls.
- Compact summary: known searched Houses, blocked Exits, active fire/characters as available. Unknown is not zero/unsearched/absent. Twelve House tiles in four spatial quadrant groups; named Houses keep their names. Inactive/active/depleted/unknown art must be distinguishable with readable HTML state.
- Per House: searched/unsearched/not-recorded. Fire and Booby Trap are separate facts; neither marks a House searched. Search marking does not select/grant an Item, move a figure or resolve a roll. No occupancy or movement simulator.
- Shared CharacterControl for Boyfriend and Smalley 1/2: in play/saved/killed plus deliberate removal/correction and unknown as appropriate. No invented personal names/health tracker. Show Smalley extra Bloodlust and Boyfriend restrictions. Linked Event lifecycle changes are atomic with character changes; Undo restores both. Totals remain separate.
- Reuse EventControl for equivalent ongoing effects; one-shot Events remain searchable/contextual references. Ending/clearing a card's record never erases independently recorded fire/Roadblocks/props. No normal-action extinguish/repair/unsearch invented; those changes live under corrections unless a verified effect authorizes them.
- Roadblocks: one observed blocked state per cardinal Exit, unknown distinguished. No per-type token inventory cap guessed. Fire selector limited to the two printed destinations for Fire! resolution. Corrections can clear observations without pretending a normal physical removal occurred.
- Cop Car: unknown / not on board / on route / exited. Explicit origin Exit and progress through five route positions from origin via Intersection to opposite Exit. Each explicit advance is one physical Upkeep movement; final advance removes car/ends Event in one write. No auto-advance on round increment, no victim count calculation. Legacy partial state can be corrected without inventing an origin.
- Item-linked prop controls: Fireworks on a non-House Street, Bicycle on a Street, one Booby Trap per House. Placement, movement, triggering/removal are explicit observations, with correction/Undo. Do not infer item possession/uses, spend Time, deal damage, mark an item discarded, or kill a victim from prop changes. Do not silently reset once-per-turn/Action-phase effects.
- Fresh Maple Lane provenance seeds verified starting observations once at durable boundary. Old/part-played games stay unknown. Selected starting Events seed only source-supported deterministic facts; rolls/destinations/physical resolutions needing choices remain pending explicit observations. No component effects, view writes or setup reseeding after Undo/reload.
- Use existing immutable observations, useModuleRecord, bounded shared validation and owner isolation. New-game baseline includes 12 House states; respect current per-observation field limits and persist complete baseline/first action atomically.
- Keep module facts historical: death context is at that death; no later fire/trap correction rewrites it. Ordinary item find does not imply use. Do not leak Dr. Fright concealed deals/snapshots into timeline, death, narration or ending.

## Integration coverage and implementation targets

| Surface | Pre-code finding / required implementation |
| --- | --- |
| Selection/ownership | Existing `s1-maple-lane` kept; no duplicate film/entity. |
| Rules/search/setup | Add `src/data/rules/mapleRules.ts`; register in moduleRules; tags/cross-links and attribution. Convince outcome table remains explicitly unverified. |
| Canonical catalogs | Add `supabase/functions/_shared/play/maple.ts`; wire catalog selectors for all verified cards, spaces, special victims and mechanisms. Copy counts separate from unique suggestions. |
| Play | Add MapleControls and registry definition; domain transitions in shared module; custom props retain shared caption/focus/44px conventions. |
| Session/recovery | Extend active game setup provenance and shared observation allowlists/labels/reducers/context. Test durable boundary, not just panel state. |
| Death/cache/narration | Maple Lane rooms, Events/Terrors/Items, Fire/Booby Trap/car context and special-victim identities when recorded. Retain unaffected historical signatures. |
| Story/visual context | Suburban Spring Hill; four quadrants, Street/House restrictions and verified recorded props. Keep both selected owners in budgets. |
| Existing Dr. Fright | Independent killer module stays intact; mixed regression includes unknown/physical/digital sleep states and safe public projections. |
| Archive/stats | Preserve old sessions and victim counts; module status does not increment aggregate totals. No new Final Girl facts. |
| Art | Original banner, House/prop/state illustrations and character portraits; inspect current neighboring art before generation. Document atlas dimensions/order/mapping and review crops. Raw photos never used as UI. |
| Release | Shared module validation/context means at least generate-death-scene and narrate-story compatible bundles before frontend; trace all imports/callers for final list. No migration is expected from current observation design, but confirm during implementation. |

## Acceptance and verification plan (not yet run)

1. Source/canonical: exact 10 Event / 8 Terror / 16 Item copies, 14 unique Item names and three Crucifixes; five Setup names; 12 mapped Houses/9 Street spaces. Friendly Neighbors/Bible add dice; Trashcan Lid blocks one damage; Boyfriend loses two Time; no movement blocking invented for Roadblocks.
2. Houses: fresh-game 0 searched explicitly known; failed search does not mark; mark one House changes only that House; duplicate taps do not repeat; fourth House in a quadrant rejected; old empty log stays unknown without new-session provenance; fire/trap do not alter searched state.
3. Props: reject House destination for Bicycle/Fireworks and Street destination for Booby Trap; max one trap per House; trigger consumes recorded trap with no inferred damage/casualties; Event clear leaves Roadblock/fire observations intact.
4. Characters: activate two Smalleys atomically; save one/kill other independently; Event ends only after last leaves; Undo/restore/corrections maintain linked card state; no changes to saved/killed totals or Bloodlust. Portrait/Details never resurrect.
5. Cop Car: all four origin routes; explicit step/reload/Undo; final exit transition atomic; no phase-engine inference or automatic saves.
6. Persistence: failed local write leaves UI unchanged/retryable; offline queued cloud sync does not block successful local play; reconnect/retry and generation failure do not duplicate observations or deaths; wrong owner rejected.
7. Mixed games: Maple Lane with Billy, Hans, Geppetto and Dr. Fright. Current 3x3 consistency spec assumes Minor Powers, so extend via actual capabilities rather than applying that assumption to Dr. Fright. Existing locations and both killer reveal entry points remain valid.
8. Narratives: Rules search; starting Event/Setup references; contextual death before/after a later correction; cached reopening and narration; endings/archive preserve facts. Missing observations add no fabricated board state or irrelevant historical cache changes.
9. Visual: actual loaded art, keyboard/focus/contrast/reduced motion and no horizontal overflow at 1280x640, 1366x768, 1440x900, 320x568 and 390x844; collapsed/expanded, full/unknown/used states, long labels and all death dialog states. Fixed dialog actions and complete ending poster fit preserved.
10. Gates: applicable domain/shared/browser tests, npm run check, npm run check:assets, npm run build and current-commit Reliability CI, native edge/database checks when applicable. Record exact results/screenshots in this record. Mocks do not prove live provider/deployment behavior.

## Remaining source limits and handoff

- **Non-blocking for the specified companion:** two Convince card faces are not supplied beyond the component thumbnail. General entry rules are verified. Do not manufacture their detailed success/cost/failure table. A straight-on photo of both faces would complete this reference.
- **Non-blocking:** total tokens is 21, but individual quantities/reverses are unverified. The app will observe placed props, not manage a token supply. Only printed constraints such as one Booby Trap per House are enforced. An itemized token photo is needed only to implement a supply bank, which is outside scope.
- All supplied readable location card faces are accounted for. No other photo is needed to start the verified implementation.
- Next: implement shared domain/catalog/Rules and persistence; illustrated Play/art; death/story callers; source-backed tests and visual fixes; compatibility/deployment inventory and PR evidence. Start from current main and carry this record forward.
- App code, tests, generated artwork, migrations/functions/frontend deployment and live smoke are **not started**. User requested preparation only and will be told when ready to begin coding.
