# Photographic opening stills

## Confirmed live failure

The October 19, 19:40 UTC Rena/Billy Reshoot used the newly deployed photographic prompt and `google/gemini-3-pro-image`. It did not use a fallback image model or an old cached image. The new medium instructions reached the provider, which still returned cartoon artwork.

Two separate pipeline defects were visible in the actual request/response logs:

- The 1,200-token shot-planning call ended with `finish_reason: length`, `native_finish_reason: MAX_TOKENS`. Its JSON stopped partway through the first concept. The handler accepted the nonempty response, failed to parse it, and silently sent the full story and extensive game rules to the image model.
- The saved continuity string was literally `Drafting Core Visual Elements:**`. A 400-token continuity call had accepted a fragment. Any truthy checkpoint suppressed regeneration, so Reshoot kept reusing it.

These are proven defects, but they do not establish why a stochastic image model ignored the requested medium. PR80's prompt-only fix was insufficient.

## Repair

Both utility calls now request low reasoning with a 4,000-token ceiling and require an explicit successful completion signal. Actual output remains bounded by the prompts and parsers. Continuity is complete JSON containing four bounded identity/location/palette fields, stored in the existing string checkpoint. No slicing can silently truncate it. Unstructured legacy notes are ignored by server prompt builders and replaced when an opening screen resumes with image generation enabled. A failed continuity enhancement still allows a shot to develop from supplied identities.

An opening requires a valid three-concept plan before spending an image call. Failure returns a retryable error and preserves the existing picture. Full game rules remain available to the planner; the renderer receives cast identity and the selected visible moment instead of repeated gameplay mechanics. Closing poster fallback, painted treatment, typography, owned opening reference and persistence remain intact.

Opening shots use reviewed photographic identity portraits for Rena, Gwynn and Billy when those characters are selected, including mixed-film games. Other cast members retain text identity direction. These are existing app assets, resized to 768 pixels and JPEG-encoded, not newly generated images. The generated module embeds approximately 610 KiB like the existing poster fonts, avoiding a new storage/configuration dependency. Rebuild it with `node scripts/opening-references.mjs` after changing those portraits. The helper accepts cast names only, not caller-supplied reference URLs. It never conditions an opening on its previous, potentially cartoon, image.

The model chain, authentication, limits and discard checks are unchanged. The requested opening ratio remains 16:9. No main-page or layout changes are included.

## Actual gateway comparison

Two isolated calls used the current primary model, `google/gemini-3-pro-image`, without fallback:

| Test | Time | Observation |
| --- | --- | --- |
| Concise photograph request, text only | 19.95 s | Photographic, but drifted from the cast identities |
| Same scene plus original Rena/Billy PNG references | 23.29 s | Photographic, substantially closer to the reviewed identities |

Both returned `stop`, at 1376 x 768. The provider did not produce an exact mathematical 16:9 size. The reference result is the selected approach, not a guarantee that every stochastic result will have identical quality.

- [Text-only diagnostic](https://cdyvccecrovyjkabfcnx.supabase.co/storage/v1/object/public/posters/diagnostics%2F20261019-controlled-opening-a-79c123.png)
- [Identity-reference diagnostic](https://cdyvccecrovyjkabfcnx.supabase.co/storage/v1/object/public/posters/diagnostics%2F20261019-controlled-opening-b-79c123.png)

A separate short JSON utility test with low reasoning/4,000 tokens completed in 4.08 seconds, with 169 completion tokens and zero reported reasoning tokens. This simple test does not by itself validate the complete three-concept production planner.

`scripts/check-opening-live.mjs` runs the exact branch builders, parsers, gateway and embedded reference bytes for both Buddyland Final Girls. It is opt-in and paid, requiring a securely supplied `LOVABLE_API_KEY`. It caps requests at four utility calls and two images, rejects fallback models, saves only temporary diagnostic files and never accesses game/session/statistics tables. It must not be added to normal CI.

The unchanged script at commit `597a8bb` was then run in a separate temporary directory against the actual gateway. All six calls completed with HTTP 200, `stop` / native `STOP`, with no retries or model fallback. Both four-field continuity records and both three-concept shot plans passed the real parsers. Later commits change documentation/tests only.

| Exact pipeline | Continuity | Three-shot plan | Image | Total gateway time |
| --- | --- | --- | --- | --- |
| Rena / Billy | 2.820 s | 4.345 s | 21.106 s | 28.271 s |
| Gwynn / Billy | 3.990 s | 5.183 s | 19.461 s | 28.634 s |

- [Verified Rena opening](https://cdyvccecrovyjkabfcnx.supabase.co/storage/v1/object/public/posters/diagnostics%2F597a8bb-20261019-rena-82d41.png)
- [Verified Gwynn opening](https://cdyvccecrovyjkabfcnx.supabase.co/storage/v1/object/public/posters/diagnostics%2F597a8bb-20261019-gwynn-82d41.png)

Both exact-pipeline outputs were visually reviewed: photographed skin, individual hair, real fabric and physical animatronic materials, with distinct heroine identities and no black bars. They are 1376 x 768. Gwynn's composition is more side-profile than the planner's proposed over-shoulder view. This verifies these two generated cases, not the deployed application or every future random sample. Diagnostic images were isolated from all real game data; no code was deployed and no sessions/statistics were changed.

## Release

After merging, deploy the frontend and both functions, including their bundled shared files:

```sh
supabase functions deploy generate-scene-image
supabase functions deploy generate-visual-bible
```

No SQL migration, new secret, dependency or model change. Existing saved pictures remain until Reshoot replaces them. The frontend deployment enables recovery of fragmentary continuity in resumed sessions. The edge changes independently reject those fragments even from an older frontend.

## Automated validation

Checks cover complete provider finishes, malformed JSON, observed continuity fragments, checkpoint recovery without rerolling the story, no image spend on broken planning, selected/mixed-film reference identity, photographic reference instructions, widescreen requests, poster composition, ownership, replacement and discard handling.

Passed locally: 256 frontend tests, 64 edge checks, 22 desktop/mobile narration and recovery browser checks, type checking and production build. Lint has zero errors and nine existing React Refresh warnings.

## Observed photographic treatment, 2026-10-26

Levi supplied `Screenshot 2026-10-26 at 11.34.59 AM.png` (attachment `file_0000000065548230a447047dfcdb16b0`, Library `libfile_e2c075aeece88191828b12e8ffd37a05`) and approved the treatment in `image(20261026-181025).png` (attachment `file_0000000052e481fd809d577d043e09f2`, Library `libfile_e5a1ea82ea30819193fa9becc91502fe`). Both were visually inspected. The desired difference is physical photographic credibility: natural anatomy rather than sculpted bodies, cloth/wood/metal with distinct material behavior, shared exposure and light, naturally uneven focus and a well-cared-for color-negative film reproduction. Grain alone is not the target. These images are style evidence, not reusable scene-content instructions; do not insert the example's map, axe, drink, poses or setting into other sessions.

The opening shot planner and image renderer now share one expanded photographic contract in `prompts.ts`. It specifies tangible construction/weight/contact, distance-appropriate skin detail, coherent available light/exposure/white balance, contact shadows, plausible lens/focus/motion behavior and restrained processing. Consumer 1980s 35mm capture describes the photograph, not a forced historical period for every story. Dirt/wear, atmospheric effects and imperfections require scene support; clean things stay clean, daytime need not be artificially dark, and grain/softness cannot hide synthetic anatomy. No decorative aging, scratches, dust, light leaks, sepia or vintage frame.

Opening shot planning prefers a credible observer viewpoint over a publicity tableau or manufactured spectacle. New medium-neutral continuity notes retain physical colors and supported light sources rather than prescribing a global tint. Existing valid continuity stays intact; the renderer explicitly overrides inherited rendering/exposure/grading directions. Attached cast portraits preserve identity while their lighting/processing/style cannot dictate the new exposure. Existing reviewed reference roster and bytes remain unchanged.

This is an opening/Reshoot prompt change for all cast/location combinations. Painted ending posters retain their separate contract, continuity linkage and compositor. No model, provider, request shape, frontend UI, game facts, image replacement/ownership/discard logic or saved image changes. Generated identity photos follow the companion guidance in `IDENTITY_PHOTOS.md`; module/UI illustrations keep their established medium.

Release for this follow-up: merge, then deploy **`generate-scene-image`** and **`generate-visual-bible`** with their bundled shared files. No frontend change is required for this follow-up; no migration, secret, reference rebundling or other function deployment. Existing pictures remain until an explicit successful Reshoot replaces them. Old valid identity continuity does not need clearing to receive the new rendering contract.

Verification checks the actual mocked planning/image-handler/gateway payloads, photographic direction across mixed casts and legacy continuity, poster-medium isolation, reference identity/processing boundaries, failure recovery and image replacement safety. The user will perform the paid regeneration/quality assessment after deployment; no live image was generated, no actual session was modified, and provider output quality is not claimed from prompt assertions alone. Compare the resulting exposure, materials, anatomy and overall photographed coherence with the approved reference, rather than equating added grain or blur with improvement.
