# Hellscape import record

Hellscape is the location from the Series 3 feature film *Hell to Pay*. Existing film ID `s3-hell-to-pay` and location name are reused. Play module ID `hellscape`. Standard physical rules and components. See the paired [Razorface import](razorface.md). Baseline source is merged Razorface PR #234.

## Source coverage

| Source | Verified components | App surface |
| --- | --- | --- |
| IMG_9629 | Board. The Nexus, House of Mutilation, Sepulchre of Blood, and two other Exits. | Rules, opening, ending and Gruesome Death |
| IMG_9630–9631 | Special setup, four double-sided tiles, two dice, six tokens, movement, Panic, placement and blocked targeting. | Setup and Rules |
| IMG_9632 | Five Setup cards and ten Event cards. Each Setup adds four Victims to eight on the tiles. Compass labels use the orientation of the title on the board. | Casting and Rules, with the three role Events in Play |
| IMG_9633 | Eighteen Items, their uses, equipment requirements and effects. | Rules and location Item suggestions |
| IMG_9634–9635 | Eight Terror cards, Hellshift, and both sides of the four tiles. | Rules and applicable Terror suggestions |

The [Hell to Pay rules](https://www.rulespal.com/final-girl-hell-to-pay/rulebook) confirm setup order, matching colors after flips, and reachable-first targeting. The photographed Hellshift card supplies the exact Time values. The closest- and farthest-target fallback and the placement exception are distinct. The photos determine the card effects and the orientation of the printed Setup placements. No die probabilities or tile-space topology are assumed by the app.

## Interaction and artwork

- The physical table holds the moving maze, dice, tokens, Peon Health and card effects. The compact illustrated Rules guide shows matching-symbol flips and different-symbol swaps, including where pieces go. Hellshift has its own Rules table.
- When a Special Victim Event takes effect on the physical board, record the role once in Play. A named starting Event is offered through the same confirmation as a later draw. Record Saved, Killed or Left play directly on the role. Saved and Killed victims stay in the roster with their own portraits. Left play cases use the collapsible history. Character effects and the maze guide are available in the main Rules view.
- Saved-game recovery uses immutable, single-role observations and the shared character controls and retry path. Hero and portrait art is [documented with the shipped assets](../../src/assets/play/photos/hellscape/README.md). Artwork and static Rules are independent of the observed scene.
- Named locations, applicable cards and roles are scoped to the location. Scenario and Event lookup, Rules search, story prompts and Gruesome Death share the catalog. Ending context includes confirmed outcomes, and the Hellscape portion of a death snapshot is reconstructed as of the death even after later Undo. Games with Birds use the core redraw rule for competing Special Victim meeples.

## Verification and release

- Domain coverage checks deck counts, board names, owner boundaries, replay and historical death signatures. Browser coverage uses synthetic signed-in saves and mocked providers.
- Actual Play and Rules crops were reviewed at 1280×640, 1366×768, 1440×900, 390×844 and 320×568. The photo crops retain each person’s face and the responsive guide, actions and modal fit the viewport.
- The recovery journey records a starting Peon and later Wretch, changes Horror separately, forces a failed local write, retries, reloads, corrects and undoes the role outcome. The unrelated Horror change and physical Victim totals are preserved.
- Local checks: `npm run check` (1,127 application and 158 Edge tests), `npm run check:assets`, and `npm run build`. Browser tests cover both desktop and phone, with local mocks for signed-in generation.
- The release needs the rebuilt frontend and Edge bundles that consume shared Play validation and death/narration facts. No schema migration or private portrait reference upload is required.
- Production deploy and signed-in live generation are separate post-merge smoke checks.
- The killed-portrait follow-up verifies all three images, visibility after reload and portrait restoration on Undo. This follow-up requires a frontend build. [Desktop and phone captures](../verification/special-victims/)

The Saved-portrait follow-up adds one 16:9 photo per role and keeps Saved cases visible. Browser checks cover every Saved and Killed image, reload and Undo. [Saved desktop capture](../verification/special-victims/saved-desktop.webp) · [Saved phone capture](../verification/special-victims/saved-phone.webp)
