# The Tormentor import record

## Scope and current status

The Tormentor, killer in `s3-marrek-murders`, stable module `tormentor`. Standard mode from seven owner photographs, reviewed 2026-11-01. Extends the existing selectable killer without duplicating the film, Final Girls or location. Marrek Warehouse, Mandy/Cassie rules and personal items are outside this killer import. Saw informs the mechanical horror atmosphere; the supplied female masked Tormentor governs identity, not Jigsaw or film actors.

Branch: `codex/tormentor-killer`, based on main `12ee423344c53742d75bcbfa71551760a4ace71e`. Implemented and locally verified; production deployment remains a separate release gate. Existing identity photograph, Collection selection, physical-game companion boundaries and painted ending posters are retained.

## Playtest refinement — 2026-11-01

This follows the always-on core trackers in merged PR #166 and implements the requested Tormentor/Warehouse simplification. Trap creation now places the Subject selector below the trap photos; optional space and Victim-name fields are omitted. Legacy metadata is retained in history. Tasks and timer checkpoints are directly clickable, with ordered task prefixes preserved; the progress action says Complete next task or Complete final task. Escaped and spent traps stay on screen with 22 new person-free deactivated/sprung photographs. A custom scalable skull replaces the terminal ×. The forecast text and Correct trap record editor are removed, and Clear card name is a borderless quiet link.

New checkpoint/task-progress commands support direct corrections without changing old `correct` replay semantics. A corrected Final Girl terminal checkpoint retracts that trap's terminal-loss observation atomically when appropriate; historical death snapshots and ordinary Victim/Health totals stay unchanged. Actual next/final task resolution still owns Endless Traps replacement effects; correction does not replay them. Removed/Upkeep records retain their correction path. See the photo README for full prompts and the safe wrapped-prop alternative for the deactivated Reverse Bear Trap.

Local verification: Node 22 full check passed 642 unit tests and 121 edge-adapter tests; asset validation and build passed. The combined tracker/Tormentor/Warehouse browser run passed all 56 cases, with native photos and rendered state crops reviewed on desktop/phone at the five required sizes. Final-head CI and the selected-stage no-op check are recorded on the follow-up PR.

Release now requires the changed shared domain in generate-story, generate-ending, generate-scene-image, generate-visual-bible, generate-death-scene and narrate-story before the frontend. No SQL migration or new private reference upload. Final automated/visual evidence and exact PR-head CI are recorded on the PR; merge/deployment remain separate.

## Evidence ledger


All **seven original JPEGs** were fully decoded and visually inspected, including upright rotations of the board, trap sheet and rules. Every original is RGB, **1536×2048**. The owner retains the original photographs; raw source photos are not committed. Review crops were temporary inspection aids.

| ID | Original | Verified coverage | Bytes |
| --- | --- | --- | ---: |
| T1 | IMG_9432.jpeg | Standard killer board: identity, Horror/Health, seven Bloodlust positions, thresholds/overflow, two Minor slots | 643615 |
| T2 | IMG_9433.jpeg | All eleven Death Trap faces, escape tasks, individual progress tracks and fail results | 979224 |
| T3 | IMG_9434.jpeg | Lore, credits, printed component quantities; Mandy/Cassie thumbnails | 655813 |
| T4 | IMG_9435.jpeg | Special setup, off-board/arrival rules, becoming trapped, progression/fatality, cleanup, escape order | 881327 |
| T5 | IMG_9436.jpeg | Escape-task limitations/cooperation, bottoming Terror cards, No Escape! exit clarification | 762071 |
| T6 | IMG_9437.jpeg | Three regular Powers, Epic Power, three Finales, effects and action lines | 766671 |
| T7 | IMG_9438.jpeg | Sixteen ordinary Terror faces including duplicates; unnamed landscape pre-Finale action face | 1049611 |

SHA-256, in T1–T7 order:

```text
73fc8537ce5d5c1bb2ce8f5a58e3a942c267ea13cc683c83949e1494c0bbc3fa
7504dac45c320a0019930a8c3a5048230f5fe92f138f75fbe5a29812895750c3
b23811430bab0e75d154873f2495065cceeea6d02de911974d0840f047baf7f2
2a5d48fd287932e441adcd99836b13a4b632de905f8f50fc286de7b6adc16f66
ad12e9d41731e98172a5b930d0f3619676e82e750cbd917f54e7b2cfdc30a783
7e376fb31804027fa6830aaa40dd20d51606920b0e67a522d24e85dd26123523
4333c727076ab9ddccb867efff4a45bd2d1014763c3ff7fea06ffd9d397d88b9
```

Printed credits: design **A. J. Porfirio**; art **Agnieszka Dabrowiecka** (T3).

## Reconciled inventory

| Component | Expected / supplied | Status / destination |
| --- | --- | --- |
| Killer board | 1 / 1 | Verified; defaults 7 Health, 3 Horror, Bloodlust 0–6 |
| Final Girl Death Traps | 4 / 4 unique faces | Verified; shared `play/tormentor.ts` |
| Victim Death Traps | 7 / 7 unique faces | Verified; same catalog |
| Powers | 3 regular + 1 Epic / all 4 | Verified; Rules, shared reveals, references |
| Finales | 3 / 3 | Verified; no Epic Finale |
| Terrors | 16 physical / all 16, 8 titles | Verified; quantities 2,3,2,2,2,2,1,2 in canonical order |
| Minor Dark Powers | 0 in photographed Terror deck | Board has 2 slots; do not invent cards |
| Tokens | 17 total | Total verified; subtype quantities unknown, no invented limits |
| Mandy / Cassie | 2 component thumbnails | Existence only; full cards not supplied / outside scope |
| Setup / Event / Item cards, location board | Not supplied in this batch | Killer uses the selected location's existing content |

## Verified mechanics and corrections

- Tormentor begins off-board. A starting Victim is trapped at the chosen Setup killer-start space. The app marks this draw pending; it does not choose a random physical card. Before Finale ignore ordinary Killer movement/attacks and temporary placements. For counting relative to an absent Killer, reveal a random Setup and use its indicated position temporarily, then shuffle it back.
- Finale reveal schedules arrival at the beginning of the **next** Killer phase. Reveal, naming/correcting the card and arrival remain separate observations. Changing a card name never repeats arrival or reveal effects.
- All active Death Traps advance one printed checkpoint together. Per-card track lengths differ; the canonical catalog contains every printed task, checkpoint and fail result. Completing ordered escape tasks never advances the timer or pays resources. Compound tasks are atomic and progress within a task cannot carry beyond the Action phase.
- A terminal Final Girl trap means immediate death/loss without Final Health even at positive Health. Early Health loss still follows normal Final Health recovery and leaves her trapped. Failed Victim traps linger through Panic until Upkeep; escaped traps leave the physical board immediately; the companion keeps their deactivated record visible. Freeing a Victim is distinct from saving one through an Exit.
- Unfair Traps increases each requirement by 1, including each compound part. Faulty Construction can complete a task while the Final Girl is trapped; recording that exceptional completion remains possible. Horrifying/Overkill effects are source guidance, never inferred costs or casualties.
- Endless Traps records required replacement draws after a freed Victim. Partial deck history cannot prove exhaustion. No Escape locks are independent per named Exit; locking the last recorded Exit does not itself establish the phase-start loss check. Both special losses are explicit reviewed observations.
- Corrected prior maximum Health 8 to photographed 7. Corrected generic Killer actions and warehouse-specific lore leakage in the killer's narrative rules. Damage/move, thresholds and overflow come from T1: damage 1,1,1,2,2,2,3; movement 1,1,1,1,1,2,2. Random Action discard at levels 1/5, Power at 3; overflow advances traps then discards a random Action.

## Integration coverage and interaction map

| Surface | Implementation |
| --- | --- |
| Rules/search/source | `tormentorRules.ts` registered by killer; complete setup, timing, traps, Powers, Finales, Terrors, Bloodlust, credits and companion boundary |
| Canonical content | One shared source-backed catalog feeds Rules, reveals, Terror choices, mechanism choices, UI tasks and server references |
| Illustrated Play panel | Killer-first registration; off-board/unknown/pending/on-board presence; per-trap illustrated cards; ordered task control; single global advance with terminal preview |
| Equivalent shared controls | Existing `KillerCards`, permanent reveal handling, Remember This, PlaySelect, ModuleArtwork and timeline controls; no duplicate reveal workflow |
| Mechanic-specific exception | Unique trap cards track independently and advance atomically as a group; not ordinary Minions or Victim counters. No generic map, inventory, resource or phase engine |
| Corrections/recovery | Quiet presence correction, directly clickable ordered task/countdown corrections, and clearing mistaken Exit names; unknown timer/task counts; owner-ordered Undo/Restore; optimistic-parent validation; failed durable writes leave gameplay unchanged and retryable |
| Setup/legacy | Fresh provenance initializes only at the durable new-session boundary. Old games remain unknown. Pending setup/replacements block a falsely complete global advance |
| Death | Eight owner-filtered Terror titles, named mechanisms in existing Other cause tile, six-cause layout retained. Snapshot/context and selected mechanism are historical. No Final Girl death in Victim totals |
| Narrative budget | Critical terminal fate / Final Girl trap / physical presence precede Victim count; location retains its own reserved budget and ownership |
| Opening | Typed original-session provenance reaches story, visual bible and scene requests. Fresh setup keeps killer unseen and omits her portrait attachment. Legacy Reshoot never borrows current arrival state |
| Ending/results/archive | Typed Tormentor review composes with Konrad fate; terminal trap death overrides positive Health/ship survival. No Escape/Endless establish a loss, not automatically physical death. Persisted play log supports archive reconstruction; no SQL column |
| Mixed owners | Module exists with every selected location; warehouse details stay with warehouse. Wrong-owner observations and ending reviews are rejected |
| Artwork | 52 individually generated original photographs plus 51 small thumbnails, exact stable-ID mapping, no known-ID fallback. See [asset README](../../src/assets/play/photos/tormentor/README.md) and manifest |

The hardest slice (two simultaneous unequal tracks, global progression and terminal loss) was implemented first, tested and visually compared against the approved actual Groves UI before bulk generation. Every supplied original was decoded at full resolution. Art was reviewed as actual loaded laptop/phone UI; header crop corrected to preserve the complete mask. Unknown is neither zero nor absent. Decorative photographs establish no victim, injury, ownership or selected location fact.

## Verification evidence

| Check | Evidence / status |
| --- | --- |
| Local lint/typecheck/unit suite | `npm run check`; 624 tests passed; final-head CI covers the complete revision |
| Edge adapters | `npm run test:edge`: 120 pass, including owner-specific prose/poster schema review, opening reference omission, historical death and narration regressions |
| Source/trap transitions | Catalog count/ranges, all eight legal simultaneous traps, no inferred totals, legacy state, ordered tasks, Endless replacements, sticky fatal observations/retraction, stale/forged writes, Undo/Restore and owner mixing |
| Art/build | `npm run check:assets`, `npm run build`; hashes, dimensions, independent scene count and budgets verified |
| Tormentor browser journeys | Desktop/phone simultaneous trap progression, reload, permanent reveals/arrival, persistence failure/retry, ordered escape, exit toggles and positive-Health terminal ending; screenshots generated in Playwright report |
| Actual viewports | 1280×640, 1366×768, 1440×900, 390×844, 320×568: loaded art, no horizontal overflow, phone task wrapping and touch targets; final header crop reviewed |
| Shared/mixed regressions | Module consistency, Konrad, Grimlash and named Final Girl identity browser journeys; 80 passed, no skipped/flaky/failing tests (complete compiled HTML report verified) |
| Required final-head CI | [PR #164](https://github.com/LeviJohnsonNC/finalgirl/pull/164/checks); final-head workflow is required before handoff |
| Live providers / deployment | Not performed; mocked browser tests do not establish provider quality or deployment |

## Release and handoff

No database migration. Deploy compatible shared-domain consumers before the frontend: `generate-story`, `generate-ending`, `generate-scene-image`, `generate-visual-bible`, `generate-death-scene`, `narrate-story`. Other edge entry points receive Deno typecheck in Reliability CI.

Opening identity staging extends the fixed-name allowlist. `node scripts/opening-references.mjs --only='The Tormentor'` stages only the new identity and preserves all previous manifest entries; use `OPENING_IMAGEMAGICK=convert` for ImageMagick 6. Exact required private object: `opening-references/the-tormentor-bcbe59ed85cb2d02.jpg`, SHA-256 `bcbe59ed85cb2d02f3edbe9e4a963af1d17865f6878eef485d4d594481a7e47e`. The same reviewed bytes are committed as `supabase/reference-assets/tormentor.jpg`. Upload these staged JPEG bytes and verify the private loader before releasing the functions/frontend. An absent/mismatched object fails closed for legacy openings that request it. Fresh verified unseen openings deliberately attach only the Final Girl reference. No Storage service credentials or deployment access were provided in this session; object upload and signed-in live smoke remain release checks.

After authorized release: mixed-location new-game setup, save/reload, arrival, multiple traps, contextual death/takes/cached reopening/audio, reviewed ending and poster. Preserve previous deployed manifest objects. Branch/CI success does not imply production deployment.
