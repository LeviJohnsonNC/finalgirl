# Browser CI: full coverage with shorter wall time

The complete desktop and mobile suites each run in four concurrent shards. Every runner keeps the existing two-worker limit, one retry, 45-second test timeout, failure traces/screenshots and module-specific videos. Test files retain their existing serial ordering (`fullyParallel: false`). No test selection filters, smaller viewport matrix, reduced timeouts or new skips are introduced.

Local discovery verified the complete 249-case set for each device is exactly the union of its four shards (72 / 55 / 60 / 62 cases), with no omitted or duplicate cases. These counts describe this change, not a hardcoded future test target. Playwright owns discovery and partitioning as the suite grows.

Each shard uploads a blob report and its raw diagnostics. Two report jobs merge all four blobs into the existing `browser-results-desktop` and `browser-results-mobile` HTML artifacts, retained for 14 days. Raw output stays under per-shard folders so diagnostic files cannot overwrite one another. Intermediate shard artifacts last one day; the merged reports retain their attachments. Missing shard reports fail collection. The existing required `browser` check fails if any shard or report job fails or is skipped; both per-device check names remain.

The tradeoff is more concurrent runners and a little more setup work. On hosted GitHub runners this avoids overloading individual machines with extra Chromium workers. Jobs from superseded commits still cancel through the existing workflow concurrency rule. The frontend, database and native edge gates are unchanged.

## Baseline and verification

The successful unsharded [run 40204562328](https://github.com/LeviJohnsonNC/finalgirl/actions/runs/40204562328) took 9m30s for desktop tests and 11m27s for phone tests. Browser installation took approximately 30 seconds in the preceding measured run. Sharding addresses the test runtime rather than adding a browser cache whose restore time could consume most of the saving.

The first sharded run must demonstrate all 249 desktop cases and 249 mobile cases (including the existing intentional mobile skip), successful merged HTML reports with attachments, and a green required aggregate. Compare observed end-to-end timing with the baseline; do not treat a predicted speedup as a measured result.

Reference: [Playwright sharding and report merging](https://playwright.dev/docs/test-sharding).
