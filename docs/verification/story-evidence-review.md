# Story evidence review — 2026-11-04

## Problem and scope

A private saved-game export exposed information loss before generation: completed
trap escapes could disappear behind routine observations; a ship system's final
state concealed its earlier activation; and an old named-Victim roster contradicted
a later explicit death. Cutting item rules and player notes at arbitrary character
positions could also drop their qualifications. The opening prompt requested a
"present-tense problem," and ending guidance encouraged repetitive injury/callback
structures.

This change repairs narrative context and prompt direction. It does not change
game reducers, victim totals, saved stories, controls, image generation, quotas,
request limits or evaluation database policies. Public regression fixtures are
synthetic. The private export, stories, game IDs and personal-item effects are not
included in this repository.

## Implementation

- Story context keeps its existing 1,800-character ceiling and module reservation.
  It includes whole observations and item-rule lines or omits them; it never cuts
  an item rule or a player note mid-sentence. Owner summaries use complete facts.
- Effective Tormentor task completions receive priority over routine observations.
  Undo, restoration, corrections, trap removal and reassignment are respected.
  A trap escape is not treated as an Exit rescue. Only the selected killer's
  transitions are included.
- Selected USS Konrad systems retain their last two distinct observed on/off
  states together, including recorded rounds. Switches do not establish payment,
  a solar flare, a detonation, an escape or casualties.
- Explicit named deaths take priority over older active Buddyland/Camp roster
  observations in the story projection. Incompatible later rosters remain an
  explicit conflict, not an invented resurrection. The underlying roster and
  victim totals are untouched; unspecified deaths do not identify a named Victim.
- Opening tense stays consistent through the handoff. Ending scenes may develop
  from consequences, choices, exchanges or responsibilities; callbacks are optional
  and low health does not prescribe the same injury beat. Reviewed facts retain
  precedence, while generic win/loss does not settle individual fates.
- New captured generations carry prompt version `2026-11-04-v2`.

## Verification

- `npm run check`: 926 frontend tests and 126 edge-adapter tests pass; no lint
  errors, 11 existing Fast Refresh warnings. Local runtime: Node 24; CI uses the
  repository's supported Node 22 runtime.
- `npm run build` and `npm run check:assets` pass. The existing bundle-size warning
  remains; no artwork changed.
- All 10 available real Play logs replay within the context limit (1,123–1,643
  characters), preserve their source bytes and produce identical game summaries.
  The previously omitted trap escapes, system history and named-death evidence are
  retained. This is context verification, not a new model-output quality score.
- Regression coverage exercises canonical actions, corrections, Undo/restore,
  owner isolation, dense timelines, named/unnamed deaths, late note qualifications,
  whole item rules, and reviewed-fact precedence.
- Desktop/phone browser contracts reload tracked games and validate their actual
  ending requests with the server schema before mocked generation. Local execution
  could not launch because the required Playwright Chromium binary is absent.
  Require the final PR head's browser, frontend, database and native-Deno CI jobs
  to pass before merging. Browser mocks do not establish production prose quality.

## Release and live review

1. Apply the already-merged, additive repair migration
   `supabase/migrations/20261104150000_repair_story_evaluations.sql` through the
   authorized database deployment path. A read-only production request still
   returned `PGRST205` (evaluation table absent from the schema cache) during this
   pass. The connected Lovable project/database calls failed, so the repair was
   not applied here. Do not weaken RLS or expose service credentials to work around
   deployment access.
2. Publish the updated frontend and redeploy **`generate-story` and
   `generate-ending`**. No new migration or secret is introduced by this follow-up.
3. In an authorized preview, generate an opening and ending, then export Story
   Evaluations. Confirm capture is available, both attempts are present, the exact
   prompts and returned model are populated, and `prompt_version` is
   `2026-11-04-v2`. Existing archived rows with unknown provenance must stay unknown.
4. Compare fresh outputs using the same reviewed inputs and model configuration.
   Include a completed Tormentor escape, Konrad on/off history, a named death with
   a stale roster, a sparse record, a noncombat rescue win, and a low-health ending.
   Repeat representative cases to expose templates rather than grading one lucky
   sample. Record provider/model fallback separately.
5. Reject factual contradictions: trap escape becoming a rescue, switch state
   becoming an invented explosion, named death being ignored, owned items being
   assumed used, or uncertain fates becoming certain. Read full openings/endings
   for tense consistency, character credibility, scene specificity, restrained
   prose and varied earned closure. Compare against the approved house style.

Fresh production generation and capture remain unverified until those deployment
and access steps succeed. Do not rate the prose 10/10 from prompts, synthetic tests
or replayed context alone.
