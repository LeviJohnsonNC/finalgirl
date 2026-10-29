# Evomorph import record

## Scope and current status

- Owner: killer. Canonical app name: Evomorph; printed title: The Evomorph.
- Film ID: `s2-into-the-void`. Proposed module ID: `evomorph`.
- Stage: critically reviewed, revised implementation plan only. No application changes, generation, merge or deployment performed.
- Scan equivalence: Levi confirmed on 2026-10-28 that all three Scan cards are identical. This is owner confirmation supplementing E2's readable face; no additional Scan photo is required.
- Reviewed: 2026-10-28, America/Regina.
- Scope: killer board, rules/setup, Evolution, Ambush, Scan, Terror, Powers, Finales, relevant Play/narrative/death integration and artwork.
- USS Konrad location import is deferred. Do not add its Events, Items, special systems, map or setup scenarios in this work.
- Ellen/Jenette are not independently imported here. Their printed component thumbnails establish inclusion, not abilities, health, reverse faces or personal Items.
- Six accessible uploads inspected visually at original resolution. This reconciles the current batch; no assumption that additional batches are finished.
- Presentation authority: current main-branch AGENTS.md, docs/MODULE_STANDARD.md, docs/module-controls.md, docs/MODULE_IMPORT_PLAYBOOK.md and docs/PLAYTEST_POLISH.md. Actual reference images inspected: reveal choices desktop, selected cards desktop, active Minor phone. The old Change Finale control visible in a reference image is superseded by current written Clear card name guidance.
- This file follows docs/templates/MODULE_IMPORT_RECORD.md and is intended for docs/imports/evomorph.md during implementation.

## Source ledger

Persistent source links identify the original photographs. Review crops are temporary aids, not replacement sources or application artwork.

| Source | Persistent original | Contents and evidence |
| --- | --- | --- |
| E1 | [evo1.jpeg](https://chatgpt.com/library?file_id=libfile_41615b642b088191bfb49143bf1e8198&account_id=personal) | Ten Ambush cards with both Youngling/Adult halves visible, plus Evolution face. |
| E2 | [evo2.jpeg](https://chatgpt.com/library?file_id=libfile_4241511ead288191830563b84961040e&account_id=personal) | Sixteen Terror faces including three Minors; Scan stack with one exposed face; pre-Finale action back. |
| E3 | [evo3.jpeg](https://chatgpt.com/library?file_id=libfile_42e2ebe59a5081918ba403a27a8ec8a7&account_id=personal) | Three regular Powers, one Epic Power, three Finales. |
| E4 | [evo4.jpeg](https://chatgpt.com/library?file_id=libfile_5c9e3066afa48191b902abe5cd4ce31a&account_id=personal) | Full special setup/rules face: Evolution, Vanishing/Ambush, Scanning. |
| E5 | [evo5.jpeg](https://chatgpt.com/library?file_id=libfile_74cce5b710d88191b2f13943ba2857ea&account_id=personal) | Component-list/lore face; printed credits: design Evan Derrick, art Tyler Johnson. |
| E6 | [evo6.jpeg](https://chatgpt.com/library?file_id=libfile_d657c77a007c81918bf16ef31b916ee6&account_id=personal) | Killer board: Horror 4, health 4/10, Bloodlust track and special effects, overflow, three Minor slots. |

## Reconciled component inventory

| Component | Printed quantity | Supplied evidence | Status |
| --- | --- | --- | --- |
| Killer board | 1 | E6 full face | Verified visible face; reverse not supplied. |
| Rules/setup sheet | 1 sheet, two photographed faces | E4/E5 | Verified. |
| Evolution card | 1 | E1 face | Verified. |
| Ambush cards | 10 | E1, all ten Youngling and Adult halves | Verified 10 cards / 20 stage-specific outcomes. |
| Terror cards | 16 | E2, all sixteen exposed faces | Verified, including duplicates and three Minor Powers. |
| Regular Dark Powers | 3 | E3 | Verified. |
| Epic Dark Power | 1 | E3 | Verified. |
| Finales | 3 | E3 | Verified named faces; E2 exposes pre-Finale action back. |
| Scan Action cards | 3 | E2 exposed face plus Levi's confirmation | Three identical copies confirmed by owner; readable effect comes from E2. |
| Scan tokens | 6 | E5 illustration/count, E4 placement rules | Quantity/rules verified; loose tokens not separately photographed. |
| Evolution marker | 1 | E5 illustration/count | Quantity/purpose verified; loose marker not separately photographed. |
| Final Girl cards | 2 | E5 thumbnails: Jenette, Ellen | Listed only; front/back details not verified and outside this killer-only import. |

### Terror faces and duplicates

All entries below are E2. Minor Powers are part of the sixteen Terror cards, not three additional cards.

| Card | Quantity |
| --- | ---: |
| “Oh God, Where Did It Go!?” | 1 |
| Sideswipe — Minor Dark Power | 1 |
| Shadow Dread — Minor Dark Power | 1 |
| Dead Silence — Minor Dark Power | 1 |
| Shadow Blitz | 2 |
| “Game Over, Man! Game Over!” | 3 |
| Skull Burster | 1 |
| Acid Spray | 1 |
| “It Came Out of the Shadows!” | 2 |
| Scratches in the Dark | 1 |
| Exo-Skeleton | 1 |
| Toying with the Prey | 1 |
| **Total** | **16** |

Nine unique non-Minor titles plus three Minor titles. Preserve all printed quantities in canonical source data; suggestions can show each unique title once.

### Powers and Finales

| Type | Names | Source |
| --- | --- | --- |
| Regular Power | Symbiotic Camouflage; Acid Blood; Razor Claws | E3 left column excluding Epic |
| Epic Power | Razor Tail | E3 red-framed face |
| Finale | The Perfect Organism; Blitz of Death; Death in the Dark | E3 right column |

### Ambush identity mapping

Ambush cards have no individual title. Use stable IDs based on the Youngling Danger number, not an invented name. Every stage has Danger values 1–10, but the number changes when reading the Adult half.

| Proposed stable ID | Youngling Danger | Adult Danger |
| --- | ---: | ---: |
| ambush-y1 | 1 | 9 |
| ambush-y2 | 2 | 6 |
| ambush-y3 | 3 | 5 |
| ambush-y4 | 4 | 7 |
| ambush-y5 | 5 | 10 |
| ambush-y6 | 6 | 4 |
| ambush-y7 | 7 | 8 |
| ambush-y8 | 8 | 2 |
| ambush-y9 | 9 | 3 |
| ambush-y10 | 10 | 1 |

Source E1. Retain each physical card's two halves together; never equate Youngling Danger 1 with Adult Danger 1.

## Verified mechanics and corrections

These are faithful planning paraphrases. Canonical implementation still requires per-card icon/timing transcription and comparison against the original sources.

| Mechanic | Verified fact | Source |
| --- | --- | --- |
| Setup | Start Hatchling, health 4, Horror 4. Build a mixed killer/location Terror deck of 8 cards rather than 10; prepare the Ambush deck with Youngling orientation. | E4/E6 |
| Evolution | Hatchling → Youngling → Adult at printed Evolve effects reached when Bloodlust increases. Do not infer evolution from any arbitrary casualty. | E1/E4/E6 |
| Hatchling restriction | Only a Victim killed by Hatchling itself increases Bloodlust. Other Bloodlust increases are replaced by gaining Time, one per replaced increase. | E4 |
| Youngling | Evolving to Youngling immediately Vanishes; Bloodlust can increase normally thereafter. | E1/E4 |
| Adult | Maximum health becomes 10, recover all health, reveal Dark Power, and use Adult Ambush halves. | E1/E4 |
| Vanish | Ends the Killer phase; physical meeple leaves the map for the Terror deck. While vanished, replace the normal Killer action/Terror draw with Ambush. | E4 |
| Ambush | Use the current stage's half. If the physical deck runs out, reshuffle its discard pile. Some results return Evomorph and remove Scan tokens. Higher Danger is more dangerous. | E1/E4 |
| Scan | Only while vanished. One token per space, up to the six physical tokens; when none remain, move the token farthest from the Final Girl. Distances/ties require player-selected physical-table information. | E4/E5 |
| Scan 3+ successes | Returns Evomorph to the Final Girl's space, skips the next Killer phase, and removes that copy of Scan from the game. This line does not print removal of all Scan tokens. The three cards share E2's other success/failure lines by owner confirmation. | E2 + owner confirmation |
| Minor health | Sideswipe 3; Shadow Dread 2; Dead Silence 2. Multiple Minor records are supported. | E2 |
| Sideswipe | Adds its printed Killer action before Vanish completes. | E2 |
| Shadow Dread | Discard and replace a drawn Ambush result with Danger 2 or less. | E2 |
| Dead Silence | One fewer die for Scan, minimum one. | E2 |
| Regular Power reveal | Each printed regular Power returns Evomorph to the closest unscanned space and removes all Scan tokens; ongoing effect differs by card. | E3 |
| Epic reveal | Razor Tail returns Evomorph to an eligible space with the most Victims, kills every Victim there, and removes Scan tokens. Requires explicit player outcome/placement information. | E3 |
| Ambush modifier | Symbiotic Camouflage and Death in the Dark each print an extra-card/highest-Danger instruction. Preserve their exact individual text; do not invent a combined stacking resolution. | E3 |
| Exo-Skeleton | Adds a reserve black Final Health token atop the current token, without increasing health; reveal both together when instructed. Concealed token values stay concealed. | E2 |
| Toying with the Prey | Conditional penalty during the next Action phase; temporary effect, not an indefinite generic toggle. | E2 |
| Pre-Finale action | Printed action back targets a Victim, moves, then attacks. | E2 |
| Bloodlust geometry | Board has a starting position and ten higher positions; Evolve appears at the first and fifth increases from the start. Overflow prints gain 2 Time then discard the next Terror card. Preserve printed action/stat symbols separately from decorative art. | E6 |

**Existing claim to correct:** src/data/killerSpecialRules.ts currently says the creature evolves each time it kills and that every fallen NPC strengthens it. Replace with stage-aware, source-backed guidance. Hatchling is explicitly dangerous; do not describe it as mechanically harmless or always manageable.

**Appearance boundary:** existing killerDescriptions.ts contains an industrial-tunnel setting and speculative cocoon/bloody-encounter language. Preserve verified creature appearance while preventing that backdrop or invented prior casualties from overriding a mixed-cast location or recorded game.

## Existing implementation audit

Read from repository default branch; no local application checkout was available.

| Surface | Current finding |
| --- | --- |
| Selection/ownership | Into the Void already exists as s2-into-the-void with Evomorph, USS Konrad, Jenette and Ellen. Reuse it; do not duplicate catalog choices. |
| Portrait registration | gameData.ts already maps Evomorph to evomorph.png. Its visual quality still requires inspection before retaining/replacing it. |
| Lore | featureFilmDetails.ts has Evomorph lore and paired-location records. Existing prose is not evidence that mechanics are implemented. |
| Dedicated Rules | No Evomorph module registered in ENTITY_RULE_MODULES or MODULE_PROMPT_CONTEXT in moduleRules.ts. |
| Play panel | No Evomorph registration in moduleDefinitions.tsx. |
| Shared domain | ModuleObservation ID union and killerMomentCards in modules.ts lack Evomorph. |
| Terror/death catalog | catalog.ts has no Evomorph cards or unique mechanisms. |
| Further caller audit | Fresh-session initialization, validators, signatures/caches, stories, reference manifest and every reveal caller need tracing during implementation. No claim that the files above exhaust all dependencies. |

## Critical review and justified corrections

The existing killer-only scope, source inventory, shared controls, photographic standard and full-surface verification remain sound. The following findings materially change execution.

| Finding and checked evidence | Likely impact | Concrete correction |
| --- | --- | --- |
| **The proposed atomic Adult/reveal/Undo behavior does not follow automatically from existing controls.** KillerCards.tsx writes a permanent moment or edits its name. events.ts locks permanent milestones against Undo and normally projects numeric Health only from state events. useActiveGame.ts enforces reveal uniqueness and restricts linkedModule to existing owner pairs. | Independent UI writes can save stage without healing/reveal, duplicate effects across entry points, or promise an Undo that is actually forbidden. | Use a narrow shared Evomorph action resolver at the durable append boundary, following existing owner-action patterns. Commit reversible effects and any first permanent reveal together in one local persistence transaction. Preserve the existing permanent reveal on ordinary Undo; reverse the associated reversible effect group together. Clear card name is metadata correction and never reruns reveal effects. Do not weaken global milestone locks or add a generic action engine. |
| **Current stage is not sufficient to identify a recorded Ambush.** E1's Youngling Danger 10 advances Bloodlust to the next Evolve and then prints a Killer action. The existing plan described a current-stage selector without freezing the originating face. | Evolving while resolving a card could substitute its Adult half and corrupt historical death context. | Persist physical card ID, stage/face at draw and displayed Danger with the observation. Current stage may subsequently change independently. Card text remains a reference; the app does not adjudicate a new half or reorder physical effects. |
| **The companion boundary needs a concrete timing/count contract.** Three identical Scan cards are now confirmed, but copies not removed are not necessarily in hand or playable. Scan 3+ returns the creature without a printed clear-all-Scan instruction. Existing useActiveGame and activeGame.ts initialize only fresh, provenance-marked sessions. | A naive available-card count, generic return action or eager defaults would misstate the table; panel expansion or reload could erase temporary/legacy state. | Track removed Scan copies 0–3 only, plus an explicitly recorded next-Killer-phase skip; do not model hand/tableau or a phase engine. Resolve/clear temporary conditions explicitly. Apply Scan removal only where that exact source instructs it. Fresh setup is written once; legacy/part-played sessions remain unknown. |
| **Stage and appearance must reach opening generation before Play initialization.** Setup is currently seeded with the first Play write; the existing description emphasizes the Adult body and a fixed tunnel. openingReferenceManifest.ts has no Evomorph entry. | An otherwise correct panel could still open with an unsupported Adult in the wrong location, or declare Hatchling merely because a legacy log is empty. | Derive opening guidance from verified new-session provenance or an explicit stage observation, without writing gameplay on render. Keep resumed unknown stage unknown. Use selected-location context; inspect existing portrait and stage artwork before reuse. Do not add an Adult-only identity reference that overrides Hatchling/Youngling scenes. |
| **Generic test promises missed the conflicts above and bounded mixed-owner context.** moduleStoryBeats reserves limited killer space inside location branches, and deathFacts has strict validated historical projections/signatures. | Passing panel tests could hide wrong stage, lost location facts, incompatible server observations or invalid cached scenes. | Add explicit journeys below, front/server/database parity checks where applicable, and long mixed-context assertions. Assess all actual opening/image/ending/death/narration callers, not only two named functions. |

The existing portrait is registered but has not been visually inspected: the connector returned empty binary content. Its quality is a verification task, not evidence that it needs replacement. Early-stage source art is small; preserve supported silhouettes and avoid claiming fine anatomical details that cannot be verified.

## Revised execution plan

1. **Finish source and contract preparation before application edits.** Keep this inventory and owner confirmation. Transcribe each condition, icon, target, ordering and duration from E1–E6 into a reviewed per-face ledger. Verify all 20 Ambush halves and their paired IDs, sixteen Terror cards including quantities, three regular/one Epic Power, three Finales, three identical Scan copies, Minor Health 3/2/2 and the eleven Bloodlust positions. Trace fresh-session creation, optional numeric trackers, both reveal entry points, domain/server/database validation and narrative/reference callers. Source facts govern; the pre-existing implementation is not rules evidence.

2. **Implement and test the narrow state/durable-action contract first, after approval.** Add Evomorph-owned shared data, validators and action resolution in supabase/functions/_shared/play/. Re-export to the frontend. Keep stage, presence, Scan placements, removed Scan copies, temporary conditions and reveal-effect resolution state distinct. Use an owner revision/parent check for stale actions and durable deduplication. Add a fresh-session provenance marker through the existing creation/recovery path; no legacy backfill or mount writes.

   - Evolve Youngling records its required Vanish without pretending the preceding Sideswipe attack caused damage.
   - Evolve Adult records maximum/current Health 10 and the first Power reveal, if not already observed, in one durable transaction. It does not record Back from the Dead.
   - The chronological shared summary supplies Health to the existing optional tracker and relevant defaults, with no competing Evomorph Health widget. Preserve stopped-tracking preference and unknown/corrected observations; recording healing does not turn an optional tracker on.
   - Preserve unnamed/legacy reveals. An unnamed Power keeps its unresolved return/outcome step explicit. Naming an already-resolved reveal changes metadata only; naming an unresolved one offers the required resolution workflow rather than silently applying it.
   - Shared panel and Remember This entry points invoke the same reveal path. Rapid cross-entry taps cannot append a second milestone or resolve healing/casualties twice.
   - Undo reverses a reversible action's linked gameplay effects as a group; the permanently observed reveal remains. Quiet corrections can repair stage/state without applying entry effects. Do not promise that Undo erases permanent milestone history.
   - If a reversible action has later dependent Evomorph actions, reject an isolated rollback that would leave an invalid chain; offer correction or undo dependent actions in reverse order. Avoid a repository-wide Undo rewrite.

3. **Build the hardest actual UI and compare it with Groves.** Implement evolution/Adult reveal resolution first, including unnamed Power, regular return and Razor Tail's explicit placement/outcome choices. No inferred distances or casualties. Inspect loaded laptop and phone controls before generating remaining assets. Then compose the compact killer panel: photographic header and stage/presence summary, useful Scan state, shared Minors, shared Power/Finale heroes. Keep detailed effects/setup on Rules; retain only choices, meaningful ongoing state, errors and required linked previews in Play.

4. **Complete physical-table observation workflows.**

   - Scan placement uses stable space identity with a player label; suggest verified locations' spaces but do not limit it to incomplete search-room lists. One token per space, six total; a new placement at capacity requires the player's explicit farthest-token choice. No map graph, movement engine or USS Konrad dependency.
   - Ambush records the revealed physical card and face at draw, not a virtual deck. Danger options use that captured stage. Conditional replacement/highest-Danger instructions remain physical reference rules; combined modifiers are not silently adjudicated.
   - All three identical Scan copies share one Rules entry. The optional removed-copy observation ranges 0–3; do not equate remaining copies with current availability. Recording the 3+ result links return, removal of one copy and next-phase skip, retaining existing Scan tokens unless another observed rule removes them.
   - Explicitly mark the skipped Killer phase consumed and Toying with the Prey ended at the appropriate observed timing. Ordinary round increments, render and reload do not clear them automatically.
   - Exo-Skeleton records the additional Final Health token without increasing Health or exposing hidden values.
   - Regular/Epic Power resolutions record only player-confirmed placement/casualties and source-required Scan removal. Avoid duplicating a death already recorded through the normal death flow; keep victim totals separate from token/creature status.

5. **Complete Rules, narrative and artwork integration.** Register the existing film/owner IDs without duplicate selection entries. Wire searchable rules/canonical suggestions, both reveal entry points, historical death context/cache/narration, opening and ending facts, archive/recovery and verified Bloodlust presentation metadata. Retain the existing shared Bloodlust art and numeric editing behavior; adding Evomorph's verified 0–10 range must not resolve Evolve or clamp old observations.

   New openings use Hatchling only for verified fresh standard setup; an observed Youngling/Adult or unknown resumed state governs otherwise. Distinguish unknown from absent. Do not force a visible creature into an opening, use the Adult body for every stage or import an industrial tunnel into another location. Bounded story/death projections must preserve both selected owners and the recorded Ambush face.

   Use the asset manifest below, audit existing identity art before replacement and plan actual ratios/crops before generation. Preserve physically believable photographic materials, canonical creature identity, legible HTML labels and the agreed camera treatment. Add only stage-appropriate trusted reference objects that the actual loader can represent correctly; do not force a manifest expansion if it would miscondition earlier stages. Any changed manifest requires reviewed bytes, fixed keys/digests and verified uploaded objects.

6. **Verify the completed import and prepare the release handoff.** Use the scenario checklist below, actual visual inspection and final-head required CI. Identify exact function/frontend/Storage/SQL changes from the final diff and verify any new observation reaches compatible deployed backends before a frontend release when authorized. Source transcription, portrait inspection, implementation and live generation have not been completed by this planning review.

## Interaction and state map

| Operation | UI and transition | Durable/unknown/correction contract |
| --- | --- | --- |
| Evolve | Explicit next-stage action and linked preview | Fresh standard setup only initializes once. Stage correction is distinct from evolution and cannot replay entry effects. |
| Adult Health / first Power reveal | One committed transaction using the shared summary and reveal path | Reversible effects Undo together; permanent reveal survives. No duplicate health truth or automatic tracker activation. |
| Vanish / return | Illustrated state; explicit workflow where placement/outcomes are required | Sideswipe's pre-Vanish action is not inferred damage. Return does not imply Scan removal unless its source says so. |
| Scan placement | Six-token pool and compact space editor | One token/space; explicit farthest-token move at capacity; unknown and empty remain distinct. |
| Scan 3+ / removed copies | Explicit observed result and optional removed count 0–3 | Return/removal/skip linked; Scan markers retained; copies remaining are not cards currently available. |
| Minor Power | Shared MinorPowerGroup/MinorPowerControl/HealthTokens | 3/2/2 maxima, positive/zero/unknown, multiple records and quiet correction. |
| Dark Power / Finale | Shared KillerCards/RevealedCard from both entry points | One permanent reveal, quiet name clearing, separately recorded once-only source effects. |
| Ambush | Recorded physical ID, face-at-draw and Danger | Captured face survives evolution; no hidden deck, automated combat or unobserved outcome. |
| Temporary effects | Explicit activation/consumption/end | No reset on mounting, reload or unrelated round tap. |
| Exo-Skeleton | Additional Final Health token observation | No Health gain or hidden-face disclosure. |

## Artwork manifest proposal

Native targets are planning budgets, to be finalized against actual rendered geometry before generation.

| Stable group | Images/states | Target geometry and treatment |
| --- | --- | --- |
| evomorph.header | One owner banner | About 2048×768, crop-safe creature focal point and dark HTML-title area. |
| evomorph.stage | Hatchling, Youngling, Adult | Three wide 1536×864 or larger source images. Preserve source-backed forms, distinct scale/silhouette, phone crops and available-light realism. |
| evomorph.presence | On-board / vanished | Use a coherent scene with a visibly absent creature for vanished; no implied teleportation or casualties. Determine whether stage compositions can supply these without redundant assets. |
| evomorph.power.* | Four named cards, including Epic | Four independent wide 1536×864 or larger photos; correct claw/tail/body identity and distinct story beats. |
| evomorph.finale.* | Three named cards | Three wide photos, independently mapped before alphabetical sorting. |
| evomorph.minor.* | Sideswipe, Shadow Dread, Dead Silence | Three wide photos supporting small dim choices and larger active state; live hearts remain HTML. |
| evomorph.scan | Scan token/quiet scanned-space treatment | Reusable art supporting labelled spaces without inventing location scenery. No ten generic Ambush illustrations solely to fill a list. |

Use candid, physically believable 1980s consumer-camera reproduction with restrained grain and coherent light. The photographic treatment does not relocate futuristic lore to the historical 1980s or turn the creature into an unrelated generic monster. Preserve approved existing assets that pass inspection. Review actual image crops under controls; no raw card-photo UI, stretched contact sheets or rendered text in imagery.

## Integration and verification coverage

All implementation rows remain **planned**, not completed.

| Area | Required evidence |
| --- | --- |
| Source accuracy | 16 Terror counts, 10 paired Ambush identities / 20 outcomes, 3+1 Powers, 3 Finales, Minor 3/2/2 health and all confirmed setup/board rules. |
| State/persistence | Fresh versus legacy unknown; legal stage/presence transitions; six-token capacity/duplicates; once-only reveal effects; grouped Undo of reversible effects with permanent reveals retained; failed save/retry, rapid taps, reload/offline recovery. |
| Ownership | Evomorph with each supported existing location; other killers retain their mechanics. Scan does not require USS Konrad. |
| Shared UI | Both reveal entry points, multiple Minors, named/unnamed/cleared cards, quiet corrections, Epic and pending effect resolution. |
| Narrative/death | Stage/vanished facts at the historical event; Ambush identity and revealed effects; cached reopening, retry, narration and ending/archive consistency. No fabricated casualties or location swaps. |
| Visual review | Actual loaded UI at 1280×640, 1366×768, 1440×900, 390×844 and 320×568; selected/unselected, unknown, active/depleted, long names and errors. Keyboard focus, 44px targets, reduced motion and overflow. |
| Automated gates | Applicable domain/shared/browser suites, npm run check, npm run check:assets, npm run build, final-head required CI. Mock tests are distinct from authorized live-provider/production smoke tests. |
| Release | Assess at least generate-death-scene and narrate-story plus every affected shared-domain caller. Frontend changes expected; exact function/Storage/migration list only after implementation audit. No deployment performed. |

## Completion criteria and targeted verification

An import is ready for review only when every applicable integration above is implemented and the following demonstrations pass. These are future checks, not claims of completed testing.

1. **Source reconciliation:** canonical quantities sum to sixteen Terror cards, ten paired Ambush cards/twenty faces, three regular Powers plus one Epic, three Finales and three identical Scan copies; all source conditions/icons/timing accounted for. No name-only effect substitutions. Printed board range and Minor Health match E2/E6.
2. **Fresh/legacy and optional trackers:** a verified new session gets the standard setup once at the durable boundary; a legacy or resumed empty log does not become Hatchling automatically. Opening/expanding writes nothing. Adult recovery reads 10 in the shared summary and relevant form defaults, with the existing optional tracker left hidden if stopped. Correction/reload does not re-heal. Generic Bloodlust edits neither Evolve nor de-evolve, including edits across positions 1/5 or high legacy values.
3. **Reveal transaction:** named and unnamed Adult cases, a pre-existing reveal, and simultaneous panel/Remember This taps produce one permanent milestone and one effect resolution. Failed local save writes neither half; retry succeeds once. Undo restores the reversible group while preserving that reveal. Clear/rename/reload does not repeat recovery, Scan removal or casualties. Stale parent requests and invalid dependent rollbacks fail safely.
4. **Ambush history:** record Youngling Danger 10 and then evolve to Adult; the pending/resolved observation and a contextual death still reference the Youngling face and the correct physical paired ID. Adult Danger is not substituted. Unknown stage cannot silently choose a face. Physical replacement/highest-Danger decisions create no hidden digital draws.
5. **Scan and timing:** place six unique tokens, attempt a duplicate, move a player-selected farthest token at capacity, correct a label without duplicating the physical token, and test known-empty versus incomplete legacy placement. Record Scan 3+ with existing tokens: return, increment removed copies once, record the pending phase skip, retain those tokens. Reject a fourth removed copy. Explicitly consume the skipped phase and end Toying with the Prey; mount, round taps and reload do not resolve them. Verify the source-specific clear-all cases separately.
6. **Casualties and hidden state:** Razor Tail uses confirmed physical outcomes, with no duplicate normal death record or inferred Bloodlust/damage from a count. Exo-Skeleton never adds Health or discloses token values. Sideswipe/attack symbols establish no unrecorded injuries. All reversible linked state recovers consistently through Undo and save failure.
7. **Mixed ownership and narratives:** exercise Evomorph with every currently supported location, including player-labelled ordinary spaces; preserve location controls and long location facts within bounded narrative context. Historical deaths use the captured Ambush face/current facts at the event; later gameplay does not leak backwards. Cached reopen/retry/narration, ending and archive work. No decorative lake/tunnel, hidden card, casualty or Adult anatomy is asserted as an unobserved scene fact.
8. **Artwork and real UI:** inspect the registered portrait before deciding retention/replacement. Review stage identity/materials, wide selected heroes, dim unselected/Epic choices, multiple Minors and zero/unknown states in loaded UI. Check all five prescribed sizes, focus/44px targets, long labels, errors, reduced motion and 320px overflow. No placeholder artwork or raw card-photo UI at completion.
9. **Contracts and release:** run applicable domain/shared/browser tests, check, asset validation, build and final-head required CI. Compare client/server and relevant PostgreSQL/JSONB historical-fact signatures; reject unsupported observations consistently. Identify exact affected functions, Storage references and any required SQL from the final diff. Assess generate-story, generate-ending, generate-visual-bible, generate-scene-image, generate-death-scene and narrate-story where their actual imports change. Deployment and authorized live smoke results remain separate from CI mocks and merge.

## Remaining uncertainties and next steps

- **Scan source gap resolved:** three identical copies, confirmed by Levi. No further Scan photo requested.
- Per-face exact transcription, full caller/database audit and visual inspection of the existing portrait remain execution tasks. Source photos are accessible; no additional photo currently blocks this killer-only plan.
- Early-stage anatomy is only shown in small Evolution illustrations. Preserve verified forms/silhouettes; do not fabricate fine canonical anatomy. Inspect the best existing assets before generation.
- Combined Ambush modifiers are not automated; retain each verified instruction and physical resolution. Only seek publisher clarification if a later requested executable workflow depends on adjudicating that interaction.
- Ellen/Jenette and USS Konrad imports remain deferred, with no new source request for them.
- No standing permission to merge, publish, deploy or perform paid live provider smoke tests is implied by this plan. Report the actual completed revision, CI and release status separately.
- Next: after implementation approval, execute the six steps above. This review changes only the planning record.



Paired location import: [USS Konrad](uss-konrad.md), implemented independently in PR #151. Its source inventory and verification do not certify or replace this Killer record.
