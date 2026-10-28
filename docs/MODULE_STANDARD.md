# Approved module standard

Current presentation baseline: **Slaughter in the Groves**, approved by Levi on 2026-10-27, source revision `dad911e034e332a23882de7c8304dc9d0db198cb` (merged PRs #137 and #138, including the final tracker photographs). Start here for every new killer/location import. The [actual UI reference pack](reference/module-standard/README.md) shows the finished controls.

## How to use this standard

Read this page, inspect relevant reference pictures, then follow the [import playbook](MODULE_IMPORT_PLAYBOOK.md) and [component contracts](module-controls.md). Update an owner-specific [import record](templates/MODULE_IMPORT_RECORD.md). Current user instructions govern scope and authorization; verified components/edition govern game facts. This document governs presentation. Record justified mechanic-specific exceptions in the owner record.

Reuse Groves' presentation and interactions for equivalent operations. Build new mechanics from the new source photos; Groves' Wrath tracks, Sacred-space tokens, special outcomes and provisional rulings do not automatically apply elsewhere. A selectable catalog entry is not evidence of implemented mechanics. Preserving this baseline does not implement Creech Manor or establish its mechanics.

Historical polish notes are in [history](history/README.md). They explain earlier iterations and are not instructions to restore retired controls or illustration treatments. Update these current guides in place when a reusable preference changes; keep chronology in history or the owner record.

## Product and interaction defaults

The app is a cinematic companion to the physical game. Play foregrounds useful current state and actions; physical cards and the Rules page carry detailed rules. Do not fill a panel with setup references, Unleash tables, duplicate summaries, routine success messages or procedural reminders. Keep required choices, meaningful errors, unknown states and consequential linked-action previews reachable. Existing rule-specific consequences can remain where needed; document the reason.

| Operation                     | Approved behavior                                                                                                                                                                                                                       |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Module entry                  | Owner-specific photographic header, concise state summary, killer before location, expansion preference that never writes gameplay. Location art belongs to the location.                                                               |
| Power / Finale                | Small, heavily dimmed choices; one vivid wide photographic hero after a named selection; unused choices hidden. Card rules stay in Rules. Both entry points share one permanent reveal.                                                 |
| Quiet correction              | Primary Dark Power uses left-aligned **Clear card name**, preserving its reveal; no Change Dark Power button. Finale uses the same left-aligned **Clear card name** action; no Change Finale button. Hans's rule-specific second Power retains its dedicated workflow.                       |
| Minor Powers                  | Before Power/Finale. Small muted unrecorded choices expand to a wide picture with live hearts when health is positive. Zero is compact Removed with restore hearts. **Clear record** is a quiet action, not a Rules/Details block.      |
| Multiple Minor Powers         | Hide unused alternatives after a record; **Add another Minor Power** restores choices without a write. Preserve every recorded power, including zero/legacy-unknown health; do not impose a one-power limit.                            |
| Simple ongoing effect         | Click the picture to toggle presence; title/state and clear inactive dimming. No separate Rules, reminder, End effect or Change status controls beneath independent toggles.                                                            |
| Characters and linked effects | Explicit legal outcomes and necessary placement/allocation choices. A known victim portrait opens its actions; saved/killed is not a presence toggle. Status correction must not repeat outcome effects.                                |
| Environmental state           | Where applicable, change the environment itself for meaningful states, retaining landmarks/camera. A simple legal cycle may use the picture; combined/unknown states keep a quiet explicit editor when cycling would erase information. |
| Empty versus unknown          | Known empty can omit a redundant caption, as Sacred spaces do. Unknown stays explicit; it must not silently become zero, absent, depleted or unrevealed.                                                                                |

Use [shared controls](module-controls.md) rather than reimplementing these patterns. Clearing an observation/card name is not deletion of immutable history. Preserve existing safeguards for genuinely destructive session/case deletion.

## Composition and photography

Use deliberate internal padding, restrained framing, readable type hierarchy and dark text scrims. Titles dominate; supporting text stays subordinate. Names/status/actions remain HTML, with keyboard focus and touch targets at least 44px. The normal laptop dashboard stays compact; expanded modules may scroll. Do not clip content or shrink controls to force every expanded panel onto one screen. Respect reduced motion; prevent 320px horizontal overflow.

New identity, module-header, Power/Finale/Minor and meaningful environmental/tracker artwork defaults to the approved physically believable photographic treatment. Follow [photo direction](IDENTITY_PHOTOS.md): tangible materials, coherent available light/exposure, natural perspective and restrained 1980s consumer 35mm reproduction. Camera-era treatment does not override verified wardrobe, technology or setting. Grain/blur must not hide illustration or CGI. Supplied approved replacements take precedence. Preserve face, mask, hair, skin, costume, silhouette and canonical props, using approved references where available.

Retained artwork is not a global replacement request: Divine Wrath/Fickleness and other approved retained UI art keep their treatment; ending posters keep their painted/composited medium. Unusual subjects retain their verified design with physically convincing materials/light; do not force every killer into a generic human costume.

Plan ratio, native resolution, display crop and dark space **before generation**. Use wide images for wide cards/headers. Avoid stretching/upscaling, blurry contact-sheet crops and neighboring-cell bleed. Review actual laptop/phone crops with controls over them. Use separate images or a verified atlas only when the native source supports the rendered size. Record source identifiers, ordering, focal positions, derivatives and budgets in the artwork README. Current examples: [card/state photos](../src/assets/play/photos/README.md), [headers](../src/assets/play/banners/README.md), [Bloodlust](../src/assets/play/bloodlust/README.md), [Killer Wrath](../src/assets/play/inkanyamba/README.md).

Progressive track art matches verified physical positions and stays distinct at every required step. Verify board ranges; an app input limit or location strip does not establish a killer maximum. Label unverified mappings honestly and preserve older saved values. Presentation never resolves effects or changes observed numbers.

## Truth, identity and ownership

Separate verified source facts, explicit player observations, unresolved/provisional interpretations and decorative imagery. Record source counts, obscured icons and missing faces honestly. Carry an approved provisional ruling with its owner and label; do not present it as publisher-confirmed or generalize it to another module.

Opening/ending/death generation preserves selected cast identities and supported story facts. Mechanics constrain fiction; they are not automatically physical props/actions, card-name signs or dialogue. Decorative state pictures establish no blood, fire, injuries, casualties or items in the session. Preserve the selected Final Girl's own portrait/appearance; named current references outrank conflicting old generated prose/continuity. See [photographic openings](PHOTOGRAPHIC_OPENINGS.md) for the pipeline and reference-storage contract.

Killer and location ownership remain separate in mixed casting. Preserve immutable history, explicit fresh-session setup, atomic linked observations, Undo, offline/reload recovery and failed-write retry. Panel mount/expansion never writes gameplay; art never infers damage, victims, costs or outcomes.

## Implementation and completion

The source-reviewed plan identifies shared controls, actual new mechanics, visible states/transitions, required versus omitted UI, and an artwork manifest. After implementation approval, build the hardest genuinely new interaction first and compare its rendered form with this baseline before producing remaining artwork. Continue routine work autonomously within approved scope; ask only for a consequential new decision or real source blocker. This is not another mandatory approval gate.

Completion requires source reconciliation, all in-scope integrations, meaningful state/mixed-owner/failure/Undo/reload journeys and actual visual inspection. Check 1280×640, 1366×768, 1440×900, 390×844 and 320×568 where applicable. Include quiet/unselected/active/depleted/unknown/combined states, long labels and loaded images. Passing tests alone does not establish realism, likeness or crop quality.

Run appropriate existing checks and wait for the **final PR head's required CI checks** before the completed handoff. Update related starting-event/integration expectations when a shared interaction changes. Distinguish CI mocks from authorized live generation/audio and production smoke tests; do not claim live quality/deployment from mocks.

Report exact frontend, function and migration requirements and current deployment status. Reuse the trusted Storage-backed reference manifest/loader; do not embed large image collections in function source or accept arbitrary caller URLs. A changed manifest requires its exact reviewed objects to be staged/uploaded and checked. Verify source limits/deployed bundles when functions change, and deploy compatible backends before new frontend callers when authorized. Merge, CI, deployment and live verification are separate. This guide grants no standing permission to merge, publish or spend on unrelated live generation.
