# Health art, named reveal art and death-location phrasing

Approved scope: 39 existing Final Girls, two reference-edited variants each (78 assets); Play health tracker only; top Power/Finale tile art synchronized with named selections; natural optional location detail in new gruesome-death takes.

## Implementation

- `FinalGirlHealthPortrait`/`finalGirlHealthPresentation`: decorative state selection, official preference and failed-image fallback. Session snapshot flows Index → NowPlaying → PlayScreen; effective maximum uses the existing observed Ultimate/Undo/restore helper. Numeric observations and immutable log are unchanged.
- Top Remember This tiles use the reduced effective reveal entry and `illustratedKillerCards`/`ModuleArtwork`. Unknown or unsupported names retain generic artwork. Hans's second Power remains independent.
- `deathLocation.ts` supplies prompt-only wording for verified Creech board-relative labels. Raw facts, historical module context and cache signatures remain unchanged. Meaningful names, physical mechanisms and directions in actual actions remain available. This does not rename saved board spaces or rewrite saved scenes.

## Local verification

- All 39 original/healthy/critical trios inspected for photographic realism, likeness, permanent features and visible condition differences. Both edits use the original source, not each other. All 39 originals retain their pinned SHA-256; private opening references are untouched.
- Full-catalog loaded UI review: 78 laptop/phone journeys, 585 state/viewport crops across 1280×640, 1366×768, 1440×900, 390×844 and 320×568. Reviewed framing adjustments for Alice, Kat, Kenzie, Jenette, Joy, Julie, Octavia, Vicky and Melanie, applied consistently across states. A one-line 14px heading at the narrowest widths keeps the low-health label clear of eyes.
- Final regression pass: 148 browser journeys passed, including the full-catalog review, health thresholds/recovery/0 HP/Undo/reload, Kate's 4→7 observed maximum without auto-healing, official preference, unknown/above-max states, variant-load and rejected-write fallback, both reveal entry points/corrections/reload, identity and gruesome-death cache/completion/narration journeys.
- After correcting the narrow-heading cascade, 94 health/reveal/full-catalog browser journeys passed again, including an explicit 320px heading-clipping assertion. Regenerated and inspected all 14 laptop/phone contact sheets; the complete heading and status labels fit without covering the eyes.
- `npm run check`: 537 unit tests and 111 edge tests passed; lint has 11 pre-existing warnings and no errors. Production build and asset validation passed (589 assets including all 78 variants). Hash/provenance, catalog coverage, unique state mapping, image resolution and per-image budgets verified.
- Prompt tests preserve raw historical death facts, mechanisms, owner separation and cache identity while supplying natural optional wording for board labels. These and mocked browser journeys do not prove live model prose quality.
- Required Reliability CI belongs to the final PR head; consult that PR's checks separately from these local results.

## Release boundary

Frontend/assets plus redeploy `generate-death-scene` with the updated shared prompt dependency. No SQL migrations, secrets or private cast-reference uploads. Existing cached scene text intentionally stays unchanged; only an uncached take uses the new prompt. Merge, deployment, signed-in smoke verification and mocked tests are separate evidence. Live function deployment/provider-output verification is not established by local tests.

## Health input cap follow-up

The Play tracker now uses the session's effective maximum for both increment controls and typed values, including observed Ultimate changes. Legacy sessions use the catalog to bound new input without backfilling their maximum or rewriting health. Existing above-maximum observations remain readable and undoable; an explicit decrease returns them to the allowed range. Re-enabling tracking also respects the cap. Other tracker limits are unchanged.

Local verification: 18 laptop/phone health/reveal browser journeys passed, including rejected over-maximum entry with an unchanged log, recovery to full health, reload, Kate's 4→7 limit, legacy correction/Undo and official-image preference. Inspected loaded maximum-health controls on both devices. The 537 unit tests, 111 edge tests and production build passed. This follow-up changes only frontend behavior and requires no function deployment or migration; final-head CI is recorded on its PR.
