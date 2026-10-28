# Play module control contracts

Read the [approved module standard](MODULE_STANDARD.md) and [actual UI references](reference/module-standard/README.md) first. This page describes current reusable components and necessary exceptions. Earlier migration notes are [historical](history/module-controls_2026-10-27.md).

## Shared capabilities

| Component / operation                                    | Contract                                                                                                                                                                                                                                                           |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ModulePanel`                                            | Owner-specific photographic header, compact summary, killer before location. Expansion preferences never create Play events.                                                                                                                                       |
| `KillerCards` / `RevealedCard`                           | Both reveal entry points use small dim photographic choices and a single wide selected hero; hide unused choices after naming. One permanent reveal per kind; changing/clearing a name does not undo the reveal. No card-rules block.                              |
| Primary Dark Power correction                            | Left-aligned **Clear card name**; no Change Dark Power button. Finale uses the same left-aligned **Clear card name** action; no Change Finale button. Hans's second Power has its own rule-specific workflow.                                                                                                           |
| `MinorPowerGroup` / `MinorPowerControl` / `HealthTokens` | Before Power/Finale. Unrecorded choices are small and muted; positive health shows a wide photo and live hearts. Zero means Removed, with restore hearts. Unknown is explicit. Quiet **Clear record** replaces Details/Corrections. Each heart changes one health. |
| Multiple Minor Powers                                    | Retain every recorded power, including zero/unknown records. Hide unused alternatives; **Add another Minor Power** exposes them without writing gameplay. Do not impose a one-power limit.                                                                         |
| `EventControl` independent toggle                        | Clicking the picture toggles presence. Show title/state and clear inactive dimming, without auxiliary Rules, reminders or End/Change controls. Placement, linked or multi-step Events retain required workflows.                                                   |
| `CharacterControl`                                       | Unknown portrait offers Add; a present character offers legal outcomes. Correction is separate from outcome resolution and must not repeat effects. Special-victim portraits do not need a Rules block; preserve genuine character-specific actions.               |
| `IllustratedTile` / `ModuleArtwork`                      | Component names do not dictate art medium. Current photo defaults are in the standard. Keep labels/state/actions in HTML, valid keyboard semantics and real crop metadata; no nested interactive elements.                                                         |
| `useModuleRecord`                                        | Save linked observations atomically; prevent stale/double transitions. A rejected durable write leaves the displayed state unchanged and retryable. Undo restores the whole linked observation.                                                                    |

## Existing mechanic-specific exceptions

Reuse operations only where their semantics match. Audit the owner domain and Rules before adapting any example below.

- Independent picture toggles include Groves' ongoing Fickleness and applicable ongoing effects, Camp's ordinary ongoing Events and Maple's Friendly Neighbors. Secret Tunnel needs endpoints; Groves' placement/allocation actions and Carnival's linked/lasting effects retain their specific workflows.
- Billy's buddy sources are independent; optional five-source setup is explicit. Buddies have their own states and do not imply victim casualties. Puppets are reusable ready/on-board/exhausted pieces, not Victims.
- Carnival traps remain placed; repeatable Item-trap records are not inferred inventory. Werewolf outcomes are not generic saved/killed actions. Zappo/Golf Cart are linked workflows; lasting Junk is not erased simply because its Event ends.
- Hans's second Power exists only for the verified Dark, Darker, Darkest condition; do not duplicate the first Power or permit a blocked second choice.
- Maple house search corrections preserve unknown states. A burning house blocks a new search, without preventing correction of an existing observation. Fright's saved-slide gating and manual reset, and the Final Girl-only Awake status, keep their own rules.
- Groves' special-Victim outcome preview retains required linked Wrath choices. The Holy Man allocation without Inkanyamba is a **provisional owner-specific interpretation**, not an official or shared rule; see the [Groves import record](imports/sacred-groves.md).

- Poltergeist has healthless ongoing Minor effects: reuse the Minor frame, muted choices and wide active photo, but no hearts or zero-health mapping. An active picture ends an effect; explicit correction preserves unknown/removed states. Its Carolyn/Mr. Floppy objective uses explicit source-backed actions; Carolyn joining plus permanent Minor removal is one durable observation and one Undo. No ordinary Victim totals or inferred win. See the [Poltergeist import record](imports/poltergeist.md).

## Groves reference mechanics

These are visual examples, not a specification for Creech Manor or other owners.

- Killer and Divine Wrath have ten physical levels and five two-level backgrounds with distinct themes. Killer Wrath uses the approved photographs; Divine Wrath retains its approved artwork. Preserve unknown state and required active modifiers. Wrath reference/Unleash tables are omitted from Play; changing the track does not resolve an effect.
- Sacred spaces normally cycle clear → Closed → Fire & Brimstone → Hallowed → clear. Token uniqueness moves positions atomically. Unknown and combined states keep the explicit editor so a click cannot silently discard information. The eight sites have state-specific environmental images with retained landmarks. Known empty omits “no tokens”; unknown remains visible.
- Removed Atonement/count/connection/setup and duplicate Bloodlust/Finale reference UI must not return merely because it exists in older documentation. Verified rules and legacy observations remain available in their proper surfaces.
- Shared Bloodlust art follows the [audited board ranges and mapping](../src/assets/play/bloodlust/README.md). An unverified maximum uses the documented fallback; the application's numeric cap is not a physical board maximum. Preserve saved high values.

## Registration and styling

Register owner ID, match name, banner, summary, capabilities and Controls in `src/components/play/moduleDefinitions.tsx`. `data-module-control` markers represent actual shared capabilities; declare only implemented operations. Registry tests reject duplicate owners/matches, missing declared controls and incomplete reveal-art catalogs. Map card art before display sorting.

`illustrated-tile.css` owns caption structure; `play-controls.css` owns shared outcomes/hearts/corrections; `cinematic-controls.css` owns cinematic reveals/Minors/opt-in picture toggles. Owner CSS handles unique mechanics and positioning. Scope custom selectors so they cannot override shared controls. Keep stable ordering, accessible names, visible focus, readable contrast and at least 44px targets; respect reduced motion and 320px bounds.

## Persistent state and verification

Preserve immutable event IDs, explicit fresh-session provenance, mixed killer/location ownership and separate victim totals. Render/expand/catalog access never writes gameplay. Unknown is not zero, absent, depleted or unrevealed. Decorative art does not record damage, movement, victims, costs, inventory or outcomes.

Domain code shared with edge functions lives in `supabase/functions/_shared/play/`; frontend `src/lib/play/` modules re-export it. Validate new observations on both sides. Death facts use the historical log at that event; keep unaffected cache signatures compatible and both owners represented within narrative budgets.

For a control change, run applicable domain and `moduleControls.contract.test.tsx` tests, actual browser journeys (including starting Events and both reveal entry points), mixed-owner isolation, failure/retry, Undo and reload checks. Inspect the loaded UI in selected/unselected, active/depleted/unknown and combined states on laptop and phone. The [import playbook](MODULE_IMPORT_PLAYBOOK.md) defines completion and release checks. Never describe mocked screenshots as live provider or production verification.
