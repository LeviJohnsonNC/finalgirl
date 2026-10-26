# Story evaluation capture

New, authenticated, validated opening/ending requests write a private evaluation record before calling the existing AI gateway. Every request is a distinct attempt, including retries. No paid requests are made for evaluation, and neither prompts nor generation settings change. The corpus is never read by gameplay, history, image generation or future story prompts.

## Deployment and smoke check

1. Apply `20261022180000_story_evaluations.sql` before deploying the changed `generate-story` and `generate-ending` functions (their shared dependencies bundle with them).
2. Deploy the frontend. Older clients still produce captures with `diagnostic_status=not_provided` and no paired game ID. Older functions do not capture anything, even with a new frontend.
3. Using your own signed-in account, generate an opening and ending for one game, then use **Collection → Collection tools (at the bottom) → Story evaluation → Export JSON**. Verify two attempts have the same `game_id`, full text, effective system/user prompts, model context, diagnostic log, actual selected model and terminal status.
4. If persistence is unavailable, story generation continues and the new frontend shows an evaluation-save warning. Fix deployment/connectivity before collecting evaluation games. No historical prompt reconstruction or backfill is attempted.

## Interpretation

- `system_prompt` includes the actual gateway punctuation instruction; `user_prompt` is exactly what was submitted. `model_context` contains the validated facts used by that prompt. Model fallback is reflected in `model` when finalization succeeds. A failed request before model selection has no model.
- `diagnostic_context` is explicitly untrusted client metadata: selection, the full recorded play log (including undo records), and, for endings, the reviewed form. It is never added to the model prompt. A snapshot over 2 MB is rejected whole and marked invalid, rather than silently truncated. Story text and prompts are not sliced.
- `story_text` contains normalized text emitted by the server, not raw provider bytes. This matches the player's punctuation contract. It does not prove browser receipt, the retry the player retained, or final game-history selection. Ending `model_context.introStory` identifies the actual opening used by that ending, even across retries.
- `complete` requires a nonblank story and explicit provider stop signal. `incomplete` includes missing stop signals, length/filter finishes, error frames or broken transport with partial text. `failed` includes empty output or request failure; `cancelled` means downstream cancellation was observed. `generating` may be in progress or left unfinished by a terminated runtime or failed final write. Do not grade those as completed stories.
- The exact successful model identifier and duration are recorded, not internal gateway retries, provider token usage, unsupported generation parameters or a seed. The captured prompts/settings describe the existing streamed request; no claim of deterministic replay is made.
- Initial/final database writes have five-second bounds and fail open. Captures are best effort if the process is killed or the database is unavailable. The final stream frame reports whether the evaluation write was acknowledged. Errors are generic codes; no provider bodies or credentials are stored.

## Export and retention

Export is explicit and owner-scoped through RLS, with keyset pagination up to the latest attempt at export start. Rows can finish during export; it is not a transaction snapshot. User IDs and internal pagination sequences are omitted from the downloaded, versioned JSON. The browser keeps no extra local-storage copy. Share this file directly for future grading; it includes private backstories and notes.

Evaluation rows have no foreign key to game history or play sessions: resetting/deleting/discarding a game does not remove evaluation attempts. Collection explains this and offers a separate **Clear evaluation data** action inside the bottom Collection tools section. Clearing requires typing the exact word `DELETE`; cancellation, incorrect text and reopening cannot reuse an earlier acknowledgement. An in-flight generation can finish after clearing; wait until generations finish before clearing if you want an empty corpus. Deleting an auth account cascades all evaluation rows. Authenticated users may read/delete only their own rows; inserts and updates require the server service role.

## Verification

Existing CI runs stream/handler adapter tests (split UTF-8/SSE, completion, failure, cancellation, retries, fail-open writes and prompt/diagnostic separation), export pagination tests, PostgreSQL migration/RLS assertions and desktop/mobile browser export journeys. Provider and backend calls in tests are mocked; the production smoke check above must be done after deployment with real credentials.
