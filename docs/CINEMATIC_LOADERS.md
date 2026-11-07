# Cinematic generation loaders

The opening/ending story reader uses a photographic blood stain with bounded
accumulation, local droplet contacts and persistent drips. Opening stills and
closing posters use separately composed developing trays with slow refraction,
cloudy photographic development and red safelight.

## Ownership and recovery

- Generation/persistence remain in the existing page and image-generation hook.
  Decorative effects never issue requests, report progress or delay saves.
- `usePresentedImage` keeps the displayed picture separate from an incoming URL.
  New results load and decode before replacement; a newer request invalidates an
  older decode. The reveal lasts at most 600ms and reduced motion skips it.
- A stalled download times out at 25 seconds. `Reload photograph` retries that
  same URL, without paying for another generation. An explicit Reshoot option
  remains available for permanently missing files. Generation failures retain
  the existing explicit generation retry.
- A previous decoded picture remains on screen if replacement download fails.
  This is not persistent rollback: the server may delete the replaced storage
  object after attachment. No storage/persistence policies changed here.
- Already-saved pictures display directly. Download readiness does not block
  saving an image URL or reading/narrating the completed story.

## Rendering and scope

One WebGL quad per active loader; no animation dependency, fluid simulation or
per-frame React state. GPU textures are capped at 1024px and drawing buffers at
960px with device density capped at 1.5. Animation clocks pause offscreen and in
hidden tabs. Context loss, missing assets and unavailable graphics retain a
photographic DOM fallback and accessible text. Reduced motion renders one still.
Listeners, frames, textures, shaders and buffers are released on unmount.

The actual generated result stays an HTML image. Only same-origin bundled
photographic location assets are used for the decorative developing image when
AI casting art is enabled. Otherwise the bath develops cloudy paper. The source
photo is atmosphere, not a progressive preview of the generated result.

## Verification

- Unit tests: saved-image display, decode-before-replace, stale decode isolation,
  download failure/retry, bounded loading, unmount cleanup.
- Browser tests: actual story-to-image generation flow; decoded handoff and
  lightbox; download-only retry; graphics fallback; reduced motion.
- Existing narration and ending-recovery journeys cover result/save controls,
  images-off, story reframing, and laptop/phone layouts.
- Development-only `/__dev/loaders` exposes live and fixed 2/8/20/60/180-second
  material studies and an image handoff/reshoot control.

The artwork and animation specifications are in `src/assets/loaders/README.md`.
