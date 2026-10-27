# Reviewed reference objects

`poltergeist.jpg` is a non-upscaled JPEG derivative of the retained approved identity at `src/assets/characters/ai/poltergeist.png`. It is an implementation release artifact, not an upload of the user's card photograph. Its SHA-256 is pinned in `functions/_shared/openingReferenceManifest.ts`.

Before deploying the changed opening-image function, upload these exact bytes as `poltergeist.jpg` to the existing private `opening-references` bucket, then verify a downloaded object's SHA-256 against the manifest. This branch does not publish or upload production objects. Deploy backend consumers before the frontend. Do not change unrelated stored portraits/digests or use caller-provided URLs. The existing reference generator includes Poltergeist on future explicit full rebuilds.
