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
- One spend records one of seven recipes and the physical tokens used. The chooser previews the draw count and applies Powerful Meds to that count. Card draws, Health, Horror, Time and movement stay player-resolved. Dr. Sunshine’s source wording leaves the specific pickup/consumption interpretation with the physical game.
- Multiple Amped records can coexist. Final Girl 2.0 records the second Ultimate separately. Resistance qualifies the Ratchet Lady Shield cue and does not change the revealed power or recorded Health.
- Events with lasting presence use the shared picture toggles and special-character control. Stun uses known in-play Enemy identities where the killer roster provides them, or a grouped observed count for other physical Enemies. Clear at Upkeep only touches the location markers.
- Hospital Gurney with riders resolves as a single standard death record plus spent state. Existing links reopen its original casualty ID. Ordered Undo restores the gurney and associated riders together. An already tallied or historical outcome can record spent without a new casualty. Enemy Health remains on its existing tracker.
- Ending prompts, item observations and death facts use owner-specific rules and confirmed state. New Wolfe deaths receive frozen historical context. Older saved-death signatures omit the new context. The photo is decorative and does not establish a casualty.

## Presentation

The approved Groves header and card hierarchy, Wingard inventory shortcuts, and Station’s explicit confirmation pattern guide the location. The photograph set is documented [alongside the assets](../../src/assets/play/photos/wolfe/README.md). The setup reference lives in Rules.

## Verification and deployment

Domain tests exercise catalog counts, same-name Items, all recipes, Wild, Amped, Stun, owner isolation, Undo, atomic gurney outcomes and death-signature compatibility. The browser fixture covers save retry and reload, mixed casting, real death entry points, and all five viewport sizes. The static photo set is built into the frontend. The changes to shared Play history, canonical death, and narrative helpers require compatible Edge bundles before the new frontend is released. No SQL or trusted cast-reference storage change is required.
