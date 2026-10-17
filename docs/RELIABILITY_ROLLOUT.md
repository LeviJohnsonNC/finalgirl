# Reliability rollout

Merge the four stacked pull requests in this order:

1. `codex/reliability-1-record-safety` — durable history and collection saves.
2. `codex/reliability-2-backend` — database and generation allowances.
3. `codex/reliability-3-gameplay` — recoverable sessions and gameplay fixes.
4. `codex/reliability-4-checks` — automated regression and deployment checks.

Each PR targets the preceding branch so its review contains only that stage.
After merging a stage, retarget the next PR to `main` if GitHub has not done so.
Do not merge a later stage first. Prefer merge commits for the stack; squashing
requires rebasing the remaining branches before continuing.

## Stage 1

No SQL migration or edge-function deployment is required.

Cloud mutations are written to an account-scoped local outbox before the UI
continues. Failed requests remain visible with a retry control, retry on network
reconnection, and resume after reload. Inserts use stable IDs and ignore duplicate
retries. Deletion waits for queued saves and reports failures instead of claiming
success. Storage failure preserves the previous durable copy and stops navigation.

Caches from the old shared keys are intentionally not imported: their owner
cannot be established. They are disposable copies; authoritative cloud records
are unaffected. Guest history and collection keys are retained until their data
has been added to an account's durable outbox. Collection imports merge films
after a successful read and do not overwrite the existing collection.

Browser storage is device-local. Clearing site data removes pending changes that
have not reached the cloud. The pending-save notice must remain visible until
the archive acknowledges those changes.

Stages 2–4 will append their migration and deployment instructions here.

## Stage 2

Apply **20261017041000_atomic_allowances_and_collection.sql** once, before deploying
this stage's frontend or edge functions. It adds two RPCs, restricts usage-ledger
writes to the service role, and reconciles poster ownership policies. No game
records, images, or collection preferences are deleted or rewritten.

1. Review `supabase migration list` and run `tests/database/preflight.sql` against
   the target project with your usual read-only database access. Live inspection
   from this task was unavailable because the Lovable connection lacks the scope
   required by its query tool. Do not assume the live migration ledger matches git.
2. Apply only the new migration using the project's normal migration deployment.
   Do not reset the production database or replay the historical SQL files.
3. Deploy all edge functions that import `_shared/guard.ts`: `generate-story`,
   `generate-ending`, `generate-scene-image`, `generate-visual-bible`, `narrate-story`,
   `migrate-legacy-images`, `ai-capabilities`, and `tts-voices`.
4. Deploy the frontend. Collection saves now use `apply_collection_delta`.
5. Verify a signed-in collection edit and one generation. An unavailable quota
   database should produce 503 without starting a paid request. Exhaustion is 429.

The historical policy/drop fixes affect **fresh installs only**. The repeated
September backfill no longer overwrites explicit image preferences. Already
changed preferences cannot be reconstructed; users can choose their desired art
in My Collection. The new migration does not guess at their earlier preferences.

Rollback: the additive database functions can remain. Reverting the frontend
restores the old collection path. Reverting the edge guard loses atomic allowance
protection; prefer fixing forward. Do not restore permissive storage policies.

For disposable PostgreSQL testing only:
`TEST_DATABASE_URL=postgresql://... bash scripts/test-database.sh`.
The script creates schemas/roles and replays every migration; never point it at
an existing project database. It checks RLS and concurrent reservations/deltas.

## Stage 3

No additional SQL migration is required. This stage depends on Stage 2's RPCs.
Redeploy `generate-scene-image` with this stage, then deploy the frontend: a late
poster/still now attaches server-side to an existing owned record, and old images
are only removed after the replacement is attached. The client also keeps late
attachments in the durable outbox if the screen has already closed.

An active draft is stored under `final-girl-active-game-v1:<account-id>` (or
`guest` for signed-out play). Navigation preserves it; RESUME GAME restores the
cast, completed stories, images, and outcome fields. Starting a new game requires
finishing or explicitly discarding the existing draft. Saving a result clears the
draft only after the history write has been durably queued. A reload during an
unfinished text stream may require generating that text again; partial prose is
not represented as a completed story.

WON/LOST and SAVE RESULT work without AI service access or an opening story.
Outcome details are saved before optional ending generation. Image generation
waits for saved preferences, honors opt-out, and reuses an existing completed
image instead of regenerating it on every visit.

## Stage 4

No migration or function deployment is needed. Use Node 22 (`nvm use`, then
`npm ci`). npm/package-lock.json is the CI installation path; Bun lockfiles are
retained for compatibility but are not a second CI source of dependency versions.

- `npm run check`: authored-source lint, frontend/build-config typecheck, unit
  tests, and edge guard/schema tests. Generated integration files stay under
  typecheck but are excluded from authored-source lint.
- `npm run check:assets`: rejects missing/stub artwork. Local compilation used
  artwork stubs because binary retrieval was unavailable; the CI checkout checks
  and builds the actual tracked artwork.
- `npm run test:database`: fresh migration replay, ownership policies, 12
  concurrent allowance requests, and 8 concurrent collection changes against a
  disposable PostgreSQL database. See Stage 2 for the required test URL.
- `npm run build && npm run test:browser`: desktop/mobile login, collection,
  resume, failed-save retry, no-AI completion, and late-poster flows. All external
  backend/provider requests are mocked; tests cannot spend credits or alter
  production accounts. Screenshots and traces are retained as browser-results.
- GitHub Actions also runs native Deno schema tests and checks every edge entry.

Local browser execution was blocked by the execution sandbox and local-file
browser policy. The supported visual verification path is the CI browser job's
screenshots; no production visual verification is claimed by the local checks.
