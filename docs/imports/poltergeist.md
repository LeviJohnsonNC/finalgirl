# Poltergeist import record

## Scope and current status

- Owner/type: Poltergeist / killer; film `s1-creech-manor`; proposed module ID `poltergeist`.
- Standard mode plus the supplied Epic Dark Power. The wiki-only Epic Finale is outside the supplied/requested scope.
- Scope: killer import first. Creech Manor location mechanics and Alice/Selena character imports await their own sources and plan.
- Stage: source review and implementation proposal, awaiting Levi's approval. No application implementation, generation, migration, deployment or live-provider verification performed.
- Last reviewed: 2026-10-27. Baseline: `docs/MODULE_STANDARD.md`, approved Groves UI references and current import playbook/control contracts.
- Existing support audited on main: selection/film IDs and portraits already exist. No Poltergeist module in moduleDefinitions, modules or canonical Play catalog, and no registered Poltergeist Rules module. Keep existing cast/Collection identity and preferences.
- Existing narrative defect: killerSpecialRules calls Mr. Floppy a teddy bear and always optional; replace with the supplied pink stuffed rabbit and the Epic-dependent requirement.
- Original and re-uploaded photos are duplicates of the same source batch, not additional physical cards.
- Count correction: polter5 contains 16 physical card faces (rows of 5, 6 and 5). Earlier chat claims of 15 cards and an Inescapable Fate card were reading/count errors, not source defects. The actual card is Unstoppable Evil. No missing Terror face is currently identified.

## Evidence ledger

| Component | Expected | Supplied | Source | Status/destination |
| --- | --- | --- | --- | --- |
| Killer board | 1 | 1 | polter1(1).jpeg; libfile_9f7a13816e9081918f66bfb82a6bff16; original libfile_073a23c5b8908191a1f57922bba5f4bf | Verified identity/board present; transcribe all numeric/icon rows at native resolution before coding |
| Component sheet | 1 face | 1 | polter2(1).jpeg; libfile_9a47c394bd8c8191b9247169144573a2; original libfile_f6ba156530a0819190f2d0ddc850e997 | Establishes 3 regular Powers, 1 Epic Power, 3 Finales, 2 Items, 16 Terrors, 2 Final Girl cards |
| Setup / special rules | 1 face | 1 | polter3(1).jpeg; libfile_b94e29e18d0c8191bdef7d6e80d89aa1; original libfile_5c6f3e32ae208191b1ca99ebde7002c2 | Killer-owned Item setup, immunity, rescue victory, Carolyn protection, Mr. Floppy restrictions |
| Dark Powers | 3 regular + 1 Epic | 4 | polter4(1).jpeg; libfile_2166388e7cb481919ed359b84bd8fb2d; original libfile_ddaf85ac44a08191a8b19fccc94dc567 | Stiff Wind, Eternal Despair, Invisible Barrier, Forgetting Something? |
| Finales | 3 | 3 | Same polter4 source, right column | Relentless Assault, Nothing Is Easy, She Will Soon Be Lost |
| Killer-owned Items | 2 | 2 | Same polter4 source, lower-right cards | Carolyn and Mr. Floppy; not ordinary location inventory or victim records |
| Terror cards | 16 | 16 | polter5(1).jpeg; libfile_bc78126bda8c81919c2f030e39b888ad; original libfile_f2e1addc3d908191b59909e11168231d | 12 named cards including two ongoing Minor Powers and four additional duplicate faces; preserve quantities |
| Final Girl cards | 2 in component list | Not part of this batch | polter2 component list | Out of this killer-only import scope; no inferred abilities/items |

Persistent source links use https://chatgpt.com/library?file_id=<exact-library-id>&account_id=personal. Do not commit raw photos or private references.

### Terror reconciliation

- Psychic Confusion ×1 (Minor Dark Power)
- Unseen Forces ×1 (Minor Dark Power)
- Carolyn? Where are you?!?!? ×2
- Corporeal Form ×1
- Did that clown... just move? ×1
- Everything was flying around! ×2
- I have to kill you! It told me to kill you! ×1
- Nothing Is As It Seems ×1
- The ground is shaking! ×2
- The shadows are closing in ×2
- Unstoppable Evil ×1
- Where the hell did this storm come from? ×1

Levi supplied https://finalgirl.fandom.com/wiki/Poltergeist#Terror_Cards as a supplemental source. Its list matches the reconciled names/counts. Read the individual Unstoppable Evil page: roll a die, take that much defendable damage or choose that many Victims to die; if insufficient Victims, choose the damage. The wiki's additional Epic Finale is not evidence it is part of this supplied standard deck. User photos govern their printing. Native-resolution icon/wording transcription remains implementation preparation, not a completed catalog.

## Verified mechanics and corrections

- The spirit has no Health and cannot be attacked, damaged or killed. Attack-capable Action cards can still matter in specific Terror encounters.
- Normal victory requires finding Carolyn and saving her through the applicable escape. The supplied Epic Dark Power adds Mr. Floppy to the escape requirement. Finding Carolyn alone is not an automatic win.
- Carolyn must not be killed, discarded or put in the backpack. She can be shuffled back into an Item deck.
- Carolyn and Mr. Floppy are included in the selected location's Item decks, never initially faceup. The killer's setup follows the killer in mixed films.
- Carolyn joining the Final Girl removes the Minor Dark Powers as directed by her card. Record the linked removal with the finding observation atomically. Later separation must not silently reactivate them or erase their history.
- Psychic Confusion and Unseen Forces are ongoing Minor effects rather than ordinary damageable two-heart powers. Use presence/removal observations; do not invent Health for them.
- Mr. Floppy's protective use and discard restrictions depend on revealed Power state, including the Epic exception. Use only the printed legal action; preserve the permanent Power reveal when suppressing its effect.
- Corporeal Form / Clown Doll are temporary card encounters. Do not turn them into persistent Minion rosters or Victims merely to reuse a widget.
- Bloodlust remains valid. Count and transcribe the board's physical positions and overflow instruction before adding its per-killer artwork mapping; no range inferred from the app's 0–99 input.

## Integration coverage and proposal

| Surface | Current/proposed implementation |
| --- | --- |
| Selection and ownership | Reuse existing film/name/portraits; register killer-only module independent of Creech Manor |
| Rules and catalogs | Add shared poltergeist domain/catalog and Rules module; faithful effects, duplicate quantities, icon/timing audit and attribution |
| Play | Dedicated photographic panel: rescue objective first, ongoing Minor effects, shared Power/Finale controls; no spirit Health or resurrection affordances |
| Shared entry points | Same reveal log and catalog in panel and Remember This; quiet Clear card name / Change Finale semantics |
| Items | Extend current location-only item lookup in a backward-compatible way to include selected-killer Items; keep found-item observations consistent with explicit rescue state |
| New-session / legacy | Explicit setup provenance; known fresh starting facts only; resumed legacy values unknown, no mount writes/backfill |
| Narrative/deaths | Add historical rescue, Minor and Item facts, owner-filtered Terrors and correct temporary attackers; preserve unaffected signatures/cache |
| Opening/ending | Fix combat-victory and teddy-bear/always-optional language across callers; preserve selected Final Girl and selected location |
| Results/archive/stats | No inferred spirit kill/Health or Carolyn victim count; preserve historic saves and manually reported outcomes |
| Artwork | One banner, 4 Power heroes, 3 Finale heroes, 2 ongoing-effect images, Carolyn and Mr. Floppy controls as the initial asset set; additional justified states/encounter motifs only where surfaced |
| Mixed films | Poltergeist with Buddyland, Camp, Carnival, Maple and Groves; eventual Creech location added separately |
| Checks | Domain/shared contracts, actual UI and narrative/persistence journeys, existing build/asset/check suites and final-head required CI |
| Release | Frontend + changed shared-domain/prompt consumers; exact function list and reference uploads identified from the final diff before handoff |

### Interaction/state map

| Operation | State/actions | Shared control or justified exception |
| --- | --- | --- |
| Carolyn objective | Unknown / not with you / with you / rescued; return-to-deck observation where applicable | Character-like photographic control with source-backed actions; no killed outcome, backpack or ordinary victim counter |
| Finding Carolyn | Explicit record of joining plus required Minor removal | One atomic observation and one Undo; avoid duplicate linked effects from repeat taps/retry |
| Mr. Floppy | Unknown / not held / held / legally used or returned as the printed card allows | Item-specific objective control; Epic requirement derives only from known card state; named corrections do not repeat item effects |
| Minor effects | Honest unknown, inactive/active/removed states and quiet correction | Shared photographic effect presentation; justified healthless Minor capability instead of MinorPowerControl's hearts |
| Power / Finale | Dim choices → one selected wide hero; one reveal through both entry points | KillerCards / RevealedCard with registered photographic mappings |
| End result | Explicit player escape/rescue/outcome confirmation | Never auto-win on finding alone or auto-kill the spirit; uncertain past tracking must not invent certainty |

Keep Play concise: no setup dump, routine rules block, turn simulator, deck shuffler or inferred damage/movement/casualties. Full printed information remains searchable in Rules. Necessary linked previews and unknown/error states stay visible.

After approval, build the Carolyn/rescue/Minor transaction first and compare its actual laptop/phone UI to the approved baseline before completing the remaining art. Routine implementation then continues within approved scope without another mandatory design approval gate.

### Artwork manifest preparation

- Preserve approved existing identities and user-supplied replacements. Audit the existing Poltergeist identity against board silhouette before deciding if any replacement is needed.
- New art uses the physically believable 1980s photographic direction. A spectral subject keeps her verified identity; do not replace her with a generic human costume. Mr. Floppy is the supplied pink rabbit.
- Plan wide native crops, quiet dark text space and mobile focal points before generation. Reuse the same identity references across assets; no illustrated contact-sheet enlargement.
- Power/Finale art is wide; unselected choices heavily dim; active ongoing controls vivid; removed/unknown states legible. Labels/actions stay HTML and targets >=44px.
- Document exact source IDs, ratios, dimensions, derivative budgets, stable state mapping and crop review in the owner artwork README.
- Preserve the painted ending-poster medium, existing surrounding app layouts and decorative-art/game-fact boundary.

## Verification evidence and acceptance plan

No implementation tests or live-generation quality claims yet.

- Source: 16 Terror faces / 12 named types, 4 Powers, 3 Finales and 2 Items reconciled; detailed transcriptions verified before committed rule data.
- Domain: no spirit Health or combat victory; true new setup versus unknown legacy; owner isolation and no writes from mount/expansion.
- Rescue: find, shuffle back, rescue, Epic requirement, legal Mr. Floppy use; multiple active Minors cleared atomically; loss of Carolyn does not resurrect removed effects; Undo/failure/reload/retry and rapid taps.
- Shared reveals: both entry points, unnamed/unknown reveals, clear-name corrections, effect suppression without erasing permanent history.
- Narrative: death uses state at the event, cast/location identity preserved, no invented kill or ordinary Carolyn casualty, temporary enemies only with supported cause.
- Mixed owners: all currently supported alternative locations and applicable linked outcomes; preserve independent location rules.
- UI: actual loaded images at 1280×640, 1366×768, 1440×900, 390×844 and 320×568; unselected/active/removed/unknown, long labels, keyboard, reduced motion and overflow.
- Gates: appropriate domain/shared/browser checks plus npm run check, npm run check:assets and npm run build; required CI on final PR head.
- Mocked browser tests do not establish live narration/image/audio quality or deployment.

## Release and next steps

1. Await Levi's implementation approval of the proposal.
2. Complete native-resolution source transcription and enumerate all impacted callers before domain edits.
3. Implement rescue state and linked persistence first, then shared controls, artwork and integrations.
4. Verify and fix all in-scope surfaces, create implementation PR and wait for required final-head CI.
5. Report exact migrations/functions/frontend/reference-object release requirements and deployment status. The audited play_sessions storage uses JSON rather than an owner-specific SQL enum; no SQL migration is currently established as necessary.
6. Shared validator/narrative changes require checking at least generate-death-scene and narrate-story plus opening/ending/image/visual-bible callers. Deploy compatible backend before new frontend observations when deployment is authorized.
7. Keep merge, publish and authorized live-provider verification separate from code/CI completion. No current authorization to merge or publish.
