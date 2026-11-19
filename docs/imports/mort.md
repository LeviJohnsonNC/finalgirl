# Mort the Teenage Dirtbag import

## Scope and evidence

Mort is the killer from *Shriek* (`s4-shriek`). His Play owner is `mort`. The existing film, Final Girls, and casting entry are retained. MegaBGCon remains a separate location. The approved [module standard](../MODULE_STANDARD.md) governs the shared controls. The portrait lineup and the linked confirmation workflow are Mort-specific.

| Source | Coverage | Use |
| --- | --- | --- |
| IMG_9593.jpeg | Killer board and eight Bloodlust advances | Starting Horror 3, unrevealed Health, Attack and Movement, Dark Power at 4, Terror discard at 5, Horror rise at 6, token at 8 and printed overflow |
| IMG_9594.jpeg | Component checklist | Reconciles ten Suspects, sixteen Terror cards, two Actions and one Basic Finale |
| IMG_9595.jpeg–IMG_9597.jpeg | Shared setup and rules for clues, Informants, temporary killers, and required reveals | Timings, physical cleanup, Minor Power exceptions and the worked Comedy Horror exclusion |
| IMG_9598.jpeg | Basic Finale, three regular Dark Powers and one Epic | Power chooser, investigation effects and pre-reveal action |
| IMG_9599.jpeg | Interrogate and Coerce and all 16 Terror faces | Search and reference data, thirteen regular copies (nine titles) and three Minor Dark Powers |
| IMG_9600.jpeg | All ten Suspect fronts | Seventy verified trait values |
| IMG_9601.jpeg | All ten Suspect backs | Disguise action, starting Health and unconditional, clue-scaled and recurring Finale effects |

The seventeen double-sided clue cards and the sealed secret envelope were intentionally left on the tabletop. The source ledger stores filenames and factual paraphrases.

## Mechanics and app ownership

- A fresh session observes the printed base trackers on the first durable Play write. Older sessions can record the physical lineup, clue numbers, bag discards and Informants without rewriting their older log.
- Either clue entry method commits one replayable observation. If a suspect was independently ruled out, a later clue can attach that exclusion without creating a second Informant. A saved or killed Informant changes the normal victim total, while Coerce changes only the on-board Informant count.
- An eliminated suspect's token is still drawable until actually discarded. Eligible tokens become the temporary Active Killer for one resolution and are explicitly returned. Both Play entry points require the player to confirm the tabletop reveal. The linked log keeps linked observations and Undo ordered.
- The shared tracker accepts the Ratchet Lady disguise's 26 Health when Anonymous Terror doubles five missing clues. The app computes known track and Finale effects and provides explicit prompts for Time, Terror cards, dice, targeting and other physical actions.
- Mort's Minors are independent of Location ownership. Slippery and Twisted Bond use a Health-free observation while Mort is disguised. The Finale clears that observation together with Mort's Minors while unrelated location controls remain in place.
- Rules and card suggestions use the photographed effects. The closing form uses the logged disguise where present and keeps older manual records readable. The generated ending and new historical death facts use the pertinent observation, with the selected Final Girl identity and location passed through the existing contracts. A temporary draw or the last visible suspect does not identify the disguise in narration.
- The [artwork manifest](../../src/assets/play/photos/mort/README.md) maps ten neutral suspect portraits, ten temporary Active Killer portraits, ten Finale photographs, seven power images and one banner. The game artwork remains separate from the licensed printed components.

## Verification and release

Mort-specific unit tests cover both revelation routes for every disguise, event replay, trait matching, doubles, Informant outcomes, ownership, Minor Power cleanup and historical death facts. The browser scenarios exercise the five-clue investigation with save failure and retry, real asset loading, the early mixed-location Finale at 26 Health, and the outcome handoff. They use test sessions and mocked generation.

The shared edge changes reach ending/story/scene validation and historical death facts. Deploy the corresponding edge functions with the frontend so the 26-Health ending request and new Play records are understood at both ends. No SQL migration or new private image reference is required for these Play photographs.


## Active Killer portrait follow-up

Each temporary Active Killer gets a new portrait in the existing lineup tile. The shot retains the suspect’s identifying costume and uses posture, distance and practical side light to distinguish the temporary state. Returning the token or undoing the draw restores the neutral portrait. The browser journey exercises all ten draws, a reload with an active token and Undo and the return to the lineup portraits. The 1280px laptop and 320px phone captures cover all ten crops and keep the Active Killer label below the image. The update ships with the frontend.
