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

## Tracker semantics

Start from round 1 for a fresh game. A midgame baseline can omit its round; no earlier rescues/deaths or rounds are invented. Next round marks the start of the next round. The final-round field includes the round in which play ended. Finish opens an editable review, so an accidental extra round tap is easy to correct.

Blank victim counts and rounds are stored as null. A deliberately entered zero remains zero after reload. Victim averages use a separate denominator for each recorded field; round averages exclude historical games without a recorded round. Health/Horror remain the existing suggested outcome defaults unless an observation supplies them; the review asks players to check these values.

The ending receives up to ten active observations within 1,800 characters. Undone events are excluded. The reviewed outcome/totals override earlier observations. The complete immutable log is saved with the result and loaded on demand in the scrapbook, rather than transferred with every history summary.

## Death scenes

Stage 4 migration: `20261017160000_play_death_scenes.sql`. Apply after the play-session migration, then deploy `generate-death-scene`, then publish the stage 4 frontend. Existing platform credentials are reused. `LOVABLE_DEATH_MODEL` optionally overrides the separate Flash-tier candidate chain in `_shared/models.ts`; availability falls back on explicit model rejection. No claim of live provider cost or latency is made by mocked checks.

A kill records immediately. The skull shortcut opens optional location/cause/name/notes; a per-game preference can open this panel automatically, but **never generates or plays audio automatically**. Buddyland suggestions use already verified board names; other locations accept the player's optional space name rather than invented official labels. Killer and location context remain independent for mixed expansions.

Develop explicitly syncs the durable observation first. The server re-reads the owned session and rejects missing/undone deaths. Scenes are cached by event ID, context signature and take (three maximum per context). A service-only atomic lease prevents simultaneous requests spending twice. Cache hits and busy replies precede allowance reservation. New calls fail closed at 60/hour and 200/rolling day per account; each vignette requests at most 200 tokens with a 20-second provider deadline. Ambiguous upstream failures are not automatically retried. A player may check saved scenes before explicitly retrying. A failed generation leaves the observation unchanged.

Correcting context preserves earlier cached versions but shows only the matching version. Undo hides its scenes; restoring the observation makes the matching cache available again. All saved takes for active observations can be read in the scrapbook. Narrative scenes are original optional fiction and never become additional deaths, rule changes or authoritative statistics. The ending receives recorded facts rather than treating generated details as events.

After deployment, smoke-test one signed-in scene and replay it to confirm the configured model and cache. Browser tests use mocked provider responses and do not establish live prose quality or provider availability. No production credits or migrations are used by this development workflow.
