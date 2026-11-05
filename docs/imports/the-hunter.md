# The Hunter import record

## Scope and status

Owner: **The Hunter**, killer module `hunter`, existing film `s3-killer-from-tomorrow` (The Killer from Tomorrow). Branch `feat/hunter-module`. Standard supplied killer board, booklet, Ally, four Powers, three Finales and complete Terror batch. Sunnydaze Mall mechanics, Kat/Tali ability/personal-item imports, alternate/Extreme rules and unprovided token faces are outside this killer import.

The three preliminary commits (`b7f06a9`, `4f93d9d`, `7dcd33a`) changed only canonical Hunter Health, narrative baseline and starting Horror. Retained them and built the module on that branch. Presentation follows MODULE_STANDARD, MODULE_IMPORT_PLAYBOOK and current shared capabilities. Local verification and final-head CI status are recorded below; production upload/deployment and signed-in provider smoke tests remain separate release work.

## Evidence ledger

| Source | Supplied component / verified coverage | Canonical destination |
| --- | --- | --- |
| H1 · IMG_9485.jpeg | Full killer board; Horror 5, Mark X Health 15, two Minor slots, Bloodlust 0–10; Mark V hood/visor/costume. | `play/hunter.ts`, setup defaults, Rules, core/model trackers. |
| H2 · IMG_9486.jpeg | Component list and first setup instructions; 3 Finales, 3 regular + 1 Epic Power, 16 Terror deck cards, 1 special Mark X Terror, Ally, 4 cubes, two Final Girl thumbnails. | Source reconciliation; no new Final Girl abilities inferred from thumbnails. |
| H3 · IMG_9487.jpeg | Remaining setup, Active Killer, phase-limited Bloodlust, Panic, Part damage/removal, shutdown, placement and Countdown, retrieval. | Shared commands, Rules and persistence. |
| H4 · IMG_9488.jpeg | Repair continuation, permanent Ally destruction, Ally rules, actions/reactions and Upkeep. | Repair and Ally state machine, separate cooldowns, no Victim count effects. |
| H5 · IMG_9489.jpeg | All four Power faces including Ally sides; all three Finales; complete Ally face. Female Mark X appearance. | Catalog, shared reveals, Rules, photographic cards, exact cooldown lengths. |
| H6 · IMG_9490.jpeg | All ordinary Terror faces and duplicates, special Mark X Terror, 4-Health Titanium Shield and 2-Health Advanced A.I. | Complete searchable catalog, death context and ongoing presence controls. |

Deck reconciliation: Target Acquired ×3, Intimidation Mode ×2, System Reboot, Move or Be Eliminated, Eliminate All Obstacles, Impersonation Mode, Deploy Counter-Measures, Have You Seen This Person?, Shock & Awe, Terminate Mark V, Analyze... Targeting Weaknesses = **14 ordinary red cards**. Two Minors bring the normal deck to **16**, plus the separately seeded Hunter Mark X Terror = **17**. Three ordinary Powers plus one Epic and three Finales are registered independently, before alphabetical display sorting.

## Verified mechanics and review corrections

| Mechanic | Implemented contract and source |
| --- | --- |
| Original pursuer | Mark V starts active with three hidden Parts and two Countdown tokens; 15 Health belongs to Mark X, not Mark V. New-session provenance initializes once. Old games remain unrecorded and retain scalar history. H1–H3. |
| Part damage | Two damage per Part, or three with Titanium-Laced Bio Tissue. Combine attacks during one Action phase; explicitly clear unfinished damage at its end. Removed Parts become separate retrievable observations; roll/placement stay on the physical board. Last Part shuts Mark V down. H3, H5. |
| Natural arrival | Explicit Countdown action removes one token and increases Bloodlust once; the second brings Mark X in at 15 Health, using a new physical Setup. It does **not** reveal the Finale. No automatic phase/round reset. H3. |
| Forced arrival | Separate Hunter Mark X Terror command drops remaining Parts, raises Bloodlust to 10 if Mark V was active, discards countdown and reveals Finale; newly arriving Mark X gets 15 Health. If Mark X is already active, it is not healed/reset. H6. |
| Power transfer | Mark V Dark Power becomes its Ally ability after shutdown. Minor records persist independently and apply to Mark X. Naming/clearing shared reveals does not resolve attacks or grant another transition. H3, H5–H6. |
| System Reboot | Active Mark V receives one hidden Part. Active Mark X recovers four Health. It has no reboot effect during the inactive Countdown. H6. |
| Retrieval / repair | Explicit retrieve costs one physical Time per token, at its space. Explicit install in Mark V’s space costs one Time, consumes that carried Part, records its revealed printed Health and adds Bio Tissue’s bonus if applicable. Parts picked up before shutdown remain available. H3–H4. |
| Ally | First repair creates living Mark V Ally. At zero it is permanently destroyed and cannot be repaired or act again. Ally is never a Victim; these actions never change saved/killed totals. H4. |
| Four independent cooldowns | Attack 2 damage: 2 slots. Move one space: 2 slots. Second move-one-space: 1 slot. Reaction reduces incoming damage by one and deals one damage: 2 slots. Explicit Ally Upkeep advances each; no round-triggered reset. Legacy unknown cubes need explicit recording. Minigun/Adaptive A.I. adjust the displayed attack value without applying damage to Mark X. H4–H5. |
| Bloodlust | Hunter exchanges increase it once per phase; Victim deaths do not. This remains an explicit main tracker observation. Countdown and forced-transition linked changes are atomic. Horror entry effects, overflow Terror discard, Panic placement and card attacks remain physical resolution. H1, H3, H6. |

No hidden Part value, token location, die result, attack resolution, reaction eligibility or Final Health result is invented. Full hidden-token faces are not supplied; the install form records the value the player actually reveals. Maximum numerical input bounds protect the observation format; they are not new printed token values. Ally attack buttons observe action-cube use, not combat resolution.

## Interaction and integration coverage

- Shared `ModulePanel`, `KillerCards`, `RevealedCard`, `MinorPowerGroup`, `MinorPowerControl`, `HealthTokens`, `IllustratedTile`, selectors and durable recording. Powers/Finales share permanent named reveals with Remember This. The forced Finale seal is derived from the same command; merely opening its naming UI makes no new observation.
- Stable Mark V / Mark X order and equal image areas. Mark V uses real active/shutdown/repaired/destroyed photographs; Mark X has a separate female identity. Known inactive states dim without losing labels. No redundant HP caption on the model portrait when it has an independent control strip.
- Core Killer Health surface represents Parts/Countdown while Mark X is absent, then its actual Health when active. Legacy unknown scalar observations are preserved. Unsupported Mark V Back from the Dead/ordinary Health interactions are suppressed.
- Minor Powers precede shared reveals. Both may coexist, zero remains Removed with restore hearts, Clear record is quiet and historical health knowledge survives clearing. Dark Power is explicitly labeled as Mark V’s Ally ability after shutdown. Unused choices hide after naming.
- Two independent illustrated presence toggles: Counter-Measures and Shock & Awe. No inferred casualties, token placements or damage from decorative pictures.
- Linked snapshots and typed commands are replay-verified on browser/server. Latest-dependent Undo/Restore, rapid stale commands, failed-write retry and local reload share the existing durable boundary. Setup flags do not backfill existing logs; panel expansion writes only display preference.
- Hunter state is frozen at the raw prefix for new deaths with `hunterReference`; legacy death signatures omit the new context. A historical death’s photo uses the model at that instant. Catalog/death suggestions are owner scoped; Ally is not a minion/Victim.
- Openings preserve original Mark V and do not introduce Mark X or a repaired Ally. Ending prose and painted posters receive typed owner-validated model/Ally facts, both owners’ bounded story context and current selected Final Girl identity. Poster references select Mark X independently and include repaired Mark V only as a second living Ally identity. No global ending layout or poster medium change.
- Finish review shows recorded Hunter state and permits Mark X Health entry only for Mark X. Existing archived scalar data are retained, not rewritten into another model’s fate.
- Original photographic set, mapping, dimensions, prompts and digests: [art README](../../src/assets/play/photos/hunter/README.md). Existing cast/Collection portraits and generic Bloodlust/Health tokens retained. Header regenerated after shallow crop inspection. No source card photos are published.

## Verification

Expected behaviors were derived from H1–H6 before testing. `src/lib/play/hunter.test.ts` covers deck reconciliation, damage thresholds/phase boundary, natural/forced arrival, Power/Minor transfer, conditional Reboot, repair, permanent destruction, exact independent cooldowns, unknown/legacy scalar preservation, stale/forged history, atomic Undo/Restore, death signatures and owner separation.

`tests/browser/hunter.spec.ts` exercises real fresh/resumed controls, durable failure/retry, normal and forced progression, shared reveal paths, full/depleted Minor states, no-write expansion, cooldowns, reload, death generation/cached replay/narration and ending/poster requests. The location matrix includes Buddyland, Camp, Maple Lane, Carnival, Groves, Creech, Konrad, Shady Acres, Marrek, Storybook Woods, Wingard Cottage and existing Sunnydaze Mall support. The latter does not claim to implement an unprovided location batch.

Visual journeys cover 1280×640, 1366×768, 1440×900, 390×844 and 320×568, all named card photos, header, core/model states, active/inactive ongoing effects and long labels. They assert decoded images, document overflow and internal control bounds. Manual visual findings: the first header crop clipped Mark V’s visor and was regenerated at the correct shallow composition; the finish review needed its owner gate enabled; four depleted Shield hearts clipped inside the 320px compact card and now wrap at full 44px targets. Inspected the complete populated panel and all distinct named photos/physical model states on laptop and phone. Faces, Minigun barrel cluster, mechanical details and paired-model Finale composition remain visible; labels/controls fit inside the panel. The forced Finale naming entry no longer creates a duplicate reveal.

| Local gate / evidence | Result |
| --- | --- |
| `npm run check` | 975 frontend/domain tests plus 141 Node edge-harness tests passed; lint/typecheck passed (11 pre-existing fast-refresh warnings). |
| `npm run check:assets` | 17 distinct originals, 9 thumbnails, dimensions, digests and byte budgets passed; 1,049,722 runtime photo/thumbnail bytes total. |
| `npm run build` | Production bundle passed; existing bundle-size advisory retained. |
| Hunter Chromium desktop / mobile | 17 journeys per project passed, five required viewports; all 12 location pairings passed. Cloud failure/reload/reconnect is explicitly included in the final composed journey. |
| Full native edge/database/browser CI | Tracked on [PR #186](https://github.com/LeviJohnsonNC/finalgirl/pull/186); wait for the final head. Native Deno caught the lower-level gateway ratio type and it was updated to match the tested 2:3 poster path. |

The published implementation tree was compared byte-for-byte with the locally verified tree during upload. Browser provider calls are mocked; no paid live story/audio/production claim is made.

## Release / deployment

No migration. Before publishing the new frontend:

1. Run `node scripts/opening-references.mjs --only='The Hunter'`. Upload both exact staged JPEGs to the private `opening-references` bucket; download/check SHA-256. Copies also live under `supabase/reference-assets/`.

| Identity | Exact private object key | SHA-256 |
| --- | --- | --- |
| Mark V | `the-hunter-4eb181874615d107.jpg` | `4eb181874615d107591223ec01c3e645b63e2266c64d68e01d150319542cf923` |
| Mark X | `the-hunter-mark-x-3817e003568b748d.jpg` | `3817e003568b748d6d6cefb73eca931080e320f6ba80a7c35e333334eeede219` |

2. Deploy the compatible shared graph: `generate-story`, `generate-ending`, `generate-scene-image`, `generate-visual-bible`, `generate-death-scene`, `narrate-story`. Reviewed fixed keys/digests use the trusted Storage loader. No base64 image collection or arbitrary caller reference URL is added; the new poster path keeps painted 2:3 output. Native edge type/bundle checks belong to Reliability CI.
3. Publish frontend through the existing Lovable UI after compatible backends and objects are present.
4. Signed-in production smoke: opening with Hunter and a mixed location, save/reload, Part shutdown/arrival/repair, contextual death/cache/narration, ending prose and model-aware painted poster. A missing reference fails closed and is a release blocker, not permission to invent a substitute.

These objects/functions/frontend have not been deployed by this implementation task. Merge, final-head CI, deployment and live provider verification are distinct. Remaining release steps above are explicit.
