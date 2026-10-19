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
