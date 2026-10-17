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
