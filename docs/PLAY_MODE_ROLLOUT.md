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

Start from round 1 for a fresh game. A midgame baseline can omit its round; no earlier rescues/deaths or rounds are invented. Starting round tracking later asks for the current physical round instead of assuming round 1. Next round marks the start of the next round. The final-round field includes the round in which play ended. Finish opens an editable review, so an accidental extra round tap is easy to correct.

Blank victim counts and rounds are stored as null. A deliberately entered zero remains zero after reload. Victim averages use a separate denominator for each recorded field; round averages exclude historical games without a recorded round. Health/Horror remain the existing suggested outcome defaults unless an observation supplies them; the review asks players to check these values.

The ending receives up to ten active observations within 1,800 characters. Undone events are excluded. The reviewed outcome/totals override earlier observations. The complete immutable log is saved with the result and loaded on demand in the scrapbook, rather than transferred with every history summary.

## Death scenes

Stage 4 migration: `20261017160000_play_death_scenes.sql`. Apply after the play-session migration, then deploy `generate-death-scene`, then publish the stage 4 frontend. Existing platform credentials are reused. `LOVABLE_DEATH_MODEL` optionally overrides the separate Flash-tier candidate chain in `_shared/models.ts`; availability falls back on explicit model rejection. No claim of live provider cost or latency is made by mocked checks.

A kill records immediately. The skull shortcut opens optional location/cause/name/notes; a per-game preference can open this panel automatically, but **never generates or plays audio automatically**. Buddyland suggestions use already verified board names; other locations accept the player's optional space name rather than invented official labels. Killer and location context remain independent for mixed expansions.

Develop explicitly syncs the durable observation first. The server re-reads the owned session and rejects missing/undone deaths. Scenes are cached by event ID, context signature and take (three maximum per context). A service-only atomic lease prevents simultaneous requests spending twice. Cache hits and busy replies precede allowance reservation. New calls fail closed at 60/hour and 200/rolling day per account; each vignette requests at most 200 tokens with a 20-second provider deadline. Ambiguous upstream failures are not automatically retried. A player may check saved scenes before explicitly retrying. A failed generation leaves the observation unchanged.

Correcting context preserves earlier cached versions but shows only the matching version. Undo hides its scenes; restoring the observation makes the matching cache available again. All saved takes for active observations can be read in the scrapbook. Narrative scenes are original optional fiction and never become additional deaths, rule changes or authoritative statistics. The ending receives recorded facts rather than treating generated details as events.

After deployment, smoke-test one signed-in scene and replay it to confirm the configured model and cache. Browser tests use mocked provider responses and do not establish live prose quality or provider availability. No production credits or migrations are used by this development workflow.

## Narration and final deployment

Stage 5 adds **no SQL migration**. Deploy updated `narrate-story` after the stage 4 database migration. It accepts `kind: death`, loads the owned saved scene, verifies that its observation is still active and its context matches, and narrates that canonical text. Supplied replacement text cannot change the saved scene. Existing `INWORLD_API_KEY` and voice fallbacks are reused; the cold persona reads death scenes. Audition it during the deployment smoke test.

Narration always requires a tap. Starting any narrator stops the previous one, including an opening still playing behind the death panel. Closing the panel, changing take, navigating away or switching accounts stops playback and prevents late responses starting audio. Blob URLs are released. iOS audio priming remains synchronous in the tap handler.

Successful clips are cached per account/text/casting on the device, with at most 24 clips / 12 MiB per account in IndexedDB and a bounded memory fallback. Replaying a stored clip, including after reload, avoids another narration request. Another device needs its own first audio generation. Storage eviction/private-mode restrictions can require a fresh request; cache failure never blocks playback. Clearing browser site data removes device copies. Voice-casting changes should bump the cache version in `src/lib/play/narrationCache.ts`.

### Merge and publish checklist

| Order | PR | Deploy requirement |
|---|---|---|
| 1 | [#37 — durable records](https://github.com/LeviJohnsonNC/finalgirl/pull/37) | Apply `20261017150000_play_sessions.sql` |
| 2 | [#38 — Play screen](https://github.com/LeviJohnsonNC/finalgirl/pull/38) | Stage 1 database ready |
| 3 | [#39 — outcomes and stories](https://github.com/LeviJohnsonNC/finalgirl/pull/39) | Deploy `generate-ending` |
| 4 | [#40 — death scenes](https://github.com/LeviJohnsonNC/finalgirl/pull/40) | Apply `20261017160000_play_death_scenes.sql`, then deploy `generate-death-scene` |
| 5 | [#41 — narration and polish](https://github.com/LeviJohnsonNC/finalgirl/pull/41) | Deploy `narrate-story` |

All five PRs target **main**. Merge in the order above; use **Create a merge commit** for this series so its ancestry and review diffs stay clear. If publishing everything together, merge them in order, apply the two new migrations in timestamp order, deploy the three functions (including shared modules and their relative imports), then publish the frontend from final main. Apply migrations and functions before any frontend containing their callers is published. If main automatically publishes on merge, prepare those dependencies from the final review branch before merging the UI. Do not rerun old reliability SQL already applied in an earlier rollout. No destructive/backfill migration is required.

Suggested Lovable instruction after review/merge:

> Sync the latest main through PR #41. Apply only the pending play-session and death-scene migrations listed in docs/PLAY_MODE_ROLLOUT.md, in order. Redeploy generate-ending, generate-death-scene and narrate-story with their shared dependencies, reusing existing platform secrets. Publish the frontend only after those steps succeed. Verify one signed-in tracked game, refresh/recovery, a contextual death and saved replay, manual narration and replay, and an ordinary untracked result. Report the migrations/functions actually deployed and any smoke-test failures.

Development does not verify what is currently running in production. Keep the previous frontend available for rollback; both migrations are additive and do not require dropping old data. If a provider is unavailable, ordinary tracking and result saving remain usable.

## Review evidence

The final local check passes 176 frontend tests and 38 edge/guard/handler checks, typecheck, lint (the same nine existing fast-refresh warnings), asset validation for all 115 artwork files, and production build. The integrated browser suite has 36 scenarios across desktop and emulated phone, including 320px portrait, short landscape, tablet and wide layouts. CI additionally replays every migration on disposable PostgreSQL, tests row ownership and simultaneous scene claims, and checks the functions in native Deno. PR checks are the authority for the final committed revision.

Audio tests use a silent deterministic device while exercising the real playback hook and IndexedDB cache, including replay after reload. Desktop/phone captures are review fixtures, not live provider auditions or physical-device Safari certification. The deployment smoke test remains necessary for the real provider/voice and hosting environment.

Review captures: [phone Play](images/play-overview-mobile.jpg), [quiet Play](images/play-quiet-mobile.jpg), [landscape](images/play-landscape.jpg), [outcome](images/tracked-outcome-mobile.jpg), [round statistics](images/tracked-statistics-desktop.jpg), [death scene](images/death-scene-mobile.jpg), [manual narration](images/death-narration-mobile.jpg).
