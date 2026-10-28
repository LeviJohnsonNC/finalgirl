# Approved module UI reference pack

These are **actual app controls** from Slaughter in the Groves at approved source revision `dad911e034e332a23882de7c8304dc9d0db198cb` (PR #138, including #137). Read the [module standard](../../MODULE_STANDARD.md) for requirements and [component contracts](../../module-controls.md) for reuse/exception boundaries. This pack preserves the finished result; it does not propose a new design or implement Creech Manor.

Captures use the repository's real compiled frontend with synthetic `ArchiveMock` state: Inkanyamba, Sacred Groves and Adelaide. No real session, provider generation, private item data or production writes are involved. Screenshots demonstrate presentation, not source-rule verification, physical-device testing or live provider quality.

## Representative states

| View                    | Laptop                                       | Phone                                      | What to preserve                                                                 |
| ----------------------- | -------------------------------------------- | ------------------------------------------ | -------------------------------------------------------------------------------- |
| Collapsed owner headers | [View](images/headers-desktop.jpg)           | [View](images/headers-phone.jpg)           | Separate owner photographs; concise summaries; killer first.                     |
| Reveal choices          | [View](images/reveal-choices-desktop.jpg)    | [View](images/reveal-choices-phone.jpg)    | Small dim choices, readable names and Epic distinction.                          |
| Named Power and Finale  | [View](images/revealed-cards-desktop.jpg)    | [View](images/revealed-cards-phone.jpg)    | Wide photographic heroes, hidden alternatives, quiet correction.                 |
| Minor: unrecorded       | [View](images/minor-unknown-desktop.jpg)     | [View](images/minor-unknown-phone.jpg)     | Compact muted choices; honest unknown health.                                    |
| Minor: active           | [View](images/minor-active-desktop.jpg)      | [View](images/minor-active-phone.jpg)      | Larger stable photo, live hearts, Clear record; additional powers supported.     |
| Minor: removed          | [View](images/minor-removed-desktop.jpg)     | [View](images/minor-removed-phone.jpg)     | Compact zero state with reachable restore hearts.                                |
| Sacred spaces: clear    | [View](images/sacred-clear-desktop.jpg)      | [View](images/sacred-clear-phone.jpg)      | Wide environments; no redundant empty caption.                                   |
| Sacred spaces: placed   | [View](images/sacred-placed-desktop.jpg)     | [View](images/sacred-placed-phone.jpg)     | Landmarks persist as Closed, Fire and Hallowed alter the environment.            |
| Sacred spaces: combined | [View](images/sacred-combined-desktop.jpg)   | [View](images/sacred-combined-phone.jpg)   | Combined labels/count and accessible explicit editor; no silent erasure.         |
| Ongoing Terror: off     | [View](images/terror-off-desktop.jpg)        | [View](images/terror-off-phone.jpg)        | Dim picture toggle without auxiliary controls.                                   |
| Ongoing Terror: on      | [View](images/terror-on-desktop.jpg)         | [View](images/terror-on-phone.jpg)         | Clear presence state; original approved Fickleness artwork retained.             |
| Killer Wrath: low       | [View](images/killer-wrath-low-desktop.jpg)  | [View](images/killer-wrath-low-phone.jpg)  | Believable approved killer identity, dark space behind controls.                 |
| Killer Wrath: high      | [View](images/killer-wrath-high-desktop.jpg) | [View](images/killer-wrath-high-phone.jpg) | Stronger photographic stage, readable ten-position track and phone crop.         |
| Divine Wrath: high      | [View](images/divine-wrath-high-desktop.jpg) | [View](images/divine-wrath-high-phone.jpg) | Distinct approved material theme; not a request to add Wrath to other modules.   |
| Bloodlust: quiet        | [View](images/bloodlust-quiet-desktop.jpg)   | [View](images/bloodlust-quiet-phone.jpg)   | Tame generic starting photograph, legible overlaid state.                        |
| Bloodlust: high         | [View](images/bloodlust-high-desktop.jpg)    | [View](images/bloodlust-high-phone.jpg)    | Strongest stage at the verified Inkanyamba maximum; art does not change numbers. |

Reusable: proportions, photo quality/crops, dimming, hierarchy, padding, state visibility, quiet actions and equivalent shared interactions. **Not automatically reusable:** Wrath, token cycles, special-Victim outcomes, Holy Man interpretation, or any other owner's mechanics. Primary Dark Power uses Clear card name; Finale now uses the same left-aligned Clear card name action (2026-10-27 playtest refinement); no Change Finale button. The older captures retain the former button as historical visual evidence. Minor Powers permit multiple records. Unknown is distinct from zero/empty. Required linked choices/errors remain available even though routine rules/reminders are omitted.

## Capture and update procedure

`capture.spec.ts` is an opt-in documentation tool outside ordinary browser-test discovery. From the repository root, with dependencies and Playwright Chromium installed:

```sh
npm run build
MODULE_REFERENCE_OUTPUT=/tmp/module-reference-candidates npx playwright test --config docs/reference/module-standard/playwright.config.ts
```

The dedicated preview server uses port 9354. Every scenario runs at 1366×768, 390×844 and 320×568. Laptop and phone produce component crops at CSS-pixel resolution; narrow only checks loaded controls/images and document overflow. Reduced motion is enabled, fonts/images settle, and the fixed app footer is hidden during crops to avoid covering the component. State and artwork are unchanged. These are not full-page composition baselines or screenshot-diff tests. The fixture blocks external requests, including external webfonts; bundled fonts load normally and system fallbacks apply where an external font is specified. Use the written typography requirements and a normal rendered-app review for final font approval, rather than treating fallback glyphs as a new font choice.

Review candidates against the current approved pack and the relevant source-backed owner record. Do not replace references solely because a test run passes. Update approved images only as part of a user-authorized baseline change; there is no extra approval gate when existing authorization already covers it. Copy reviewed JPGs into `images/`, update this source revision and generate metadata:

```sh
node docs/reference/module-standard/manifest.mjs --write --source <approved-40-character-source-commit>
node docs/reference/module-standard/manifest.mjs
```

Metadata generation requires ImageMagick (`magick`); verification uses Node only. `manifest.json` pins provenance, capture viewports, dimensions, byte sizes and SHA-256 for every committed image. Images are deliberately lightweight review references, not new runtime assets. Keep all 32 representative images and review relevant additional laptop sizes through ordinary module journeys when changing layout. The full state-art inventories remain in the owner asset READMEs; this pack is intentionally representative.
