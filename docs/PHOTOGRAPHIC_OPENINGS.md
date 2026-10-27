# Photographic openings: current contract

Use the [approved module standard](MODULE_STANDARD.md) and [photographic treatment](IDENTITY_PHOTOS.md). The [earlier pipeline notes](history/PHOTOGRAPHIC_OPENINGS_2026-10-27.md) are historical diagnostics; their embedded-reference approach and release lists are superseded by the current code.

## Image and story truth

Openings should look like physically coherent candid photographs, with motivated light, believable materials/perspective and restrained consumer 35mm reproduction. Preserve selected identities and verified canonical design. The selected Final Girl's named current portrait/appearance outranks conflicting older generated prose or continuity. Incidental wounds, expressions and props in a portrait are not automatically new session facts.

Translate recorded mechanics into supported fiction rather than depicting game procedures. Dice, cards, tokens, track names or “Fire & Brimstone” signs must not appear merely because a game log uses those terms. Decorative UI backgrounds establish no actual injury, fire, blood, casualty or inventory. Do not silently invent an action because a rule explains its possible effect. Preserve scene-specific era, wardrobe, technology and setting; the camera treatment does not override them.

## Trusted identity references

- `supabase/functions/_shared/openingReferenceManifest.ts` maps named cast members to fixed private object keys and SHA-256 digests. At this audit it contains 39 Final Girls plus Billy and Inkanyamba; this is a snapshot, not a permanent expected count.
- `generate-scene-image/referenceLoader.ts` downloads only these objects from the private `opening-references` bucket using the server-side service role. `_shared/openingReferences.ts` verifies JPEG bytes and digest before use. Do not accept arbitrary caller reference URLs, whole-collection conditioning or a previous generated scene as identity authority.
- A listed missing/altered reference raises `OpeningReferenceError`; do not silently replace it with a generic person. A cast member not in the manifest contributes no image reference; its supported text direction remains available. Check actual caller policy before extending coverage.
- `node scripts/opening-references.mjs` stages the exact JPEG bytes in `build/opening-references/` and writes the manifest. **It does not upload them.** Review the staged files; upload the exact bytes/digests to their fixed keys when authorized. Original portraits remain unchanged.
- Never embed a large base64 image collection in shared function source. That strategy exceeded deployment source limits. Keep references lazy and Storage-backed; verify bundle/source budgets whenever changing this pipeline.

## Generation, verification and release

Validate a complete plan/checkpoint before spending on image generation. Keep identity and game/fiction boundaries in shared prompt builders and server contracts. Narrow guards are not a semantic classifier or proof that all generated output obeys the prompt. Preserve the previous successful image and retry behavior on provider/reference failure.

Run affected prompt, identity, manifest/digest, loader, validation and browser recovery tests. Review real likeness, materials, crops and narrative coherence only when live generation is authorized; mocked responses cannot establish those qualities.

Assess actual callers for release. Shared opening/image prompt changes commonly affect `generate-story`, `generate-visual-bible`, `generate-scene-image` and `generate-ending`; Play/death-context changes may also affect `generate-death-scene` and `narrate-story`. List the exact functions for the actual diff. Frontend identity changes require the frontend release; manifest changes require reviewed Storage objects and digest checks. Deploy compatible backends before new frontend callers when authorized. Record source-size checks, deployed revisions and pending live tests rather than assuming merge equals deployment.

The documentation/reference preservation pass requires no SQL, function deployment, Storage upload or paid generation.

## Cassie / Mandy identity correction, 2026-10-27

The selected `characters/ai/cassie.png` portrait has medium-brown skin, long wavy black hair, silver nose rings and purple clothing. `mandy.png` has fair skin, short straight dark hair, a black mesh top and athletic hand wraps. Their former appearance descriptions were crossed. Alice and Selena had reference photographs but no image-generation descriptions. All four existing photographs were inspected; Selena's selected photograph has a high bun, even though her biography describes a bob.

`_shared/finalGirlIdentity.ts` is the single source for these four reviewed identities, used by the frontend description catalog and server-side image, continuity and story prompts. Reviewed identity overrides an outdated caller description and conflicting biography/older prose. Other cast members retain their existing descriptions. Image planning and rendering replace only the Final Girl field in the prompt view of a valid legacy continuity record, preserving its other fields and the saved checkpoint. Poster prompts and reference instructions also give current named identity priority over a mismatched old opening. Existing generated images are retained until an explicit successful replacement; corrected data does not retroactively regenerate them.

Release: deploy `generate-story`, `generate-ending`, `generate-visual-bible` and `generate-scene-image` before the frontend. No SQL, new artwork or identity-reference object/digest changes. Existing references still need to be present and match the manifest; missing references continue to refuse openings. Tests cover named catalog description/reference coverage, independently reviewed identity anchors, stale callers/continuity, story/shot/image handoffs and desktop/phone fresh generation/legacy Reshoot. Browser image responses are mocked and establish no live-provider likeness claim. After release, visually check a fresh Cassie opening and a legacy Reshoot against the selected portrait; inspect the painted poster if the old opening had the wrong person.
