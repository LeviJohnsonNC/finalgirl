# Marrek Warehouse import record

## Scope and current status

- Owner: location **Marrek Warehouse**, film `s3-marrek-murders`, Play ID `marrek`. Extend the existing selectable entity; Warehouse is a search alias, not a duplicate.
- Standard mode, supplied edition IMG_9439–IMG_9444. Independently usable with any Killer. Related [Tormentor record](tormentor.md).
- Approved revised plan implemented on branch `codex/marrek-warehouse` against main `971c7e40705f91318bd54e0227171e95128aee5c`, November 1, 2026.
- Status: implemented and locally reviewed; final PR CI pending. No merge or production deployment has been performed. CI and live generation are separate evidence.
- Approved standard, current Groves reference pack, compact Konrad controls and correctable Shady Acres outcomes were followed. Good existing selection/Collection art and named Final Girl identities remain unchanged.

## Source ledger

Source IDs below identify the owner's original photos by filename and digest. Raw photos and private reference identifiers remain outside public Git.

| ID | Original | Bytes | Verified coverage |
| --- | --- | ---: | --- |
| W1 | `IMG_9439.jpeg` | 674156 | Complete location board; three Exits, three Search areas, four Rack regions, The Pit, ground spaces and printed Panic directions |
| W2 | `IMG_9440.jpeg` | 702420 | Component counts, credits, special setup |
| W3 | `IMG_9441.jpeg` | 654764 | Locked Exits, Racks, acquiring/using Climb and Leap, The Pit |
| W4 | `IMG_9442.jpeg` | 739486 | Eight Terror faces, including three different Click! cards; two complete Action faces |
| W5 | `IMG_9443.jpeg` | 1161581 | Five Setup diagrams and all ten Event faces |
| W6 | `IMG_9444.jpeg` | 936809 | All sixteen Item faces, including charge markers, hands, ranges, damage and special effects |

SHA-256, W1–W6 order:

```text
60b934352c588555898e0baac8b6ca0127319b1915f7466f7ef54ae3dc84f87d
ec5061e74014aa56e89adeee3857edbcedd066b36e87834d8af72c6624a817cd
cc2507e1d47c0a64743705e204454961c68156a4f23cd5f222efbbe3e4ec608b
787c30126baca8fa9554fb67506540d36c9885d6bc0fe81a397a53fc22df01b8
dca111c7c74c6f2a695a58bfdecb09c39a24fcf57f58c8d1a13650af7527e0cb
c123a31ca581756493f97ba49ead01628d37d84c0fa4aafbda4fd48b13e72515
```

Credits (W2): design **A. J. Porfirio**; art **Agnieszka Dabrowiecka**.

Supplemental primary sources checked:

- Publisher [Series 3 page](https://vanrydergames.com/collections/final-girl-series-3) links its [Feature Film rulebook](https://cdn.shopify.com/s/files/1/0593/6984/8897/files/FG3_FeatureFilm_Rulebook.pdf?v=1736347059). Downloaded complete 11,338,990-byte PDF, SHA-256 `746aa1284dd1e55ff0103d1d4e43c848bb020cd853366ff2b3998b0d07604b29`; inspected Warehouse printed pp. 27–28 (PDF spreads 14–15), corroborating W2/W3. No contradictory printing found in those rules.
- Publisher [core rulebook](https://cdn.shopify.com/s/files/1/0593/6984/8897/files/FinalGirl_Rules_ff324b01-6f74-43e0-90e2-1685594703d5.pdf?v=1717621644), visually inspected back-page icon reference: the hockey mask means Horror +1; red hourglass means Time loss; slashed heart means unpreventable Health loss; red X ends the Action phase. This avoids confusing Horror, a Horror roll and a Killer action.
- Publisher [product description](https://vanrydergames.com/products/final-girl-the-marrek-murders) describes a mid-sized shipping/fulfillment warehouse, not an abandoned heavy-industrial foundry. It corroborates racks and timed security doors. Owner photos govern the supplied edition and card effects.

## Reconciled inventory

| Component | Expected | Supplied | Status |
| --- | ---: | ---: | --- |
| Location board | 1 | 1 | Verified |
| Setup cards | 5 | 5 | Verified names and complete diagrams |
| Events | 10 | 10 | Verified complete faces |
| Location Terrors | 8 | 8 | Five other faces plus three exit-specific Click! faces; six printed titles |
| Items | 16 | 16 | Verified complete faces |
| Actions | 2 | 2 | Climb and Leap, complete faces |
| Various tokens | 12 total | Component illustration / card references | Total verified; not a photograph of every loose token or a verified complete subtype breakdown |

No missing card faces block the planned import. Do not invent token subtype quantities from the total of 12. Four Severed Heads are explicitly established by Tumbling Boxes; three distinct Locked Exits are established by the board/setup. Item charge counts are card uses, not automatically a universal token-pool limit.

Named board areas: **Main Entrance, Loading Dock A, Loading Dock B, Supply Cage, Receiving Area, Manager's Office, The Pit**. Four unnamed Rack regions can use honest coordinate labels (upper-left, upper-right, lower-left, lower-right), never invented official names. Ground-space labels needed for observations use explicit descriptive board positions in one stable, source-indexed space table. Reuse these IDs for setup references, Plank endpoints and placed-trap locations; spelling variants must not create separate copies of one known space. Unknown legacy/freeform positions remain unverified rather than being assigned a fabricated ID. This is a labeling table, not a movement/Panic graph.

Setup names: **Unloading, Daily Huddle, Shift Change, You're Fired, Units Per Hour**. Preserve printed Final Girl/Killer/Victim markers in source data and setup descriptions; a selected diagram is initial placement, not a live roster or current position tracker. Transcribe/test each diagram against W1/W5 during the source-data step, rather than inventing room positions or default Victim counts from a title. Tormentor's separate rule suppresses its physical initial placement.

## Source-backed rules and card inventory

### Setup and board

- Put the Forklift in The Pit, initially usable only after finding Forklift Keys. All three Exits start Locked. An Exit can still be entered while Locked; Victims cannot be saved there. Unlocking removes its Locked token.
- Keep all three Click! cards aside during normal Terror-deck setup. Protect the normal deck's top two cards, shuffle Click! into the remainder, then put those two back on top. Do not create a numerical countdown or a second digital Terror deck.
- Put Climb and Leap in the Action Tableau. During the Action phase, discard Walk to take either, or Sprint to take both. These cards are not acquired through ordinary purchasing.
- Racks represent the tops of storage racks. Enemies/Victims move to and from them normally unless a card says otherwise. The Final Girl uses Climb to enter an adjacent Rack, normal movement to leave one, and Leap between Racks. Victims may follow; followers do not take damage from a failed Leap.
- The Pit is the named middle area. Panic direction there uses two dice. Do not turn its name into an unsupported literal excavation, shaft or fatal hole.

### Terror faces (W4)

| Stable proposed ID / printed title | Verified effect order |
| --- | --- |
| could-be-anywhere / The Killer Could Be Anywhere… | Increase Horror per intervening space between Final Girl and Killer, maximum 3; exclude their own spaces. Then target Final Girl → move → attack |
| safer-up-there / We'll Be Safer Up There! | Panic Victims adjacent to Racks. Then target closest Final Girl/Victim → move → attack |
| saw-the-killer / I Think I Saw the Killer… | Increase Horror by 1 (verified mask icon), then target closest Victim → move → attack |
| open-boxes / Let's Open Some of These Boxes! | Optional roll per unused Item set aside during setup; lose 1 Time per selected card. 1–4: keep it unrevealed/out of game; 5–6: reveal and take it |
| pushed / Were They Pushed? | Closest Final Girl/Victim → move → attack first. Then panic all Rack Victims; those no longer in a Rack afterward fall and are killed |
| click-main / Click! — Main Entrance | Unlock Main Entrance; draw next Terror |
| click-a / Click! — Loading Dock A | Unlock Dock A; draw Event, then next Terror |
| click-b / Click! — Loading Dock B | Unlock Dock B; draw Event, then next Terror |

All three Click! cards also say: if discarded by an effect, unlock their specified Exit but apply **no other effects**. Use stable IDs and qualified UI labels so three identically printed names do not collapse in alphabetical/deduplicated selectors. Keep `printedName: Click!` separately; a legacy unqualified Click! remains target-unknown, never silently Main Entrance. Selecting a card as a death reference is not resolving or discarding it. Tormentor's pre-Finale restrictions still govern its actions; these location cards do not make her appear.

### Events (W5)

| Event | Verified facts / persistence |
| --- | --- |
| Help on the Racks | Panic adjacent Victims, moving only those whose result enters a Rack. Repeat until at least two have entered or no adjacent Victims remain; discard |
| Good Ole Zipp | Replace the Victim farthest from the Killer. While Zipp is with you, you may treat Exits as Unlocked. His death adds 1 Bloodlust. Discard when he leaves play |
| Scatter! | Panic all Victims; discard |
| It Has Been 0 Days Since… | While active, a Victim panicking from a Rack into a normal space is killed. Not every Rack panic is fatal: a Rack-to-Rack move is different |
| You Aren't Going Anywhere | Re-lock all physically Unlocked Exits, return all Click! cards from the discard pile to the Terror deck, shuffle; discard this Event |
| Heroic Best Friend | Replace a chosen Victim. Cannot be saved while any other Victims remain. If the Final Girl would take damage and Best Friend is in her space or adjacent, they move to her space and take it instead. Discard when they leave play |
| Tumbling Boxes | Place four Severed Heads in different, mutually non-adjacent non-Rack spaces. Entering one increases Horror by 1 and removes that token. Discard after the last token leaves |
| The Supervisor | Add Supervisor plus two new ordinary Victims in Supply Cage. For Panic in their space, roll one die and move every Victim there, including Supervisor, using that result. Discard when Supervisor leaves |
| Smarter Than They Look | When an Exit becomes Unlocked, you may save Victims there remotely. Victim Saved benefits are taken at the start of the next Action phase |
| Trucks Are Here! | Add one new Victim to each Loading Dock. At a Locked Dock, that Victim waits out of play until it becomes Unlocked. Discard only after both have entered play |

Replacement roles are not extra spawned Victims. Pending truck deliveries are not on-board Victims or Saved Victims. Special-person outcomes keep ordinary Saved/Killed totals separate, matching current shared controls. Cards with conditional effects provide constraints; their presence never proves that a casualty, rescue, reward, movement or die result occurred.

### Actions (W4)

| Action | 2+ successes | 1 success | Failure |
| --- | --- | --- | --- |
| Climb, only while adjacent to Rack | Move to adjacent Rack; lose 1 Time | Same movement; lose 2 Time | Lose 1 Health; return Climb to hand |
| Leap, only while in Rack | Move directly to another Rack; lose 1 Time | Same movement; lose 2 Time | Must move 1 space; lose 2 Health |

These belong in Rules. No Action-hand, roll-conversion or Time-spending simulator will be added.

### Items (W6)

| Item | Verified properties/effect to catalog |
| --- | --- |
| Trashcan Lid | One hand, three uses; ignore 1 damage |
| Forklift Keys | Enables Forklift; it may accompany Final Girl but cannot enter Search or Rack spaces. While with it, spend **1 Time** to move a Victim safely from an adjacent Rack into your space |
| Odds and Ends | Three uses; place a Booby Trap in your space during Action phase, at most one per space. An entering Enemy discards the token and takes 2 damage |
| Plank | One token bridges two different Racks; they count as adjacent and panicking Victims from either always move to the other |
| Hard Hat | Holds random Final Health token. When yours is revealed, you may reveal this one and choose one to resolve. Not considered in Backpack. Does not bypass Tormentor's terminal-trap rule, which forbids Final Health revelation |
| Knife | Range 0, damage 1, one hand |
| Whip | Range 0–1, damage 1, one hand; damaging an Enemy permits moving it 1 space |
| Chainsaw | Range 0, damage 3, two hands, two uses. Cannot modify Reactions; using it appends immediate Action-phase end |
| A List of Things in the… | Roll: 1–2 Supply Cage, 3–4 Receiving Area, 5–6 Manager's Office. Reveal all Items in that deck without changing order; discard this Item |
| .44 Magnum | Range 1–2, damage 1, one hand; cannot modify Weak Attack |
| Megaphone | One hand; once per Action phase move any Victim 1 space, then all Enemies target Final Girl and move |
| Power Drill | Range 0, damage 1, one hand; may discard to unlock your Exit |
| Bowling Ball | Two hands; discard during Action phase while on Rack to deal 3 damage to Enemy in adjacent space |
| First Aid Kit | One hand; Action-card Health recovery gains one additional Health |
| Two-Way Radio | One hand, four uses; spend 1 Time to move Victim 1 space; same Victim cannot benefit twice in a turn |
| Bolt Cutters | Two hands, two uses; ignore 1 damage OR unlock current Exit |

The Item catalog records printed charges for Rules/reference. Finding an Item is not proof of current inventory, remaining charges or use. Only stateful board objects get dedicated Play controls; this import does not add sixteen inventory widgets.

## Implemented integration and interaction map

| Surface / operation | Implementation and boundary |
| --- | --- |
| Canonical Rules/catalog | One shared `play/marrekWarehouse.ts` supplies all five exact Setups, ten Events, eight qualified Terrors, sixteen Items, two Actions and stable board-space labels. Rules/feature details use it; no duplicate entity. Corrected the invented literal Pit depression and abandoned factory/conveyor lore. |
| Illustrated module | Registered location panel, own original header, concise summary, killer first. Shared CharacterControl, EventControl, IllustratedTile, ModuleArtwork and useModuleRecord. Expansion/rendering does not record gameplay. |
| Physical exits | Three source-backed canonical IDs, Locked/Unlocked/Unknown, paired same-landmark original photographs. A real unlock previews/saves a known waiting delivery in one command. Quiet corrections collect lock plus optional delivery together; no repeated card resolution or automatic rescue. |
| Tormentor integration | In Marrek, No Escape links to Warehouse locks instead of an independently editable freeform list. New competing freeform submissions are rejected after adoption; existing logs retain their replay contract. New narrative/death context projects the same three locks into both owners. Canonical Unknown outranks old aliases; unmatched/conflicted old labels remain unknown, never a fourth Exit. Other locations retain Tormentor freeform locks. |
| No Escape / Zipp | No automatic all-locked loss; explicit Killer-phase-start ending review stays with Tormentor. Zipp With-you permission is separate from physical lock removal and does not automatically resolve Trucks, remote saves or a loss ruling. Leaving play clears companionship atomically. |
| Special people | Zipp, Best Friend, Supervisor: shared dim absent/left portraits; In-play, Saved, Killed and Left outcomes with identity-consistent original photos. Outcomes remain correctable; same-state actions are no-ops. No ordinary Victim totals, Bloodlust, damage interception or introduction effects replay. |
| Forklift / Plank | Availability picture toggle only, no fuel/riding/position simulation. Plank requires two distinct Rack IDs in one saved command; quiet remove/unknown/correct. These are observations, not proof of current Item inventory. |
| Persistent Events | 0 Days and Smarter use dim-off/vivid-on shared picture toggles. Four/unknown/zero heads tracked without claiming positions; final removal retires Tumbling Boxes. No inferred Horror, casualty or reward. |
| Trucks | Dock-specific unknown/waiting/entered, correct observation when a physical Event occurs at already-unlocked Docks, one-time known admission on actual unlock, both entered retires Event. Corrections, relock, reload and re-add do not create more arrivals. |
| Booby Traps | Optional collapsed placed-trap section, actual canonical space required, one per known ID, repeatable placement/removal. No inferred charges or Enemy damage. Legacy completeness remains uncertain. |
| Fresh / legacy | Durable `marrekSetupVersion:1` only at new-session creation. Setup and deterministic starting-Event facts persist with initial observation. Old/resumed logs are not backfilled. Random placements and unobserved state remain unknown. |
| Immutable persistence | Strict shared action/snapshot validation, relevant parent revision, owner checks, stale/no-op rejection, linked Undo/Restore, failed-local-write retry and reload. Timeline disables dependency-breaking Undo, including interleaved Warehouse/Tormentor observations. |
| Gruesome Death | Existing six causes, qualified Click selectors, owner-filtered rooms/people/Items/Terrors/Events, Rack fall and Enemy-targeted Booby Trap references. Selecting a reference never resolves it. Historical facts/cache signatures remain stable after later state changes; saved death, narration and archive journeys are covered with mocks. |
| Original opening | Optional location-scoped `marrekOpening: fresh-v1 / legacy-unknown` reaches story, still and visual-bible validators/prompts. Derived from original durable provenance, never current locks/people. Missing legacy provenance stays unknown. Selected Final Girl identity and poster medium are preserved. |
| Ending / other killers | Both owners receive whole-sentence bounded context. Tormentor terminal-trap and Grimlash terminal-Madness fate remain authoritative; Warehouse observations never fabricate deaths or change totals. |

The app remains a companion to the physical board. It does not simulate ordinary movement, Panic, the Terror deck, Climb/Leap hand acquisition, Time payments, inventory or charges. It does not add sixteen Item trackers or twenty-three decorative Item/Setup/Action images.

## Artwork and actual visual review

See [photograph manifest and direction](../../src/assets/play/photos/marrek/README.md). **33 independent original native scenes / 66 bounded derivatives**, including a separate header, six door states, two Forklift states, two Plank states, ten Event identities, six role outcomes, five other Terror scenes and one placed trap. Three deliberate Click aliases use their corresponding Unlocked Exit image; role Events use their own base role portrait. No missing-ID fallback, contact-sheet enlargement or publisher card scans.

Generated with the built-in image tool; every native output was reviewed. Loaded controls were inspected at 1280×640, 1366×768, 1440×900, 390×844 and 320×568. Review fixed missing exit-caption positioning, narrow outcome-button clipping and a min-content grid that could hide a phone column despite no document scroll. Tests now check control/frame bounds, not only page overflow. Real door/bridge landmarks, role faces and readable HTML captions are retained; reduced motion and 44px targets are checked. Expanded modules can scroll.

## Verification evidence

| Evidence | Result / command |
| --- | --- |
| Source reconciliation | Six native 1536×2048 originals decoded/read; publisher Warehouse rules and core icons corroborated. All faces/counts above accounted for; five diagrams transcribed with twelve Victims each. Loose-token subtype quantities remain unverified. |
| Core domain and shared contracts | `npm test -- src/lib/play/marrekWarehouse.test.ts src/lib/activeGame.test.ts src/components/play/moduleControls.contract.test.tsx`; includes stale/forged/wrong-owner changes, atomic unlock/Undo/Restore, correction versus resolution, aliases, Plank/trap uniqueness and historical death signatures. |
| Node 22 frontend/edge | `npm run check`: latest full local pass had 634 unit tests and 121 edge-adapter tests; subsequent focused checks cover the final exit-context/owner changes. Final required CI reruns the entire final tree. Existing eleven lint warnings are unchanged. |
| Asset/build | `npm run check:assets` verifies all 33 independent sources, hashes, dimensions, 66 derivatives and three deliberate aliases; `npm run build` passes. |
| Warehouse browser | Full Warehouse journeys pass on desktop/mobile: correction/retry, fresh setup, all nine implemented killer registrations, all eighteen card-reference images, cached death/narration/archive, original fresh/legacy Reshoot. Additional deep Evomorph/Warehouse evolution and Grimlash/Warehouse terminal-result journeys are included. |
| Neighbor regression | 88 desktop/mobile journeys across Warehouse, Tormentor, Shady Acres and Konrad passed; later targeted critical/layout/deep-mix pass: eight journeys. Final required CI reruns all browser shards. |
| Visual artifacts | `tests/browser/marrek-warehouse.spec.ts` writes `marrek-critical-*`, `marrek-complete-*`, per-region five-size crops and every Terror/Event crop into its Playwright test-results directory. Actual captures were inspected, not accepted solely from assertions. |
| Native edge | New `marrekWarehouse_test.ts` and opening schema coverage are wired into Reliability CI. Local Deno 2.9.6 could not retrieve deno.land imports (connection refused); native typecheck/test success must come from final CI, not the Node adapters. |
| Production/live providers | Not deployed or live-smoked. Browser/adapter tests use mocks and do not prove live text/image/audio quality. |

## Uncertainties and release boundary

- Loose-token subtype quantities are not inferred from twelve total components or Item charge circles. No guessed Booby Trap pool cap.
- The consulted rules do not explicitly adjudicate every Zipp treat-as-Unlocked interaction with Trucks/Smarter/No Escape. Physical locks and recorded outcomes stay separate; no invented publisher ruling.
- No SQL migration and **no new private opening-reference upload**. Existing location portrait and trusted Final Girl/killer reference manifest remain unchanged.
- Deploy the latest compatible bundles for **generate-story, generate-ending, generate-scene-image, generate-visual-bible, generate-death-scene, narrate-story**, including their changed shared dependencies, **before** frontend publication. Merge/green CI alone does not deploy them.
- Then publish frontend changes and live-check signed-in mixed Play, save/reload, unlock/truck admission, Zipp permission, a historical cached death/narration and opening/ending behavior. No production action is part of this review branch.
- Remaining review gate: final PR head's required Reliability checks; record the actual run/head result in the PR. User retains merge/publish control.
