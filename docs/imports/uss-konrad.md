# USS Konrad — source inventory and implementation plan

## Scope and status

- Owner: **location**, canonical name **USS Konrad**. Existing film ID: `s2-into-the-void`. Proposed shared module ID: `konrad`.
- Stage: **critically reviewed, revised execution plan**. The inventory, current code and approved references have been rechecked. **Planning only; no location implementation, artwork generation, merge or deployment.**
- Standard: `docs/MODULE_STANDARD.md`, `docs/MODULE_IMPORT_PLAYBOOK.md`, `docs/module-controls.md`, `docs/PLAYTEST_POLISH.md` and `docs/templates/MODULE_IMPORT_RECORD.md`. Groves source reference: `dad911e034e332a23882de7c8304dc9d0db198cb`.
- Reviewed 2026-10-29, America/Regina. Current GitHub default-branch source was read directly, including its merged Evomorph registration. PR #150 is merged. This plan does not certify its unfinished photographic work or silently absorb that separate killer work.
- Extend the existing film; do not duplicate Collection or cast choices. USS Konrad works independently with every supported killer.
- In scope: board spaces and Setup diagrams; special rules; Keycards and Maintenance systems; Super Loader and Beacon observations; location Terror/Minor, Events, Items, special characters; Rules/search, Play, death/narration, opening/ending, artwork and verification.
- Ellen/Jenette personal cards, secret Items, unrelated variants, scenario books and a digital combat/movement/deck engine are outside scope. A character illustration on a rule sheet does not establish new Final Girl facts.
- After implementation approval, copy/update this owner record at `docs/imports/uss-konrad.md` and cross-link `evomorph.md`. Keep the records separate.

## Access and evidence

GitHub access is confirmed by successful current-file reads. All seven newly uploaded photos resolve, open in their viewers, and have been visually inspected; readable original-resolution local photo copies were also available for detailed rotation/cropping. The current uploaded versions are 2048×1536. Persistent links below remain the source of record; review crops and prior local copies are aids, not replacement attachments.

The normal local transfer helper hit a network restriction; browser viewing and existing original photo bytes allowed source review to continue. This is not a missing-photo blocker. Deployment credentials and signed-in paid provider generation were not tested or used. During implementation, local preview/server restrictions may require CI-hosted browser execution; access to code/photos does not by itself prove live production access.

### Source ledger

| ID | Persistent photograph | Contents |
| --- | --- | --- |
| K1 | [konrad1.jpeg](https://chatgpt.com/library?file_id=libfile_6b1cde9315f48191a39b6e7144f69d3f&account_id=personal) | All 8 location Terror faces, including Slippery; all 3 Maintenance faces showing 4 functions. |
| K2 | [konrad2.jpeg](https://chatgpt.com/library?file_id=libfile_8f3ef19fd31c8191bc5ae030f87c36d7&account_id=personal) | 19 visible Item faces: 14 other cards and 5 Keycard copies. |
| K3 | [konrad3.jpeg](https://chatgpt.com/library?file_id=libfile_9d445f2443b081919f2a951700c1fd90&account_id=personal) | All 5 Setup diagrams and all 10 Events. |
| K4 | [konrad4.jpeg](https://chatgpt.com/library?file_id=libfile_589d4b575e54819198e7d3b737a4876d&account_id=personal) | Super Loader special-rule continuation; illustrative character artwork. |
| K5 | [konrad5.jpeg](https://chatgpt.com/library?file_id=libfile_955952c220b08191be31b4ccb76fa48d&account_id=personal) | Special setup; Keycards; Maintenance Shafts; Maintenance activation, cancellation and self-destruction loss exception. |
| K6 | [konrad6.jpeg](https://chatgpt.com/library?file_id=libfile_63f743d439bc81918663eea013e18ca3&account_id=personal) | Printed component counts, ship identity and credits. |
| K7 | [konrad7.jpeg](https://chatgpt.com/library?file_id=libfile_ee9aaef503e4819190cadc8875f092bf&account_id=personal) | Complete location board: rooms, three Exits, four shafts, search/function spaces, paths and Panic numbers. |

### Reconciled inventory

| Component | Printed/established total | Visible evidence | Status |
| --- | ---: | --- | --- |
| Location board | 1 | K7 full board; K6 component thumbnail | Verified visible gameplay face. No reverse/variant assumed. |
| Rule/component reference | Three photographed sections | K4–K6 | All supplied text reviewed. Physical folding/page count not inferred. |
| Maintenance cards | 3 | K1 | Verified: Airlock; Self Destruct; shared Crusher/Incinerator card. Four functions, not four cards. |
| Terror cards | 8 | K1, all 8 faces | Verified; includes the Slippery Minor Power. All are unique in this batch. |
| Event cards | 10 | K3, all 10 faces | Verified. |
| Setup cards | 5 | K3, all 5 diagrams | Verified faces. Diagram placements must be encoded as placements, not invented scenario summaries. |
| Item cards | 20 | K6 total; K5 establishes 6 Keycard cards; K2 shows 19 faces | **One Keycard copy is not visibly laid out.** Fourteen other Item faces and five Keycards are readable. Six Keycard cards are established by setup (1 starting + 2 reserved + 3 shuffled); a sixth separately photographed face is not claimed. |
| Various tokens | 11 | K6 printed total and illustrations | Total verified. Loose pieces are not separately laid out for counting. Named marker roles are verified by K1/K2/K4/K5; do not invent a per-type supply count from a thumbnail alone. |

No additional photo or owner confirmation is required to begin the planned implementation. K5 establishes six Keycard cards and the general Keycard rules; K2 supplies five readable examples. Keep the unpictured sixth face as a coverage note, without calling all twenty faces photographed or making that note a new approval gate. Physical loose-token subcounts remain unverified; do not introduce a global supply restriction that depends on guessing them.

Printed credits (K6): design Evan Derrick; art Tyler Johnson.

## Verified card and board ledger

The paraphrases below preserve the supplied rules. Canonical data should store quantities, timing and icons separately from presentation. Damage and unpreventable Health loss must not be conflated. The round hockey-mask symbols on these cards are Horror, not generic dice-roll instructions.

### Board and Setup

K7 has **16 spaces**: eight named rooms (Hangar, Trash Compactor, Mess Hall, Bridge, Storage, Furnace, Armory, Junction), three Escape Pods, and five unnamed ordinary spaces. The three Search spaces are Armory, Mess Hall and Storage. The four function rooms are Hangar, Trash Compactor, Furnace and Bridge.

Give duplicate Exits and unnamed spaces stable navigation IDs, with clear labels such as upper-right Escape Pod, lower-left Escape Pod, lower-right Escape Pod, and board-relative corridor labels. These disambiguate a table observation; narration should usually say the escape pod or corridor, not recite coordinates. Shafts are **connections**, not extra occupiable spaces.

Four shaft IDs: upper-left, upper-right, lower-left, lower-right, oriented to K7 with its title upright. Preserve all board paths/Panic numbers in the factual reference. Do not build a pathfinder or infer distances, adjacency eligibility, closest/farthest targets or Panic outcomes.

| Setup | Verified pair of loose Keycard positions, matched to K7 | Other diagram content |
| --- | --- | --- |
| Bloody Feast | Hangar; upper-right Escape Pod | Final Girl/Killer and Victim placements are visible. |
| Born in Flames | Junction; Storage | Same. |
| Showdown | Lower-left Escape Pod; bottom-center unnamed space | Same. |
| Space Rave | Armory; Bridge | Same. |
| Junction Danger | Trash Compactor; Bridge | Same. |

The second diagram-to-board pass is now complete. Stable descriptive names for the five unnamed spaces below are navigation labels, not invented official room names. Each Setup has **12 Victims**; spaces omitted from its list have zero. These are starting placements, not live meeple tracking.

| Setup | Final Girl starts | Killer starts | Victim placements (count) |
| --- | --- | --- | --- |
| Bloody Feast | Unnamed space immediately below Junction | Upper-left unnamed space | Hangar 1; unnamed left of Junction 1; Junction 1; unnamed right of Junction 1; Bridge 1; Mess Hall 4; Storage 1; lower-left Escape Pod 1; lower-right Escape Pod 1. **Total 12.** |
| Born in Flames | Upper-left unnamed space | Furnace | Hangar 3; Bridge 3; Armory 2; Trash Compactor 1; unnamed left of Junction 1; unnamed right of Junction 1; unnamed immediately below Junction 1. **Total 12.** |
| Showdown | Bridge | Hangar | Upper-left unnamed space 2; Mess Hall 1; upper-right Escape Pod 1; Junction 3; unnamed immediately below Junction 1; Armory 1; Furnace 1; lower-right Escape Pod 2. **Total 12.** |
| Space Rave | Mess Hall | Unnamed space right of Junction | Upper-left unnamed space 2; Hangar 4; Bridge 1; Storage 1; Furnace 1; Armory 1; upper-right Escape Pod 1; lower-right Escape Pod 1. **Total 12.** |
| Junction Danger | Armory | Junction | Upper-left unnamed space 1; Hangar 2; Mess Hall 2; Bridge 2; Storage 1; bottom-center unnamed space 1; lower-left Escape Pod 1; lower-right Escape Pod 1; upper-right Escape Pod 1. **Total 12.** |

Together with the loose-Keycard table, these close the deferred Setup source work. Encode stable IDs and verify the transcription against K3/K7 during implementation; do not substitute the current unsupported meal/fire/rave/confrontation synopsis descriptions for these placements.

K5 special setup: two loose Keycard tokens at the selected Setup's positions; Super Loader card beside the play area and its marker in the Hangar; one Keycard card with a token in inventory; two empty Keycard cards reserved; three Keycard cards shuffled with the other Items; Maintenance cards faceup. None of this is silently backfilled into a resumed game.

### Maintenance functions

| Function | Base cost and station | Printed trigger/effect | Persistence |
| --- | --- | --- | --- |
| Crusher | 1 Keycard; activate at Trash Compactor | An Enemy or Victim ending movement there receives 1 damage. Does not affect the Final Girl or Victims following her. | Active until a cancelling effect/explicit correction; entering/passing through is not the stated trigger. |
| Incinerator | 2 Keycards; Furnace | On an Enemy or Victim entering: roll a die. 1 → 3 damage; 2–3 → 2; 4–5 → 1; 6 → none. Does not affect the Final Girl or her following Victims. | Active until cancelled; differs from Crusher's end-of-movement trigger. |
| Airlock | 3 Keycards; Hangar | Activation places the Airlock marker in Hangar. During Action, while in Hangar or an adjacent space, discard that marker to open it, killing everyone in Hangar; Super Loader there is lost. A killed Killer reveals Final Health and, if revived, returns at Junction. A Final Girl in Hangar rolls: 5–6 survives; otherwise loses without revealing her Final Health token. | Funding, armed marker and opening outcome are distinct. Opening consumes the Airlock marker, not the funding Keycards. No unlimited repeat-fire button. |
| Self Destruct | 4 Keycards; Bridge | Activation puts the countdown marker at the start. Each physically resolved Upkeep advances one position. Reaching the explosion destroys the ship. A Final Girl outside an Exit loses, even when the Killer is also killed. | Three printed positions (start, middle, explosion): two advances. No automatic ticking on render, elapsed time or a round edit. |

K5: normal activation requires the Final Girl to be at the corresponding function room, not passing through. Using/placing a Keycard costs no Time. If an effect removes Keycard tokens from an **already activated** Maintenance function, cancel it immediately and remove associated markers. Model this cancellation explicitly; do not merely recalculate whether remaining funding still meets today's discounted threshold.

Discounts: Emergency Override reduces Incinerator, Airlock and Self Destruct by one; it does not reduce Crusher. The Captain reduces Self Destruct by one **while at Bridge**. Unknown Captain location is not Bridge by default. Record the discount facts/actual paid cost used for an activation; later Event or character changes do not retroactively rewrite it.

The wording supplied does not fully settle every automatic reactivation case after effect-driven token relocation, nor all cross-film immunity/ending interactions. Do not manufacture a publisher ruling. The companion records player-resolved funding and activation explicitly. Verify an applicable primary clarification before adding automatic reactivation or adjacency adjudication. A general status correction remains available without replaying effects.

### Keycards, shafts and relocation

- K5: pickup is permitted when starting or ending movement at a token's space, not while passing through, and costs 1 Time. Take a reserved Keycard Item card and put the token on it.
- Whenever a Keycard Item card is taken via searching/Event, place a token on it. A historical found-item record is not proof of current charged inventory.
- Used Keycard Item cards remain in inventory empty, cannot be discarded, and are ignored for instructed Item discard.
- Placed tokens cannot be retrieved without a specific effect.
- From adjacent to an inactive shaft, placing a Keycard activates it for the Final Girl and following Victims.
- Enemies cannot normally use shafts, including active ones, without a specific permission. **Slippery grants this to the Killer**, whereas the named Terror grants temporary access to **all Enemies**.
- Remote Access (K2) moves a token **on the board** to another Maintenance Shaft or to a Maintenance card, during Action, with two uses. Do not silently expand its source to tokens on Maintenance cards; the other cards explicitly say board and Maintenance cards.
- System Reboot and Solar Interference clear/reallocate board and Maintenance funding and must include linked cancellation/marker changes in the same durable observation.
- Do not infer equipped Items, a current hand, movement, damage, Victim totals, Horror, Bloodlust, Time expenditure or random outcomes merely from a card's presence.

### Location Terror — eight unique cards

| Card | Faithful effect summary | Required app treatment |
| --- | --- | --- |
| Incinerator Malfunction | Panic Victims adjacent to Furnace. Roll per entity at Furnace: 1 loses 2 Health; 2–4 loses 1; 5 none; 6 moves one space in a chosen direction. Then closest Final Girl/Victim target, move, attack. | Reference and contextual death cause. This Health loss is not Incinerator's attack damage. No die/movement/casualty simulation. |
| System Reboot | Return every Keycard token from board and Maintenance cards to Keycard Item cards. If at least one returns, increase Horror by 2. Draw an Event. | Explicit reset/result workflow, atomic cancellation and marker cleanup; report Horror/Event instructions without silently resolving them. |
| Solar Interference | Remove all board/Maintenance Keycards; roll for each and place: 1 upper-left shaft, 2 Crusher, 3 upper-right shaft, 4 lower-right shaft, 5 Incinerator, 6 lower-left shaft. Then target closest Final Girl/Victim, move, attack. | Record the physical redistribution with counts/eligible destinations; no virtual rolling. Cancel prior functions first. Repeated destinations retain every placed Keycard in a per-destination count; two tokens on one shaft still represent one open connection, but both tokens must survive relocation/reset. Do not discard duplicate results implicitly. |
| “Let's Test the Maintenance Shafts!” | For this turn all Enemies may move through any shafts. Target closest Final Girl/Victim, move, attack. Increase Horror by 1 for each Enemy that used a shaft. | Optional explicitly active/expired temporary observation, not a permanent Slippery flag or an automatic Enemy count. |
| Gas Leak | Roll: 1 upper-left and upper-right; 2 lower-left and lower-right; 3 upper-left; 4 upper-right; 5 lower-left; 6 lower-right shaft(s). Everyone adjacent to an affected shaft loses 1 Health. Draw an Event. | Historical cause and optional resolved affected-shaft record. No fabricated gas persistence after resolution. |
| Garbage Day | Panic Victims adjacent to Trash Compactor; everyone at Trash Compactor loses 1 Health; target closest Final Girl/Victim, move, attack. | Source-backed death suggestion; do not infer deaths or substitute Crusher's damage trigger. |
| Catastrophic Hull Breach | After the target/move/attack line, put Skull at the farthest Exit. Anyone there or entering is instantly killed. A killed Killer reveals Final Health and, if revived, goes to Junction. Draw an Event. | Player chooses the physical farthest eligible Exit. Durable breach location; entering/being there is not automatically resolved by the app. |
| Slippery — Minor Dark Power | 2 Health; Killer freely uses all Maintenance Shafts. | Location-owned shared Minor control, independent of Killer Minor slots/state. 0 = removed; unknown is not zero. |

The `EVENT` box at the bottom of several Terror faces means draw an Event. It does **not** make them Event cards or ongoing Event toggles.

### Events — all ten faces

| Event | Verified effect and duration | Play behavior |
| --- | --- | --- |
| The Captain | Add special Victim at Bridge; one less Keycard for Self Destruct while he is there; if killed, +2 Bloodlust; discard when he leaves play. | Shared character, present/saved/killed/left/unknown as appropriate; Bridge presence separate. End associated Event atomically on departure. No assumed casualties or generic +2 Bloodlust write. |
| Jonas the Cat | Add special Victim at the farthest Victim's space; never follows. Upkeep: panic Jonas three times. End Action with Jonas: choose -1 Horror or +3 Time. Discard on departure. | Shared character with explicit location/outcome observations. Choice/physical resolution, not automatic per-round movement or reward. |
| Orphan Girl | Closest existing Victim becomes her; while in Final Girl's space, one extra Victim follows and inactive shafts are freely passable. Death increases Horror by 3; discard on departure. | Replace an existing role; do not spawn an extra Victim. Shared character and explicit together/apart observation if recorded. Non-adult harm stays off-screen in prose. |
| Master Access | Expose facedown top Items; take showing Keycards. Discard. | Instant resolution/reference; no permanent active toggle or fabricated card draws. |
| Weapons Locker | Move unused weapons to Armory's Item deck, faceup on top or facedown beneath. Discard. | Instant resolution/reference; no inferred current weapon possession. |
| Faulty Wiring | Upkeep: roll separately for Furnace and Trash Compactor; 1–2 everyone there loses 1 Health; 3–6 none. | Ongoing independent picture toggle; no Upkeep auto-damage. |
| Good Cookin' | Ending Action in Mess Hall recovers 1 Health. | Ongoing picture toggle; health changes are explicitly recorded. |
| Cramped Escape Pods | More than one Victim at an Exit prevents saving Victims from that space. | Ongoing picture toggle; no guessed counts or automatic rescue eligibility. |
| Cluttered Shafts | While moving, Final Girl may use an inactive shaft for 1 Health; Victims cannot follow through it this way. | Ongoing picture toggle. Does not activate the shaft or grant Enemy access. |
| Emergency Override | Incinerator, Airlock and Self Destruct each cost one fewer Keycard. | Ongoing picture toggle plus explicit activation-cost preview; not a global all-functions discount. |

A role appearing, leaving or being corrected is distinct from saving/killing it. Any ordinary Victim total and a contextual death must be confirmed through the existing explicit flow, never added by a status correction. Captain Bloodlust must respect the selected Killer's actual rules: for example Hatchling Evomorph replaces non-Hatchling-kill increases with Time. The location must not write an unconditional generic Bloodlust increase.

### Items — twenty printed cards / fifteen unique names

| Item | Quantity | Verified reference |
| --- | ---: | --- |
| Keycard | 6 established; 5 faces pictured | Token follows the card when acquired; Action use at a function room or adjacent shaft; spent empty card retained. |
| Personal Beacon | 1 | Once each Action phase, trigger the printed Killer target-Final-Girl/move action. It does not print an attack. |
| Super Loader Key | 1 | In the same space as Loader, may take and equip it. Finding the key alone is not equipping Loader. |
| Super Loader | 1 | Two-handed, range 0, 2 printed weapon damage. Victims do not follow; movement and received damage each reduced by 1, minimum 1; no Short Rest, Long Rest or Search. |
| Remote Beacon | 1 | Spend 2 Time to place Beacon up to three spaces away; Killer chooses it instead when selecting a target; remove when Killer enters. |
| Energy Drink | 1 | Discard in Action: gain 3 Time or move one space. |
| Emergency Access | 1 | Two uses; move one adjacent space through an inactive shaft. |
| Flamethrower | 1 | Two-handed, range 0–1, 3 printed damage, two uses. Distribute damage evenly among Victims, Enemies and Final Girl, in that order, in attacked space. |
| Ship's Manifest | 1 | Discard at a Search space to inspect/reorder its Item deck and leave top faceup. |
| Thermal Visor | 1 | Discard to replace an Ambush. When Enemy enters the Final Girl's space, may discard two Action cards to take Guard into hand. |
| Vibroclaw | 1 | One-handed, range 0, 1 printed damage; successfully reducing attack damage with a Reaction deals one extra damage to attacker. |
| Remote Access | 1 | Two uses; relocate a board Keycard to another shaft or Maintenance card during Action. |
| Remote Monitor | 1 | Once per Action phase inspect top Terror or Ambush, leave it or put beneath its deck. |
| Motion Tracker | 1 | One hand; +1 die on Scan. When Enemy enters, may discard to move to adjacent space immediately; remaining Enemy movement is lost. |
| Mysterious Pills | 1 | Discard in Action to decrease Horror by 1 or recover 2 Health. |

K4 Loader rules: starts in Hangar, usable only with Key; unequipping or losing Key leaves marker at current space and returns Loader card beside board. Loader cannot go into Backpack. Airlock can lose it. Ordinary Item finds keep the existing shared flow; a narrow Loader/Beacon state does not justify an equipment simulator.

## Existing code audit and necessary corrections

Current default-branch files were read through GitHub on 2026-10-29. Local Evomorph edits are not treated as proof that unpushed fixes are on main.

| Surface | Current finding | Planned change |
| --- | --- | --- |
| `src/types/gameData.ts` / existing film | USS Konrad and registered AI location art already exist under Into the Void. | Retain stable IDs, independent casting and custom/official image precedence. |
| `src/types/featureFilmDetails.ts` | All five Setup names and ten Event names exist. Setup prose is generic invention rather than placements. Ship company/model text conflicts with K6. | Replace unsupported Setup summaries with verified diagrams/placements; retain correct Event facts and correct omissions/wording. |
| `src/data/locationDescriptions.ts` | Explicit WEYGAR-YUSTARRY branding, a fixed planet/orbit/docking-camera scene. | Correct to K6 Noguchi Masaki Mining Corporation / 9791-Bison; distinguish optional visual backdrop from session facts. |
| Existing `src/assets/locations/ai/uss-konrad.png` | Visually inspected: convincing used-future exterior, but visible incorrect company branding. | Preserve useful ship geometry/composition; correct the branding via a faithful photo edit or unobtrusive unbranded treatment after approval. Do not bless wrong text as canonical. New Play header may be an interior scene. |
| `src/data/rules/moduleRules.ts` | Evomorph registered; no USS Konrad dedicated module. | Add canonical `konradRules.ts`, tags/search and bounded location guidance. |
| `src/components/play/moduleDefinitions.tsx` | Evomorph exists; no Konrad location panel. | Register separate `konrad` owner with its own banner, summary and Controls. |
| `_shared/play/catalog.ts` | No Konrad room, Item, Terror or mechanism catalog. | Add verified location-filtered entries, roles and contextual death mechanisms. |
| `_shared/play/modules.ts`, `events.ts`, `death.ts` | New owner needs validation, persistence, public facts and historical signatures. Bounded mixed-owner story branches already exist. | Extend their actual allowlists/callers; keep both selected owners represented and unaffected signatures unchanged. |
| `useActiveGame.ts`, `activeGame.ts`, `Index.tsx` | Owner-specific setup provenance and durable append patterns exist. | Add Konrad provenance only for genuine new sessions, narrow resolver and canonical atomic writes. |
| `_shared/deathLocation.ts` | Board-label prose normalization exists for Creech. | Reuse the principle for Konrad corridors/duplicate pods without changing saved labels or historical signatures. |
| Opening/ending and poster callers | Existing owner context/request paths can carry verified location guidance. | Propagate explicit system/escape facts, preserve selected cast, self-destruction exception and poster medium. Do not redesign pages. |

Relevant current blob SHAs: module standard `6bada0dab0f8ac896d5143c09fc8c76459152101`; feature details `28c174ccf1d58ad5748bcd5c31b756a9de8ca889`; module registry `740d5d24016018abaea5db2cc6748f635a62dc76`; shared catalog `491104037a9aea18e8f6206dbdac9ac603ef3bbd`; shared modules `a90c097a246a194b718b5476460efc6158324697`. Rebase/recheck before implementation, since main may advance.

## Critical review and justified changes

The location-only scope, seven-source ledger, shared controls, photographic standard, physical-game boundary and mixed-owner verification remain sound. Four findings materially change execution:

| Finding and checked evidence | Impact | Concrete correction |
| --- | --- | --- |
| **A shaft flag cannot account for every Keycard.** K1 Solar Interference places each token independently; the same destination can occur repeatedly. K5 preserves placed tokens until an effect retrieves them. | Collapsing repeated placements to an active flag loses tokens and corrupts later moves/reset. Returned tokens also do not, by themselves, establish which Item cards are currently held. | Store counts at loose spaces, each shaft and each function, with explicit knowledge coverage. Derive open/closed separately. Conserve reported quantities in known transactions; retain unknowns in partial records. Keep held charge optional and update it only from confirmed possession/destination. No generic Item inventory or guessed global supply cap. |
| **Ending prose alone cannot enforce the destruction exception.** Current main Index.tsx records the case before the outcome form. storyFacts.ts derives fate from Health. useGameHistory.ts persists only mapped fields; its update-column map does not include outcome. | A case can remain a win in cloud statistics, or a positive old Health value can imply survival, despite a recorded fatal Airlock/Self Destruct result. A form-only review can disappear after reload. | Persist resolution/review as Konrad Play observations in existing play_events; derive a validated typed ending payload. Check known fatal self-inflicted outcomes before initial case recording. A later explicit correction must update the same case outcome/log through the durable history mapping, including cloud reload and Save without narration. Explicit fatal resolution outranks old Health for fate without inventing a zero-Health event. |
| **The proposed source-preparation step deferred available work and risked an unnecessary confirmation gate.** K3/K7 are readable; K5 establishes six Keycard cards. | Implementation would start with unfinished Setup specifications or stop for a photo that adds no established mechanic. | Finish all five placement tables now (12 Victims each); keep the sixth unpictured Keycard face as a documented coverage limit, not an implementation blocker. No variant face or token subcount is invented. |
| **The visual acceptance route was underspecified.** Local preview binding still returns EPERM. The existing Evomorph art resolver on main returns its portrait when a named photo is missing. | Passing tests or successful image decoding can conceal missing distinct artwork; CI execution alone does not establish that screenshots were actually retrieved and reviewed. | Prove a capture/retrieval/viewing route with the hardest real interaction before bulk art. Require a Konrad asset manifest with explicit IDs, dimensions and no generic missing-asset fallback. Check coverage and inspect actual final images at all five sizes. Keep checkpoints/draft PR evidence so an interrupted session resumes without treating a temporary reference as finished art. |

Additional current-main checks: Index.tsx blob 691f3ee82854a5295c016030ae276c039c3bdded; GameOutcomeForm.tsx 9fa173f4e5e20fe30178b1d9077986a4fb5fd5a1; useGameHistory.ts 68bfc4f5e2617fa13a7b3336eb2e61d272909467; storyFacts.ts c96046dbcc84a02adf878e876f485e8fdc4a3c39; validation.ts f523b5e1e6359aef77b2344b1030db562d850d93; evomorphArt.ts 13916ed778fbad53953631773a77a345695695bb. The module standard blob is unchanged. These are code observations, not new rules evidence.

## Proposed state and interaction contract

Use `supabase/functions/_shared/play/konrad.ts` for verified catalogs, fields, source references, the narrow resolver and facts. The frontend reuses it. No general import engine, new dependency or new database schema is presumed necessary.

Fields distinguish:
- Optional explicitly observed charged Keycards held versus unknown; per-space loose Keycard counts, per-shaft token counts and per-function funding counts, each preserving partial knowledge. Historical Item finds, tokens returned to Item cards, and spent empty cards do not establish current held charge.
- Four shaft access states derived from their known token counts, retaining unknown when coverage is incomplete. Several tokens can fund one open shaft; do not collapse them to one token. Placed tokens persist through unrelated Event changes.
- Funding count, activation record and associated markers for each function. Airlock armed/spent state is separate from its Keycards. Self Destruct start/middle/explosion/cancelled/unrecorded is separate from a global round.
- Breached Exit; Super Loader parked/equipped/lost/unknown and last explicitly observed space; Beacon unplaced/placed/unknown and its reported space.
- Captain, Jonas and Orphan Girl roles/outcomes and only the positional/with-Final-Girl facts needed for reported benefits.
- Ongoing Events; explicitly active/expired temporary shaft permission; Slippery Health 0–2/unknown.
- Final Girl self-inflicted destruction/escape observation, separate from tracked Health and from the player's final result.

Use a revision/parent check at durable append, validate proposed changes against the current state, reject stale/double actions and owner mismatch, and keep inverse/Undo behavior coherent. New setup, a first tap and a necessary linked effect must not race into independent partial writes. Restore must revalidate dependencies as well as Undo. Mount/expand/reference viewing writes nothing.

| Operation | Visible UI | Linked facts and boundaries |
| --- | --- | --- |
| Inspect location | Photographic header; compact current summary; location after Killer | Expand preference only. No setup or Event writes. |
| Use a Keycard / activate shaft | Four stable picture tiles with open/closed state and quiet correction; collect physical source/destination when needed | Move the observed token once, preserving repeated-destination counts; update held charge only with confirmed source/possession. An unknown or out-of-date optional balance must have an explicit physical-result/correction path. Never decide adjacency from the app's picture. |
| Fund/activate function | Four compact illustrated station cards; progress/funding and actual cost in HTML; explicit activation choices | Confirm physical station eligibility. Record funding/activation/marker together. Unknown imported funding must not be silently treated as zero or automatically armed. |
| Remote Access / reset / redistribution | Scoped operation panel, only when used; choose eligible source/destination or explicit physical redistribution | Atomically remove source quantities, cancel affected prior functions and markers, place every token (including repeated destinations), and record explicitly resolved activation. Preserve unrelated tokens and partial-knowledge flags. Do not roll, apply casualties or auto-advance phases. |
| Airlock release | Clear armed state and a consequential preview; explicit physical resolution/outcome choices | Consume armed marker; confirm Loader loss if present; record observed revival/Junction return only if supplied. Casualties and Health stay explicit. |
| Self Destruct | Three-position visual countdown with explicit Advance after physical Upkeep; quiet correction/cancelled state | One durable step per action; no mount/round/clock ticking. Confirmation at explosion records table result. Final Girl caught in self-inflicted destruction must not be narrated/statistically presented as a heroic simultaneous-death win. |
| Hull breach | One selected Exit and photographic hazard; quiet corrected location | Farthest/ties chosen at table. No automatic deaths on a location edit. |
| Super Loader / Beacon | Compact photographic observations with required space and legal state choices | No chosen Final Girl face invented inside Loader art. Finding an Item alone does not equip it. Last observed space is not live movement tracking. |
| Roles | Shared `CharacterControl`, supplied-role photographs, explicit departure/outcome and quiet correction | Departing ends associated Event/benefits atomically; correction never repeats rewards. Ordinary saved/killed totals confirmed separately through normal flow. |
| Simple ongoing Events | Shared `EventControl` picture toggles | Active/inactive/unknown visible; no extra End/Change/Rules blocks. |
| Instant Events / one-shot Terror | Canonical Rules/reference and existing record flow; scoped resolution where state really changes | No false long-lived active flags for discarded cards or resolved gas. |
| Slippery | Shared `MinorPowerControl`, live 2-Health hearts, wide active scene, small muted initial/removed states | Location owns it, even with a healthless Killer. It does not enable a numeric Poltergeist Health tracker or erase other Minors. |

Shared components retained: `ModulePanel`, `IllustratedTile/ModuleArtwork`, `EventControl`, `CharacterControl`, `MinorPowerGroup/MinorPowerControl/HealthTokens`, `PlaySelect`, `useModuleRecord`. Do not add Konrad Powers/Finales: these belong to the selected Killer.

### Concrete quantity and ending contracts

- **Known resources:** a relocation moves the stated quantity once and preserves the sum of all reported source/destination counts. System Reboot returns every reported token and clears all board/function destinations when the player confirms the physical reset. Held charged Keycards are not inferred from the returned total; capture that balance explicitly if wanted.
- **Partial knowledge:** an unknown shaft count is not zero. A reset can establish empty after explicit physical confirmation, but cannot invent the unknown previous total or a replenished hand. If a historical source has unknown multiplicity, require the actual moved/returned quantity for a resolved transfer or use a clearly labelled correction of the observed end state. Test both paths.
- **Funding versus activation:** retain counts and activation history separately. A cancellation removes associated armed/countdown markers even if a discounted threshold might still be met. Effect-driven activation stays an explicit table resolution; eligibility is not guessed from a picture or a partial ledger. Airlock firing and Self Destruct ticking are not generic picture toggles.
- **Initial result:** before Index.handleGameEnd calls recordGame, derive the current Konrad resolution. A confirmed fatal self-inflicted Airlock/Self Destruct outcome requires loss. Reaching an Exit is not an automatic win and does not prove an unkillable Killer died. Ordinary deaths and unrelated location/Killer endings keep their current behavior.
- **Final review/correction:** use a Konrad ending-review observation in existing Play history, carrying confirmed mechanism and Final Girl fate/escape, with unknown available. The form must not save an unpersisted review only into text or a local-only result property. Wire active-session checkpoint, the same archived case's outcome/play_events, history update-column mapping, fromDbRow rehydration, Save without narration and ending request construction. Use existing durable queues/idempotent game IDs; do not claim an atomic transaction across separate localStorage keys. A failed checkpoint/write keeps the pending review retryable and prevents prematurely closing the session.
- **Typed narration facts:** validate an optional Konrad review payload as belonging to USS Konrad and derive it from the persisted reviewed observation. Explicit fatal resolution takes precedence over a stale positive/unrecorded Health value in endingFacts. Do not rewrite numerical Health, fabricate casualties or reinterpret old cases lacking the new observations. The same reviewed cause/fate must reach poster guidance without changing poster medium.
- **Bounded context:** prioritize reviewed terminal cause/fate, active deadly hazard and material system state before incidental token listings. Reserve the selected Killer's essential facts, including Evomorph stage and captured Ambush face. A crowded record/long label must not truncate away either owner or the fatal-resolution constraint; full canonical state still underpins historical signatures.

### Consequential decisions and uncertainty handling

1. **No digital map/rules adjudicator.** Record explicit table observations and source-backed linked token changes. Full movement, deck order, hand, Time economy, random rolls and combat remain physical.
2. **No automatic role casualty/Bloodlust chain.** Captain/Orphan outcomes must not bypass normal death confirmation or the selected Killer's restrictions.
3. **Relocation is not a generic toggle.** System cancellation and associated marker removal are required atomic effects. Any unverified automatic reactivation/shaft-adjacency ruling remains outside automation until primary evidence settles it.
4. **Cross-film endings stay explicit.** Test Poltergeist and other unusual Killers without pretending ship destruction automatically kills an unkillable threat or adjudicates its unique victory condition. Preserve explicit table result; present the source's self-inflicted-loss exception and prevent contradictory known outcome claims unless the observation is corrected.
5. **Source coverage remains honest without redundant gates.** Six Keycards are established by setup, five visible. Proceed with the verified count and generic Keycard rules; do not claim the unpictured face was seen. Loose token type quantities are not independently photographed. Do not invent reverse faces/Extreme Horror/scenario content.
6. **Preserve quality.** Existing convincing ship composition can be retained with corrected branding. All new Play art is physically believable photography; Rules, labels and numbers stay HTML.

## Revised execution plan after approval

1. **Establish the current implementation baseline.** Start from current main in an isolated branch; carry this source ledger, completed Setup tables and shared-control references into docs/imports/uss-konrad.md. Recheck any intervening code change. The sixth unpictured Keycard remains a coverage note. Before bulk artwork, prove that an actual UI capture can be obtained and visually inspected with the available environment/CI route.
2. **Implement the narrow shared domain and durable transactions.** Add canonical Konrad data/fields/resolver, quantities and coverage flags, source-backed funding/cancellation, fresh-session provenance and explicit correction/result paths. Preserve partial knowledge and optional held charge. Verify no mount writes, wrong-owner/stale requests, multiplicity conservation, rejected-write retry, Undo and dependent restore. No generic inventory/map/deck/phase engine.
3. **Implement and inspect the hardest actual UI.** Exercise Solar Interference/reboot with repeated shaft destinations, an armed Airlock and running Self Destruct, discounts and unknown prior counts. Inspect real laptop/phone layout against Groves. Use a clear quantity/activation preview and fix any confusing result/correction flow before producing remaining assets. Save review findings and a resumable draft checkpoint.
4. **Complete shared controls and content.** Register the independent location panel; complete shafts/four functions, Loader/Beacon/breach observations, three characters, five ongoing Events, temporary Enemy permission and Slippery. Add accurate Rules/search/Setups/Items/Terrors/spaces and shared Item/death suggestions. Keep original dashboard/death/ending layouts and omit redundant rule dumps.
5. **Complete result/history/narrative integration.** Implement the concrete ending contract above across pre-record validation, later explicit correction, same-case history/cloud persistence, Save without narration, ending facts/request validation and poster guidance. Preserve source-specific loss, unknown fate, mixed-owner context and historical cache/signature compatibility. No automatic casualty, survival, win or unkillable-Killer adjudication.
6. **Finish and verify photographic assets.** Preserve scope and all meaningful states in the manifest; faithfully correct existing ship branding where used. Use explicit stable asset mappings without a generic missing-image fallback. Validate coverage/native dimensions/budgets and inspect every required scene/crop, including final UI at all five sizes. A temporary reference is never a completed photo.
7. **Run release-level verification and fix findings.** Run the scenario matrix below and relevant existing tests, assets/build checks, native edge/database tests and all required CI on the final PR head. Include cross-device roundtrip/Save without narration and failure recovery for reviewed outcomes. Separate UI mocks from live provider quality. Record exact evidence and intentional limitations.
8. **Prepare a reviewable release handoff.** Update this record with final PR/head, source coverage notes, screenshot findings, exact deployed-function dependency list, any actual migration/Storage requirement and live-smoke status. Compatible backend bundles precede dependent frontend release when deployment is authorized. Implementation approval does not itself authorize merging or publishing.

## Artwork manifest and visual standard

Inspect the approved Inkanyamba identity photograph before generation and preserve its candid physical realism. The 1980s reference governs camera/reproduction, not spaceship technology. Use tangible metal, seams, glass, wiring and coherent practical light; no game render, illustration hidden by grain, branded card text, baked labels, stretched portraits or neighboring atlas cells.

Plan for independent native **1536×864 or larger** landscape scenes (1536×1024 acceptable for a reviewed crop). Wide selected cards may approach 1074×300; header source should support approximately 1024×420. Runtime card derivatives target ≤160 KiB, headers ≤200 KiB, without upscaling; document any justified exception. Focal machinery/characters belong in the middle safe band with dark space for HTML and phone cropping. Store IDs, source-generation references, derivative dimensions, ordering, focal points and byte budgets in `src/assets/play/photos/konrad/README.md` and the banner README.

| Stable group | Required visual states / mapping | Intent |
| --- | --- | --- |
| `konrad.header` | Location-specific wide ship/interior scene | No Killer identity imposed on mixed games. |
| `shaft.{upper-left,upper-right,lower-left,lower-right}` | Four distinct landmark scenes, inactive/active variants | Same camera/landmarks, physical access/lighting changes. Unknown uses explicit neutral treatment, not a falsely closed state. |
| `function.crusher` | Inactive/active | Trash Compactor machinery; no invented casualties. |
| `function.incinerator` | Inactive/active | Furnace with believable powered heat; retain identity across states. |
| `function.airlock` | Inactive/armed/released | Funding/armed marker/opening remain HTML state. No repeated-release implication. |
| `function.self-destruct` | Inactive/start/middle/explosion | Three distinct countdown positions plus inactive; countdown numbers/actions stay HTML. |
| `person.{captain,jonas,orphan-girl}` | Three distinct role photographs | Use supplied role evidence; do not claim an unverified real actor face or Final Girl identity. Child remains safe/non-graphic. |
| `event.{faulty-wiring,good-cookin,cramped-escape-pods,cluttered-shafts,emergency-override}` | Five independent ongoing scenes, dim off/vivid on | Existing toggle semantics; avoid redundant rules under tiles. |
| `minor.slippery` | One killer-agnostic wide vent scene | Shared muted/active/removed treatment and live 2-Health hearts; no Evomorph-only artwork. |
| `loader` | Parked, powered/equipped indication, lost | Show the machine/controls, not an invented operator replacing the selected Final Girl. Space and status are observed data. |
| `beacon` | Placement scene/prop | Accessible space/state; no invented physical movement. |
| `hull-breach` | Breached Escape Pod environment | Explicit chosen Exit label disambiguates the physical board. No inferred dead occupants. |
| `keycards` | A useful workbench/reader scene only if the actual balance control needs one | Counts and token placement stay HTML. No unnecessary six-card Item gallery. |
| Existing exterior identity | Faithful branding correction, if used | Preserve convincing ship geometry; K6 identity governs text. |

The Konrad resolver must enumerate every required runtime asset ID and fail its completeness checks when an image is missing; do not copy the existing Evomorph portrait fallback. Purposeful reuse for the same object/unknown treatment is explicitly mapped and documented, never an accidental catch-all. Check asset ID-to-entity/state mapping before display sorting, native dimensions, decoded images, actual crop and image budgets.

Ordinary Items and instant Event references use existing flows; they do not require a new permanent illustrated equipment gallery. A UI state may reuse a photographed scene with HTML/dimming where that conveys it accurately. Meaningful physical state changes above require an actual reviewed scene/variant rather than a misleading status label alone.

Keep the dashboard compact while allowing expanded module scrolling. Target 44px controls, visible focus, readable scrims and stable ordering; no horizontal overflow at 320px. Preserve death dialog boundaries/actions and complete 2:3 painted ending poster.

## Verification and completion criteria

| Area | Required evidence |
| --- | --- |
| Source/catalog | 8 Terror / 10 Event / 5 Setup / 20 Item quantity reconciliation; four functions on three cards; 16 board spaces; per-card icon/trigger order; exact Setup placements and two Keycard positions each. Every unexplained source gap remains named. |
| Keycards | New balance 1 and Setup placements only with provenance; normal use free Time versus pickup 1 Time; ordinary spending does not overdraw a confirmed balance; a deliberate physical-result/correction path handles stale/unknown optional balance. No spent-card deletion or freely retrieved placed token. |
| Multiplicity/knowledge | Solar sends two or more tokens to one shaft; that shaft remains one connection, moving one leaves the others, reboot returns all. Test repeated function destinations and complete/partial ledgers. Unknown previous totals never become a guessed held charge. |
| Atomicity | Source removal + destination placement + required system/marker cancellation save together. Failed storage leaves all unchanged and retryable. Duplicate/stale taps, Undo and dependent restore cannot split/replay effects. |
| Activation/discounts | Crusher 1 unaffected by Override; Incinerator 2→1; Airlock 3→2; Self Destruct 4→3→2 with eligible Captain. Captain off-Bridge/unknown gives no assumed discount. Later changes do not replay activation. |
| Hazard timing | Crusher end movement versus Incinerator entry; damage versus Health loss; Slippery Killer-only versus temporary all-Enemy permission; temporary expiry explicit; no auto combat/casualties. |
| Airlock | Funding distinct from armed token; release cannot double-fire; actual Loader loss explicit; Final Girl 5–6 survival/failure and Killer revival/Junction observation distinct; no automatic Health values or kills. |
| Self Destruct | Three positions/two explicit advances; no automatic tick on reload/round change; cancellation clears countdown atomically; escaped/caught/unknown result contexts, including source's self-inflicted-loss exception. |
| Ending durability | Confirm fatal Airlock and Self Destruct with stale positive/unknown Health; prevent initial won-case persistence, then test late explicit correction of the same case, queued-write/checkpoint failure and retry, reload, cloud roundtrip, Save without narration, archive and statistics. The correct result/fate and cause must survive, without fabricating numerical Health. |
| Roles/Events | Correct starting Event on genuinely new cast; expansion writes nothing; Captain Bridge observation; Orphan replaces existing Victim; Jonas does not follow and no automatic panic movement; departure ends benefits; corrections never re-award/re-kill; instant cards not ongoing toggles. |
| Stateful Items | Loader Key acquisition differs from equipping; unequip/key loss leaves Loader at reported space and cannot put it in Backpack; Beacon target/entry effects recorded explicitly; historical Item find does not establish current inventory. |
| Mixed Killers | Hans, Billy, Geppetto, Dr. Fright, Inkanyamba, Poltergeist and Evomorph with Konrad. Test Hatchling Captain Bloodlust restriction, healthless Killer + location Slippery, Killer/Minion access differences, other-owner unknown state and bounded facts. Generic unsupported Killers must not acquire verified mechanics merely by selection. |
| Ownership/security | Konrad observations rejected at other locations; Killer observations remain separate. Character names/space labels treated as data, not prompt instructions. No raw source photos/private personal-item secrets in public source/build output. |
| Cross-app journeys | Search Rules by card/shaft/system; fresh/resumed/offline/reload; Remember This Item references; contextual death with space and mechanism; failed sync/retry and cached reopening/take/narration without duplicate deaths; ending/archive/statistics with explicit escape/destruction facts. |
| Historical compatibility | Death context uses state at that death, not today's system state. Frontend/shared native Deno accept same observations; JSONB key order roundtrip does not corrupt validation/signatures. Unaffected old signature shapes remain valid. Isolate database fixtures using unique IDs and transaction rollback. |
| Visual review | Actual loaded 1280×640, 1366×768, 1440×900, 390×844 and 320×568 UI. Cover quiet/active/depleted/unknown, multiple roles/Events, long labels, cancellation errors, combined systems, reduced motion, keyboard and 44px targets. Compare with approved Groves pack. |
| Artwork coverage | Enumerated IDs resolve to intended Konrad photographs with valid native dimensions/budgets, no generic portrait fallback and no missing/undecoded image hidden by a passing UI journey. Compare actual final assets/crops with the approved references. |
| Context priority | Populate all shafts/functions/roles/Events with maximum-length supported labels plus Evomorph stage/Ambush observation; ensure both owners and reviewed terminal constraints survive bounded prompts. |
| Automated gates | Applicable domain/hook/shared-control/browser suites; `npm run check`; `npm run check:assets`; `npm run build`; native edge/database checks; **all required CI on the final PR head**. Repair failures before handoff. |
| Release | Report exact affected functions/migrations/frontend/Storage after final import audit. Backend compatibility before frontend. Mark live provider/production checks pending unless actually authorized and performed. |

Completion means all in-scope applicable surfaces are implemented, source-backed, tested and visually inspected, with no placeholder art or undisclosed gaps. Mock browser checks do not establish live model/audio quality or a production deployment.

## Planned rollout assessment

- Frontend release required for canonical content, Rules, panel, setup, context and artwork.
- At minimum assess/redeploy `generate-death-scene` and `narrate-story` when their shared Play contracts change.
- Ending review changes make generate-ending and its storyFacts/validation callers explicit deployment dependencies. Trace generate-story, generate-visual-bible and generate-scene-image for bundled shared validation/prompt changes as well. Give the final exact list from the actual dependency graph, not the previous PR's two-function list.
- Prefer existing play_events for durable Konrad state/review and existing outcome for the case result. Wire both snake_case history conversions and the update-column map; a new form field is not persistence. This design does not currently require a new SQL column/migration. Confirm against the final diff and prove a database/cloud roundtrip rather than assuming the session JSONB path covers archive writes.
- No new identity-reference Storage manifest is assumed. If the actual trusted reference manifest changes, stage/review/upload the exact fixed-key objects and digests and verify source/bundle budgets before releasing dependent callers.
- Neither this plan nor successful CI grants standing permission to merge, publish, deploy or spend on paid provider tests.
- Current status: **inventory and critically reviewed execution plan prepared; location implementation and all implementation/live verification pending.**

## Remaining uncertainty and execution evidence

- **Documented, not a gate:** the sixth Keycard face is unpictured; K5 establishes its count and generic rules. All five Setups are now tabulated, with 12 Victims each. No further photo/owner confirmation is presently required.
- **Rule interpretation remains explicit:** effect-driven reactivation/shaft adjacency and unusual cross-film endings are not silently adjudicated. Obtain primary clarification only before adding automation that depends on it; retain the planned physical-resolution observation path.
- **Physical supply:** eleven total tokens are printed, but loose per-type counts are not independently photographed. Do not impose a guessed supply cap; preserve quantities/conservation for reported operations.
- **Verification access:** local preview binding was rechecked and is restricted. Establish an actual capture/retrieval/viewing route at the first UI milestone; if it fails, finish independent work and identify that concrete verification blocker. Do not substitute a green test or generated mockup for visual inspection.
- **Not yet performed:** implementation, final images, browser/native CI and live deployment/provider checks. Do not mark completed based on the plan or another owner's earlier tests.
