# Bad Times at Buddyland: Play mode

This extends the functional Play mode foundation with optional Billy and Buddyland observations. The visual redesign remains a separate pass. Cards are factual paraphrases of owner-supplied photographs, not reproductions of card artwork or flavor text.

## Included

- Seven named Buddies with printed Health, Attack, Movement, Initiative, abilities and kill rewards. Record Health, status, whether they share Billy's space, location and whether they await the next Killer phase. Zero Health does not automatically declare a defeat.
- Five individually tracked Power Sources, their locations, and an explicit starting-setup shortcut. No automatic healing, Time expenditure or activation occurs.
- Four Finales, four Dark Powers and two Minor Dark Powers. Minor powers have separate Health tracking; reaching zero does not silently remove a power. Power Surge distinguishes Billy from Boris and explains that both must be defeated.
- Six optional notes for revealed Bloodlust tokens. Facedown tokens remain unknown.
- Nineteen distinct Terror names, representing 22 photographed copies: eight Location cards and eleven Billy names, including three pairs of repeated cards. Record a draw and view its effect without fabricating its outcome.
- Ten Events, three Special Victims, and the Tragic Collapse/Broken token location. Event and Special Victim status notes do not change the main saved/killed counters.
- Sixteen Items, their rules references, limited-use tracking and relevant token-location notes. Skee-Balls remain unloaded until the player records loading them in an Arcade space.
- Rena/Gwynn save-reward and ultimate references. Use the existing structured moments to record unlocking/using an ultimate; rewards stay on the physical board.
- Named attacker, Special Victim, room, mechanism and card suggestions in death details. Selecting a card provides a researched effect; it never applies the effect or invents extra deaths.

Billy's mechanics follow Billy to other Locations. Buddyland Events, Items, hazards and rooms follow the Location when another Killer visits. Character references follow the selected Final Girl. Nothing automatically fills the Buddy roster or reveals hidden cards.

## Persistence and AI context

Module observations are validated immutable `module` entries in the existing shared play log. Multi-field changes, such as adding a Buddy with its printed Health, are one event. Undo and restore work through the existing timeline. Session recovery, cloud compare-and-swap, offline queues and saved scrapbook/history logs carry the same observations without a new database table.

Text fields have independent durable drafts in the existing `playDrafts` map. Blur commits a completed observation; finishing flushes remaining drafts before taking the final snapshot. A complete-roster checkbox distinguishes a confirmed zero Buddies from an incomplete or unused tracker. Ending review prefills only confirmed roster counts, recorded Finale/Boris status, and known source states.

Death facts include only applicable module observations at the time of that death. Future changes do not invalidate an earlier scene. Undoing a prior observation or correcting the death's facts can change its signature. Records without module context retain their prior identity. Nearby Buddies, inventory and recent card draws do not prove a death's attacker or mechanism. Explicit death details supply that evidence. Ending summaries reserve space for meaningful moments and a bounded module summary.

The existing generator, manual Generate control, three-take limit and narration cache remain in place. This is a play aid, not automated rules resolution or a digital board simulation.

## Sources

| Photograph supplied October 18, 2026 | Used for |
| --- | --- |
| IMG_9308.jpg | Rena/Gwynn fronts; Endless Power, Deathlust, Introducing... Billy Jr., Merciless Minions; four Finales |
| IMG_9309.jpg | All photographed Terror cards and both Minor Dark Powers |
| IMG_9311.jpg | All ten Events, including the corrected Sing-A-Long instruction to draw a Terror card during Upkeep |
| IMG_9312.jpg | All sixteen Item names, effects and visible use markers |
| IMG_9313.jpg | All seven Buddy cards |

Earlier owner-supplied character reverse sides, biographies and Setup photos remain documented in [BUDDYLAND.md](BUDDYLAND.md). The existing Billy/Buddyland rules sheets supply the starting setup, source behavior and activation/reward timing. The [published core rulebook's icon reference](https://cdn.svc.asmodee.net/production-asmodeeca/uploads/2025/10/Final-Girl-Rules.pdf) supports shared icon terminology.

Original photographs are retained outside the repository. Card source labels in the app identify the corresponding owner photo; they are not broken web links.

## Remaining evidence gaps

The five new photographs do not show Billy's board, the individual Bloodlust token faces, or the full Location board. Therefore the app does not claim exact token effects, threshold-to-token mapping, map adjacency, printed panic arrows, or setup coordinates. Use the token-note and free-text location controls with the physical board. The four Arcade spaces are described by the existing source-backed rules; arbitrary player labels are not treated as official space names.

One board photo and a photo of all token faces would close those reference gaps. They do not block using these trackers or the next UI pass. Additional token-specific shortcuts should wait for that evidence.

## Release and validation

Deploy `generate-death-scene` and `narrate-story` with the frontend: both consume the shared log validation and death signature schema. No database migration is needed. The existing ending endpoint accepts the bounded summary through its current request schema.

Coverage includes invalid module payloads, unknown versus zero, undo/restore, source and Buddy state at the time of death, card filtering in mixed games, item use recovery, durable unfinished drafts, ending prefill, and desktop/mobile layout overflow checks. Browser tests mock backend and generation services; they do not spend production credits.
