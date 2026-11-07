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
  older decode. The decoded result develops inside the tray during a bounded 1.6-second handoff;
  reduced motion skips it. This uses an HTML image, so cross-origin GPU texture
  restrictions cannot prevent the actual photograph appearing.
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
Resource changes also replace the DOM canvas, so late artwork preferences cannot
reuse a context that cleanup has already released.

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
- A rendered-pixel regression checks blood area at 2/20/180/300 seconds and
  changing arrivals after three minutes. Laptop fit checks include 1024×530,
  1024×600, 1280×640 and 1440×800, with the Hunter’s long title.

## Continuous waits and laptop fit

Blood uses a slow rational growth curve instead of an early exponential finish.
Three differently timed lanes feed visible droplets into the stain while three
persistent drips lengthen over minutes. The shape never resets. The darkroom
cloud pattern varies by mount; its warm metal double border catches a quiet red
safelight reflection. Reduced motion disables the border movement too.

At laptop widths (900px+) and usable heights (500px+), the opening spread uses
the available viewport height minus the measured footer. Its reader takes the
space remaining after controls/title. The loader scales inside that space;
completed prose scrolls inside the reader. Phones and very short windows retain
normal page scrolling.

## Actual-photo preview investigation (2026-11-07)

`generateImage` currently makes a non-streaming Lovable chat-completions request
using the configured image-model override or Gemini candidates. The edge function
uploads the finished image (and composes ending posters) before returning a URL.
No intermediate image reaches the client. The in-tray result reveal is therefore
a presentation of the finished image, not progress during generation.

OpenAI documents 0–3 intermediate images via `partial_images` on a streaming
image-generation request: https://developers.openai.com/api/docs/guides/image-generation#streaming
Google documents interleaved image/text streaming, which does not establish
successive previews of the same unfinished photograph through our Lovable route:
https://ai.google.dev/gemini-api/docs/streaming
Lovable's image documentation does not confirm that preview contract for the
current route: https://docs.lovable.dev/features/ai-images
A future true-preview path needs provider/gateway confirmation plus streaming,
reference-fidelity, billing and poster-composition validation. No provider or
backend behavior changed in this polish pass.

The artwork and animation specifications are in `src/assets/loaders/README.md`.
