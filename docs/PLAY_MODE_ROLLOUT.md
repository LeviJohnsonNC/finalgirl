# Play mode and gruesome deaths rollout

Merge Buddyland PR #36 first. Every follow-up PR targets **main**, never a previous feature branch. The follow-ups are cumulative: merge in the numbered order below so review diffs shrink as prerequisites land.

1. Durable play records: apply `20261017150000_play_sessions.sql` before deploying the tracker frontend. Additive play-session storage, owner policies, an atomic revision-checked save RPC, nullable historical round count and optional event history. Old clients and old games remain valid. No old rounds are fabricated. No edge redeploy for this stage.
2. Optional Play mode: artwork, quick saved/killed/round observations, undo, catch-up, notes, manually recorded health/Horror, offline saves and explicit cloud handoff. Apply stage 1's migration first.
3. Results/story/stats: tracked totals prefill editable outcomes; round statistics and timeline appear in the scrapbook; a bounded timeline summary goes to the ending. Deploy the updated `generate-ending` function before publishing that frontend.
4. Gruesome deaths: additive scene cache migration, then deploy `generate-death-scene`, then publish its frontend. Original fiction; the recorded death remains separate from generation and narration.
5. Death narration/polish: deploy the updated `narrate-story` function before publishing its frontend. Existing platform credentials are reused; no per-user provider key.

No production migration, deployment or merge is performed by the coding task. Review each PR's validation and deployment notes before publishing through Lovable.

## Data and recovery

The active game and immutable observations save locally before a tap is acknowledged. Cloud snapshots use revision comparison, row ownership and idempotent identical-state retries. A stale device cannot silently overwrite a newer snapshot. When the player chooses a version, both copies are backed up under their account/device storage before switching. Offline pending writes survive reloads. Closing a session queues its complete last snapshot before clearing the local draft.

Generated deaths will attach to stable death-event IDs. No retry, replay or generated sentence changes a victim counter. Unknown details remain unknown. The physical game is authoritative; recording a victim does not automatically change Bloodlust, Health, power sources or rewards.

## Checks

`npm run check`, migration replay/concurrency tests in CI, `npm run check:assets`, production build, desktop/mobile browser tests. All external backend/provider requests are mocked in browser tests. Screenshots and deployment steps accompany the feature PRs.
