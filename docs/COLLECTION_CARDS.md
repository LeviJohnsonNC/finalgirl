# Illustrated Collection cards

Approved scope, 2026-10-25: match Levi's `Screenshot 2026-10-25 at 7.27.11 PM.png` (attachment `file_00000000c89481fdbdb6a7246cbcc11f`) across all 23 catalog entries: 21 named releases with bespoke scenery/title compositions and two finished upcoming teasers. Preserve source box art and the selected official/AI image preference. Reuse the 39 existing Final Girl identities as optimized portrait buttons, retaining the shared modal and private-item boundaries.

## Completion criteria

- Individually directed, reviewed backgrounds for all 21 named releases, distinct title compositions, consistent distressed print treatment, intact covers, readable metadata and portrait buttons.
- Vignettes retain a single character and Location: Your choice. Upcoming entries remain unavailable and do not invent cast/locations. Missing verified character details show an honest unavailable state.
- Roughly 420px minimum desktop cards; two columns on ordinary laptops, three on larger containers, one on phones. Natural content height; no clipped titles, descriptions or controls at 320px. Touch targets at least 44px; keyboard focus and reduced motion supported.
- Ownership persists through the existing queue/RPC and continues to gate casting. Character actions are independent of ownership switches. Collection Back preserves its origin and active game.
- Small cover/portrait derivatives and individually lazy-loaded WebP backgrounds; no full-resolution identity downloads for the shelf. Target 200KiB per backdrop, 96KiB per cover derivative and 30KiB per portrait derivative, measured before delivery.
- Full checks/build/asset validation plus applicable Collection, reliability, character/unlock and casting browser checks. Review every entry on laptop and phone, plus the complete shelf at 1280×640, 1366×768, 1440×900, 320×568 and 390×844. Check unavailable, unowned/owned, missing-image, image-mode and cloud-error states.

## Implementation sequence

1. Establish the live card with Happy Trails, Buddyland and Into the Void; calibrate composition and performance.
2. Produce the remaining bespoke scenery and title metadata; record stable source/cell mapping beside assets.
3. Complete shared interactions, all character triggers and truthful fallbacks, thumbnail pipeline and recovery states.
4. Review the full set, fix findings, run checks and deliver a PR. Frontend publication only; no backend, model, private catalog or migration change is intended.

## Evidence and release

Implemented with one `FilmToggle`, authored metadata in `src/data/collectionArt.ts`, 23 individually lazy-loaded original scenes and the existing selected cover/identity registries. Artwork sources and row mapping are recorded in `src/assets/collection-scenes/README.md`. Artwork is collection decoration; the candid 1980s identity-photo direction remains in `IDENTITY_PHOTOS.md`. No new identity images or game rules are part of this change.

The 39 named portrait buttons all open the shared character modal. Melanie, Patsy and Gabrielle retain their available biographies without invented gameplay references. Kenzie, Julie, Meghan and Ronda show “Details aren’t available yet.” No unlock controls are added for unverified characters. Nancy, Kenzie and Ginny have individually reviewed narrow-strip focal positions. The two upcoming films retain disabled ownership controls and abstract teaser art without invented cast/settings.

Cover derivatives trim only uniform blank margins, leaving every actual box face visible; source cover and identity files are byte-unchanged. Portrait derivatives preserve the complete image and use CSS crops. The existing supplied Buddyland official and AI cover PNGs are byte-identical, so their production thumbnails correctly share one URL. Both image modes are checked without assuming they must look different. The new portrait generator processes all 60 current identity assets; the shelf uses the corresponding 39 Final Girl images.

Measured assets: 23 scene files total 2444.7KiB (largest 136.1KiB), 60 portrait derivatives total 562.5KiB (largest 18.3KiB), and 22 cover derivatives total 1144.3KiB (largest 82.3KiB). Source covers total approximately 41MiB and are not downloaded by the shelf. `check:assets` enforces all three budgets. Missing-image fallbacks retain readable titles and usable controls; reload retries failed assets.

## Verification

- `npm run check`: 446 unit tests and 104 edge/handler tests pass; lint has the existing 11 warnings and no errors. TypeScript passes.
- Asset validation: 374 valid image files; production build passes. No new dependencies.
- 54 distinct desktop/mobile journeys pass across Collection (14), character/unlock, reliability, Buddyland and casting suites. Coverage includes selected covers, all 23 entries/39 triggers, single-character vignettes, upcoming entries, unavailable details, ownership persistence and rejected-write recovery, load-error disable/retry, both image preferences, missing scene/cover/portrait recovery, return navigation and preservation of an active game.
- Additional local visual audit: all 23 cards captured and reviewed at 1366×768 and 390×844; all 39 character dialogs opened with no private item reads for locked fixtures. Full-shelf containment checked at 1280×640, 1366×768, 1440×900, 320×568 and 390×844. Final focal-position, unowned-state and five-size reading checks pass. Laptop cards use two columns below 1400px, with three where the container supports the 420px reading width. Long titles and descriptions reflow rather than clip.

The first full CI run exposed a pre-existing casting screenshot timeout: all layout assertions passed, but four 3× mobile-device screenshots exhausted the combined 45-second test budget. Each location now has its own test, retaining all six viewports and visual checkpoints, with laptop screenshots captured at CSS resolution. Both locations pass under desktop and mobile emulation.

Frontend publication is the only deployment step after merge. No SQL migration, edge-function deployment, private-catalog change, generation model or prompt update. Production publication and signed-in live smoke testing are not claimed. The implementation PR's Reliability workflow supplies the full current-head CI gates.

## Cinematic refinement, 2026-10-26

Levi's follow-up critique and the supplied 7:31:28 / 7:32:05 screenshots requested quieter supporting typography, stronger depth, more tangible box art, less framing, tighter proportions, and dramatically dimmed unowned cards. Keep the existing authored title lettering and original environments. Supporting descriptions, metadata, character names and ownership labels now share a system sans-serif family with a clearer size/weight hierarchy.

The environment, directional black gradients, and separate foreground mist/scratches form three decorative CSS layers. A dark edge vignette and one subtle film-accent border replace the doubled outer rim and inset lines. Killer/location icons consistently use red/cyan. Metadata and portrait spacing are tighter; portrait buttons and the ownership switch retain at least 44px interaction targets while the switch's visible track is 32×16px.

Covers occupy approximately 8% more width. Their derivatives now use a 384×576 maximum, Lanczos resizing, restrained post-resize sharpening and quality-86 WebP. Deeper CSS shadows and a faint edge highlight give the unchanged box faces separation. Original cover, identity and scenery assets are unchanged. Full cover derivatives now total 1.12MiB; the largest is 82.3KiB, below the new enforced 96KiB limit. Portrait and scene budgets are unchanged.

Unowned cards darken the scene, cover, title, description, metadata, portraits and frame without disabling character information. Their smaller ownership control remains legible and keyboard-accessible. Hover does not restore the owned appearance; keyboard focus remains visible. Rendered Happy Trails samples have approximately one-third the owned card's mean luminance on both laptop and phone. Upcoming cards also use the unowned presentation.

Same-width, whole-catalog measurements before/after: mean card height falls 9.6% at 1366px, 14.6% at 1440px, 12.3% at 320px and 13.2% at 390px. The Happy Trails cover grows 7.8–8.5% across those widths. Natural content height accommodates longer titles/metadata; no line clamping or fixed-height truncation is used.

Refinement verification: full `npm run check` passes (446 unit and 104 edge/handler tests; the existing 11 lint warnings). Production build and 374-image asset validation pass. All 42 targeted desktop/mobile Collection, character-reference and reliability journeys pass, covering image modes, unavailable details, fallbacks, ownership recovery, active games and spoiler boundaries. Every card is visually reviewed at laptop and phone sizes; containment and 44px controls are checked at 1280×640, 1366×768, 1440×900, 320×568 and 390×844. Additional rendered owned/unowned, modal and keyboard re-ownership checks pass. This remains a frontend-only release after merge.
