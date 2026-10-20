# Ending poster service failures

Production diagnostics on October 20, 2026 showed a completed shot plan at 15:30:28, followed by two `google/gemini-3-pro-image` HTTP 503 responses at 15:31:26 and 15:32:25. Both reported `Service temporarily unavailable`. The function then failed in the image gateway, before poster composition or upload. This was an upstream image outage rather than a broken image URL or rendering failure.

The image path previously retried the same provider twice, while model fallback only handled unknown model IDs. Images now make one attempt per distinct candidate and fail over on server availability errors (500/502/503/504), connection loss or a bounded model timeout. Credit exhaustion, rate limits, authorization, policy errors and empty output do not trigger failover. The existing reference-input compatibility retry remains scoped to 400/422 responses and shares the same model deadline.

The preferred model, candidate order, prompts, cast references and dimensions are unchanged. A successful image never triggers another generation. The model that actually answered still reaches usage logging. Each image model gets at most 65 seconds, and the entire image chain shares 105 seconds. Planning gets 20 seconds with one attempt, leaving room for composition, storage and attachment before the platform's 150-second request idle limit. Poster planning can still use its existing fact-constrained fallback; opening planning must still be complete before spending an image call.

The browser has a longer 155-second safety deadline and shows a recoverable error for platform 502/503/504 responses, local timeouts or an otherwise successful response without an image. Retry retains the same game and story. Saving the result and late server attachment remain available.

Validation reproduces the observed 59-second 503 followed by a successful backup, checks shared timeout exhaustion without real waiting, preserves photographic opening references and dimensions, and verifies that protected errors never advance the chain. Desktop/mobile browser cases exercise outage, platform timeout and missing-image recovery through a saved result.

After merge, deploy the frontend and redeploy `generate-scene-image`. No migrations or new secrets are required. No production image generation was invoked during diagnosis or validation. An already saved game with a missing poster can be recovered using **Generate pic** in its scrapbook after deployment.

Platform reference: https://supabase.com/docs/guides/functions/limits
