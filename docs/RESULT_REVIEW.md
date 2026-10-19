# Cinematic result review

The result-entry page follows the approved closing case-file reference. A location banner carries Victory or Defeat, matchup and location. Saved, killed and final-round counters come first, followed by Final Totals, applicable module panels, and The last moments. Continue retains the existing ending flow. More options exposes save-only recovery without a competing primary action.

## Artwork and presentation

Four generated, optimized WebP assets live in `src/assets/outcome/`:

- `buddyland-banner.webp`: a quiet indoor arcade panorama with empty space behind live text.
- `billy-workbench.webp`: dormant mascot components and power equipment behind Billy's fields.
- `last-moments.webp`: a chair, flashlight and abandoned tickets behind Buddyland's closing notes.
- `case-surface.webp`: neutral photographic wear for the frame and fallback surface.

The three counters reuse existing survivor, corridor and stopwatch artwork. Other locations use their existing location imagery. This artwork is static, so the review page does not invoke image generation or spend player credits. Headings and numbers use locally hosted licensed fonts. Field labels, values and menus remain live HTML.

The desktop layout pairs final totals with module details. Tablet and phone layouts stack the form; the smallest phones stack the increment and decrement controls inside each counter. Menus are collision-aware and keyboard accessible. The page has one document scroll, with bottom space for the existing footer and news ticker.

## Result semantics

The existing draft fields and final-data builder remain in use. Tracked values prefill editable fields. Blank counts, rounds, Health and Horror remain unknown; an explicit zero remains zero. Numeric controls share inclusive bounds, support direct typing, correction and clearing. A win at zero Final Girl health is still displayed as Victory, and unkillable threats have no invented health field.

All existing applicable killer/location sections are retained, including Billy's conditional Boris field, Poltergeist rescue facts, Falconwood missions and Slayer dimensions. The themed module selectors retain their catalogs. Buddyland weapon and room suggestions use the existing verified data while allowing custom text. Saving, reload recovery, statistics and ending context use the same result pipeline as before.

## Verification and release

The browser scenarios exercise both Buddyland outcomes, editing and reloading final totals, real Finale/Boris menus, a sacrificial Poltergeist victory, mission/dimension details, and save-only recovery. Existing browser tests continue to cover the broader game and archive flows. Unit checks cover unknown versus zero, clear, and numeric bounds.

Full-page review captures hide the fixed ticker/footer during the capture so those controls do not obscure fields halfway down a long image. Their normal viewport placement and clearance are checked separately. Provider and backend calls in browser tests are mocked.

This is a frontend and static-artwork change. No database migration or edge-function deployment is required.

## Review captures

| Outcome | Desktop | Phone |
| --- | --- | --- |
| Buddyland victory | [View](images/outcome-victory-desktop.jpg) | [View](images/outcome-victory-mobile.jpg) |
| Buddyland defeat | [View](images/outcome-defeat-desktop.jpg) | [View](images/outcome-defeat-mobile.jpg) |
| Poltergeist rescue victory | [View](images/outcome-rescue-desktop.jpg) | [View](images/outcome-rescue-mobile.jpg) |
| Falconwood mission loss | [View](images/outcome-mission-desktop.jpg) | [View](images/outcome-mission-mobile.jpg) |

Local validation: 239 unit tests, 51 edge adapter tests, and all 186 desktop/mobile browser tests passed. Lint passed with nine existing refresh warnings; production build, final typecheck, and validation of 192 artwork assets passed.
