# Play module interaction standard

## Adding a module

1. Verify the owner's rules and card references before adding state or actions. Separate location and killer ownership; mixed films must work without borrowing another module's rules or artwork.
2. Register the owner, match name, banner, summary, capabilities and Controls in `src/components/play/moduleDefinitions.tsx`. The registry contract tests automatically inspect every registration and reject missing declared shared controls, duplicate owner/match pairs and incomplete illustrated reveal catalogs.
3. Use the shared control for an equivalent operation. Supply the module's legal states and atomic observation callback; keep rule-specific transitions in the shared play domain, not in the presentation component.
4. For a genuinely different operation, retain the common artwork/caption, focus, touch and error conventions. Document why its lifecycle differs. Do not add generic save/kill actions to an enemy, consume permanent terrain, or turn reusable tokens into casualties merely to match another panel.
5. Add real module journeys covering setup, older saves, correction, Undo, reload, failed writes, linked state, mixed ownership and rule-specific exceptions. Inspect actual screenshots at 1366×768, 390px and 320px. Run existing Reliability CI; it already discovers the shared contract tests and browser specs.

## Shared components

| Operation | Component | Required behavior |
| --- | --- | --- |
| Special character/companion | `CharacterControl` | An unknown portrait adds the entity; a recorded portrait opens details. Explicit legal outcome buttons only while present. Restoring or changing an outcome uses Change status. Counts remain separate. |
| Ongoing Event | `EventControl` | Artwork activates only from unrecorded state. Recorded artwork opens details. End effect is explicit. Re-activation and clearing are deliberate corrections. The module controls whether reactivation is legal. |
| Dark Power/Finale | `KillerCards` | Same illustrated chooser from the killer panel and Remember This. One durable permanent reveal per type; further choices edit its detail. Card names may stay unspecified. Register original artwork/catalog mapping in `killerPresentation.ts`. |
| Minor Dark Power | `MinorPowerControl` + `HealthTokens` | Unknown is distinct from 0/2 health. A filled/empty heart removes/restores one, regardless of slot index. Rules and direct 0/1/2/unknown correction stay behind Details & corrections. Preserve earlier reveal evidence without inventing remaining health. |
| Illustrated presentation | `IllustratedTile` + `ModuleArtwork` | Accessible HTML title/state/action, decorative artwork, no nested buttons. Atlas images stay original; rules/text are never baked into imagery. |
| Observation write | `useModuleRecord` | Same stale-render payload is recorded once, unrelated actions remain possible, failed writes are retryable, and UI follows saved observations. Domain helpers bundle linked changes into one event for Undo. |
| Outer section | `ModulePanel` | Banner and compact current-state summary, local expansion preference only. Mounting or expanding never records gameplay. |

`data-module-control` is a shared-component capability marker used by registry tests. New modules declare only capabilities they actually implement. A different mechanic does not need to pretend to be one of these capabilities.

Supply verified `effect`/`help` text for Event/character Rules disclosures. The
optional shared `reminder` is visible only while that entity/effect is active;
use it for consequential ongoing restrictions or penalties. Do not repeat initial
placement or automatically apply damage, bonuses or casualties from a reminder.

## State and history

- Use **Not recorded** for unknown observations. Reserve **unrevealed** for affirmative card-reveal information; absent data alone cannot prove a card was never revealed.
- Distinguish ending an effect from clearing its record and from correcting its physical presence. Document lasting penalties separately; clearing/ending an Event must not silently erase them.
- Preserve existing field names, validation, raw log history, Undo/restore and historical death/story context. Never infer victim totals, damage, adjacency, item possession or completed physical board actions from a UI convenience.
- Seed verified setup once at the durable active-game boundary, gated by fresh-session provenance where required. Do not initialize through a component effect or backfill existing logs. Unknown legacy state must remain editable.
- Power/Finale entry points share one permanent reveal; two controls racing cannot create two permanent observations. Hans's second-power capability remains a separate field and cannot duplicate the first.

## Styling and artwork

`illustrated-tile.css` owns the basic caption structure. `play-controls.css` owns shared cards, outcomes, hearts, corrections and state treatment. Module CSS owns board-specific layout, unique mechanics and art positioning. Scope custom button/article rules to their custom sections; broad module selectors must not override shared controls.

Keep art, status and the primary action together. Put secondary rules/corrections behind details. Retain module-specific motifs and good existing images; generate only missing art. Validate atlas order before alphabetical display sorting, thumbnail crops, long names, filled/depleted/unknown states, actual image loads and contrast. Text and state labels must remain readable without relying on color.

Controls stay at least 44px tall, keyboard operable with visible focus, stable in ordering and free of horizontal overflow. Expanded Play content may grow vertically; never clip content or shrink targets to force every open section into one viewport. Respect reduced motion.

## Current legitimate exceptions

- Billy's power sources are on/off, with an optional fifth; Buddies retain their streamlined token lifecycle and state-specific portraits.
- Geppetto's Puppets are reusable Ready/on-board/Exhausted tokens with a rule-specific spawning helper and explicit protection reset.
- Carnival's Terror Traps remain placed; Item Trap encounters can recur and are not inventory. Werewolf has no saved/killed outcomes. Zappo and the Golf Cart have their own legal outcomes and linked Event consequences.
- Hans's additional Dark Power appears only for Dark, Darker, Darkest.
- Maple Lane House tiles toggle their search mark directly as a tracker correction. Burning Houses permit removing an accidental mark while blocking new searches. Unknown remains a separate explicit correction; no physical Search effects are reversed.
- Dr. Fright's digital Boiler Room moves the cover and prior cards as one stack. Temporary pointer motion never records gameplay or exposes a new cutout; the existing saved-slide acknowledgment gates settling/reveal. Native cancellation, keyboard alternatives and reduced motion retain the same domain transitions.

- Sacred Groves uses shared character outcomes to collect a Wrath target/allocation and preview one linked observation. Status correction never repeats outcome effects. Divine Wrath, physical Bloodlust/Finale instructions and two reusable connection signs stay location-owned; Atonement is shared with Inkanyamba. Ritual removal is not a casualty.

## Verification evidence

`moduleControls.contract.test.tsx` covers shared behavior, unknown versus depleted health, disclosure without resurrection, duplicate-action protection, failure/retry and registry adoption. `module-consistency.spec.ts` covers all current nine combinations on desktop/mobile. Extend module-specific journeys when adding rules; shared tests do not establish rules accuracy, visual quality or live provider behavior.
