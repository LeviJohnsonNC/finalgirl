# Creech Manor import record and implementation plan

## Scope and current status

- Owner: Creech Manor / location; film `s1-creech-manor`; proposed module ID `creech`.
- Stage: source inventory, code audit and plan only. No application implementation or new artwork generation authorized yet.
- Reviewed 2026-10-27 against the approved Groves standard, actual UI reference pack, import playbook and control contracts.
- Base: completed Poltergeist work in PR #140 (`896444be7db10026c2e7642f4e5754428fbdee90`). Keep killer and location ownership independent. Alice/Selena abilities and personal Items remain outside this location import.
- All six uploaded photographs were opened visually at full available resolution. Some source photos are sideways; rotated inspection copies were used. OCR alone was insufficient, especially for the setup diagrams and icons.
- Existing app support includes film/casting IDs, selected images, location description, five setup names with placeholder descriptions and ten Event descriptions in `featureFilmDetails.ts`. There is no dedicated Creech Rules module, Play module, canonical location Item/Terror catalog or location controls. Preserve the existing identities, collection artwork and image preferences.

## Evidence ledger

| Photo | Persistent Library ID | Supplied content | Reconciliation |
| --- | --- | --- | --- |
| `creech1.jpeg` | `libfile_306f2e179c708191bb6d440fcbdf6d1c` | Eight location Terror faces | 8/8, all distinct |
| `creech2.jpeg` | `libfile_5b033d4cf274819194b92c98cadef597` | Location board | Named spaces, room boundaries, floor relationships, panic connections, three Windows, three outside Exits, three one-way connections and the external ladder |
| `creech3.jpeg` | `libfile_2f924cd7fbb48191a31feafb8cb11901` | Component/credits sheet | 1 board, 8 Terrors, 10 Events, 18 Items, 5 Setups, 5 tokens |
| `creech4.jpeg` | `libfile_6e199db6d90881918d88f66268cb7570` | Special rules | One-way movement versus adjacency, Windows, external ladder versus decorative attic ladder, inside/outside |
| `creech5.jpeg` | `libfile_48f8649c758c8191bb070450ed77cdfd` | Top row: all five Setups; below: ten Events | 5/5 Setups and 10/10 Events |
| `creech6.jpeg` | `libfile_34ae02cc3bb081918595948d541afcc0` | Eighteen Items | 18/18 distinct cards; Trashcan Lid is upside down in the source |

All **41 card faces** reconcile with the component sheet: 8 + 10 + 18 + 5. No missing card photo is currently identified. Five token identities are established by the component sheet and corresponding card callouts: Broken Ladder, Rope Ladder, Padlock, Helicopter and Skull. Separate physical token close-ups are not required to design their controls; they would be optional art references.

Credits: design A.J. Porfirio; art Tyler Johnson; additional Item art Tumo Mere. Raw owner photos must not be committed to public Git.

### Canonical inventory

- Setups: The Dead Zone; Dancing Queen; Creepshow; Strange Trophies; The Ladder.
- Events: Liquid Courage; Frozen in Fear; Curiosity Killed the People; I Ain't Afraid of No Ghost; Helicopter Rescue; Light's Out; No One Comes Back; Pushed to the Edge; Clingy Victims; Ghost Hunters.
- Terrors: Something unholy happened in the…; The trees are alive!; Voices… I hear voices!; It's coming, it's coming!; It's a fake!; It's broken!; Something is coming through the wall!; The windows and doors just slammed shut!
- Items: Ancient Text; Lucky Rabbit's Foot; Lucky Dice; Energy Drink; A List of Things in the…; Map; Crucifix; Mysterious Pills; Old Revolver; Trashcan Lid; Padlock; Candle; First Aid Kit; Rope Ladder; Flashlight; Ritual Dagger; Knife; Shotgun.

## Verified mechanics and important boundaries

1. Three one-way connections restrict movement for the Final Girl, Enemies and Victims, but the connected spaces remain adjacent both ways. A placed Rope Ladder changes that connection's movement. Broken external ladder explicitly removes both movement and adjacency for its endpoints.
2. The external ladder connects the left outside Exit to the third-floor left washroom. The drawn ladder leading to the Attic is decorative and is unaffected by ladder effects. Do not build a generic ladder toggle that changes both.
3. Three blue Window spaces are referenced by Events/Terrors; they have no extra general rule. Only the three green Exit spaces are outside. A photographic exterior motif does not establish that the Final Girl is outdoors.
4. Rope Ladder is discarded either to remove Broken Ladder or to place its unique token at a one-way connection. Padlock uses a chosen room connection; a reported blocked Enemy attack removes the Padlock. Token placement is not proof of a held Item, damage, movement or an attack.
5. Helicopter Rescue places a roof token and permits one use during the game. Attic and Helicopter act adjacent for that use. Victims or Carolyn with the Final Girl may be saved. Without saving Carolyn, the Final Girl returns to the Attic and the token leaves play. The Helicopter is explicitly **not an Exit**. Keep use history separate from Event presence and do not reset it by toggling/reopening the Event.
6. Ghost Hunters replaces up to three ordinary Victims with the orange, blue and white Special Victims. They do not follow until one of the group is killed. Each killed hunter adds one extra Bloodlust; the Event is discarded when the last Special Victim leaves play. Do not duplicate existing Victims or infer generic saved/killed totals from a token correction.
7. No One Comes Back puts a Skull in the Attic and kills Victims there or entering it. Event activation records the hazard, not an automatically inferred victim count. Reported deaths use the existing death flow.
8. Liquid Courage, Frozen in Fear, Light's Out and Clingy Victims are ongoing effects. Light's Out concerns movement Action cards and has a minimum of one die; Flashlight/Candle can ignore its penalty. An old Item-found note does not prove that either Item is currently held.
9. Curiosity Killed the People, I Ain't Afraid of No Ghost and Pushed to the Edge are immediate/discard Events. They belong in setup/card references and recorded moments, rather than being invented permanent toggles.
10. The windows/doors Terror lasts through the next Action phase and depends on inside/outside: no movement when inside, or no entering when outside. Use explicit reported status and manual completion; advancing a round is not proof that the effect was resolved.

### Remaining interpretation check

The supplied Helicopter card clearly permits Carolyn rescue and clearly says the Helicopter is not an Exit. Its interaction with the Poltergeist's **Forgetting Something?** Epic Power needs a publisher/designer clarification before adding an automatic eligibility restriction. An initial search did not establish one; unrelated search matches and fan discussions are not authority. Also audit Invisible Barrier using its exact Exit wording. Preserve explicit physical-game confirmation and unknown states instead of silently applying ordinary Exit gates or auto-winning. This is a rules interpretation check, not a request to resend readable photos.

## Proposed Play composition and state map

Register **Inside Creech Manor** below the selected killer. Keep the normal dashboard compact; expanded controls may scroll. Use the same typography, framing, dimming, wide active photographs, HTML captions and quiet corrections as the approved standard. No setup dump, movement simulator, full pawn roster or automatic card resolution.

| Control | States and explicit operations | Shared capability / justified exception |
| --- | --- | --- |
| External ladder | Unknown / usable / broken; report break or repair | Photographic environmental pair retaining the same landmark; quiet correction. Repair does not change the decorative attic ladder |
| Rope Ladder | Unknown / unplaced / one of three verified connections | Placement chooser with one unique token; moving its location is atomic. Repair is a separate explicit alternative, not another placement |
| Padlock | Unknown / unplaced / selected connection / removed after blocking | Small endpoint chooser; required preview before consuming on a reported Enemy attack. Never resolve damage from its picture |
| Helicopter | Unrecorded / available / used or left play; explicit rescue use | Special workflow, not a repeatable toggle. Preserve once-per-game history and reported passengers; Carolyn action appears only with Poltergeist |
| Ghost Hunters | Unrecorded group size up to three; per-color in play / saved / killed / left play | Shared character outcomes, with group-wide first-death follow condition and explicit bonus-Bloodlust handling. Keep source-token colors and avoid invented canonical names |
| Skull / No One Comes Back | Unknown / present / removed; linked Event presence | Shared ongoing-effect presentation with actual Attic hazard status; no inferred casualties |
| Other lasting Events | Unknown / active / ended; multiple simultaneously allowed | Shared Event picture toggles; no routine rules blocks beneath them |
| Windows/doors restriction | Unknown condition / inside movement blocked / outside entry blocked / ended | One compact lasting-effect control with explicit condition and completion, rather than a turn engine |

The Ghost Hunters and Helicopter workflows come first after approval, because they expose the hard group and cross-owner cases. Compare their real laptop/phone rendering with Groves before producing the remaining artwork. Routine work then continues without another mandatory design-approval gate.

## Execution order

1. **Finish the source table.** Transcribe all effects, weapon attributes, charges, timing and icon meanings; give every board space a stable board-relative ID, preserving unnamed spaces without invented official room names. Reconcile all five setup diagrams to those IDs and produce accessible setup descriptions. Verify the Helicopter/Power interpretation above.
2. **Build one canonical location domain.** Add `creech.ts` under shared edge-compatible Play code; reuse its catalogs in Rules, casting setup/Event descriptions, suggestions, death references and prompts. Preserve existing selection IDs and replace placeholder setup descriptions. Register location ownership independently of Poltergeist.
3. **Implement durable state and the hard interactions.** Resolve commands against the latest saved observations; preserve unknown legacy state and gate known new-session setup through explicit provenance. Use one durable write and one Undo for linked outcomes. If Helicopter use also records Carolyn rescue, add a narrowly typed, validated cross-owner transaction; keep the existing Groves-only linked observation contract intact. Unknown Bloodlust requires an observed value before recording a hunter bonus; do not fabricate a baseline or add ordinary attack Bloodlust again.
4. **Build the remaining Play panel.** Reuse Event/character components, token placement patterns and shared artwork frames. Show only meaningful current state and legal reported actions. Corrections do not repeat outcomes; opening panels, Add/Change choices and catalogs write nothing. Keep Item discovery separate from possession and token placement.
5. **Complete Rules and narrative integration.** Add searchable location setup/rules, eight Terrors, ten Events and eighteen Items with credits. Integrate Remember This and both direct panel/card entry points where relevant. Preserve historical state at each death, unchanged signatures for unaffected logs, separate victim totals and both owners within existing context budgets. Ending review records the actual rescue route; the story must not invent an Exit, helicopter, death, hunter or possession from a decorative image.
6. **Produce and review the owner photographs.** Retain approved location/cast/Collection identities. Build explicit named asset mappings before sorting choices; preserve originals and document dimensions, crops and budgets. Inspect actual loaded controls before calling the artwork complete.
7. **Run the acceptance matrix, fix failures and create the implementation PR.** Update old assumptions that Creech has no location panel, including starting-Event and mixed-module tests. Wait for every required check on the final PR head. Report release status separately from implementation.

## Planned artwork manifest

Initial target: **19 runtime photographs**, subject to reducing redundant variants if the verified control design does not display them. No photograph is generated merely because a card exists in the catalog.

| Group | Count | Planned use |
| --- | ---: | --- |
| Owner banner | 1 | Wide manor header based on retained approved location identity |
| Lasting Event scenes | 7 | Four simple ongoing effects, Helicopter Rescue, No One Comes Back and Ghost Hunters |
| Ghost Hunter portraits | 3 | Orange / blue / white token identities, shared character presentation |
| External ladder | 2 | Usable and broken views of the same left-side connection |
| Rope Ladder | 4 | Unplaced object plus the three verified placement scenes; fixed landmarks per placement |
| Padlock | 1 | Object/control photo with actual endpoints in HTML; no combinatorial art for every room pair |
| Windows/doors restriction | 1 | Temporary sealed-house effect |

Use native wide sources for headers/heroes and appropriate portrait sources for characters. Plan dark text space and phone focal points; no upscaled contact-sheet cells. Small muted inactive choices, vivid active pictures, meaningful broken/intact environmental differences, and clear unknown/removed labels. Record exact stable IDs, generated source identifiers and per-asset byte budgets in `src/assets/play/photos/creech/README.md`. Preserve other approved UI media and painted ending posters.

## Verification and completion criteria

- Every supplied face is accounted for and all 41 card records, setup placements and topology distinctions match the photos; no invented card effects or official room names.
- Domain/persistence coverage: unique token placement, repaired versus broken ladder adjacency, Padlock consumption, multiple Events, ghost group transitions and bonus handling, one-use Helicopter, Poltergeist ownership, legacy unknown states, stale/double taps, failed-save retry, atomic Undo/restore and reload/offline recovery.
- Mixed UI journeys: Creech with Poltergeist, Hans, Billy, Geppetto, Dr. Fright and Inkanyamba; also a killer without a dedicated panel. Preserve other Locations' behavior and reject foreign-owner observations.
- End-to-end journeys: owned Rules search, all five Setups, persistent versus immediate starting Events, Item suggestions, explicit token placement, Ghost Hunter outcomes, helicopter victim rescue without an inferred win, confirmed Carolyn rescue, contextual death/cache/narration and reviewed ending/archive facts.
- Inspect real loaded images and controls at 1280×640, 1366×768, 1440×900, 390×844 and 320×568, covering unknown/active/removed/broken/combined states, long labels, keyboard focus, 44px targets and no horizontal overflow. Settle offscreen images before full-panel screenshots.
- Run `npm run check`, `npm run check:assets`, `npm run build`, relevant local browser journeys, and the final PR head's entire Reliability workflow including native edge/database checks. Do not equate mocked services with live AI/audio quality or production sync.

## Release and handoff plan

Expected: frontend/assets plus updated canonical-context consumers **generate-death-scene** and **narrate-story**. Assess **generate-ending** and **generate-scene-image** for rescue-route/fate facts; assess all transitive callers from the actual diff and report the exact function list before handoff. New client guidance can use existing bounded fields for generate-story/visual-bible if no server change is required. Deploy compatible backends before the frontend. No SQL migration is expected for JSON observations; confirm during implementation.

New location UI photos do not automatically become trusted opening identity references. Audit any actual manifest change separately; upload and digest-check exact objects only when required and authorized. Keep PR #140's existing portrait/release requirements separate from this plan.

Completion means source-backed, implemented, tested, visually reviewed and ready for PR review. Merge, deployment, reference upload and paid live smoke tests remain separate actions. Current work stops at this plan; there are no application or artwork implementation changes.
