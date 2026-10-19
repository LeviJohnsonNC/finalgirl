# Bad Times at Buddyland: Play mode

This extends the functional Play mode foundation with optional Billy and Buddyland observations. The cinematic dashboard presents these controls in optional expandable panels. Cards are factual paraphrases of owner-supplied photographs, not reproductions of card artwork or flavor text.

## Streamlined Play controls

The main counters are Round, Victims saved, then Victims killed. Health, Horror and Bloodlust stay opt-in. Selectable name lists are alphabetized; timeline entries remain chronological and the portrait state cycle has a fixed logical order.

- Billy has seven always-visible portrait buttons, alphabetized by name. Each cycles Off → In play → Killed → Off. No Health, room, activation, protection or roster-completeness controls remain.
- Buddyland has three Special Victim portrait buttons: Birthday Girl, Nick the Janitor, Pizza Guy. They cycle Off → In play → Dead → Off. They do not change main totals or open death details.
- Power Sources, Billy status, revealed-power panels, drawn Events, Tragic Collapse and Item tracking are removed from active Play controls. Their verified catalogs remain available to rules and cause-specific death details.
- Remember this contains eight alphabetized moments: Back from the dead, Dark Power, Finale, Found a weapon or key item, Other moment, Second wind, Ultimate unlocked, Ultimate used. Narrow escape and Turned the tables are no longer offered; older records remain readable and editable in the timeline.
- Dark Power and Finale record immediately, even without a named card. Billy's six verified powers and four Finales appear in an optional themed dropdown. Selection commits immediately; a separate optional note has a durable draft. Other killers can record unnamed reveals and notes, but do not receive Billy's catalog.
- Rena/Gwynn save-reward and ultimate references remain available. Rewards are resolved on the physical board.

Off means untracked, not proof that a character is absent or never appeared. A partial portrait roster therefore does not prefill a complete ending count; the ending review still allows the player to enter one. Recorded Boris status and named Finale moments prefill the applicable review fields.

## Persistence and AI context

Portrait changes are one immutable module observation per tap. Existing Undo, restore, local recovery, cloud compare-and-swap, offline queues and scrapbook history carry these observations. Existing detailed records are accepted without rewriting them on load. Changing a legacy Buddy portrait clears superseded Health/location/activation/protection values from its current state and invalidates any old complete-roster assertion; original observations remain in history. Old saved/away Special Victim observations appear Off because those statuses are not part of the new cycle, and remain saved until the player changes that portrait.

The shared event validator accepts the new dark-power and finale moment types and the optional killerCard detail. Corrected selections, removed moments and restored moments are reduced before deriving module context. A power reveal is explicitly represented as revealed, not proof the power is still active. Finale names feed existing Billy rules context. Later reveals do not affect an earlier death; old logs without these new fields retain their existing death signatures.

Character deaths also remain eligible as meaningful ending beats even if their portrait is subsequently turned Off. Generic counters remain the authority for recorded totals. No rule effects or extra deaths are applied automatically.

## Artwork

Thirty-two static optimized WebP files live in src/assets/play/roster/: ten characters with individual shadow, active and killed/dead treatments, plus two general reveal-moment images. Buddy designs are based on the supplied IMG_9313 character identities; human victim images are original interpretations of the supplied roles, not claims about official portraits. Birthday Girl's dead state uses an abandoned party hat and present, with no depicted injury. The artwork contains no embedded names or state labels. Live HTML labels, keyboard controls and visible status markers remain usable independently of imagery. Portraits load lazily and inactive-state art is not downloaded until it is displayed.

## Review previews

| Surface | Desktop | Phone |
| --- | --- | --- |
| Play dashboard | [Desktop](images/play-streamlined-desktop.jpg) | [Phone](images/play-streamlined-mobile.jpg) |
| Character states | [Desktop](images/play-roster-desktop.jpg) | [Phone](images/play-roster-mobile.jpg) |
| Finale selection | [Desktop](images/play-reveal-desktop.jpg) | [Phone](images/play-reveal-mobile.jpg) |

## Sources

| Photograph supplied October 18, 2026 | Used for                                                                                               |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| IMG_9308.jpg                         | Rena/Gwynn fronts; Endless Power, Deathlust, Introducing... Billy Jr., Merciless Minions; four Finales |
| IMG_9309.jpg                         | All photographed Terror cards and both Minor Dark Powers                                               |
| IMG_9311.jpg                         | All ten Events, including the corrected Sing-A-Long instruction to draw a Terror card during Upkeep    |
| IMG_9312.jpg                         | All sixteen Item names, effects and visible use markers                                                |
| IMG_9313.jpg                         | All seven Buddy cards                                                                                  |

Earlier owner-supplied character reverse sides, biographies and Setup photos remain documented in [BUDDYLAND.md](BUDDYLAND.md). The existing Billy/Buddyland rules sheets supply the starting setup, source behavior and activation/reward timing. The [published core rulebook's icon reference](https://cdn.svc.asmodee.net/production-asmodeeca/uploads/2025/10/Final-Girl-Rules.pdf) supports shared icon terminology.

Original photographs are retained outside the repository. Internal card source labels identify the corresponding owner photo; these labels are not displayed beneath selected options.

## Remaining evidence gaps

The five new photographs do not show Billy's board, the individual Bloodlust token faces, or the full Location board. Therefore the app does not claim exact token effects, threshold-to-token mapping, map adjacency, printed panic arrows, or setup coordinates. Consult the physical board for token effects and positions. Previously recorded token notes remain saved. The four Arcade spaces are described by the existing source-backed rules; arbitrary player labels are not treated as official space names.

One board photo and a photo of all token faces would close those reference gaps. They do not block using these trackers or the next UI pass. Additional token-specific shortcuts should wait for that evidence.

## Release and validation

Deploy `generate-death-scene` and `narrate-story` with the frontend: both consume the shared log validation and death signature schema. No database migration is needed. The existing ending endpoint accepts the bounded summary through its current request schema.

Coverage includes all ten portrait cycles and distinct image files, keyboard activation, unchanged main totals, Undo/reload, legacy detailed logs and retired moments, alphabetical menus, optional/corrected reveal selection, unfinished notes, mixed killer/location applicability, death context and ending prefill, and desktop/mobile overflow. Browser and edge tests mock providers and do not spend production generation credits.

Local validation: 245 unit tests, 55 edge adapter tests, and all 190 desktop/mobile browser checks passed. Production build, native Deno checks for generate-death-scene and narrate-story, and validation of 224 artwork assets passed. Lint has no errors and the nine existing refresh warnings. The final alphabetical death-cause adjustment is also checked in the focused Play/modal suite.
