# MegaBGCon import

MegaBGCon is the location from *Shriek* (`s4-shriek`). Its Play owner is `megabgcon`. Mort keeps the investigation, temporary Killer, and Finale under his own owner. The standard physical setup applies.

| Photo | Verified coverage |
| --- | --- |
| IMG_9602.jpeg | Location board, 12 Exhibit spaces, Food Court, General Areas and marked hall and dock links |
| IMG_9603.jpeg | Printed checklist including 12 Booths, 10 Booth Events, 10 Events, 18 Items, eight Terror, five Setups, two Action cards and the Finale Reminder |
| IMG_9604.jpeg | Setup, area rules, directional Panic, extra movement die, Upkeep roll branches, location-only Booth draws and Finale cutoff |
| IMG_9605.jpeg | Area classification key |
| IMG_9606.jpeg | All five Setup faces and ten regular Events, including four named Special Victims and three sealed SWAG tokens |
| IMG_9607.jpeg | All ten Booth Events, including the three ongoing booth tokens and both Tragic Accident branches |
| IMG_9608.jpeg | All 18 Item faces (two copies each of Box Cutter and Cash Money) and the Medical Buggy rules |
| IMG_9609.jpeg | All 12 Booth cards and both copies of Create a Panic |
| IMG_9611.jpeg | All eight location Terror cards |

The component checklist and the card spread agree. The supplied photos do not show the three SWAG reward faces. Play records each token as sealed, rescued, or discarded and leaves the actual reward on the tabletop.

## Play and integration

- Record Upkeep after the physical roll, using either the direct arrival action or the Booth Event picker. A location-only draw uses the shorter Booth lookup and cannot produce an Upkeep event. The selected killer's Finale stops routine draws. Previously placed tokens keep their independent lifecycles.
- A new or resumed game records only observed events. The existing starting Event selection offers an explicit recording action. Special Victims collect their printed Booth placement or role only when needed. Lunch Time advances on explicit Action phase endings. The two independent ongoing Events use the shared picture-toggle interaction. Players still roll, move figures, and manage physical decks.
- Tragic Accident records a casualty or its empty-booth alternative as a single observation. The shared kill action leaves the usual tabletop consequences to the player. Explicit printed additions and supported items update the applicable tracked value atomically. The Buggy tracks placement and use, and can change known Health when the player confirms the affected Killer is represented by that tracker. Other Enemy damage is resolved at the table.
- The case uses the actual selected cast and shared narrative context. The Location card helper goes to Mort's existing Suspect bag when applicable. A valid token can span several Booth lookups on the same card. A ruled-out token remains a Mort discard, leaving Booth and investigation state distinct.
- The shared replay and owner validation apply to active games, death context and archive rows. Death facts freeze at the event, with existing historical signatures retained. No database migration or private opening-reference upload is needed. Deploy the changed frontend and consumers of `_shared/play`, especially death-scene functions, together.

Original artwork and crop details are in the [Play artwork manifest](../../src/assets/play/photos/megabgcon/README.md).
