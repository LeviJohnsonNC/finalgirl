# Cinematic generation materials

These photographic assets are for the story and image loaders, not game identity
art or generation references. No runtime image-generation request is made for a
loader. Captions remain HTML. The three original WebP files total approximately 183 KiB.

Source: built-in image generation, using Levi's approved blood-stain and darkroom
references from 2026-11-06. Outputs were reduced to WebP at quality 88 (blood alpha
quality 100), with no further artistic edits.

## Asset specifications / final prompts

- `blood-stain.webp` (768px square, transparent): Isolate the reference's irregular
  wet oxblood splatter with small satellite droplets. Exclude long downward drips,
  background, scene, lettering and external shadow. Dark wine-red almost-black
  pooled centre, thin crimson ragged edges, fine glossy cream/red highlights from
  upper left. Flat against vertical glass, no floating crown, no body or organs.
  Leave transparent margin. The shader authors growth and the three drips.
- `developer-tray.webp` (960px wide, 3:2): Worn black photographic developing tray
  under deep red upper-left safelight, with fine chipped rim and restrained silver
  edge reflections. Almost overhead camera, horizontal tray axis, slight depth
  on the back inner wall. Dark nearly still developer, no photograph, paper,
  lettering, hands or extra equipment. Black #090807 background and padding.
- `developer-tray-portrait.webp` (640px wide, 2:3): Portrait counterpart with the
  same materials and upper-left light, tall narrow tray with a vertical central
  axis. Not a rotated landscape photograph. Large clear dark liquid interior,
  5% background margin, no paper, picture, lettering or props.

## Compositing contracts

`shaders.ts` expresses arrival fields and drip paths in normalized canvas units.
The blood texture is sampled with its alpha intact; its photographic shading is
preserved. Accumulation and trails do not shrink/restart. Local contact glints are
transient. All clocks are decorative, unrelated to request completion.

Tray artwork is rigid. The shader composites paper and optional photographic
location artwork inside the tray, then applies refraction, cloudy development,
safelight and reflections. Landscape liquid bounds: (.14,.205)–(.88,.87).
Portrait bounds: (.15,.145)–(.87,.905). These must be rechecked if artwork changes.
Official illustration/box art is never supplied as a photographic preview.

The finished generated image is decoded and displayed in HTML, not uploaded into
the GPU. Saved pictures do not replay the sequence. Fallbacks use the same assets.
The font is the repository's locally hosted Oswald, under its existing license.

Inspect with `npm run dev`, then `/__dev/loaders`. That route and its material-study
module are omitted from production. Fixed-time controls use a fixed seed; live
story requests choose a seed once per mounted sequence.

## Amber film gate for opening and ending stories

The opening and ending story waits use a shared empty film-gate photograph (`film/gate.webp`,
960 × 400) and three distinct widescreen environment photographs (720 × 405) for
each named location in the catalog. The images were generated from the approved
amber gate reference and existing location photographs. Each trio uses
`film/<location-slug>/<location-slug>-01.webp` through `-03.webp`, ordered left,
center and right. The center is the establishing shot. These are decorative
photos and carry no events, characters or scene facts into story generation.

The browser composites the strip against the shared gate. Only the selected
location's three WebPs are requested, and absent imagery uses neutral leader.
The film moves one frame pitch and seats once. The falling drop and guide bead
stay in gate coordinates. The smear, pool and trails use film coordinates and
respect the stock and perforations. Decorative assets and motion are independent
of the story request. The same film is shown as a still under reduced motion
or graphics failure.

Use `/__dev/loaders` to choose a location and inspect the film before, during
and after the pull-through. Verify both readers at 1024 × 530 and 320 px wide.
Inspect the impact and the five-minute settled state.
