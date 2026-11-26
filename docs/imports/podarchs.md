# Terror From Beyond — the Podarchs and Joan

## Scope and starting point

Planning record, November 26, 2026. Add one Series 4 vignette to Collection, the Podarchs to killer selection, and Joan to Final Girl selection. Use the player's chosen location. Proposed IDs are `s4-terror-from-beyond` for the film and `podarchs` for the killer module. The current checkout has no catalog entry for this vignette or either character. The other three vignettes establish ownership and casting behavior in `src/types/gameData.ts`. The generic fallback in `src/data/killerHealth.ts` would give an unknown killer 9 HP. The Podarchs require explicit handling there and in Finish. [Publisher's Series 4 listing](https://vanrydergames.com/products/final-girl-terror-from-beyond-vignette)

## Source ledger

Use the five user-supplied JPEGs as evidence for standard play. Filenames below follow attachment order. Retain the design and artwork credits printed on the booklet. Use the original artwork as a visual reference.

| Photo | Coverage | Evidence to check during transcription |
| --- | --- | --- |
| IMG_9646.jpeg | Booklet front, component counts, setup, ordered Evolution steps, assimilation, spawn and Bloodlust rules | Two Bloodlust cards, five reversible Plant/Pod tokens, twelve Assimilated tokens and one Greenhouse token. The booklet sets the limits for physical placement and assimilation. |
| IMG_9647.jpeg | Docile and Hostile behavior, worked examples, Minor Powers, persuasion, victory and Finale timing | Follow the distinct timing of the end-of-Killer-phase check and the Upkeep reveal. |
| IMG_9648.jpeg | Bloodlust track, both Persuade copies, Docile reference, Plants & Pods, three Dark Powers, three Finales and their six companion rules cards, Joan's starting face | Use this assembled track as supplied. Read from the start circle upwards, count the seam once, and transcribe the movement, attack, Dark Power, Hostile and overflow markings against the icon key. Check Joan's four rescue choices and individual card icons against the core icon key. |
| IMG_9649.jpeg | Hostile reference, pre-reveal Minion action and Joan's Ultimate face | Both Joan faces show 5 Health. Use the printed Weak Attack result symbol, once-per-Action-phase timing and additional rescue reward. |
| IMG_9650.jpeg | All 16 Terror-deck cards | Fourteen ordinary cards across five titles, plus one each of Targeted Growth and Sense of Urgency. Preserve the physical copy counts and conditional redraws. |

The ordinary cards are **Someone Sent Me Flowers!** ×3, **You're Evolving Into a New Lifeform!** ×2, **A Mutation of Some Kind!** ×2, **Something Evil Has Possessed This Town!** ×3 and **People Are Becoming Less Human!** ×4. The three primary Powers are **Hunted by the Mob**, **Obstinate Victims** and **Mass Hysteria**. Pair each Finale with its two matching rules cards by the printed colored diamonds. A source cover is available to check through the publisher listing. Joan's personal item and a full biography are outside the supplied evidence.

## Review decisions

| Finding | Impact and correction |
| --- | --- |
| The first draft gave players separate controls for placement, flipping, cleanup, spawning, persuasion and assimilation. | Any skipped tap would make the apparent board counts unreliable. Keep the board authoritative. Give the invasion an optional illustrated story moment and use the existing Bloodlust tracker to show the threat changing. A whole round can pass with zero Podarch entries. |
| Generic Health comes from two paths. Play defaults to 10 and the catalog used by Finish defaults to 9. Play also offers a generic killer revival. | Suppress those defaults and actions for this owner across fresh setup, Play, Finish and generated context. Reserve Health for the particular Finale objective that has it. |
| The first draft left some outcome logic implicit. | A full token pool by itself is legal. Loss occurs when another Victim must be assimilated and all twelve tokens are in use. Destroying the Greenhouse opens a separate escape objective. Neither event can be inferred from optional logs. Accept the player's reported result even if they recorded no prior turns. |
| Eight card images and a portrait would leave gaps on the surfaces players actually see. | Specify Joan's healthy and critical photos, casting and opening identity, the threat across its states, and the Finale objective changes. Use existing Rules and Play surfaces to show them. |
| Event selection currently depends only on location. | Filter using the selected killer and verified Event identities before casting and in active Play suggestions. A changed killer can invalidate an already-selected starting Event. Preserve unaffected choices and historical records. |

## Execution plan

### 1. Register the cast and transcribe the reference set

Use the existing vignette pattern in `src/types/gameData.ts`, the film details and Collection art manifest. Ownership unlocks one killer choice and one Final Girl. Joan works against other killers and the Podarchs can appear with another Final Girl at any supported location. Show “Your choice” for the location. Preserve the player's chosen cover/portrait preference.

Add Joan to the shared Final Girl references and new-game Health snapshot. Both sides show 5 Health. Her four rescue choices are move one space, take a top Item, gain two Time, and reduce Horror. The additional rescue reward reduces Horror. Her Ultimate permits treating the printed failure result on Weak Attack as one star. Once per Action phase she may also resolve Weak Attack as though played from hand. Use the existing Ultimate reveal and dossier. The personal-item disclosure stays on its existing private path. Use only supported biographical details.

Build the killer's shared card catalog under `supabase/functions/_shared/play/`. Transcribe the two track faces as arranged in IMG_9648 and compare the Docile/Hostile transition with the worked examples in IMG_9647. Save a row-by-row table in the import record during transcription, including the cap, overflow instruction, movement/attack values, entry icons and the Dark Power reveal within the Docile section. Use it in Rules and the existing Bloodlust tracker. Include the three primary Powers, three Finales with both rules cards each, both healthless Minor Powers, both Persuade copies, both reference sides, and the pre-reveal Minion action. Record the Terror quantities above once. The physical cards supply redraws and exceptions, including the Terror that explicitly activates its newly Assimilated figure.

Searchable Rules carry setup and timing. Start with Horror 4, Bloodlust at the start, Docile behavior, one Assimilated in the killer start space and one Plant with the farthest Victim. Explain Persuade prerequisites, its success/failure results and the reusable Special Victim meeples. Cover enemy/minion distinctions, legal attacks and spillover, skipped targets, the closest active Assimilated, panic exceptions, and the printed green Bloodlust icon. Docile Assimilated may die from location damage. Hostile Assimilated sharing the Final Girl's space attack her even if they had targeted a Victim. Ordinary Victim deaths and red Bloodlust icons do not advance this track. Killing an Assimilated does.

Evolution belongs between Planning and Killer. Check the Final Girl alone with a Pod first (no Victims there, immediate loss, bypass Final Health), return abandoned tokens, assimilate one Victim per remaining Pod, then flip remaining Plants. Evolution-created Assimilated skip the first Minion Action of that Killer phase. Distinguish the five-token no-placement rule from required assimilation with no free Assimilated token. Explain both pre-Finale checks at the end of the Killer phase and the subsequent Upkeep reveal if the Terror deck has run out.

### 2. Build the smallest useful Play panel

Start with the Hostile transition and one optional assimilation moment. Fit both into a populated Play screen before producing the remaining photos. Keep the following interaction budget throughout implementation.

| What the player wants | Interaction and smallest durable fact |
| --- | --- |
| See when the crowd turns dangerous | Add a Docile/Hostile label and matching photo to the owner banner, driven by recorded Bloodlust and its verified transition. Use shared Bloodlust controls for green-icon increases or killed Assimilated. Use track history for the transition and Undo for a mistaken crossing. An unknown track must stay visibly unknown. Opening the panel writes nothing. |
| Remember someone being replaced | One optional “Victim assimilated” action. A single tap records that moment; subsequent Undo uses the common log. No room, name, turn, meeple color or token count is required. It changes neither victim total nor Bloodlust, triggers no death scene and establishes no current count. A direct spawn does not establish a victim's assimilation. |
| Record a rescue, a real casualty or Joan's reveal | Use the existing saved/killed and Ultimate entries. Saving a Victim is sufficient evidence of the rescue; prior persuasion entries are unnecessary. Offer the applicable Minor removal with the save when relevant and let the player identify their choice if several are active. One rescue can retire at most one Minor. A correction cannot apply that benefit twice. |
| See which Power or Finale matters now | Share the existing chooser between Remember This and the killer panel. Support a reveal with the name unknown, quiet name corrections, both healthless Minor Powers simultaneously, and their removal on Finale reveal. Apply the printed removal rules to applicable location Minor Powers too, including their lack of Health markers here. |
| Follow the current objective | Only a named Finale supplies the relevant objective control below. Keep physical movement, targeting, dice, token pools, round-by-round Evolution and setup placement in Rules and on the table. Next round never advances a countdown, resolves Evolution or declares an outcome on its own. |

The screenshot pilot passes when the posture is clear collapsed, a player can record assimilation in one tap from the open panel, and a routine Evolution with no memorable event requires no interaction. Review those cases by playing through them. Do not promote a read-only illustration into an extra button.

### 3. Handle Finale stakes and Finish

| Branch | What the player can report |
| --- | --- |
| Before the reveal | Victory when no Plants, Pods or Assimilated remain at the end of the Killer phase. If no Victims remain at phase end, discard the remaining Terror cards and reveal during Upkeep as applicable. |
| Luxuriant Growth | Greenhouse Health, starting at six. At zero switch the objective to escaping at an exit without an Assimilated in that space. Finish records the escape. Describe the placement, spawn trigger and damage restriction in Rules. |
| Born Again | Use the printed six-to-zero Countdown as the sole numeric objective. Show the printed Pod-destruction goal. Offer the distinct countdown and Pod-proximity loss reasons with their printed phase timing. The player can report victory directly without entering a history of Pods destroyed. |
| You're Next! | Show the Leader as the killer for this Finale. Track its own normal Health and Final Health, using existing Health patterns. Record its defeat after Final Health is resolved. Rules carry placement, the Leader's separate action and its use of the Bloodlust stats. |
| Any branch | Permit a reported loss with its actual cause, including Final Girl assimilation and exhaustion of the Assimilated supply. An unnamed Finale or incomplete log may leave the detailed cause unknown. A correction to a card name must not reuse another objective's Health, countdown or outcome. |

Inspect `src/lib/play/defaults.ts`, `src/hooks/useActiveGame.ts`, `src/components/play/PlayScreen.tsx`, `src/components/GameOutcomeForm.tsx`, ending and scrapbook readers. Keep generic killer Health and revival out of this cast. Seed verified setup at the fresh-session write boundary only. Use the existing event/reducer and retry contracts for linked effects. Enforce owner validity in the shared validators. An explicit rescue, named reveal or confirmed Finish remains a single player decision even if it has multiple persisted consequences.

### 4. Integrate mixed casting, story and photography

Use a single killer-aware eligibility check for Events with Special Victim meeples in the location's supplied card data. Apply it in the casting dropdown, when the killer changes before starting, and in location/Event suggestions during the game. Preserve compatible special *rules* and setup cards. A keyword in an Event title or descriptive reference to a Victim is insufficient evidence to exclude it. Keep the complete location deck visible in searchable Rules and give the vignette's setup instruction for physical decks or incompletely documented locations.

Opening, Gruesome Death, narration, ending and scrapbook use the selected people/location and observations available at the relevant time. Introduce the threat through the ordinary-looking Assimilated. A recorded assimilation can appear in the story without adding a casualty. Test the existing generic killer-attacker fallback so an ordinary location death does not become a Podarch murder. Keep decorative imagery out of the story facts, and keep historical facts and cache keys stable for unrelated games.

| Photo set | Direction and use |
| --- | --- |
| Collection, casting and Joan | One distinctive invasion scene, the publisher cover, a Podarch identity and Joan's card-informed portrait. Develop healthy and critically exhausted variants from the same Joan master for the Play Health strip. Preserve her dark hair, red turtleneck, face and necklace across crops. Add the reviewed opening identity reference through the existing private object/digest path. |
| Plants, Pods and Assimilated | Photograph a practical Plant and a mature Pod in recognizably different states. Show an ordinary-looking person Docile and the same person Hostile through posture, expression and framing. Use a wide owner banner with title space, an assimilation still on the optional moment, and relevant existing Rules/reference surfaces for close details. Keep scenery neutral enough to work with the selected location. |
| Powers, Terror and objectives | Compose distinct stills for each of the three Powers, two Minors and three Finales. Use small derivatives for dim choices and wide vivid art for named reveals. Give the five distinct Terror titles source-specific imagery where displayed, reusing art across physical copies. Show intact and destroyed Greenhouse, the Countdown stakes and a recognizable Leader. Reuse the established numeric and Final Health treatments. |
| Delivery | Follow the approved candid consumer-camera treatment and the Organism asset manifest as a sizing precedent. Start with a 1152×480 banner, 960×540 card heroes and 288×162 choices. Export optimized WebPs for their actual slots and document provenance, cropped focal points and byte budgets. Review identity, hands, practical materials, negative space for labels, and full-size and shallow phone crops. Preserve the shared Bloodlust artwork and established ending poster medium. |

### Completion criteria

1. **Source fidelity.** Reconcile the physical deck from the five photos. Compare the Bloodlust table with every visible row and the behavior examples. Verify Joan's reward icons and both Weak Attack clauses, the three paired Finale objectives, each win/loss timing and the two different token-supply rules. Track any remaining uncertainty at the level of the individual symbol or card. IMG_9648 is sufficient to proceed.
2. **A table-side playthrough.** Run a fresh game through one quiet Evolution, one optional assimilation, a rescue, crossing to Hostile and a named Finale. Demonstrate zero required entries for the quiet round, one entry for assimilation, the correct saved/killed totals and the posture change without another toggle. Repeat Finish from a sparse log. Neither route needs a reconstructed board.
3. **Rules and recovery.** Exercise the final available token versus the next required assimilation, each pre-Finale and named Finale outcome, zero Greenhouse Health before escape, zero Leader Health before Final Health, and a countdown at zero before the loss check. Cover both reveal entry points, unknown-name correction, Minor removals, Undo/reload, rejected save/retry and duplicate taps. No panel, reference view or artwork load creates gameplay events.
4. **Mixed casts and historical output.** Use the Podarchs with Joan and with another Final Girl, two locations exercising incompatible Events and location Minor Powers, and Joan with an ordinary killer. Switch killers with a selected Event during casting. Verify legal suggestions, owner-gated observations, correct artwork and historical story context. Check an older session with unknown state, a saved death/cache and an unrelated completed game.
5. **Visual and release evidence.** Compare the pilot and then the complete populated module with the approved Groves references. Inspect every new photo in its served crop, the Collection card, Joan's dossier and Health strip, collapsed and expanded Play, reveal choices and each named objective. Use 1280×640, 1366×768, 1440×900, 320×568 and 390×844, including keyboard focus, reduced motion, loaded images and reachable 44px targets. Run relevant domain, shared, edge and browser tests plus `npm run check`, `npm run check:assets` and `npm run build`. Record CI and actual visual findings. List affected functions and private identity object/digest from the final diff, verify compatible backend readers before frontend release, and distinguish mocked generation from a live signed-in smoke test.

The revised plan is ready for implementation. No code, runtime artwork or deployment has been changed by this review.
