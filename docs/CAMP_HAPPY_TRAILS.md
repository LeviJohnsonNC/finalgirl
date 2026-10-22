# Hans and Camp Happy Trails

Camp extends the existing Play dashboard with two initially collapsed panels. Hans exposes his two Minor Dark Powers with independent 0–2 Health controls. Camp shows all three special characters and six ongoing events as illustrated tiles; they remain unrecorded until explicitly used. Panels remember their open/closed preference by account, game and module, without recording gameplay observations. No rescue, death, movement, damage, Bloodlust or Horror effect is automatically resolved.

## Controls and persistence

- Remember This offers Hans’s four photographed Dark Powers (including the Epic Blood Frenzy) and three Finales. Dark, Darker, Darkest exposes a second, distinct Dark Power choice within the same remembered reveal. The main milestone remains permanent. Correcting the Finale hides and excludes an inapplicable second power from narrative context; its original observation remains in history.
- Minor Dark Powers start at two Health only when explicitly revealed. Each filled heart removes one Health; each empty heart restores one. The numeric 0–2 observation remains authoritative. Full, weakened and removed artwork follows that value; zero is visibly distinct from unrevealed. Corrections and stopping tracking do not change Hans’s general Health.
- Boyfriend, Girlfriend and The Damned each have distinct Untracked, In play, Saved and Killed portraits. Tap an untracked or terminal portrait to mark In play, then use direct Saved/Killed outcome buttons. Stop tracking clears the current observation while retaining its history. Untracked does not prove absence.
- Ongoing Camp details are Clingy Campers, Dark Waters, Deathwish, Secret Tunnel, Star Crossed Lovers and Stubborn Kids. Each can be marked Active or Resolved or removed from tracking. The tunnel permits two different endpoints from Cabins, Dock and Utility Shed. Endpoints are omitted from current narrative context when the tunnel is inactive.
- Portrait states never alter Saved/Killed totals or open a death modal. Main counters remain authoritative. This follows the existing Buddyland observation model.
- All changes use the existing immutable Play log, validation, Undo/restore, local checkpoint, offline queue and cloud synchronization. Camp/Hans controls, Items and card references follow the selected killer and location independently.

## Verified catalogs

The factual, paraphrased catalog lives in `supabase/functions/_shared/play/camp.ts`; it is shared by the frontend and edge functions. The frontend re-exports shared catalogs rather than importing frontend code into edge bundles.

| Source photo | Coverage                                                                                                      |
| ------------ | ------------------------------------------------------------------------------------------------------------- |
| IMG_9319.jpg | Hans board, 12 starting Health, starting Horror 4, Bloodlust track                                            |
| IMG_9320.jpg | Four Dark Powers, including Blood Frenzy; three Finales                                                       |
| IMG_9321.jpg | Nine distinct ordinary Hans Terror effects and both Minor Dark Powers; repeated cards share one catalog entry |
| IMG_9322.jpg | Camp’s seven named spaces and three Search spaces                                                             |
| IMG_9323.jpg | All eight Camp Terror cards                                                                                   |
| IMG_9324.jpg | Five Setup cards and all ten Events                                                                           |
| IMG_9325.jpg | Eighteen Items and their photographed effects/use markers                                                     |

The Setup card miniature is rotated relative to the Location board. Descriptions were checked against both views; exact positions remain on the physical Setup card. The app does not simulate board adjacency, panic arrows or hidden card draws.

The published [core rulebook](https://cdn.svc.asmodee.net/production-asmodeeca/uploads/2025/10/Final-Girl-Rules.pdf) supports icon interpretation, Minor Dark Power Health and Laurie’s starting five Health. Boyfriend’s partly glared text was cross-checked against the [card entry](https://finalgirl.fandom.com/wiki/Boyfriend_%28Camp_Happy_Trails%29): his death in the Final Girl’s space gives 12 Time next Action phase. Other Final Girl abilities, rescue tracks and personal Items are deferred to the owner’s later Final Girl batch.

These sources correct previous omissions and errors: Dark Feast increases Horror and heals according to dead Victims; the Whistle also moves Enemies toward the Final Girl; Bear Trap deals two damage and cannot be placed in the Lake; Fireworks costs two Time and redirects target choice; Map applies to Item decks; Lucky Rabbit’s Foot requires a Horror Roll. Hans’s visual identity is a metal pig mask and sledgehammer, rather than the previous latex-mask/cleaver description. Existing character artwork is retained. Hans’s maximum Health and Laurie’s starting Health references are made consistent without rewriting any saved observations.

## Narrative behavior

Cause-specific death fields offer the applicable Terror/Event catalogs, named Camp spaces and Special Victim roles. Effects enrich the short story without resolving new game events. Active relationships do not establish the current scene’s victim; finding an Item does not establish its use. Later observations cannot alter the module snapshot for an earlier death. Existing context-free death signatures remain unchanged; existing complete scenes remain cached.

Setup, starting Events, Rules, opening guidance and endings reuse the verified catalog. Endings receive a bounded summary that prioritizes observed state, with known remembered Item effects where space permits. Main reviewed totals override the timeline. Original logs remain available in saved case notes. The model, generation deadlines, retry behavior and story lengths are unchanged.

## Artwork

The existing role/state images and Camp/Dark Waters/Secret Tunnel panoramas remain in `src/assets/play/camp/`. New static WebP atlases in `src/assets/play/modules/` supply three matching Saved portraits, four event illustrations, the enamel heart token, and Hans’s full/weakened/removed powers. The dedicated Hans header now follows the verified rigid metal pig mask, red apron and sledgehammer identity. Photographic film stills use warm practical light against pine-green shadows. Aftermath portraits show abandoned possessions; spent power art never implies Hans has died. There is no generated lettering. HTML labels, status text and keyboard controls remain independent of the images; no image generation occurs during play. Atlas cells render through exact SVG view boxes. See `PLAY_MODULE_CONTROLS.md` for the shared presentation pattern.

## Deployment and review

The original Camp/Hans rollout required **generate-death-scene** and **narrate-story** support for module observations and canonical signatures. This illustrated-controls follow-up uses that existing contract and requires only the frontend deployment. No SQL migration or new secret is required. Opening/ending improvements are supplied through the existing frontend request schema; global image models and photographic rendering settings are unchanged.

Verification covers inventory and effect corrections, mixed modules, bounded request sizes, independent health and victim totals, second-power corrections, Undo/restore, zero, JSONB round trips, old death signatures, original death-time snapshots, canonical narration, cache reopening, reload, themed alphabetical menus, Rules search, and desktop/phone overflow. Provider and production calls are mocked during tests.
