# Storybook Woods import record

## Scope and current status

Standard-mode location module `storybook-woods` in the existing Once Upon a Full Moon film (`s2-once-upon-full-moon`). It works with the selected killer independently of the film's [Big Bad Wolf module](big-bad-wolf.md). Implementation is based on merged main `9e8ae978f49b42b9db1ba4b2f2b6abf172b588df`. The [approved module standard](../MODULE_STANDARD.md), [actual UI references](../reference/module-standard/README.md), [controls](../module-controls.md), [Marrek Warehouse](marrek-warehouse.md) and [Shady Acres](shady-acres.md) govern presentation.

## Evidence ledger

Each source is a full 1536 × 2048 owner JPEG. The source photos and private IDs remain outside Git. The supplied rule sheet credits Julie Ahern for design and Tyler Johnson for art.

| Source | Expected / supplied | Coverage |
| --- | --- | --- |
| IMG_9452.jpeg | 1 / 1 board | Seven named spaces, three search spaces, two exits, three bridges and eleven distinct marked non-exit Raft landings |
| IMG_9453.jpeg | 1 / 1 component page | Counts, credits and 12 miscellaneous tokens |
| IMG_9454.jpeg | 1 / 1 rules page | Normal setup, bridge followers, Toll Bridge and Raft |
| IMG_9455.jpeg | 5 / 5 Setup, 10 / 10 Event | Exact Final Girl, killer and Victim placements and complete Event faces |
| IMG_9456.jpeg | 18 / 18 Item | 17 titles and two matching Knife cards |
| IMG_9457.jpeg | 8 / 8 Terror | Eight unique location faces |

SHA-256 in source order:

```text
1df49305d2c5aff04458de47b342950a7157df4f05706538e1b6a595a9735f04
814e247941483c23ff9c5e955327983364bcf59078ec28c167498b5a796c7710
c1246c5a9ce401e7901efcbdadeac6f09dd17b040c895aeef096d604f7488c2e
a9469a6243738425876a6ac2d1eec0ef284f703bb00ee3ac9dd3f702a18e15d6
762c638b5cb9125c08868967eafd852a246ad48a0d8b3fb281a879197028b636
0dd90fa4e3553939a45e6f89d7bb5849731a7abe09a2b24dd461710f8bcc65a8
```

The [Series 2 rulebook](https://cdn.shopify.com/s/files/1/0593/6984/8897/files/FG_S2_FeatureFilmRules-compressed_2_d7a4674c-d7cf-4d4d-8118-59622183cbcc.pdf?v=1717771084), printed pages 27–28, corroborates the location rules. It calls the Toll Bridge “Troll Bridge”. The actual Event and supplied sheet use Toll Bridge. The [core rulebook](https://cdn.shopify.com/s/files/1/0593/6984/8897/files/FinalGirl_Rules_ff324b01-6f74-43e0-90e2-1685594703d5.pdf?v=1717621644) supplies the icon key and general Special Victim rules. The [official location death book](https://cdn.shopify.com/s/files/1/0593/6984/8897/files/FG2_StorybookWoods_GruesomeDeaths_20265632-6828-4dbb-a6f7-bec3301f27e2.pdf?v=1717621786) establishes the separate Pied Piper Event entry and the three Full Moon locations. No source prose or component artwork was copied into the app. The loose tokens were not individually photographed and their full subtype breakdown is unverified.

## Rules and interaction

| Operation | Rules and Play behavior |
| --- | --- |
| River and Toll Bridge | At most one follower across each bridge. Toll costs 1 Time and 1 additional with a follower. The tile records placement. Endpoints remain on the board. |
| Breadcrumb Path | Three legal pairs among Dell, Meadow and Clearing. One atomic choice or presence with pair unrecorded. Only the Final Girl uses it. |
| Raft | Four distinct marked non-exit landings. One movement plus 1 Time per passed token including both ends. The picture records placement while the board carries the landing configuration. |
| Primrose Flowers | Ongoing reversible observation. Rules describe entry panic at Meadow and Glen. |
| Hansel, Woodsman and Piper | Shared character controls with explicit outcomes. Hansel replacement is distinct from a death. Piper starts at Village, can cause Event deaths and ends his effect when he leaves. Outcomes never edit the Victim ledger or spend rewards. |
| One-shot Events | Existing reference and observation flows. Fairy Ring has an explicit Remember This entry for a disappearance, with no casualty or Bloodlust mutation. Travelers places at Dell, Meadow and Clearing. |

Setup placements, 41 supplied faces, marked spaces and card effects live in `supabase/functions/_shared/play/storybookWoods.ts`. Rules, casting, item suggestions and scene card references use that catalog. Unnamed spaces use descriptive labels and Grandma’s House is one place across board/card spellings. One-shot events do not replay on entry. Fresh, explicitly named starting Events seed a versioned observation on the first durable write. Blank and pre-import sessions preserve unknowns. Crossing and person actions verify the active parent and are repeat-safe. Rejected saves preserve prior state and the selection editor.

## Integration and artwork

The existing film and Collection retain their IDs and art. The woods-only header and shared tiles work with Wolf or mixed casting. Opening prompts receive source-backed setting and starting Event text. Narration, ending and poster calls receive bounded explicit facts from both owners. The six-cause death form exposes source-backed fatal selections, retains free text, uses the Piper as an Event actor, and maps the Full Moon image to the recorded space. New death context reads the raw log prefix, while explicit edits to the death itself remain authoritative. Existing take signatures keep their original behavior.

The [artwork record](../../src/assets/play/photos/storybook-woods/README.md) includes the generation prompts and asset manifest. The woods header, person portraits and crossing state photos were selected to show grounded natural materials, geographic continuity and an identifiable visual subject in a wide crop.

## Verification

Local verification includes `npm run check` (659 app tests and 125 edge adapter tests), `npm run check:assets`, `npm run build`, and 12 compiled desktop/mobile journeys across the Woods and Wolf suites. Final-head Reliability results are attached to the pull request. The domain and edge tests cover source coverage, setup and aliases, wrong-owner and stale observations, stored history and stable death signatures after Undo. Browser screenshots cover 1280×640, 1366×768, 1440×900, 390×844 and 320×568. The first rendered pass exposed a missing shared tile class which positioned crossing captions relative to the panel. The correction puts the caption and scrim inside each tile. A second pass widened the tiles to the source ratio, restored portrait exposure for recorded outcomes, and adjusted the moon and basket positions in the shallow death tiles. Every derivative and its actual named surface was reviewed.

## Release

Publish compatible `generate-death-scene` and `narrate-story` bundles before the new frontend. Those are the runtime consumers of the changed shared Play domain. Opening and ending use the existing request contracts. No migration or new private reference is needed for the location. If the separately merged Wolf reference has not been installed, follow the [Wolf release instructions](big-bad-wolf.md) before exercising the live pairing. Signed-in production generation and deployment are separate from compiled browser fixtures and GitHub CI.
