# Carnival of Blood module

Standard-mode Location implementation. Works with any Killer, including Geppetto, Hans and Billy. Final Girls, personal-item unlocks, combat automation and a digital board/movement engine are unchanged.

## References

Owner photos IMG_9338–IMG_9343: board; components/setup; special rules; eight Location Terror cards and trap reference; five Setups and ten Events; eighteen ordinary Items and three Item Traps. IMG_9337 is the independent Geppetto deck. Canonical paraphrases live in `_shared/play/carnival.ts`, reused by setup/Event descriptions, Rules, Play suggestions and narrative references. Setup diagrams remain authoritative for physical placement; generic strategic interpretations were removed.

Small icons were checked against photo crops. Tiger Terror: one damage to Enemies and one Health loss to the Final Girl, not two. Steel Bear Trap: one Health loss, two Time to remove. Sibling death: two Bloodlust. The Strongman Hammer’s red X is the immediate Action-phase-end icon, checked against the publisher/distributor core rulebook legend: https://cdn.svc.asmodee.net/production-asmodeeca/uploads/2025/10/Final-Girl-Rules.pdf (printed page 12/36). Health loss and attack damage remain distinct; no effects are automatically applied.

## Observations and state

- Three fixed Terror Trap tokens: unrecorded/not placed/placed, optional space note. Placement is explicit. Discarding or canceling a card never removes a placed token. Correction and Undo can fix mistaken records. All Enemies ignore these tokens.
- Item Trap encounters are repeatable observations, not inventory entries or permanent unlocks. Cobra/Bear attachment is separate from terrain. Gas has no persistent condition. Found Footage cancels the whole selected Terror Trap card; Zappo only avoids an Item Trap when used to Search. A cancellation does not clear an earlier attached effect.
- Event activation and immediate linked actor/object state save atomically. Sibling/Fiancé outcomes and Cart discard end their corresponding Event. Reactivation cannot restore ended roles/objects; explicit status correction can. The Werewolf cannot be saved, killed or targeted. Zappo is not a Victim.
- So Much Junk’s Search penalty is latched when Zappo is lost after that Event. Regaining him or ending the Event does not clear it. A labeled correction control can correct a mistaken penalty record.
- Victim totals, stats, damage, rolls, movement, adjacency and placements on the physical board remain manual. Actor-status buttons never silently add casualties.

Newly cast Carnival games carry `carnivalSetupVersion: 1`. Their three not-placed traps and known starting Event initialize with the first durable Play observation. Existing logs and older empty-log games never backfill. The marker is not part of narrative facts or death fingerprints. Failed saves leave the UI unchanged; same-render repeated taps are guarded. Panel expansion is a local display preference only.

## UI and narrative

The Location owns the illustrated panel; Killer controls remain first and independent. Stable tile positions preserve click targets and keyboard focus. Active effects are summarized without reordering controls. Nested sections hold people/props, Events, Item Trap encounters and quick rules. Five original generated WebP assets supply scenery, six board-trap states, six Item Trap scenes, companion/object portraits and Event artwork. No card photographs appear in the UI.

Ordinary item finds establish possession at that time, not later inventory or use. Opening/ending references use the selected Location; death context uses observations at that death. Other-location fingerprints retain their shape. Mixed endings reserve space for each owner inside the existing 900-character module/1800-character total limits; static rule guidance stays within the existing request budgets. Evaluation capture continues through the existing opening/ending pipeline.

## Release and acceptance

No migration, new dependency or secret. Deploy **generate-death-scene** and **narrate-story** with the shared validator/context changes before publishing the frontend; old edge bundles reject Carnival observations. CI does not deploy the app. After deployment, verify a signed-in mixed game: starting Event, placement/cancellation/reload, Zappo loss, a trap death and saved narration. Live provider calls/deployment are separate from the automated fixture checks.

Automated acceptance covers catalog counts/isolation, source-specific quantities, all ten starting Events, legacy recovery, Event/actor lifecycles, repeatable/canceled encounters, Search penalty persistence, invalid fields, Undo, historical JSONB-stable death signatures, prompt budgets, failed local writes, rapid taps, mixed Killer/Location layouts and Rules search. Visually inspect actual artwork, labels, state changes and layout at 1366×768, 390px and 320px; controls must remain keyboard accessible, at least 44px tall, and free of horizontal overflow. Run the existing Camp/Buddyland/Geppetto browser regressions and all Reliability CI jobs before merge.
