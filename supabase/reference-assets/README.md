# Reviewed reference objects

`poltergeist.jpg` is a non-upscaled JPEG derivative of the retained approved identity at `src/assets/characters/ai/poltergeist.png`. It is an implementation release artifact, not an upload of the user's card photograph. Its SHA-256 is pinned in `functions/_shared/openingReferenceManifest.ts`.

Before deploying the changed opening-image function, upload these exact bytes as `poltergeist.jpg` to the existing private `opening-references` bucket, then verify a downloaded object's SHA-256 against the manifest. This branch does not publish or upload production objects. Deploy backend consumers before the frontend. Do not change unrelated stored portraits/digests or use caller-provided URLs. The existing reference generator includes Poltergeist on future explicit full rebuilds.

## Grimlash approved full-pumpkin reference — October 31, 2026

`grimlash-pumpkin.jpg` is the exact JPEG derivative of the approved full-pumpkin identity now used at `src/assets/characters/ai/grimlash.png`. It is an implementation release artifact of approved generated artwork, not a physical card photograph. SHA-256: `214e58a025239a865d68eb080226214d11925cad9bb156a667370d2672342fad`.

Before deploying the new image/reference consumers, upload these exact bytes to private `opening-references/grimlash-214e58a025239a86.jpg` and verify the downloaded object digest. Preserve the previous `grimlash.jpg` during rollout so existing deployed consumers still receive their pinned bytes. Every current manifest object must be present with its exact digest; retaining an older version during rollout is intentional. Deploy `generate-visual-bible` and `generate-scene-image` with the canonical identity/manifest changes, then publish the frontend. No SQL migration is needed. The other 42 manifest entries/digests are unchanged. This PR stages and verifies the artifact locally; production upload/deployment/live generation are separate release checks.
