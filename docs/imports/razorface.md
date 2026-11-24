# Razorface, Kenzie and Christie

Scope is the killer side of Series 3 *Hell to Pay* and both Final Girl dossiers. Keep the existing film ID and Hellscape casting option. A Hellscape location module, extra promotional cards and unrevealed personal-item identities are outside this import.

## Evidence and catalog

| Evidence | Reconciled content |
| --- | --- |
| IMG_9623 | Killer board with 9 Health, Horror 5 and nine Bloodlust positions including the separate bottom position |
| IMG_9624–9625 | Component counts and three opening Afflictions, Action-phase purge, impossible replacement, required-draw loss and the Final Health restriction |
| IMG_9626 | Three Finales, three regular Dark Powers, one Epic Dark Power |
| IMG_9627 | All eight Afflictions, standard pre-Finale action and both Ultimate sides |
| IMG_9628 | Fourteen regular Terror cards, two healthless Minor Dark Powers and both starting faces |
| [Publisher core icon reference](https://vanrydergames.com/collections/final-girl-series-3) | Red X ends the Action phase. The mask increases Horror. The crossed heart is Health loss. |
| [Publisher Julie promo](https://vanrydergames.com/products/julie-promo-pack) | Julie is a separate survivor. New *Hell to Pay* casts offer Kenzie and Christie. Julie assets, observations and opening reference remain available to saved sessions. |

The three repeated Terror titles are Brutal Reward, Ecstatic Torture and Violent Tastes. The published film rules and photographed faces govern. See the Purpose in Your Pain requires a physical choice when a prior purge leaves no active card to exchange. There is no automatic ruling for that situation. Use the actual tabletop draw result.

## Play and integration

- Resolve requirements, effects and the one-per-turn limit at the table. Press **Purged** to record a completed purge and reveal that Affliction's second image. Use **Replace an Affliction** for impossible cards.
- Fresh setup records the three actual face-up cards. A resumed game can reconcile the cards in play, including a confirmed empty board. Correcting an incomplete record ignores purge costs. A required draw that fails forces a loss at Finish and review. A replacement is separate from a purge.
- Use the standard trackers for Health or Horror changes from the tabletop. Both active Minor Powers leave play through the same purge observation. Undo restores the afflicted image and both powers. Historical observations with recorded tracker effects still replay.
- Protection status appears in Play and near the last point of Killer Health. Ordinary Health remains trackable. Clearing Afflictions allows a later token reveal. Confirm revival or defeat after resolving the physical token. Finish can confirm a win played off-app.
- The historical death uses the facts at that point in the log. Ending requests use reported results and the selected location. Catalog titles and atmosphere establish no attack, injury or casualty.
- All eight [Afflictions](../../src/assets/play/photos/razorface/README.md) have paired photographs. The purged cards stay visible, and the open gate marks the end state. The power scenes and Christie cast portrait were made for the companion.

## Release

Verify private Storage contains the reviewed [Christie JPEG](../../supabase/reference-assets/christie.jpg) at the immutable path and digest in [the manifest](../../supabase/functions/_shared/openingReferenceManifest.ts) before deploying the new generation functions. Deploy the compatible shared code to generate-death-scene and narrate-story before the frontend records Razorface events. Deploy the updated generation bundles with Christie’s reference and description: generate-story, generate-visual-bible, generate-ending and generate-scene-image. No SQL migration is required. Production Storage visibility and provider generation require a signed-in smoke test after deployment.


## Verification

The shared domain tests exercise all deck counts, replay, explicit results and historical death signatures. Browser coverage includes populated art at 1280×640, 1366×768, 1440×900, 390×844 and 320×568. It also covers a failed purge write and retry, Undo after reload, both Power entry points, mixed casting, confirmed loss and victory, and old Julie sessions. Browser generation requests are mocked. Asset checks pin all source files, and the Edge attachment test reads Christie’s staged bytes and verifies the digest.
