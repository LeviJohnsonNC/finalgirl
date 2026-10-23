# Playtest presentation refinements

The shared Dark Power/Finale chooser dims unselected artwork, keeps its HTML labels readable, gives verified Epic cards a static distressed blood border, and retains separate selected/focus indicators. The duplicated selected-card preview is removed. Its rules are disclosed below the chooser; unnamed and older card names remain visible. Both entry points and Hans's second power keep their existing observations.

Gruesome Death now uses a height-bounded illustrated frame with a compact header and a fixed action footer. Editing scrolls the form; reading scrolls prose. Generated or reopened matching scenes default to reading, with Edit death details to restore fields. Changing the cause restores editing and clears incompatible draft fields through the existing domain helper. On narrow phones, reading keeps only the selected cause tile; editing restores all six. Existing drafts, Cancel, takes, signature checks, save failures, narration and event identity are preserved.

Removed normal-view filler: the Item Trap availability/repeat paragraph, the People & props procedural paragraph, tap-to-activate/portrait/heart instructions, generic correction guidance, reveal-only/resolve-on-board reminders, and visible routine moment confirmations. Moment success is announced to assistive technology. Full Event, companion and trap effects are under Rules; lasting penalties, spawn previews, health/status labels and errors remain visible. The rule catalogs and prompt data are unchanged.

Ending posters reclaim the former internal mat allowance. The fit accounts for actual caption height and preserves a complete 2:3 poster, the existing art column, story reader, header and tools. Phone layout is unchanged.

Frontend deployment only. No migrations, edge-function updates, model changes or gameplay backfill.

Verification: `playtest-polish.spec.ts` exercises short-laptop and 320px layouts, fixed death actions through editing/loading/reading/errors, narration, draft cancellation, cause changes, Epic selection, read-only rule disclosure, and a measured image-area comparison against the former poster fit. Existing reliability tests retain the module, cache, ending and narration journeys. Browser screenshots are included in the CI artifacts.
