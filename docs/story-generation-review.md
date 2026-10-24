# Story and artwork direction

## Request compatibility correction (2026-10-24)

The expanded Dr. Fright context exposed a request-size bug in both opening and
ending generation. Each API field repeated the combined killer/location context;
Dr. Fright at Maple Lane sent 3,321 characters under `killer.specialRules` and
3,097 under `location.specialRules`, exceeding their existing 3,000-character
limits. All four imported locations reproduced the rejection with Dr. Fright.

Opening and ending requests now use one shared helper to put the complete killer
guidance under the killer and the complete location guidance under the location.
No rules are truncated, and the API limits remain unchanged. Combined context for
artwork and visual continuity remains available through its existing interface.
This correction requires publishing the frontend only; no function deployment,
migration or new secret is required. Existing failed sessions can retry generation
after loading the corrected frontend.

Regression coverage validates every catalog killer/location rules pairing against
the actual opening and ending schemas. Desktop/phone journeys submit Dr. Fright
with each of the four imported locations through both readers, with real request
validation before mocked generation. Provider prose/art quality remains a separate
live check.

## Original prompt overhaul

This change implements the approved prompt overhaul. It does **not** establish a 10/10 production-output score. The app's gateway key is unavailable in the development workspace, and the revised edge functions have not been deployed. Keep the PR in draft until the live output review below is completed in an authorized preview.

## What changed

- Opening: original character-led horror, a specific disturbance within two sentences, one human concern, escalation and an actionable handoff. Target 300–400 words with natural rhythm. Preserve the setup/event's starting state; no pre-play kills, rescues or completed missions. No author imitation, forced bold verbs or fixed paragraph/sentence formula.
- Ending: actual reviewed facts and up to three consequential recorded beats, with a meaningful opening callback. Earn closure or continuing danger from the particular result; no compulsory sequel sting. Missing values stay unknown. Victory and survival are separate, including sacrificial wins, noncombat victories and losses while alive. An explicit unique module ending overrides a generic health inference.
- Facts: correct Dr. Fright's supernatural identity and milky eyes, and the Poltergeist's rescue-and-escape objective. No claim that escaping destroys the haunting. Carry unique objectives and Falconwood missions through both stories and images. Remove the invented killer-health denominator of 20.
- Outcome entry: unrecorded health remains blank; explicit zero remains visible and survives reload. Tracked values still prefill. Unkillable threats do not receive a fictitious zero-health value, including legacy ending drafts. Outcome headings no longer equate a win with survival.
- Art: one utility call proposes three compositions and selects one before generating a single image. Use stable cast identity, readable depth, physically motivated light, scale and contact, and the actual ending. Malformed plans fall back to the fact-constrained full story; no random layout selection.
- Continuity: retain the existing resumable visual-bible string, now carrying cast/architecture anchors as well as palette. An owned opening photo can condition the new ending poster through multimodal input. Only the authenticated owner's exact game's opening storage path is accepted. A route rejecting reference input can fall back to text continuity; credit, safety and authorization errors do not authorize that fallback.
- Poster: generate art without typography, then rasterize local licensed serif/condensed lettering, a story-specific title/tagline and minimal fictional studio billing into a 1000×1500 PNG **before upload and late attachment**. Preserve the full art if the provider ignores the requested ratio. PNG, JPEG and WebP inputs work. Failed composition leaves the previous poster intact and never attaches incomplete art.

The image model candidates, authentication, quotas, storage ownership checks, durable saving and late attachment behavior remain in place. No database migration or production deployment is included.

## Verified locally

- Full `npm run check`: 206 frontend tests and 45 edge adapter tests pass; zero lint errors and nine existing refresh warnings.
- Production build and validation of 126 original artwork files pass.
- Native Deno: 27 schema/compositor tests pass, including real PNG/JPEG/WebP decoding, baked typography, and corrupt-image rejection. All four changed generation entry points typecheck. CI now runs the native compositor tests.
- 86 unique desktop/mobile browser checks pass across the full and focused runs. The first full run passed 83; the theater width check expected hidden scrollbars and failed under the visual-review harness's forced visible scrollbars. That check passed when rerun with the normal Playwright scrollbar settings. No theater code or assertion was changed. All app/provider calls were mocked.
- Six scenario contracts are covered: Buddyland win, Poltergeist rescue, sci-fi loss, Falconwood mission, sparse Dr. Fright record and sacrificial Hans win. These verify fact propagation, not the quality of generated prose.
- Combined narrative rules across the available killer/location modules fit the 3000-character field (longest checked: 2668 characters).
- An illustrative Buddyland opening and two poster-art generations were inspected with the available image-generation tool. These were **not** the app's deployed image provider or utility planner, and used hand-prepared scene/shot data. They are art-direction checks, not a production A/B benchmark. The first poster leaned too photographic; the revised prompt made the painted medium explicit and the second sample showed visible paint edges. A complete saved poster was also rendered and inspected locally. Example local composition timings were about 0.1–0.3 seconds; these are not a hosted edge-runtime performance guarantee.

## Live quality gate still required

Use an authorized preview with the revised four edge functions. Exercise the actual UI and quota/auth paths; do not put provider keys in the browser, repository or test fixtures. Review both the existing and revised prompts under the same available model configuration. Record the model returned by each request, since a fallback can change the result.

| Scenario | Required story check | Required image check |
| --- | --- | --- |
| Rena / Billy / Buddyland, costly win | Immediate hook; believable concern; recorded Finale/Buddies and cost respected | Exact animatronic/cast identity; readable threat; portrait paint treatment; clean lettering |
| Alice / Poltergeist / Creech Manor, rescue win | Carolyn rescued and escaped; ghost not destroyed in combat | No defeated ghost body or invented exorcism; credible architecture |
| Ellen / Evomorph / USS Konrad, loss | Recorded evolution and actual loss; no invented battle | Selected ship setting, plausible spatial discovery, no generic monster montage |
| Nancy / Slayer / Falconwood, mission | Correct mission; dimension constraints; no invented completion method | Same identity/architecture; no impossible cross-dimension attack |
| Nancy / Dr. Fright / Maple Lane, sparse record | Dream threat; unknown totals/fate stay unknown; no farm-killer premise | Identity and eyes consistent; no invented casualty or weapon use |
| Laurie / Hans / Camp Happy Trails, win at zero health | Sacrifice; no living-heroine ending; earned opening callback | No triumphant living survivor; image reflects the cost without graphic violence |

For each, read the complete opening and ending, then inspect both images at thumbnail and full size. Score hook, character credibility, specificity, prose restraint, continuity, factual fidelity, composition, physical plausibility, cast consistency and typography. Reject contradictions regardless of their other scores. Examine an unknown-health and a positive-health loss as well. Do not declare the work 10/10 based on prompt wording, mocks or a different model's samples.

After preview deployment, check an image finishing after Save/reload and verify that its **stored URL itself** contains complete typography. Check a reshoot failure keeps the old image. Confirm the compositor's cold-start dependencies and CPU/memory fit the hosted runtime; local Deno execution cannot establish that deployment gate.

## Lore and capability references

- [Publisher: Dr. Fright, the Dream Doctor](https://vanrydergames.com/products/final-girl-frightmare-on-maple-lane)
- [Publisher: find Carolyn and get out of Creech Manor](https://vanrydergames.com/products/final-girl-haunting-of-creech-manor)
- [Publisher: Final Girl rules and simultaneous deaths](https://vanrydergames.com/pages/final-girl)
- [Lovable: image generation and editing capabilities](https://docs.lovable.dev/features/ai#image-models)
- [Google: OpenAI-compatible image input](https://ai.google.dev/gemini-api/docs/openai)
- [Hosted edge runtime limits](https://supabase.com/docs/guides/functions/limits)

This is a correction of the identified lore conflicts, not a claim that every existing catalog description has been independently verified.

## Opening still screen format

New opening stills request `image_config.aspect_ratio: "16:9"` through the existing chat image gateway, matching the theater aperture. Previously the ratio appeared only in prompt text. Both opening shot planning and the final photograph prompt now ask for edge-to-edge artwork without letterboxing, pillarboxing, or black bars. The dimension option survives model retries and the existing reference-input fallback. Closing poster settings, saved image bytes, and the theater's full-image display remain unchanged.

Regression checks verify the handler-to-gateway option, serialized request dimensions, fallback preservation, and separate poster behavior. These are mocked provider checks, not a live Lovable image-generation result. Providers can round dimensions or ignore requested framing; review the next real opening still after deploying `generate-scene-image`. No database migration is required.
