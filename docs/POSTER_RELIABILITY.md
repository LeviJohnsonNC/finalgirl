# Ending poster service failures

Production diagnostics on October 20, 2026 showed a completed shot plan at 15:30:28, followed by two `google/gemini-3-pro-image` HTTP 503 responses at 15:31:26 and 15:32:25. Both reported `Service temporarily unavailable`. The function then failed in the image gateway, before poster composition or upload. This was an upstream image outage rather than a broken image URL or rendering failure.

The image path previously retried the same provider twice, while model fallback only handled unknown model IDs. Images now make one attempt per distinct candidate and fail over on server availability errors (500/502/503/504), connection loss or a bounded model timeout. Credit exhaustion, rate limits, authorization, policy errors and empty output do not trigger failover. The existing reference-input compatibility retry remains scoped to 400/422 responses and shares the same model deadline.

The preferred model, candidate order, prompts, cast references and dimensions are unchanged. A successful image never triggers another generation. The model that actually answered still reaches usage logging. Each image model gets at most 65 seconds, and the entire image chain shares 105 seconds. Planning gets 20 seconds with one attempt, leaving room for composition, storage and attachment before the platform's 150-second request idle limit. Poster planning can still use its existing fact-constrained fallback; opening planning must still be complete before spending an image call.

The browser has a longer 155-second safety deadline and shows a recoverable error for platform 502/503/504 responses, local timeouts or an otherwise successful response without an image. Retry retains the same game and story. Saving the result and late server attachment remain available.

Validation reproduces the observed 59-second 503 followed by a successful backup, checks shared timeout exhaustion without real waiting, preserves photographic opening references and dimensions, and verifies that protected errors never advance the chain. Desktop/mobile browser cases exercise outage, platform timeout and missing-image recovery through a saved result.

After merge, deploy the frontend and redeploy `generate-scene-image`. No migrations or new secrets are required. No production image generation was invoked during diagnosis or validation. An already saved game with a missing poster can be recovered using **Generate pic** in its scrapbook after deployment.

Platform reference: https://supabase.com/docs/guides/functions/limits

## Opening shot-planning recovery, October 21

Both production opening attempts reached `generate-scene-image` version 62. At
14:01:16 UTC, the utility planner `google/gemini-3.8-flash` returned 503 after
6.136 seconds. At 14:01:41 UTC, a second request failed after 21.750 seconds with
`TimeoutError: Signal timed out`. Both failed before calling an image model.
Yesterday's image failover therefore could not help.

Shot planning now tries each distinct utility candidate once on transient
500/502/503/504 responses, connection loss, unknown model IDs or a model timeout.
Each attempt gets at most ten seconds and its own abort signal; the entire
planning chain retains its existing twenty-second budget. A stalled primary
leaves ten seconds for the backup. Image generation retains its 105-second
budget, prompts, cast references and dimensions. Other text routes retain their
existing retry behavior. Credits, rate limits, authorization, policy errors,
empty output and incomplete completions never advance the planning chain.

An opening still requires a complete, parseable three-shot plan before any image
call. Exhausted planning returns a specific retryable 503 or 504 message instead
of the generic reel-jammed 500. The existing client displays that message and
retries the same game and story. Closing poster fallback remains available.

Regression checks simulate the observed 503, timeout and backup recovery, total
budget exhaustion, protected errors, Responses overrides, and the real handler
reaching exactly one image after successful recovery. Desktop/mobile browser
cases verify both planning messages, preserved play access and unchanged retry
requests. These checks mock providers and do not spend production credits.

Deploy `generate-scene-image` with its bundled shared files. No frontend runtime
change, migration, new secret or other function deployment is required for this
repair. A signed-out 401 proves reachability, not successful image generation or
which planner code is deployed; retain the deployment source fingerprint and
distinguish those checks from an authenticated generation.
