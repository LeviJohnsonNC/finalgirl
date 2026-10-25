# Gruesome Death: reading, groups and private nightmares

The reading/loading/error view replaces the cause grid with a victim-count, cause and space summary plus Edit death details. The full grid and fields return when editing. The illustrated frame, prose typography, fixed actions, single prose scroll and manual narration remain. Failed local detail saves keep the form editable. Back to game closes reading; Cancel discards descriptive drafts, never recorded deaths.

A compact editing counter records relative `death-count` observations (`target` original death UUID, `delta` +1/-1). The durable active-game boundary validates the latest stored group and tally, preserving rapid taps and rejecting duplicate IDs, inactive groups, limits and rejected writes. A group stays between 1 and 50; remove a whole death with existing Undo. No special-character status, damage or Bloodlust is inferred. The original killed observation, ID and round stay immutable.

The shared reducer separates the group's projected historical quantity from chronological count deltas. Existing reductions retain their original semantics; reductions after a group count correction apply chronologically. This supports editing older groups after a manual total baseline without silently losing new casualties. Each count edit can be undone/restored; undoing the original death disables its count edits. Manual total baselines remain authoritative over earlier observations. Story context and archive use the same projection; final tally comes from that shared summary.

Changed quantities invalidate current text/audio identity and stop narration. Generation remains explicit. Restoring matching facts can reuse the saved take without a paid call. Dr. Fright-specific style/cache compatibility and creative provenance are documented in `imports/dr-fright.md`.

## Verification

- Shared tests cover relative counts, historical round, previous reductions and manual baselines, main-counter reductions, per-edit and whole-group Undo/restore, limits, rapid persistence, duplicate IDs and failed-write retry.
- Server handler tests cover canonical updated counts and current/legacy narration authorization; changed/undone facts cannot narrate stale text.
- Browser journeys cover one recorded victim plus two additions, generated request facts, narration cancellation, cached return after count restoration, reload, final archived tally, quota failure, sync failure, AI failure and explicit rewrite of three old Dr. Fright takes.
- Existing death, recovery, module, takes, narration and Play-polish journeys remain applicable.

Same-story, same-font measurements from the previous build versus this build (a deliberately long saved fixture to exercise the viewport):

| Viewport | Previous prose height | Revised prose height | Gain |
| --- | ---: | ---: | ---: |
| 1280 × 640 | 133 px | 307 px | 174 px |
| 1366 × 768 | 201 px | 411 px | 210 px |
| 1440 × 900 | 317 px | 426 px (full text) | 109 px |
| 320 × 568 | 143 px | 214 px | 71 px |
| 390 × 844 | 372 px | 465 px | 93 px |

The fixture is UI verification text, not evidence of provider narrative quality. Arbitrarily long text still scrolls. Production deployment and actual generated prose must be verified separately; backend and frontend changes are not live merely because CI passes.

Local verification: `npm run check` passes (411 unit/component tests and 100 server tests; 11 existing lint warnings, no errors), all 285 artwork files pass `check:assets`, and the production build passes. Existing and new death journeys pass on desktop/phone; final Reliability CI and deployment status are recorded below when available. Screenshots inspected at all five viewports include editing, loading, reading, error and grouped-death views.
