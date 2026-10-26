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
| Ongoing Event | `EventControl` | Default artwork activates only from unrecorded state; recorded artwork opens details. Independent presence effects can explicitly opt into image toggling (Fickleness; Camp Deathwish, Star Crossed Lovers and Stubborn Kids). Linked/placement/lasting effects keep their existing explicit lifecycle. |
| Dark Power/Finale | `KillerCards` | Same illustrated chooser from the killer panel and Remember This. One durable permanent reveal per type; further choices edit its detail. Card names may stay unspecified. Register original artwork/catalog mapping in `killerPresentation.ts`. |
| Minor Dark Power | `MinorPowerControl` + `HealthTokens` | Unknown is distinct from 0/2 health. A filled/empty heart removes/restores one, regardless of slot index. Rules remain in Rules; hearts correct known health directly and a quiet Clear record link resets the observation. Preserve earlier reveal evidence without inventing remaining health. |
| Illustrated presentation | `IllustratedTile` + `ModuleArtwork` | Accessible HTML title/state/action, decorative artwork, no nested buttons. Atlas images stay original; rules/text are never baked into imagery. |
| Observation write | `useModuleRecord` | Same stale-render payload is recorded once, unrelated actions remain possible, failed writes are retryable, and UI follows saved observations. Domain helpers bundle linked changes into one event for Undo. |
| Outer section | `ModulePanel` | Banner and compact current-state summary, local expansion preference only. Mounting or expanding never records gameplay. |

`data-module-control` is a shared-component capability marker used by registry tests. New modules declare only capabilities they actually implement. A different mechanic does not need to pretend to be one of these capabilities.

Supply verified `effect`/`help` text where Rules disclosures are appropriate. Special-victim cards omit their Rules disclosure; their full effects remain in Rules. Props/companions retain their own disclosures. The
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

- Sacred Groves uses shared character outcomes to collect a Wrath target/allocation and preview one linked observation. Status correction never repeats outcome effects. Divine Wrath and physical token observations stay location-owned. The streamlined Play view omits Atonement/count helpers, connection tracking, setup and Bloodlust/Finale reference sections; Rules retains their facts. Old observations remain readable by the domain and historical context. Ritual removal is not a casualty.

## Verification evidence

`moduleControls.contract.test.tsx` covers shared behavior, unknown versus depleted health, disclosure without resurrection, duplicate-action protection, failure/retry and registry adoption. `module-consistency.spec.ts` covers all current nine combinations on desktop/mobile. Extend module-specific journeys when adding rules; shared tests do not establish rules accuracy, visual quality or live provider behavior.

## Compact module presentation, 2026-10-26

`WrathTrack` supplies live numbered levels and ± with separate Killer/Divine material themes. Five original backgrounds per owner represent levels 1–2, 3–4, 5–6, 7–8 and 9–10; unknown is explicitly labelled and uses a desaturated quiet background. Play omits Unleash text and the Inkanyamba Wrath reference; Rules retains the source-backed instructions. Changes are physical-tracker observations, never automatic resolution. Unknown and 1–10 bounds remain explicit. At 320px, all ten numbered targets must remain completely inside the board, not merely inside a clipped page.

All five supported killers use small muted photographic Power/Finale choices in both entry points, including Hans's second power. Selecting a named card replaces its alternatives with one wide read-only photographic hero. Dark Power uses the left-aligned Clear card name link to restore choices; it edits only the name and preserves the permanent reveal. Finale retains Change Finale; opening/cancelling that chooser records nothing. Corrections update the existing permanent reveal. Clearing a name preserves that reveal and restores choices. Card rules remain in Rules.

`MinorPowerGroup` hides unused Minor Powers after one is recorded, without enforcing a one-power limit. Add another Minor Power reopens unused choices without writes; recording an additional power closes the choices and preserves all recorded powers. Previously revealed/unknown and zero-health powers count as recorded. Positive health uses a large photographic panel; zero uses a compact Removed state with reachable restore hearts. The photograph stays stable through health changes; live hearts and labels carry the state. Minor Powers precede Power/Finale. Photos use native 16:9 derivatives; original atlases retain explicit source clipping where still used.

Sacred-space imagery cycles clear → Closed → Fire → Hallowed → clear. Each token exists at one location; relocation/removal is one observation. Mixed-token or partially unknown states open the on-demand Adjust tokens editor instead of erasing observations. Explicit edits change only the chosen token and never activate/end Events or affect victim totals. Combined states list every token and show a count. All eight combinations at each of the three sites have environmental artwork: blocked access, fiery surroundings and/or hallowed light; no overlaid medallions. This is decorative interpretation and does not add facts to the game or narrative. Fickleness toggles active/ended without executing costs or effects; Undo restores observations.


## Cinematic module presentation, 2026-10-26

`cinematic-controls.css` covers equivalent Minor Powers, both reveal entry points and opt-in independent Event toggles. Module-specific life cycles, raw observations, canonical effects, Rules search and historical/narrative context remain unchanged. Each Minor Power article keeps its accessible name across compact, active and removed presentations. `RevealedCard` is read-only; interacting with the hero must never submit gameplay. The named/unnamed permanent reveal remains owned by `KillerCards`. Hans's second-power mutation controls also respect the disabled state.

Fickleness retains its original scene and direct active/ended observation; its visible reminder is removed and the illustration is 195px high (previously 130px). Camp's Deathwish, Star Crossed Lovers and Stubborn Kids share the premium toggle presentation while retaining their own appropriate Rules/reminders. Linked, placement and lasting-effect controls do not acquire toggle behavior.

Wrath artwork is thematic, never an effect resolver. Only Inkanyamba and Sacred Groves currently own Wrath tracks. Sacred state combinations are bit-addressed (Closed=1, Fire=2, Hallowed=4) as eight native widescreen photographs per site; actual token limits, atomic relocation and unknown/mixed-state correction remain in the existing domain/presentation helper. Identity photographs, Collection scenes, ending posters and generation prompts are outside this visual change.


## Photographic card follow-up, 2026-10-26

The user explicitly requested photorealistic wide card and Sacred-space images, overriding the earlier illustration-medium restriction for these views. `modulePhotos.ts` maps 46 killer photographs and 24 Sacred-space photographs before display sorting. Provenance and exact row-major mapping live in `src/assets/play/photos/README.md`. Photos are thematic UI motifs, never new identity facts, injury/death observations or rule evidence. The Inkanyamba duplicate Power/Minor reminder beneath Wrath is removed; canonical Rules and relevant controls remain. Wrath backgrounds, other Events, identity pictures, Collection and generated-story prompts are unchanged. This follow-up requires only the frontend/artwork build, with no SQL or function redeployment.


## Quiet corrections and photographic headers, 2026-10-26

The user explicitly replaced Minor Powers' Details & corrections disclosures with one underlined Clear record button. It records the existing nullable health observation and remains disabled for blocked games; it does not delete history or reverse physical board damage. Live hearts retain one-at-a-time remove/restore, including zero health. Unknown/legacy evidence remains explicit; full effects remain searchable in Rules. Clear record and Undo retain existing owner-specific semantics, including Fright's separate sleep observations.

The primary named Dark Power view omits Change Dark Power; Clear card name is left-aligned and restores the chooser while preserving its single permanent reveal. Finale and Hans's separate second-power controls keep their appropriate workflows. Sacred spaces omit the No tokens caption only when all placements are known and empty; unknown and live token labels remain.

All ten registered Play module headers use owner-specific photographic banners from `src/assets/play/banners/`, with documented native crops/focal points. No global identity, Collection, card/state, Wrath or narrative image changes. Source/provenance: banner README. Frontend/artwork deployment only.
