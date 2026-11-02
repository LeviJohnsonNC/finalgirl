# Health progression, finale input and Guillotine diagnosis (2026-11-02)

## Portrait audit and corrections

Compared all 39 healthy/intermediate/low-health sets. The old intermediate state used the identity original, which sometimes had more visible cuts and blood than the supposedly critical derivative. Regenerated eighteen critical images using their identity originals and added three mild intermediate tracker-only edits (Asami, Mandy, Veronica). All original identity SHA-256 values remain unchanged. The full per-asset prompt, input and generated-file provenance are in `src/assets/play/final-girl-health/manifest.json`; outputs are individual self-hosted 768px WebP images below 160KiB. Generation used the built-in image tool. Three critical generation attempts were declined; the mild intermediate alternatives preserve a clear progression without graphic escalation.

Low-health faces now have substantially stronger bruising, fatigue and wear. No changes to casting, Collection, private references, health observations or numerical thresholds. Unknown, invalid, above-maximum and official-art presentations retain their original fallback behavior. Intermediate overrides apply only below a known maximum and above 2 HP.

## Finale typing

`useDraftField` previously called `updateFormDraft` before updating its local input. Each character synchronously parsed, serialized and wrote the entire active game, broadcast a storage event, rerendered Index (including full play-log validation), and triggered repeated play-log reductions in the review form. This cost grows with the session log. Cloud syncing was already debounced; the synchronous local work remained in the keystroke path.

Text fields now update local state immediately, merge pending fields, and persist after 600ms without typing. Blur, Continue, Save without narration, beforeunload, pagehide, document hiding and unmount flush the pending text. Failed writes retain the latest text, display a retry message, and block Continue/Save until persistence succeeds. Numeric/select observations retain immediate durable writes. The mounted review is keyed to account and game. Play-log and module summaries are memoized instead of being recomputed for every character.

A browser reproduction with 600 recorded events and a 39-character sentence previously wrote the entire active game 39 times. The same journey after this change produced zero active-game writes while typing on desktop and phone, then retained the exact text after an immediate reload without blur or waiting for the debounce. These synthetic journeys demonstrate removal of the costly work; they do not measure Levi's device or prove the exact delay observed in his live session.

## Guillotine death diagnosis and proposed creative fix

Guillotine is a verified Tormentor victim-trap mechanism. It is present in the picker, accepted as a death detail, preserved by canonical fact construction, and sent to the death writer. No missing-mechanism or Guillotine-specific client rejection was found.

The writer currently requests a “gruesome” 100–150 word scene, allows bloody horror and supplies the trap context. A provider content refusal is plausible for a guillotine depiction. The original response/log from the reported live request was not available, so this is not a confirmed root cause. Other distinguishable possibilities remain sync failure, exhausted allowance/credits, timeout, or incomplete provider prose. A complete-text validator also rejects fewer than 40 words, a missing closing punctuation mark, or more than 1600 characters.

The existing gateway recognized normalized `content_filter` and explicit refusals but treated other native blocked finishes as incomplete. Added recognition of native safety/blocklist/prohibited-content finishes and prompt feedback, machine-readable failure codes, and structured session/event/mechanism diagnostics. A refused scene is left failed and retryable; no new death is recorded, and no automatic model retry or fallback attempts to evade a refusal. The player now gets a useful less-graphic-description suggestion instead of a generic repeat request. Provider enum reference: https://ai.google.dev/api/generate-content . Gateway forwarding of every native field is provider-dependent; future logs are needed to confirm the actual live response.

**Proposed prompt change, not implemented:** for mechanisms involving decapitation or similarly explicit injury, preserve the exact mechanism and recorded death count, but put the graphic moment off-screen. Build the scene through the release, sound, interrupted movement and restrained aftermath. Explicitly prohibit anatomical detail, prolonged suffering and torture spectacle. Keep ordinary death scenes otherwise unchanged. Do not switch models or lower safety settings after a refusal. Review several live, newly generated trap scenes before judging prose quality.

## Verification and release

- `npm run check`: 649 unit tests and 123 edge tests passed; type checking and lint passed with eleven existing Fast Refresh warnings.
- Asset validation and production build passed. Original identity hashes, explicit state mapping and per-image size budgets verified.
- Browser coverage includes all 39 girls at healthy/intermediate/critical states on desktop and phone, health/fallback/Undo/reload, finale persistence, outcomes, death completion, cache and narration. 124 browser journeys passed. Reviewed all 234 healthy/intermediate/critical tracker crops in fourteen desktop/phone contact sheets, in addition to the full-frame portrait audit.
- No database schema/migration or reference upload is required. After merge, publish the frontend in Lovable and redeploy `generate-death-scene` for the diagnostic changes. Existing cached death prose remains unchanged. No production deployment, signed-in model call or live-log confirmation is claimed by these local checks.
