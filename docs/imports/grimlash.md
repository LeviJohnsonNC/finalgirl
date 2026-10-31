# Grimlash killer module import record

## Implementation record — October 31, 2026

Implemented on [PR #156](https://github.com/LeviJohnsonNC/finalgirl/pull/156), branch `codex/grimlash-killer`, based on main `1844e7c39c2056abbc1f28c52ea2c837894145cb`. The source inventory and revised decisions below preserve the planning evidence; this implementation record supersedes their earlier “planning only” status.

- Killer-only Rules, Play, shared reveals/Minors, narrative/death facts, persistence and ending review are implemented. No Shady Acres module, location art, Children mechanics or new Final Girl abilities/items were added. The existing Children outcome field is now location-scoped.
- Canonical catalogs preserve all 15 Harvest cards, 16 physical Terrors across 12 unique faces including Minors, 4 Powers and 4 Finales. Board starts at Health 10/Horror 4; Bloodlust 0–8 has its own printed entry-effect table. Action sequences are separate from triggered prose. The unconditional last action block of “It Consumes All!” applies after either level-specific block.
- Exact Madness positions, owner-parent replay, atomic card retirement, owner-ordered Undo/Restore, Ready/Spent/unknown faces, explicit Upkeep, correction-preserved peak/face state and sticky skull/explicit Telluric loss share one frontend/edge resolver. An explicit retraction of an erroneous skull loss also clears the stale skull position/peak atomically, so a reviewed win cannot carry contradictory skull facts. Legacy records remain unknown. Physical rules, dice, decks, costs, healing and casualties remain player-resolved.
- Effective Health composes the starting/Ultimate provenance and the known +1/+3 kept cards for Grimlash only. Both Play and ending review preserve observed excess Health and decrement exactly one. Card metadata does not heal or clamp. Fatal Grimlash and USS Konrad endings are combined before computing the reviewed result.
- Completed 47 dedicated independent photographic scenes plus a source-faithful replacement identity and 35 card thumbnails. No production contact-sheet crops, borrowed killer art, known-ID fallback or orphan images. Exact sources, native dimensions, crops, budgets, byte sizes and SHA-256 live in [the art manifest](../../src/assets/play/photos/grimlash/manifest.json) and [art README](../../src/assets/play/photos/grimlash/README.md). Official/user-image preferences retain precedence. Shared Bloodlust, jeweled hearts and unknown/custom Terror cause illustrations are deliberate reuse.
- Actual compiled UI review covers 1280×640, 1366×768, 1440×900, 390×844 and 320×568. Reproducible capture journeys are in `tests/browser/grimlash.spec.ts`; artifacts are attached to the [PR checks](https://github.com/LeviJohnsonNC/finalgirl/pull/156/checks). Review found and corrected caption positioning, wide entity focal points, narrow track fitting and a non-Grimlash Health-stepper regression introduced by the first draft. The Minor journey uses the standard Add another Minor Power interaction.
- Verification commands: `npm run check`, `npm run check:assets`, `npm run build`; complete required frontend, Deno edge, PostgreSQL and desktop/mobile browser CI. Final head status and exact run evidence are recorded on PR #156. Local Node 25 needs `NODE_OPTIONS=--no-experimental-webstorage` for jsdom; supported CI uses Node 22. Local preview sockets/headless launch were restricted, so rendered verification uses the real compiled frontend in CI with synthetic ArchiveMock sessions, never production game data or live generation.

### Release state

This is a reviewable implementation, not a production release. No merge, frontend publication, backend deployment or paid live provider smoke test has been performed. No SQL schema migration is required.

`node scripts/opening-references.mjs` now includes Grimlash and stages the exact JPEG at `build/opening-references/grimlash.jpg`. Its manifest digest is `479c632f7550e4c50c0736af026c865ebb43a9a6d656f3f8a4402fd1b7e091b0`; all 42 existing object entries/digests are unchanged. The private `opening-references/grimlash.jpg` object has **not** been uploaded or verified remotely. Upload those exact bytes and check the digest before releasing the new manifest consumer; a listed missing object fails closed. Storage management/deployment credentials were not available through the repository connector.

Compatible backend consumers to deploy before frontend release: `generate-story`, `generate-visual-bible`, `generate-ending`, `generate-scene-image`, `generate-death-scene` and `narrate-story`. Then perform a live Grimlash opening/Reshoot, death vignette, reviewed ending and poster smoke test. Mocked transport/schema/browser success does not establish live model likeness, provider behavior, private object availability or deployed revision parity.

## Original inventory and approved revised plan

## Scope and status

The following inventory and plan were reviewed October 30, 2026, America/Regina, before implementation. See the implementation record above for current status.

- Owner: killer, **Grimlash**. Retain existing film ID `s4-rotten-harvest`; proposed new Play owner ID `grimlash`.
- Extend the existing A Rotten Harvest entry. Keep Shady Acres, Children, Ancient Curses, location Setups/Events/Items, Joy/Vicky abilities and secret items outside this pass.
- Standard mode plus the supplied Epic Power and Epic Finale; no reverse/Extreme Horror rules inferred.
- Reviewed online repository: [LeviJohnsonNC/finalgirl](https://github.com/LeviJohnsonNC/finalgirl), main commit `1844e7c39c2056abbc1f28c52ea2c837894145cb`.
- Follow current [MODULE_STANDARD](https://github.com/LeviJohnsonNC/finalgirl/blob/1844e7c39c2056abbc1f28c52ea2c837894145cb/docs/MODULE_STANDARD.md), MODULE_IMPORT_PLAYBOOK, module-controls, PLAYTEST_POLISH, IDENTITY_PHOTOS and MODULE_IMPORT_RECORD template. Actual Groves reference images reviewed: selected Power/Finale on laptop, active Minor on phone, and Killer Wrath track on laptop. Old Change Finale button in the reference capture is superseded by current Clear card name behavior.
- This record is prepared for `docs/imports/grimlash.md` during implementation. No separate Shady Acres record is created before its source batch.

## Critical review and revised decisions

The source inventory, killer-only scope, physical-deck boundary, shared Minor/reveal controls, separate owners and five-size visual checks remain sound. The following corrections replace the earlier loose assumptions; this remains a plan, not an implementation report.

| Significant issue | Evidence and impact | Concrete correction |
| --- | --- | --- |
| Artwork coverage was incomplete and some destinations were unspecified. | The saved 37-scene plan omitted the ten unique ordinary Terrors. PlaySearch is text-only and Rules RuleBlock has no general image type; merely generating extra files would not display them. | Add ten distinct Terror scenes and stable ID mappings. Show the selected known Grimlash Terror image within the existing Terror cause tile in DeathSceneDialog, keeping the same six-tile grid and dialog geometry. Use Grimlash's portrait for his Killer cause tile. No new gallery or Rules renderer is needed. Inspect every visible asset/crop and reject orphan or missing mappings. |
| Opening identity work cannot be conditional only on replacing the portrait. | Grimlash is absent from openingReferenceManifest.ts. openingReferenceNames filters unlisted identities out, so generated openings currently receive no Grimlash photograph. An absent manifest entry is different from a listed but missing/bad-digest object, which fails closed. | Add the reviewed Grimlash identity entry and exact JPEG object/digest even if the existing image passes review. Stage/upload/check that object before release, and deploy the compatible loader consumers. Preserve user image preferences on display surfaces; do not pretend generated references automatically honor arbitrary overrides. |
| The existing ending form violates killer/location ownership. | GameOutcomeForm.tsx gates both Children Survived and Harvest Madness Peaked on isGrimlash, and defaults Children to 0. Grimlash in another location can consequently fabricate Children facts. | Keep Children UI/output scoped to Shady Acres only, preserving its existing legacy behavior pending the separate location import. Replace the vague Grimlash peaked checkbox for new records with observed maximum level, exact position and explicit loss reason when known. Legacy peaked remains ambiguous and must never become a skull/loss automatically. |
| Temporary maximum Health requires a shared calculation and exact editing semantics. | observedFinalGirlMaxHealth only accounts for starting/Ultimate Health. PlayScreen's decrease uses min(value-1, maximum), so lowering a cap can make one tap silently drop several Health. Outcome forms/history and TheEnd use a separate saved maximum. A 7-Health cast can legally reach 11 with both Harvest bonuses. | Add a narrowly scoped effective-maximum helper using existing base/Ultimate provenance plus active known Grimlash modifiers. Wire current/historical/ending callers consistently, preserve the base snapshot separately, and save the effective ending maximum. Minus changes exactly one; metadata changes never heal or clamp a recorded value. Test Kate's Ultimate and a 7-Health cast with both bonuses. |
| Atomic writes alone do not make dependent Undo safe. | Current shared code has explicit parent/replay rules for Evomorph/Konrad. An ordinary patch plus generic Undo could revive an old card after a later drop/reacquisition or reset a newly acquired card. | Use an owner-specific command resolver with a prior-owner-event token, canonical linked changes and history validation on frontend and edge. Undo Grimlash state transitions in owner order; stale/dependent Undo or Restore must be rejected until later owner transitions are undone. Unrelated location observations remain independent. |
| Skull/loss state and a position correction were underspecified. | The physical rules say immediate loss; the original plan allowed a later explicit outcome action without specifying whether lowering the track erased the loss. Telluric has a different loss trigger, and the existing ending route can retain the originally recorded outcome. | Recording arrival at skull records the loss in the same durable observation, without auto-closing Play, changing Health or recording a Victim death. A later ordinary position move cannot erase a recorded loss. Correct an erroneous observation through explicit correction/Undo. Carry validated loss through initial result, reviewed save, same-case updates, archive/stats and both prose/poster requests. Telluric loss is explicit, never inferred from current Horror/Bloodlust alone. |

Two earlier conclusions are tightened: Play's default already suggests killer Health 10 and Horror 4 via fallback; the confirmed Health discrepancy is the separate killerHealth.ts catalog value 9. Also, the thumbnail identity audit is not a full-resolution likeness approval. Its final keep/replace decision requires the original image and the source board/card references.

No new engine, broad UI redesign, location implementation or Final Girl ability import is added. Interactions among dice-modifier cards are retained as printed Rules, not adjudicated by this companion.

## Source access and persistent ledger

All six original uploaded images are accessible and visible in this conversation; Library resolves each at 1536×2048. The original Harvest Madness photograph also opens in the authenticated browser viewer. These persistent originals, not extracted text, govern the inventory. The automated local transfer encountered a host DNS restriction; no successful local original download is claimed. GitHub connector reads of current source, tree and reference images succeed; a terminal git fetch is separately blocked by host DNS. This does not block this planning pass.

| ID | Original | Contents |
| --- | --- | --- |
| G1 | [grim6.jpeg](https://chatgpt.com/library?file_id=libfile_e2e3f5c078e08191abdb184f235ba9fd&account_id=personal) | Full standard killer board, sideways: Health/Horror, Harvest Madness spaces, Bloodlust rows and overflow instruction. |
| G2 | [grim15.jpeg](https://chatgpt.com/library?file_id=libfile_02cabc461b8c8191815729cc255a899d&account_id=personal) | Lore, credits and printed component counts. |
| G3 | [grim4.jpeg](https://chatgpt.com/library?file_id=libfile_2f1d192054a48191aa1fef6916f657e5&account_id=personal) | Special setup and complete supplied Harvest Madness rules. |
| G4 | [grim3.jpeg](https://chatgpt.com/library?file_id=libfile_b95caccbeaf081919ecef083eb972f28&account_id=personal) | All 15 Harvest Madness faces, 5 per level; sideways. |
| G5 | [grim2.jpeg](https://chatgpt.com/library?file_id=libfile_7c35059af3dc81918d63a75da01c34a9&account_id=personal) | Four Finales and four Dark Powers, including both Epic cards. |
| G6 | [grim1.jpeg](https://chatgpt.com/library?file_id=libfile_f43c4eca17e0819196bd8c0284174ba2&account_id=personal) | Sixteen portrait Terror-deck faces, including two Minors, plus an unnamed landscape action face. |

Credits from G2: design Ryan Jorjorian; art Ondine Champetier de Ribes. Library-generated OCR/captions are unreliable for icons and even the board name; do not import those captions as rules.

## Reconciled inventory

| Component | Printed total | Supplied coverage | Status |
| --- | ---: | --- | --- |
| Killer board | 1 | G1 full gameplay face | Verified standard face; no reverse variant claimed. |
| Regular Finales | 3 | G5 all three | Hunger of the Old Gods; Ancient Abomination; Withered Harbinger. |
| Epic Finale | 1 | G5 | God of Blood and Grain. |
| Regular Dark Powers | 3 | G5 all three | Rite of the Corrupted; Root-Bound Curse; Rite of the Old One. |
| Epic Dark Power | 1 | G5 | Fields of Madness. |
| Harvest Madness cards | 15 | G4 all fifteen, five per level | Complete supplied face set. |
| Terror deck | 16 | G6 sixteen portrait faces | Fourteen ordinary Terror copies, ten unique ordinary titles, plus two distinct Minor Powers. Do not count the Minors again as extra Terror cards. |
| Harvest Madness marker | 1 | Illustrated in G2/G3; track in G1 | Role/count verified; loose marker not separately photographed. |
| Final Girl cards | 2 | Component thumbnails only in G2 | Joy and Vicky are already cataloged; no ability/secret-item import in this scope. |

The landscape action face in G6 is an additional photographed face, not a seventeenth portrait Terror card. Its exact physical card/reverse identity is not established by a label in this batch; retain that qualification in the source ledger.

### Terror duplicate ledger

| Ordinary title | Copies |
| --- | ---: |
| “Was That Scarecrow There Before?” | 2 |
| “It Consumes All!” | 1 |
| “…And Death Followed With Him.” | 2 |
| Bleed Upon the Earth | 1 |
| A Bad Moon Rises | 2 |
| Shadows in the Fields | 1 |
| To Water the Earth in Blood | 2 |
| Roots of Insanity | 1 |
| Violent Growth | 1 |
| “It Has Always Been Here!” | 1 |
| **Ordinary Terror total** | **14** |

Minors in the same sixteen-card deck: **Flaming Eyes**, 1 Health; **Burning Sickle**, 2 Health. Use the supplied punctuation as display copy, stable slug IDs as identity, and explicit quantities rather than duplicating unique catalog entries.

## Current repository audit and corrections

| Surface | Current evidence | Planned change |
| --- | --- | --- |
| Catalog/casting | Existing A Rotten Harvest, Grimlash, Shady Acres, Joy and Vicky in gameData; film lore in featureFilmDetails. | Retain IDs, ownership and casting; no duplicate film or forced location. |
| Starting killer Health | killerHealth.ts currently assigns Grimlash **9**. | Correct verified default to **10**. Do not rewrite old observations, cases or statistics. |
| Play starting suggestions | play/defaults.ts already falls back to killer Health **10** and Horror **4**. | Add explicit source-backed Grimlash entries without treating existing fallback suggestions as a new setup observation or enabling stopped trackers. |
| Starting Horror | Board G1 shows **4**. | Source-backed fresh-game default, preserving the optional-tracker policy and unknown legacy values. |
| Rules | moduleRules.ts already contains the supplied general Harvest Madness setup/rules. | Preserve correct text; add board/card facts, searchable names, cross-references and canonical card data. |
| Play | No Grimlash entry in moduleDefinitions; no Grimlash domain owner in ModuleObservation union. | Register killer panel and verified state/validation across frontend and edge. |
| Card catalog | No Grimlash-specific canonical module catalog or reveal art. | Add all supplied Powers, Finales, Minors, Harvest cards and Terror references. |
| Visual/narrative identity | Existing identity images and generic prose; killerSpecialRules currently ties Grimlash to Shady Acres and lacks Madness loss. killerDescriptions assumes a formal suit and a particular carved face. | Review existing image against physical references before retaining; correct unsupported visual assumptions and hardcoded setting. Add source-backed loss/state guidance. |
| Bloodlust artwork | Grimlash absent from verified per-killer maxima. | Add photographed standard range **0–8**, map nine positions distinctly through shared killer-agnostic images, retain exact high legacy values. |
| Existing ending ownership | GameOutcomeForm.tsx binds Children Survived to Grimlash and defaults it to 0. | Gate the existing Children field/highlight on Shady Acres; a mixed-location Grimlash result must not carry it. Keep detailed Children mechanics for the later location pass. |
| Opening identity references | Grimlash is missing from openingReferenceManifest.ts; unlisted names are omitted by openingReferenceNames. | Add reviewed identity manifest/object/digest coverage whether the main photograph is retained or replaced. |

## Verified board and Harvest Madness rules

G1 shows 10 starting Health, Horror 4, and nine Bloodlust positions including the separate starting space. Bottom-to-top standard Bloodlust values:

| Position | Attack | Movement | Printed entry effect |
| --- | ---: | ---: | --- |
| 0 | 1 | 1 | Starting position. |
| 1 | 1 | 1 | Increase Harvest Madness once. |
| 2 | 1 | 1 | No additional entry icon. |
| 3 | 2 | 1 | No additional entry icon. |
| 4 | 2 | 2 | Reveal Dark Power. |
| 5 | 3 | 2 | Recover 2 killer Health. |
| 6 | 3 | 2 | Increase Harvest Madness once. |
| 7 | 4 | 3 | Increase Horror once. |
| 8 | 4 | 3 | Recover 2 killer Health. |

Above maximum: discard the next Terror card. These are Rules/reference facts; changing Bloodlust in the companion does not automatically heal, reveal, discard or advance Madness.

Harvest Madness uses exact physical positions, not a 0–3 counter:

| Proposed position index | Printed level |
| --- | --- |
| 0, 1, 2 | Level 0 |
| 3, 4 | Level 1 |
| 5, 6 | Level 2 |
| 7, 8, 9 | Level 3 |
| 10 | Skull; immediate loss |

Position 0 is the orange-outlined starting space shown in G3. The indices are app coordinates, not printed board numbers.

- Shuffle three separate five-card Harvest Madness decks physically.
- A Madness icon advances one physical space. On entering a higher level, physically draw two from that level, keep one and discard the other.
- Lower-level kept abilities persist while at or above their level.
- Leaving a level downward discards that level's kept card. Re-entering requires a fresh draw-two/keep-one; an old card must not be resurrected automatically.
- If a draw needs more cards than remain, reshuffle that level's discard pile.
- Resolving healing icons is an either/or choice: heal normally or reduce Madness one space per heart. Do not split that resolution across both.
- Flipped once-per-turn cards become faceup in the Upkeep phase, not on render, reload or an arbitrary round-number edit.
- Skull is an immediate loss. The app must preserve this outcome without inventing zero Health or an extra physical attack.

### Harvest Madness card facts

Keep effect text in Rules. The Play surface records the kept identity and applicable ready/spent state, without resolving dice, Time, damage or healing.

| Level | Card | Faithful effect summary |
| --- | --- | --- |
| 1 | Decaying Humanity | Flip to convert a partial-success die by discarding one Action card instead of two. |
| 1 | Vile Prowess | Flip when rolling two unmodified successes to gain 4 Time. |
| 1 | Thorn-Choked Veins | Increase maximum Health by 1 and recover 1 Health; on discard lower maximum by 1 and lose Health above that maximum. |
| 1 | Blooming Pestilence | Flip while on a Search or Exit space to recover 1 Health. |
| 1 | Hollow Soul | Flip during a Horror Roll to reroll one blank die. |
| 2 | Vulgar Regrowth | Flip to ignore 1 damage. |
| 2 | All-Consuming Energy | During a Horror Roll, flip and increase Horror once to change one partial success to a success. |
| 2 | Visions of the Beyond | Gain 2 Time each time the Horror-increase icon is resolved. |
| 2 | Blood of the Reaper | During a Horror Roll, flip and lose 1 Health to reroll all partial-success dice. Health loss is distinct from damage. |
| 2 | Primal Awareness | During Action, flip to resolve an Action costing 3 Time or less from the Tableau as though played from hand. |
| 3 | Entangled Fates | When a Terror would be drawn, draw two and resolve one, putting the other on the deck bottom. |
| 3 | Fiendish Vitality | When the black Final Health token is flipped, recover 2 Health if blank. |
| 3 | One With the Land | Increase maximum Health by 3 and recover 3 Health; reverse maximum increase on discard and lose any excess Health. |
| 3 | Unnatural Possibilities | Action cards cost 1 Time less. |
| 3 | Telluric Visions | Horror Rolls always use three dice regardless of Horror; if Bloodlust is at maximum and increases because Horror is raised, immediately lose. |

Thorn-Choked Veins and One With the Land can coexist: effective maximum Health can be base +4. Merely naming or correcting a kept card must not heal or retroactively clamp recorded Health. New legitimate Health increases must accommodate a verified raised maximum. Mandatory excess-Health loss on card removal remains player-resolved and must not silently rewrite an observed value.

### Power and Finale facts

| Type | Card | Source-backed condition |
| --- | --- | --- |
| Dark Power | Rite of the Corrupted | During Upkeep, increase Madness if it did not increase that turn. |
| Dark Power | Root-Bound Curse | When healing icons are resolved for healing or Madness reduction, Grimlash recovers half that many Health, rounded up. |
| Dark Power | Rite of the Old One | When Madness increases to a new level, discard the next Terror card. |
| Epic Dark Power | Fields of Madness | Horror Roll dice: Level 0/1 minus one, minimum one; Level 2 unchanged; Level 3 plus one. |
| Finale | Hunger of the Old Gods | At end of Killer phase all Victims move one space toward Grimlash. |
| Finale | Ancient Abomination | When Grimlash resolves an attack, add the Madness **level**, not physical-position index, to Attack Value. |
| Finale | Withered Harbinger | Each space Grimlash moves during Killer phase costs Time as indicated. No automatic movement/Time deduction. |
| Epic Finale | God of Blood and Grain | On reveal, kill all Victims. Naming the card does not automatically change casualty totals. |
| Minor | Flaming Eyes | When Grimlash enters the Final Girl's space, increase Madness twice; 1 removable Health. |
| Minor | Burning Sickle | When Grimlash damages the Final Girl, also deal one damage to every Victim in her space; 2 removable Health. |

### Ordinary Terror effect ledger

Source G6. A target followed by Move/Attack denotes printed action icons and current printed Movement/Attack values, not an invented fixed number of spaces/damage. Keep icon sequences in canonical data. Horror icons mean Horror increases, not extra Horror Rolls.

| Title | Printed sequence and conditions |
| --- | --- |
| “Was That Scarecrow There Before?” | Target the Final Girl, Move, then increase Horror twice. |
| “It Consumes All!” | Madness Level 0/1: target the Final Girl, Move, Attack. Level 2/3: target the closest target (Final Girl or Victim), Move, Attack; then target the Final Girl, Move, Attack. |
| “…And Death Followed With Him.” | Target the closest target, Move, Attack; if Madness Level is at least 1, choose either lose 1 Health or increase Bloodlust once. |
| Bleed Upon the Earth | Target the closest target, Move, Attack; increase Horror zero/one/two/three times at Madness Level 0/1/2/3 respectively. |
| A Bad Moon Rises | Increase Madness once; target the closest target, Move, Attack. |
| Shadows in the Fields | Panic all Victims in the Final Girl's space; increase Madness twice. |
| To Water the Earth in Blood | If no Victims remain on the board, discard and draw the next Terror. Otherwise target a Victim, Move, Attack. |
| Roots of Insanity | If Horror is at least 5, increase Madness twice and discard this card. Otherwise increase Horror twice. |
| Violent Growth | If no Victims remain on the board, discard and draw the next Terror. Otherwise target a Victim, Move, Attack; increase Horror twice. |
| “It Has Always Been Here!” | At Madness Level 3, increase Horror twice and discard this card. Otherwise increase Madness twice. |

The selected Terror supplies a potential rule mechanism; it is not proof that any conditional branch, resource change or casualty occurred. Preserve the separate copy-count ledger above.

Store and verify the action-icon sequences separately from prose in the canonical catalog. The unnamed action face shows a one-space movement action, an attack and a conditional Madness increase if a Victim was killed. Do not turn that into an automatic phase engine.

Terror conditions include Madness-level branches, conditional Horror increases, choices between losing Health and increasing Bloodlust, Victim panic, and discard/redraw when no Victims remain. Keep every branch and duplicate count in canonical Rules/death references. Selecting a Terror as a death cause never executes it.

## Planned interaction and state map

### Panel composition

Killer photographic header and concise summary first; inside, Harvest Madness track and kept abilities, then Minor Powers, then shared Dark Power/Finale controls. Preserve the four existing optional tracker cards and the surrounding Play page. Expanded modules may scroll.

| Operation | Visible behavior and durable semantics |
| --- | --- |
| Record Madness position | One wide photographic track, physical-position controls and clear level label. Plus/minus records observed physical advances/reductions; a quiet direct editor records a correction. Distinguish those intentions in history/narrative. Unknown is visibly unrecorded, never position 0 by default in resumed games. |
| Enter a new level | Expose the corresponding kept-card slot. Player chooses the actual card kept after the physical draw. Five small muted choices become one selected wide photo; do not simulate draws, discard piles or shuffle. |
| Drop below a level | One concise inline preview at the boundary names kept cards being discarded; do not add a modal confirmation per tap. Save position, cleared card identities and cleared spent flags atomically. Retain lower eligible cards. Owner-ordered Undo restores the whole observation. A correction records corrected current eligibility without claiming a physical discard occurred. |
| Skip multiple levels in a correction | Retire all newly ineligible cards together or expose all newly eligible unrecorded slots. Never invent a draw order or selected card. |
| Re-enter a former level | Start with an unrecorded kept card; no old-card resurrection. A quiet correction can record the actual known identity without applying acquisition effects. |
| Use a flippable ability | Click selected card picture to record Ready/Spent; spent is dimmed and labeled. Passive cards do not receive a fictional flip action. No dice, resource or Health mutation. |
| Record Upkeep | One explicit action restores spent kept cards together, visible only when something can reset. Round edits and reload do not reset them. No automatic Rite of the Corrupted Madness advance and no new generic phase counter. |
| Correct a kept card | Quiet clear/change-name access; preserve immutable acquisition/use history and distinguish missing identity from no kept card. Card corrections never replay costs or bonuses. |
| Minor Powers | Shared MinorPowerGroup/MinorPowerControl/HealthTokens, before reveals; Flaming Eyes one heart, Burning Sickle two. Both may coexist; Removed and unknown states stay distinct. Use original jeweled live/spent hearts. |
| Power and Finale | Shared KillerCards/RevealedCard from both panel and Remember This; muted choices, wide named photograph, hidden alternatives and Epic treatment. Left-aligned Clear card name preserves permanent reveal. |
| Record a Madness loss | Recording arrival at skull atomically records skull loss without changing Health, Victim totals or automatically closing Play. Ordinary later movement cannot cancel it. Undo/correction can retract an erroneous observation. Telluric's conditional loss is recorded explicitly through a compact loss-reason action in the ending review; it is never inferred from current numbers. Guard initial and reviewed results against a contradictory victory and update the same saved case. |

State contract: exact position or unknown; per-level kept-card identity with an explicit known-empty/unknown distinction; faceup/facedown/unknown for cards that can flip; and an explicit loss reason or unknown/none observation. A known card's face can be unknown on a resumed session; passive cards have no face-control state. When a lower position is known, higher cards cannot remain active. When position is unknown, explicitly recorded kept cards remain observations rather than being erased by a guessed level. Maximum observed level/position for new ending records derives from resolved advancement history, excluding retracted observations and not interpreting a position correction as a physical peak.

Commands: initialize (fresh provenance only), record movement, correct position, record/correct/clear kept identity, record face state, record Upkeep, record/correct loss, and shared Minor/reveal operations. Use a prior-owner-event token and one canonical resolver for dependent Madness operations. Apply the same transition/history/ownership rules to locally accepted events, server validation, replay, Undo and Restore. A plain field-shape validator is insufficient. Reuse the existing immutable event storage; no new database schema or generic engine is planned.

Health contract: compose existing starting/Ultimate provenance with active known Thorn-Choked Veins (+1) and One With the Land (+3), scoped to killer Grimlash. Preserve the base/starting snapshot; never feed an already effective saved maximum back through the bonus calculation. Each Health decrement changes exactly one observed Health. When a cap falls below recorded Health, show the discrepancy and allow recording the physically resolved value; do not clamp on render, selection, clear, submit or an unrelated edit. Existing observations and unknown base/Ultimate state remain honest. No automatic acquire-heal, discard damage, Root-Bound Curse recovery or dice/resource effect is added.

## Artwork plan

Use independent, native, physically convincing 1980s photographs: real material texture, coherent light, believable silhouette and practical fire exposure. G1/G5 govern Grimlash's identity over unsupported generated prose. The source's charred gourd/crown, tangled root-like form and ragged dark silhouette must remain recognizable. Avoid turning the module into generic Halloween decorations or a clean orange emoji pumpkin.

| Asset group | Planned coverage | Composition |
| --- | --- | --- |
| Killer panel header | 1 dedicated Grimlash scene | Wide; ivory title and controls in HTML; camera/crop planned before generation. |
| Harvest Madness track | 11 distinct position scenes, including skull | One coherent environmental/corruption progression, three Level-0 steps through Level 3 and fatal endpoint. Distinct at every physical step; imagery establishes no session casualties or injuries. |
| Harvest kept cards | 15 distinct scenes | Wide 1536×864 or larger native sources; ability-specific imagery without baked rules, labels or dice. Dimming supplies Spent state where the physical state is otherwise unchanged. |
| Minor Powers | 2 distinct scenes | Flaming Eyes and Burning Sickle; shared hearts remain separate graphics. |
| Dark Powers | 4 distinct scenes | Separate regular/Epic identity and crop. |
| Finales | 4 distinct scenes | Separate regular/Epic identity and crop. |
| Ordinary Terrors | 10 distinct scenes | One per unique ordinary title; duplicate cards share a scene. Use the selected named Terror's photo in the existing Terror cause tile, keeping its caption, accessible name and six-tile layout. An unselected/custom unknown Terror retains the existing generic cause illustration deliberately. |
| Shared Bloodlust | Reuse approved set | Add verified Grimlash 0–8 mapping; no killer-specific replacement set. |
| Existing cast identity | Full-resolution keep/replace gate | Verify against G1/G5 and the approved photo-quality reference; the current thumbnail is not approval. Replace if likeness or photographic quality fails. Derive Collection portrait, selector/detail and tracker crops consistently; preserve approved user overrides. Add the reviewed opening reference even when retaining this image. |

Planned baseline: **47 dedicated scenes** (1 header, 11 Madness positions, 15 Harvest cards, 2 Minors, 4 Powers, 4 Finales, 10 Terrors), plus a replacement identity photograph if required. Keep the count as a coverage check, not a quality score. Existing shared Bloodlust and jeweled hearts are deliberate reuse; no additional art per duplicate Terror, spent ability, lost Minor heart or unknown state is required.

Every image has a visible destination and stable entity ID before generation. Map card art by ID before alphabetical sorting; use a Grimlash-specific mapping so missing registration cannot fall through to Billy's atlas. Verify the header, Madness, kept cards, both reveal entry points, Minors, Remember This, Killer Health portrait, selected Terror/Killer cause tiles and relevant historical/detail views. Current PlayScreen uses the killer portrait for Killer Health and displays Power/Finale photographs in Remember This; preserve that division rather than assuming the Health tracker already switches to reveal art. Preserve the existing Collection scene/box art and ending-poster medium. Fixed card scenes must not depict a specific Final Girl as if she were the selected cast member.

No contact-sheet crop shortcuts or stretched portraits. Use explicit focal points/phone crops, small thumbnails and optimized WebP derivatives; record native dimensions, exact mappings, provenance, hashes, crop decisions and budgets in the owner's art README. Initial budgets: selected scene ≤200 KB and small thumbnail ≤35 KB where quality permits; measure final bundle rather than treating budgets as proof of visual quality. The identity reference's reviewed JPEG object and digest are release requirements, not an optional artwork file.

After implementation approval, build and inspect the hardest new interaction first: a level drop that removes a spent higher-level card while preserving lower-level cards. Compare its actual laptop/phone rendering with the approved baseline before generating the remaining art. No extra approval gate for routine work.

## Integration coverage and code plan

| Surface | Planned work |
| --- | --- |
| Canonical domain | Add `supabase/functions/_shared/play/grimlash.ts`, frontend re-export and source-backed IDs/card quantities. Extend modules/events/owner validation, reducer/history and labels. |
| Rules/search | Extend or extract current Grimlash rules into `src/data/rules/grimlashRules.ts`; register without duplicate entities; add verified card/board data and searchable names. |
| Play | Add GrimlashControls, module definition, photographic banner, kept-card component only where no shared equivalent exists, reveal/minor presentation and art registries. |
| Fresh setup/recovery | Extend current durable session boundary; position 0 and verified killer defaults only for genuinely fresh games. Preserve stopped trackers, legacy unknowns and old numbers. |
| Health-cap callers | Implement the shared effective-maximum contract above. Wire PlayScreen, FinalGirlHealthPortrait, the Index result snapshot, GameOutcomeForm, TheEnd and server facts to the appropriate current/historical/saved maximum. Preserve exact-one decrements, base snapshots and legacy values. |
| Narrative identity | Correct generic killer visual/special-rule prose. Use selected location; neither Shady Acres nor Children are implied by choosing Grimlash. Preserve selected Final Girl identity. |
| Death and narration | Add owner-filtered Terror/Minor/Power references and relevant Madness mechanisms. Use historical position/kept/spent state at the death; preserve unaffected cache identities and both owners within context budgets. |
| Opening/ending/results | Source-backed flavor and explicit Madness-loss context. Gate Children UI/highlights on Shady Acres, not Grimlash. Keep legacy peaked ambiguous. Carry known loss through Index initial finish/review checkpoints, GameOutcome, GameOutcomeForm, TheEnd, useGameHistory same-case update and backend story/image validators. Game loss does not itself prove physical death or zero Health; no decorative fire/blood becomes fact. Preserve poster medium and archive/stats behavior. |
| Reference storage | Extend scripts/opening-references.mjs, add the currently absent Grimlash opening-reference entry, stage/review exact fixed-key JPEG/digest and upload/check before release, whether identity is retained or replaced. Test unlisted versus listed-but-missing/digest-mismatched cases separately. Do not embed image collections in edge source. |
| Mixed modules | Grimlash works with every implemented supported location. Shady Acres remains its current independent partial support until the later location pass. |

## Verification plan and completion criteria

Expected behavior comes from the source tables, not implementation snapshots.

1. Reconcile 15 Harvest cards, 4 Powers, 4 Finales and the sixteen-copy Terror deck including Minors. Check icon distinctions: level vs position, Horror vs dice, damage vs Health loss, Time, timing and targets.
2. Verify Madness boundaries 2↔3, 4↔5, 6↔7 and 9→10; within-level movement does not draw/discard a card. Test skipped levels, downward linked removal, reacquisition, ready/spent/passive/unknown-face distinctions and explicit Upkeep. Correcting an erroneous peak must not add a gameplay peak. Reject stale and out-of-order Undo/Restore after reacquisition; unrelated location events remain independent. Frontend and edge replay must agree.
3. Test Thorn/One With the Land separately and together, raised Health limits, removed-card excess-Health observations, legacy unknowns and no bonus replay on name correction. Include a 7-Health cast at 11 and Kate before/after observed Ultimate. After removing +3, above-cap observed Health remains unchanged until explicitly edited; minus decrements exactly one and unrelated saves never clamp it. Save/reload an effective ending maximum without double-adding bonuses.
4. Verify Minors' 1/2 Health, coexistence, removal/restore, common hearts, both reveal entry points, permanent reveal after clearing a name and Epic options.
5. Exercise atomic Undo/restore, offline save/reload, cloud roundtrip, stale/double taps and rejected durable writes. No displayed gameplay update on rejected persistence; retries do not duplicate events.
6. Verify skull and explicit Telluric losses with nonzero/unknown Health, contradiction prevention at initial finish and reviewed save, historical death context after later Madness changes, cached reopening, Save without narration and generation/audio retry. Moving a recorded skull left cannot erase loss; retracting an erroneous loss explicitly must restore the correct result without duplicating a case. Test offline retry and cloud rehydration of the same case/outcome/statistics. Legacy Harvest Madness Peaked alone must not imply loss, skull, a kept card or a casualty.
7. Run Grimlash with Camp Happy Trails, Buddyland, Carnival of Blood, Maple Lane, Sacred Groves, Creech Manor and USS Konrad, plus the current Shady Acres selection boundary. Reject wrong-owner observations; do not change location state/casualty totals. Children fields/highlights are absent for Grimlash at other locations and remain location-owned for another killer at Shady Acres. Do not certify Shady Acres mechanics as implemented.
8. Inspect actual loaded UI at 1280×640, 1366×768, 1440×900, 390×844 and 320×568: quiet/expanded, unknown, every track range, multiple kept cards, spent, removed, Epic, long names, focus, 44px targets, reduced motion and overflow. Review all 47 scene mappings and identity derivatives at rendered crops, including all ten selected Terror cause images and the six-tile dialog/footer. Verify stable-ID mappings before/after sorting; no Billy-atlas or missing-photo fallback for a known Grimlash card.
9. Run applicable domain/shared/native edge/browser tests, shared control contracts, `npm run check`, `npm run check:assets` and `npm run build`. Wait for required CI on the final PR head and retain exact evidence in the owner record.
10. Test opening-reference registration and the staging script without regenerating unrelated portraits. Verify the exact stored JPEG digest and manifest membership; mock valid/missing/bad-digest responses and prove Grimlash plus the selected Final Girl reach the opening model request. A real production object/load smoke remains a separately reported release check.
11. Report implementation, merge, deployment and live verification separately. Planning alone does not establish runtime or provider quality.

### Execution sequence and completion gates

| Step | Deliverable and exit condition |
| --- | --- |
| 1. Establish sources and runtime | Start an isolated checkout/snapshot from the reviewed head, inspect intervening changes and preserve other work. Confirm a usable build/test environment or CI route. Current terminal DNS restrictions do not establish cloning/deployment/live generation access; resolve working-source access before implementation. Lock source/card/position ledgers and art IDs. |
| 2. Implement the critical vertical slice | Canonical Grimlash commands/history validation, effective-Health calculation, a rendered Madness track and kept-card slots. Demonstrate lower-card retention, spent higher-card removal, reacquisition, safe Undo, reload and rejected saves with existing reviewed art before bulk generation. Inspect actual laptop/phone rendering against the approved reference. |
| 3. Complete the photographic catalog | Full-resolution identity decision; all 47 scene mappings and real destinations; native wide sources/derivatives, crop/order/byte metadata. Keep a coherent identity/progression across independent scenes. Reject illustrations, wrong cast, unreadable crops and orphan assets. |
| 4. Complete app integration | Shared Minors/reveals/Remember This, Rules/Terror references, fresh setup, historical death/narration, opening reference staging, effective ending Health and validated loss/results. Correct the existing Children ownership leak without implementing its location mechanics. |
| 5. Verify and fix | Pass source-led domain/replay, shared-control, browser/mixed-owner, edge and persistence scenarios. Review all five target sizes and actual artwork, fix material defects, run check/assets/build and final-head required CI. Record exact evidence and intentional live/provider gaps. |
| 6. Reviewable handoff | Provide final PR, updated import record/art manifest and concise verification summary. Name exact frontend/function/Storage requirements and real remaining blockers. Stop at the authorized boundary; planning approval is not authorization to merge, deploy or spend on live generation. |

Ready-for-review means every applicable in-scope surface is source-backed, implemented, durably recoverable, tested and visually inspected; no missing known-card art, unreviewed identity, guessed rule, silently coerced Health, owner leakage or undisclosed release dependency. Merged/deployed/live-verified are separate statuses.

## Release and remaining work

No implementation or runtime verification has been performed. Deploy compatible backend consumers before a frontend that sends new observations. Audit and test these six existing bundles against the final diff: **generate-story, generate-ending, generate-scene-image, generate-visual-bible, generate-death-scene and narrate-story**. Their current imports touch shared validation/prompts/story or Play contracts; generate-scene-image specifically loads opening references. Produce the exact changed-bundle list from the completed dependency diff rather than claiming six deployed functions now. Check source/bundle size limits.

Grimlash reference staging, its manifest entry and exact private Storage JPEG/digest are required even if the current photograph is retained. **Extend scripts/opening-references.mjs first:** its current killer allowlist contains Billy the Bear, Inkanyamba and Poltergeist, excluding Grimlash. Preserve unrelated object keys/digests and check manifest/object parity. Unlisted identity omission and listed-object load/digest failure have different expected behavior. The latter stays a clear retryable error, not a generic replacement image. Verify the exact object before releasing the new reference consumer/frontend.

Existing Play event storage and final_girl_max_health/outcome columns appear sufficient; no SQL schema migration is planned. A source-backed implementation finding can change that assessment; do not add a schema for convenience.

Execution follows the six steps above. Location implementation stays deferred. Production upload/deployment and signed-in live generation/audio require the authorization and credentials available at release time. A mock does not prove them. Report a blocked release check precisely without labeling the implementation live-verified.

No additional source upload is presently required for the core killer scope. Retained limitations: loose marker not separately laid out, unrelated Final Girl faces/secret items not supplied, no reverse variant, and exact provenance of the unnamed landscape action face not labeled. Full-resolution existing identity approval, generated artwork quality, actual rendering and live rollout remain unperformed. If a consequential small icon is unreadable during final canonical transcription, isolate that specific gap and complete independent work rather than inventing an effect.

Known source access: online repository read works; terminal git and automated original-image downloads previously failed DNS. A working checkout/test route is a first-step requirement, not an assumed capability or a request for new permissions at this planning stage.
