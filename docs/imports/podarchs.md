# Terror From Beyond

Series 4 vignette, film ID `s4-terror-from-beyond`. Collection ownership adds the Podarchs and Joan independently. The location comes from the rest of the player’s collection.

## Source ledger

Standard-mode references supplied by the owner. The booklet credits Mike Martins for design and Agnieszka Dąbrowiecka for art.

| Photo | Coverage | Physical evidence |
| --- | --- | --- |
| IMG_9646.jpeg | Booklet front, component counts, setup, ordered Evolution steps, assimilation, spawn and Bloodlust rules | Two Bloodlust cards, five reversible Plant/Pod tokens, twelve Assimilated tokens and one Greenhouse token. The booklet sets the limits for physical placement and assimilation. |
| IMG_9647.jpeg | Docile and Hostile behavior, worked examples, Minor Powers, persuasion, victory and Finale timing | Follow the distinct timing of the end-of-Killer-phase check and the Upkeep reveal. |
| IMG_9648.jpeg | Bloodlust track, both Persuade copies, Docile reference, Plants & Pods, three Dark Powers, three Finales and their six companion rules cards, Joan's starting face | Use this assembled track as supplied. Read from the start circle upwards, count the seam once, and transcribe the movement, attack, Dark Power, Hostile and overflow markings against the icon key. Check Joan's four rescue choices and individual card icons against the core icon key. |
| IMG_9649.jpeg | Hostile reference, pre-reveal Minion action and Joan's Ultimate face | Both Joan faces show 5 Health. Use the printed Weak Attack result symbol, once-per-Action-phase timing and additional rescue reward. |
| IMG_9650.jpeg | All 16 Terror-deck cards | Fourteen ordinary cards across five titles, plus one each of Targeted Growth and Sense of Urgency. Preserve the physical copy counts and conditional redraws. |

The ordinary cards are **Someone Sent Me Flowers!** ×3, **You're Evolving Into a New Lifeform!** ×2, **A Mutation of Some Kind!** ×2, **Something Evil Has Possessed This Town!** ×3 and **People Are Becoming Less Human!** ×4. The three primary Powers are **Hunted by the Mob**, **Obstinate Victims** and **Mass Hysteria**. Pair each Finale with its two matching rules cards by the printed colored diamonds.  Joan's personal item and a full biography are outside the supplied evidence.

## Printed track and Finale checks

| Level | Attitude | Move | Attack | On entry |
| --- | --- | --- | --- | --- |
| 0 | Docile | 1 | — | Start, Horror 4 |
| 1–2 | Docile | 1 | — | |
| 3 | Docile | 1 | — | Dark Power |
| 4 | Hostile | 1 | 1 | Increase Horror |
| 5 | Hostile | 1 | 1 | |
| 6 | Hostile | 1 | 1 | Increase Horror |
| 7 | Hostile | 1 | 1 | |
| 8 | Hostile | 2 | 1 | Increase Horror |
| 9 | Hostile | 2 | 2 | |
| 10 | Hostile | 2 | 3 | Increase Horror. Further Bloodlust discards the next Terror card. |

The joined track in IMG_9648 establishes the Hostile boundary. Ordinary Victim deaths and red icons have no Bloodlust effect. A green icon or a killed Assimilated raises it. An attempt to place a sixth Plant/Pod does nothing. An attempt at a required assimilation when all twelve Assimilated tokens are in use loses the game.

| Stage | Trigger and objective |
| --- | --- |
| Before reveal | At the end of the Killer phase, clearing all Plants, Pods and Assimilated wins. If no Victims remain, discard the remaining Terror deck. The reveal occurs in Upkeep. |
| Luxuriant Growth | Six Greenhouse Health. Destroy it, then reach an exit without an Assimilated there. Each attack triggers a spawn even if the attack destroys the Greenhouse. |
| Born Again | Place all five Pods from a new Setup in the printed priority. Destroy all Pods to win. At **end of Killer phase** decrease the Countdown and spawn at the furthest Pod. At **start of Killer phase** lose on zero or on sharing a space with a Pod, even with Victims there. |
| You’re Next! | New Setup places the Leader at the Killer start. Five Health and a separate Final Health token. The Leader uses its own action. Defeating it wins. |

Joan has five Health on both faces. Her four rescue rewards are move one space, take any top Item, gain two Time, or lower Horror. Her Ultimate allows a Weak Attack failure to be treated as one star and a once-per-Action-phase Weak Attack as if played from hand. Further saves lower Horror. The dossier uses the letter in the booklet. The supplied set does not establish a personal item.

## Table and app responsibilities

- **Play.** A round of movement, planting, Evolution and persuasion requires no Podarch input. The existing Bloodlust track determines the banner. An old log can leave that value unknown. The optional illustrated assimilation records a replacement. It adds no death, save or Bloodlust and does not represent a direct spawn.
- **Rescues and reveals.** A single ordinary save can retire one active Minor. When two are active, the player chooses which one. The saved victim and discard share one reversible observation. Finale reveal retires active Minors, including the compatible location Minors Slippery and Twisted Bond. Both card entry points use the same permanent reveal and correction history.
- **Objectives.** Named Finales expose their own control. Advancing rounds does not move the Countdown or preempt a physical result. A destroyed Greenhouse displays the escape condition. The Leader has its own Final Health. Finish accepts a reported result from a sparse log and filters detailed endings for a known Finale.
- **Mixed casting.** Known Special Victim Events are removed from casting and card suggestions. Event-based characters are suppressed in location controls. Setup people, ordinary Victims and other compatible location objectives remain available. The booklet supplies the redraw instruction for locations outside the documented cards.
- **Stories.** The selected killer and location supply guidance separately. Assimilation is an observed replacement. An unrelated casualty retains its reported cause and historical context. Documentary art never establishes a death. The scrapbook uses the confirmed result and its highlights.

## Artwork and verification

The Play catalog includes 19 photographic scenes and eight small chooser derivatives. Collection and casting have the film scene, illustrated alternate cover, cast portraits and shelf thumbnails. Joan’s Health strip has two additional expressions from the same photographic session. See the [art ledger](../../src/assets/play/photos/podarchs/README.md). The publisher listing identifies the release. The supplied photos contain no box front. The Collection uses the existing alternate-cover fallback. [Publisher listing](https://vanrydergames.com/products/final-girl-terror-from-beyond-vignette)

The focused Playwright journeys cover opening Joan’s dossier, reading the rules in a mixed cast without writing a log, optional assimilation, the Hostile threshold, both Minors, a rescue, card selection, named Finale correction, Greenhouse Health and escape, Countdown and Leader Final Health, and reload. The first screenshot review showed oversized objective hearts and an oversized assimilation photograph. Both now use bounded sizes. Browser services are mocked. Unit coverage includes sparse and named Finish choices, Undo, owner validation, quantities and source-specific Event compatibility.

## Release dependencies

Deploy compatible shared Play readers in `generate-ending`, `generate-death-scene` and `narrate-story`, and the revised opening renderer in `generate-scene-image`, with the frontend. The reviewed private object is `opening-references/joan.jpg`, SHA-256 `64a58d91b34cc6354feffb650b1f7c623ab711112c9a5326a4c3931bfcb19e49`. Exact bytes are staged in `supabase/reference-assets/joan.jpg`. Verify the private object before enabling the updated renderer. Production deployment, a signed-in smoke test and live provider generation are separate release checks.
