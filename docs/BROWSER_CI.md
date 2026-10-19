# Browser CI

The reliability workflow runs the complete desktop and mobile Playwright projects on separate runners. Each project uses two workers in CI, retains its retry, and uploads a uniquely named report. `fail-fast: false` lets both device reports finish even if one fails.

The final `browser` job preserves the existing required check name. It runs even if a device job fails, is cancelled, or is skipped, and succeeds only when the entire browser matrix succeeds. No test or device coverage is removed.

## October 19 investigation

In run `39282541839`, all 204 browser checks passed in 7.9 minutes. The browser step finished at 16:13:57 UTC, its report upload finished at 16:14:09 UTC, and the log reached orphan-process cleanup. GitHub nevertheless continued reporting the job as in progress until the run was updated to successful at 16:32:39 UTC. There was no Playwright timeout, failed test, retry, or hung report server in that run's log.

Separating the projects reduces the normal critical path from running both on one two-worker machine. The replacement workflow starts fresh runners; a platform failure to finalize an already-completed job cannot be repaired in application code. Inspect the raw job log as well as the summary status when diagnosing that discrepancy.

Run the same project locally against a production build:

```sh
npm run build
CI=true npm run test:browser -- --project=desktop
CI=true npm run test:browser -- --project=mobile
```

Each runner starts its own preview server. Locally, run those commands sequentially because they share port 4173. Keep the 20-minute device-job ceiling so browser installation, a full retry, and report upload remain bounded.
