# Wingard Cottage import record

## Scope and current status

- Location owner Wingard Cottage, paired with The Intruders in A Knock at the Door, Series 2. Reuse film ID `s2-knock-at-door` and propose `wingard-cottage` for the independent Play module. Related import is [The Intruders](the-intruders.md).
- Planning and source review only. GitHub main reviewed at `a4d1f7396117cba548b25ba8ac45df2c1ca02829`, which includes PR #179. Seven original JPEGs opened and decoded at 2048 × 1536. Raw sources stay outside Git.
- Main already has casting, a Collection entry, all Setup and Event names, a basic Rules module, and supplemental ending spaces. The location has no registered Play panel. Preserve the existing film, Collection art, cast IDs and photo preferences. Replace loose or misleading gameplay descriptions with shared source-backed facts wherever those descriptions drive behavior.
- The approved [Groves captures](../reference/module-standard/README.md) set the visual baseline. [Storybook Woods](storybook-woods.md) demonstrates narrow observations and fresh versus legacy Event behavior. [Marrek Warehouse](marrek-warehouse.md) demonstrates independent location artwork, explicit person outcomes, and dedicated controls for tabletop objects worth tracking.

## Evidence ledger

| Component | Expected | Supplied | Source | Evidence |
| --- | ---: | ---: | --- | --- |
| Location board | 1 | 1 | IMG_9470.jpeg | Named rooms, two Bedroom spaces, search sites, three printed exits, marked supply sources, Lakefront and Lake |
| Location sheet | Cover and rules | Cover and rules | IMG_9471.jpeg, IMG_9472.jpeg | Counts and credits, setup, zone definitions, supply and crafting rules, carryover example |
| Terror | 8 | 8 | IMG_9473.jpeg | All named faces, top and bottom rows |
| Setup | 5 | 5 | IMG_9474.jpeg, top | Grad Party, Special Occasion, Fishing Trip, Dysfunctional Family, Couples Weekend |
| Event | 10 | 10 | IMG_9474.jpeg, middle and bottom | Brainstorming, Marked for Death, Battle Ready, Getting Resourceful, Escape Attempt, Home Security, Booby Traps, Loser Boyfriend, Kick-Scooter, Another Way Out |
| Supply | 4 | 4 | IMG_9475.jpeg, top | Rope, Wood, Nails, Discarded Tools |
| Crafted | 10 | 10 | IMG_9475.jpeg, middle and bottom | All recipes and effects below |
| Standard Item | 16 | 16 | IMG_9476.jpeg | 13 names. Two each of Knife, Wooden Bat and Blueprint |
| Loose tokens | 11 listed | No separate spread | IMG_9471.jpeg, IMG_9474.jpeg, IMG_9475.jpeg | Use card-verified purposes and limits. Reconcile individual physical tokens only if a proposed rule or control depends on them. |

### Crafting reference

| Crafted card | Ingredients | Base Time |
| --- | --- | ---: |
| Snare | Rope, Wood | 1 |
| Spiked Slingshot | Nails, Rope | 2 |
| Nail Bat | Wooden Bat, Nails | 2 |
| Spear | Knife, Wood | 2 |
| Disemboweler | Wooden Bat, Knife, Rope | 2 |
| Nail Trap | Wood, Nails, Discarded Tools | 2 |
| Nailgun | Nails, Discarded Tools | 2 |
| Sawed-off Shotgun | Shotgun, Discarded Tools | 2 |
| Porcupine | Trashcan Lid, Nails | 2 |
| The Obliterator | Wood, Rope, Discarded Tools, Nails | 4 |

## Pre-implementation review

- The Workbench must remain useful with a partially recorded game. The cards establish the recipe and what a completed craft returns, while the existing app has no general inventory ledger. Record a completed tabletop craft directly when needed, including from an unrecorded offer. Show the known ingredients and return only that recipe's Supply cards in the same write. Allow optional pickup observations and quiet corrections. Reserve validation for contradictions in known Cottage state, rather than requiring a duplicate inventory or four complete starting offers.
- A recipe, its current acquisition, its charges and its placed board tokens have different lifetimes. The core rules discard most depleted limited-use cards. The Cottage rules return discarded crafted cards to the market, and the Spiked Slingshot card explicitly stays in play at zero. Return a depleted ordinary craft in the same action, keep zero-use Slingshot available to refill, and preserve already placed Snare/Nail Trap tokens when the recipe returns or is crafted again. Enforce per-card, per-placement limits from the cards. The publisher's combined-trap achievement confirms both can trigger in a turn. It does not settle simultaneous placement on the same space, so leave that edge to the tabletop and impose no app-wide cross-type prohibition.
- Shared controls cover rendering and retry messages. `useModuleRecord` only guards an identical stale-render submission, and `useActiveGame` and shared validators own first-write setup and replay. Validate the actual owner and command against the current log, including first action plus setup, and replay the same transition through client and server validation. Seed a selected persistent Event once, and keep several later Events active independently. Avoid resetting on panel expansion or rewriting older sessions.
- The existing Wingard visual prompt calls for weapons and supply stashes unconditionally, and `deathFacts` gates raw-log history through owner-specific reference flags. Move weapons and Event outcomes behind explicit observations, keep atmospheric location guidance separate, and mark only new Wingard death references for frozen location facts. Test an existing Wingard death signature as well as an unrelated one. Keep explicit death edits authoritative and both owners represented when their contexts share the same budget. `openingReferences.ts` loads killer and Final Girl identities, so the new Play panorama does not need a private opening upload.
- The photographic bar requires comparing the first loaded Workbench states with the approved Groves samples before generating the full set. Fix focal crops and controls at the rendered sizes, then generate from a surface-to-state shot list. Scope new stills to visible references and distinct physical states, using shared imagery when a character Event and its role portrait represent the same subject.

The source sheet and cards cover the proposed actions. The loose token breakdown and any exact same-space cross-type trap ruling remain unverified. Neither is needed for the app's observed-state controls. Source cross-checks use the publisher's [Series 2 feature film rulebook](https://cdn.shopify.com/s/files/1/0593/6984/8897/files/FG_S2_FeatureFilmRules-compressed_2_d7a4674c-d7cf-4d4d-8118-59622183cbcc.pdf?v=1717771084) and [core limited-use and Event rules](https://cdn.shopify.com/s/files/1/0593/6984/8897/files/FinalGirl_Rules_ff324b01-6f74-43e0-90e2-1685594703d5.pdf?v=1717621644).

## Verified mechanics and revised state

| Mechanic | Rules and Play behavior |
| --- | --- |
| Setup and zones | Begin with four supplies available and four random Crafted cards face up. Keep the physical draw on the table. Record any or all known offers in the app, leave unrecorded offers unknown, and distinguish the two bedrooms in reference data. Garage is in the House. Shed and Boathouse are Indoors and outside the House. The board, rather than Play, handles movement and victim placements. |
| Supplies | Discarded Tools at Garage, Nails at Shed, Rope at Boathouse, Wood at two marked outdoor spaces. Picking one up costs 1 Time and requires stopping on its space. Track each optional held/available observation with a compact illustrated control. Two Wood pickup sites share one card. Used or discarded supply returns to the common pool. |
| Workbench | Show recorded face-up recipes and their ingredients and Time, with a compact picker to add offers. Record the four starting offers as observed. Blueprint adds one chosen unused recipe, Brainstorming adds the two revealed from the unused cards. Offers may then exceed four. Crafting records acquisition and returns only the recipe's spent supplies in one write, with that consequence visible before the action. A completed craft can be recorded even if its original offer or pickup history was unrecorded. Discarding a crafted card returns it to the offer row. Corrections use the same quiet action patterns as other modules. |
| Uses | Support relevant limited uses in the Workbench without tracking the base inventory. Enter actual inherited uses for Sawed-off Shotgun or Porcupine when known. Keep unknown separate from zero. Show use controls only for limited-use crafts. Final use of an ordinary limited-use craft returns the card to the offer row in the same observation. The Spiked Slingshot remains held at zero and refills using Nails, returning Nails to the pool in the same observation. Getting Resourceful reduces crafting Time by 1, including a 1-Time recipe, and does not reduce pickup or placement costs. |
| Placed traps | Snare and Nail Trap have distinct, repeatable board-token states. Place during the Action phase for 1 Time per token. A Snare stops further Enemy movement for the turn, and a Nail Trap deals 1 damage. Record a known placement using a compact space selector, one per space for the same trap type, plus trigger/remove when the player reports it. A reported placement spends one use on its acquired card. Keep placed tokens separate from unspent placements and crafted card availability so prior tokens remain after the last placement, a card return or a re-craft. The tabletop resolves movement and damage. |
| Home Security | Available after its Event. Activate in an Action phase with no Enemies in the House. An Enemy attempt to enter is blocked and adds one token. The third attempt disables the alarm, as does the Final Girl or a Victim entering or leaving the House. Show ready, active with count, and disabled. Record the observed attempt or crossing without consulting a digital board. |
| Kick-Scooter | Record parked outdoors or with the Final Girl. Keep starting placement and legal movement on the board. Rules explain the nearest-outdoors placement, last-outdoor-space parking, and once-per-Action-phase movement of up to two spaces without Victim followers. |
| Outsider and Boyfriend | Use the shared person control with card-specific actions. Marked for Death starts the Outsider in the Bathroom and changes target/path effects while present. Loser Boyfriend identifies an existing Victim furthest from the Final Girl, protects him from Enemy targeting and killing, and has a specific consequence if the Final Girl kills him. Capture the player-observed outcome and leave Horror and Bloodlust totals to existing controls. |
| Neighbor and Boat | Another Way Out introduces the Neighbor in the Family Room and Boat in the Lake. The Neighbor at Lakefront can leave with up to three other Victims there. If the Neighbor leaves play, the Boat and Event go away together. Record an explicit boat escape or other Neighbor outcome without silently changing the general victim ledger. |
| One-shot Events | Booby Traps causes immediate House panic and kills Victims who leave during that resolution. Keep it distinct from the crafted Nail Trap. Battle Ready, Escape Attempt and Brainstorming resolve on the tabletop, with revealed offers, discoveries, casualties or other explicit outcomes recorded through existing paths when useful. No automatic draw, reroll or resolution on entry. |

## Integration and artwork

1. Reconcile all 53 card faces against the canonical catalog, including duplicates, icon magnitudes, effects, Setup placements, spaces and aliases. Keep full Rules/search/casting references. Use one verified source of gameplay facts for frontend and Edge consumers. Suggested names for unnamed board spaces are descriptive and disambiguated.
2. Build and inspect the Workbench first with one representative supply and craft photo. Exercise partial setup, one atomic craft and one correction with the actual component before generating the remaining photos. Use the shared `ModulePanel`, `IllustratedTile`, `PlaySelect`, `CharacterControl`, `EventControl` and `useModuleRecord` where their contracts fit. Use a small owner-specific action for crafting and returning supplies, and compact trap and Event controls only when relevant. Keep the four core trackers and the approved owner header composition. There is no map, general inventory, phase clock, combat automation or deck runner in scope.
3. Record persistent observations through existing durable boundaries. Fresh setup can seed verified known facts and the chosen ongoing starting Event, once, through first-write provenance. Later explicitly recorded ongoing Events can coexist. Partial or resumed games stay editable and unknown where evidence is absent. Mount and expansion are read-only. Validate commands and ownership at the durable write boundary and in shared replay. Test stale, repeated and failed actions, atomic Undo/restore/retry, and the ability to correct known states without duplicating rewards or totals.
4. Integrate contextual Terror, Event, item and location references with existing Remember This and Gruesome Death surfaces where they apply. Keep free text and the six-cause flow. A card that merely introduces Victims, raises Horror or reveals an Event is context unless its effect or the player's report establishes a death. Build historical facts from the log at the moment. Keep signatures stable for pre-import Wingard and unrelated deaths. Freeze new Cottage context from the raw log prefix, retain deliberate edits to the death itself, and test both-owner context in a single death. In opening, narration, ending and archive paths, distinguish an offer, a crafted item, a placed trap, an actual use and an observed outcome. Preserve both selected owners and the chosen Final Girl.
5. Generate original 1980s consumer 35mm photographs. Use the approved Inkanyamba reference for realism and the existing cottage identity for architecture. Prepare a wide cottage panorama, four supply and ten craft photos, individual Terror reference scenes where displayed, live-event objects and people, and distinct visual states for meaningful environmental changes. Candidate subjects include the alarm at the same doorway, the scooter by the porch, a boat at Lakefront, and portraits of the three Event roles. Vary subject and viewpoint across the workbench, porch, rooms and shoreline. Use no fixed killer or Final Girl in location art. Keep generated images free of card scans, text and graphic gore.
6. Use independent native landscape frames. Aim for a panorama around 1500 × 500, with a safe center crop, and heroes around 1280 × 720 or 1280 × 853 within native dimensions. Supply smaller derivatives around 400px wide for tiles. Use neighboring module budgets of about 160 KiB per hero and 35 KiB per thumbnail, then review actual quality. Record source prompts, intended states, dimensions, bytes, digests and focal crops in the asset manifest. Role outcomes share identity. A placed and a triggered trap can share a composition with a meaningful physical change. Use dimming for unobserved presence rather than implying an event occurred.

## Completion criteria and handoff

- Source reconciliation covers all named cards, setup positions, effect and ownership boundaries, printed spaces and supply sites. Record any residual icon or token uncertainty with the smallest necessary crop and keep it out of enforced Play rules.
- In normal Play, record physical offers, pick up supplies, craft and return an item, add an offer, recover from a failed write and Undo a linked change. Demonstrate carryover for an upgrade, ordinary final-use return versus Slingshot zero/refill, a trap still placed after the card returns or is re-crafted, both trap types in play, Home Security disabling by both routes, and Neighbor/Boat lifecycle while other Events are active. Verify known empty versus unknown and event corrections. Check The Intruders pairing and the shared mixed-owner matrix, with a live control journey using an unrelated killer and an unchanged existing location journey.
- Verify Rules search, contextual death selection and replay, and affected opening/narration/ending/archive payloads. Check affected server adapters with saved JSONB-shaped logs, first action plus setup, save/reload, older sessions, both owner contexts, and existing Cottage and unrelated death-cache compatibility. Test opening without an actual craft or active Event to catch unsupported weapons, props or casualties.
- Inspect loaded images and controls in the compiled app at 1280 × 640, 1366 × 768, 1440 × 900, 390 × 844 and 320 × 568. Compare collapsed and expanded states to Groves, including long labels, unrecorded/recorded/depleted cards, Home Security and the relevant death view. Confirm keyboard navigation, reachable 44px targets, readable photos and no horizontal overflow. Expanded sections may scroll.
- Run the relevant unit and browser suites, asset and build gates, and final-head required CI. Record actual outcomes and screenshot evidence in this record. Confirm the affected Edge function graph and compatible deployment order if shared prompts change. No migration or new private opening reference is anticipated with the proposed existing log and cast reuse. Report frontend, Edge and live smoke status separately from CI.

The approved plan above is retained as the implementation baseline.

## Implementation and release

The shared catalog reconciles the board, five setups, ten Events, eight Terrors, four Supplies, ten Crafted Items and sixteen standard Item faces. Play uses an independent location owner, a small Workbench and explicit ongoing Event controls. Fresh sessions record the available Supply cards and verified starting conditions through the first durable write. Unknown offers, inherited charges and prior sessions remain unknown until observed. A recorded craft, refill, last use, placement or boat escape persists its linked Cottage state atomically. Board movement, casualty counts and Time remain player-controlled.

[Photograph manifest and directions](../../src/assets/play/photos/wingard/README.md) account for 31 native sources and 62 bounded derivatives. The layout review of the first assembled Workbench reduced sparse grids from full-width tiles to bounded tiles, with extra space only for an open card's controls. Several craft concepts are photographed as constituent objects. The original attempt to render a fully assembled Nail Bat was rejected by image generation, so its still shows the bat and nails on the bench.

The frontend and the Edge functions that consume the changed shared Play graph need compatible releases. The graph covers `generate-death-scene` and `narrate-story`. The frontend sends the refreshed opening, visual guidance and ending context through existing payloads. No new database migration or private cast reference object is required. Production publishing and a signed-in live smoke test are separate from PR verification.

| Verification | Local result |
| --- | --- |
| `npm run check` | 940 app tests and 126 Edge adapter tests passed. Lint and typecheck completed. |
| `npm run check:assets` and `npm run build` | Passed, including all 31 sources and 62 mapped photo derivatives. |
| `npx playwright test tests/browser/wingard-cottage.spec.ts` | Six Chromium journeys passed, covering the Workbench, legacy and failed-save recovery, Undo, reload, Events, death replay, and fresh casting through opening, ending, archive and Rules. Generation responses used the existing browser mocks. |
| Neighboring module regression | 42 Cottage, Woods and Warehouse Chromium journeys passed in the preceding compiled visual run. |
| Rendered photo review | Reviewed 1280 × 640, 1366 × 768, 1440 × 900, 390 × 844 and 320 × 568 Workbench captures and both device classes in the death dialog. Loaded photographs and controls were inspected after compacting sparse grids and preserving the selected death photo. |


### Play presentation follow-up

The Workbench has separate links for recording recipes and crafted items. Both use a picture picker. Recorded cards keep their wide size when crafted. The card face shows and updates limited uses. Trap placement remains an explicit spatial observation. Supply art distinguishes carried and available materials. Active people get wide color portraits, with separate saved and non-graphic killed images. The Scooter and Getting Resourceful share the compact event tile proportions. The photo manifest now covers 51 sources and 102 bounded derivatives.


### Consistent large event cards

Event and recipe cards use the same responsive grid sizing. People keep their card size across unrecorded, present, saved, killed and left states. Full-size portrait assets serve every state. All four held-material photographs were edited to show a woman carrying the material, with faces excluded for mixed Final Girl casting. Source and edit-reference digests are recorded in the photo manifest.

The follow-up passed the 14 focused desktop/mobile Cottage and Intruder browser journeys, typecheck, asset checks and production build. Actual screenshot review covered the five approved viewport sizes and the large Event grid. The large cards keep their columns when outcomes change.

Clicking a grey Left play portrait restores that person to In play through the shared status correction, without replaying outcome effects. The shared behavior also covers other owners and Creech’s custom hunter roster. This follow-up is frontend-only.
