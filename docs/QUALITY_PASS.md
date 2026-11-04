# Story export, narrative evidence, and performance comparison

## Delivered behavior

- Collection → Utilities → Story evaluation → Export JSON first reads the
  owner's captured attempts, including retries and partial stories. If the
  capture table is unavailable or empty, it exports archived openings/endings and
  recorded game facts instead. That fallback has schemaVersion 2, an empty
  `attempts` array, `captureStatus`, and `savedGames`. Each saved game is labelled
  `provenance: saved-game`; unavailable original prompts/model are null. It is
  never presented as a captured generation attempt. Existing attempt exports
  retain schemaVersion 1. The fallback excludes account IDs and image columns.
- Both sources paginate using an owner-scoped cursor and fixed ceiling. Read
  failures do not produce a partial download or silently switch sources. Auth
  and permission errors remain errors. Export/clear remain explicit actions;
  generation does not read the evaluation corpus. Clearing evaluations never
  deletes archived games/stories.
- Ending context now prioritizes recorded revivals, turning points, Ultimate use
  and escapes over routine recent notes. Selection is deterministic and the
  selected observations retain chronological order. Corrected/undone events are
  resolved before selection. Last rescues/deaths and notable observed pressure
  can be included when room remains; no causal or fate inference is added.
  Existing module-fact reservation and the 1,800-character limit remain.
- The ending prompt permits an earned callback without forcing one when the
  opening offers none. Existing reviewed fate, mission, noncombat-win,
  sacrificial-win, sparse-data and fiction constraints remain. Captures carry
  prompt version `2026-11-04-v1`.
- Image and visual-continuity requests validate the owner before dispatch and
  after completion, including when the originating screen has unmounted.
  Superseded image requests cannot overwrite newer progress/error state. A
  request from a previous account is discarded. Same-owner late-image behavior
  and draft-poster attachment policy remain as before.
- Stats → Your style adds recent versus earlier results using the latest 20
  completed games and previous 20. Raw rates are separate from a same-Final-Girl,
  killer-and-location comparison. Each game is matched once in date order,
  without choosing by outcome. Five pairs are required to display the comparison;
  fewer than ten are labelled a small sample. It is descriptive, not a skill
  estimate or a causal claim. Setups, draws and difficulty remain confounders.
- Rescue/Horror means use only pairs with both values recorded (zero counts,
  unknown does not). Their denominators are visible. No composite score or new
  network request is added. Evidence expands to the exact archived games.

## Validation and limits

`npm run check` runs the full lint/typecheck/unit/edge suite. New regression
coverage includes 240 deterministic synthetic-log scenarios, dense midgame
pivots, corrected and undone events, zero/unknown metrics, cast-mix confounding,
losses, account changes, stale asynchronous results and paginated export failures.
These are synthetic observations, not generated prose, real player data or
statistical evidence about the player. They never write to a live account or call
paid providers. Actual narrative-quality grading still needs exported outputs.

`npm run build`, `npm run check:assets` and the existing browser suite verify the
build and tracked artwork. New desktop/mobile browser journeys download and parse
both JSON formats, exercise a missing capture table, inspect sparse/matched
performance states, check widths from 320 to 1440, and open exact evidence cases.
Existing outcome-review, failed-save/retry, discard and image-outage journeys
remain required. Database tests replay the repair with existing data and with a
missing table, verifying owner isolation and read/delete-only client privileges.

## Release order

1. Apply only `20261104150000_repair_story_evaluations.sql` through the project's
   normal migration deployment. It creates the missing optional table or preserves
   existing rows and restores its policies/grants. It reloads the REST schema
   cache. Never reset the live database or replay old migrations to repair this.
2. Redeploy **generate-story** and **generate-ending** for the prompt version and
   ending prompt changes. No other edge-function deployment is needed for this
   pass. The frontend changes include the bounded Play summary.
3. Publish the frontend. Export works from archived stories even before the
   optional capture table is repaired. Verify a signed-in export, then a new
   generation: its captured attempt should include exact prompts/full text and
   the new version. Check Stats with a real archive and follow an evidence link.

During this work, the live REST endpoint returned PGRST205 for story_evaluations;
no authenticated player corpus was available. Production migration and function
release are separate from PR validation. Rollback the frontend/functions if
needed; the additive private capture table can remain. No data backfill or
synthetic production records are required.
