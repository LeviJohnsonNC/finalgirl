# Wolfe Asylum import record

Wolfe Asylum is the Series 2 location in Madness in the Dark (`s2-madness-in-dark`). Its Play owner is `wolfe`. The [Ratchet Lady](ratchet-lady.md) has independent killer ownership. Existing exterior casting and loading images, and Heather and Veronica’s existing identity assets, remain in use.

## Evidence

| Component | Supplied | Evidence |
| --- | --- | --- |
| Board and booklet | Board plus two rules/contents faces | IMG_9586–IMG_9588. Three searches and three exits. The booklet specifies 18 mixed tokens, including ten Pills by color. |
| Setups and Events | 5 and 10 | IMG_9589. The Rules picker uses perspective-corrected diagrams from this photograph. |
| Items | 18 cards, 16 names | IMG_9590. Mysterious Pills has three copies and only the Wolfe version immediately grants two Pill tokens. |
| Side Effects | 10 | IMG_9591. Normal ×6, three stop-drawing outcomes and Reset. |
| Amped, Pill Effects and Terror | 5 Amped, one reference and eight Terror faces | IMG_9592 2 plus the eighth Terror in IMG_9585. IMG_9592 2 is byte-identical to the previous IMG_9592. |
| Printed rules | Series 2 feature film rules, pp. 33–35 | Setup, held pills, batch resolution and Stunned timing. The location has no standalone illustrated Play board in the app. |

Artwork credits on the booklet are Vladyslava Ladkova, with additional Item and board art from Tyler Johnson and Roland MacDonald. Design is by A.J. Porfirio and Evan Derrick.

## Behavior

- A fresh game records one unobserved starting pill and deterministic starting-card presence. The deck and token pool remain physical. Legacy starts and historical events retain unknown state until observed.
- The tray shows recorded tokens with per-color steppers. A legacy unrecorded tray stays unknown until the player saves its counts. Eat pills offers only payable recipes, including Wild substitutions. One accepted action consumes the tokens and updates the existing Health or Horror tracker. Health uses the Play maximum and the Horror floor grants a Time instruction for each excess reduction. Time, movement, card draws and conditional modifiers remain on the physical board. The chooser includes the Powerful Meds draw modifier. Legacy spend records retain their original manual resolution.
- The Amped photograph toggles whether the recorded abilities apply. Multiple named cards can coexist and survive a toggle. Final Girl 2.0 retains the separately recorded second Ultimate. Resistance applies to the Ratchet Lady Shield cue only while Amped is active.
- Events with lasting presence use the shared picture toggles and special-character control. Under the Core Rulebook’s Special Victim rules (p. 30), all three named people can be saved. Dr. Death’s card only changes his own kill consequence, adding 2 Time without Bloodlust. Stun is tracked on the physical board. Historical Stun observations still replay.
- Hospital Gurney stays visible beside Amped. Click the inactive gurney to add it. The card opens with steppers for up to two Victims when in play. Ram gurney records one standard death for all riders and marks the gurney rammed. Open Gruesome Death reopens that same record. Mark spent records an already resolved outcome. The card offers Undo ram and Undo spent, which restore the prior rider state even after unrelated Asylum actions. Undo ram also removes its linked deaths. Clear record returns the card to its unrecorded state, with Undo clear available. The card shows the ram damage to apply to the chosen Enemy on the board.
- Ending prompts, item observations and death facts use owner-specific rules and confirmed state. New Wolfe deaths receive frozen historical context. Older saved-death signatures omit the new context. The photo is decorative and does not establish a casualty.

## Presentation

The approved Groves header and card hierarchy and Station’s explicit confirmation pattern guide the location. The medical tray and composited tablet photographs replace the original static inventory pictures. The photograph set is documented [alongside the assets](../../src/assets/play/photos/wolfe/README.md). The setup reference lives in Rules.

## Verification and deployment

Domain tests exercise catalog counts, same-name Items, all recipes, Wild, Amped, Stun, owner isolation, Undo, atomic gurney outcomes and death-signature compatibility. The browser fixture covers save retry and reload, mixed casting, real death entry points, and all five viewport sizes. The static photo set is built into the frontend. The changes to shared Play history, canonical death, and narrative helpers require compatible Edge bundles before the new frontend is released. No SQL or trusted cast-reference storage change is required.

The follow-up changes shared Play log replay and generation prompt identity. Update `generate-story`, `generate-visual-bible`, `generate-scene-image`, `generate-ending`, `generate-death-scene` and `narrate-story` alongside the frontend. Existing saved shots can be replaced by Reshoot.

The gurney correction changes shared Play log validation. Deploy `generate-death-scene` and `narrate-story` with the updated validator before publishing the frontend. No database migration or new artwork is required.
