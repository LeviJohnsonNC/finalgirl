# Bloodlust terror progression

Levi requested a slower escalation, less early redness, more meaningful changes between steps, and a truly creepy face in the final one or two moon images. This refresh replaces the eleven shared Bloodlust photographs, preserving verified per-killer mappings, recorded numbers, unknown/legacy behavior and the approved bottom control strips.

## Result

The fixed cabin/dock/canoe composition starts silver-blue. Fog advances, clouds obscure the moon, cabin lights go out and water roughens before any red appears. The midpoint introduces only a muted warm horizon; copper and then red lunar light build late. Stage 8 remains faceless. Stage 9 reveals a cratered, malicious grin; stage 10 opens a jagged black maw with glinting sockets. The supernatural face is an explicit user request; environmental and lunar surface materials retain the photographic treatment.

Eleven separate 1536×1024 sources become 768×512 WebP derivatives with no upscaling, each under the existing 160KiB limit. Source IDs, visual ordering and sizes are recorded in `src/assets/play/bloodlust/README.md`. Original generated PNGs remain intact in generation history.

The Bloodlust-only center-top crop protects the high moon, including its entire forehead, in both narrow cards and wide two-column layouts. Other tracker crops and artwork remain unchanged. Controls and labels stay in the existing separate bottom strip.

## Verification and release

The existing tracker-artwork journeys exercise every mapped position for Hans, Dr. Fright, Inkanyamba, Geppetto, Poltergeist and Billy's generic scale, plus decrement, Undo, reload, unknown/legacy values and rejected saves. Hans now captures all eleven images at 1280×640, 1366×768, 1440×900, 1024×768, 390×844 and 320×568. Final-stage checks verify the reviewed lunar-face bounds remain within the rendered picture. Tracker-strip regressions verify unobstructed pictures, accessible controls and all existing tracker behavior.

Local and required final-head CI results are recorded on the PR. Browser journeys use synthetic local state; they do not demonstrate production deployment.

Frontend/artwork release only. No function, migration, secret, private identity reference, narrative-context or game-rule changes. Merge and frontend publication remain separate release steps.
