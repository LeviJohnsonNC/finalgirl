# Core tracker control bars

Approved scope: the four core Play trackers. The 2026-11-01 request makes them always visible and removes the ×/Stop tracking and + Track controls. Preserve artwork, mappings, health limits, manual corrections, immutable history, Undo, reload and rejected-write behavior.

## Reference

Levi's uploaded `Screenshot 2026-10-28 at 12.12.00 PM.png`, 944×264, shows Health, Bloodlust and Horror with clear artwork above a distressed dark control strip. Infer the same treatment for Killer Health. Persistent source: Library file `libfile_062f3dbe77c48191bb70af621af9b25b`; SHA-256 `018d9a635d08427e3eef58d7eb2325a3c3d49a7397ad3004e1dd0170fc8a6119`. The existing app artwork remains authoritative; the reference requests layout and styling, not replacement images.

## Implementation

- A clipped picture region holds the existing portraits/state imagery and condition art. All labels, status text and controls are in a separate bottom strip, including numeric editing.
- Visible titles are Health, Killer Health, Bloodlust and Horror. Existing precise accessible action names and saved field names remain stable.
- The strip contains title/status, minus, editable current value and plus. The former close column and divider are removed. New games initialize existing starting values once at the first durable Play write via `coreTrackersVersion:1`; never backfill resumed games. Unknown/previously cleared values remain visible as ? with Set available and +/- disabled until supplied. Old Evomorph tracking visibility flags do not hide known module-established health.
- Dark nearly opaque strips reuse the existing worn frame edge with subtle static texture. Green Health, red Killer Health/Bloodlust and blue Horror controls follow the reference. No artwork files change.
- Native buttons retain at least 44×44 targets and visible keyboard focus. Cards use two columns on intermediate widths and one column on narrow phones so a single control row fits. Killer Health can wrap within its title area. This affects only these four trackers; Poltergeist remains healthless with three cards.

## Always-on verification and release — 2026-11-01

- First-Play initialization, an early first tap, failed initialization/retry, legacy unknowns, snapshot starting Health, Undo/reload and healthless Poltergeist are covered by hook/browser journeys. Existing normal editing, zero values, caps, Kate’s Ultimate, Evomorph evolution and ending consumers remain covered.
- Local Node 22 full checks passed: 639 unit tests and 121 edge-adapter tests; asset validation and production build passed. The 38 targeted desktop/mobile tracker, ending and state-art journeys passed. Required final-head CI is recorded on the PR.
- Actual loaded four-card, unknown/editing/critical and healthless layouts were reviewed and are captured at 1280×640, 1366×768, 1440×900, 390×844 and 320×568 by `tracker-bars.spec.ts`. Final reviewed local results and required CI are recorded on the PR.
- Frontend-only release: merge then Publish in Lovable. No edge function redeployment, migrations, new assets or private-reference uploads.

## Earlier control-strip verification — 2026-10-28

The following records the earlier opt-in design; its stop/opt-in behavior is superseded above.


- `npm run check`: 537 unit tests and 111 edge tests passed; 11 existing lint warnings, no errors. Production build and asset validation passed (589 unchanged artwork files).
- 124 local browser journeys passed, including the new strip controls, health limits/Kate's Ultimate, artwork states, opt-in/close, keyboard activation, manual edit/Cancel, Undo/reload, rejected writes and existing Play/death journeys.
- Existing Buddyland assertions now verify the bottom-strip titles and their new names. All 18 Buddyland/strip journeys passed after this integration expectation update.
- Full-catalog review covers 39 Final Girls × three states × five viewports (585 crops). An additional 78 catalog journeys recaptured settled frames at CSS-pixel scale. Reviewed all portrait trios in the new laptop/phone picture areas; original assets and the reviewed per-girl framing metadata are unchanged.
- Actual four-card controls, three-card Poltergeist layout, critical/zero-health, untracked and editing states inspected. Automated checks verify that titles and all 44px controls stay below the picture, fit the strip and do not cause horizontal overflow at 1280×640, 1366×768, 1440×900, 390×844 and 320×568. Wider fallback title-font metrics are also checked.
- Required final-head Reliability CI is recorded on the PR, separately from local results.

Frontend-only release: no function, database, secrets or private-reference changes. Local synthetic browser screenshots do not establish production deployment.
