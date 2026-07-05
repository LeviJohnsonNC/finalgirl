
# Casting Room Redesign — Cursed VHS Case File

Rebuild the feature selection page around the 5 uploaded assets. Keep all game logic; change only presentation, geometry, and the picker overlay.

## 1. Asset intake

Upload the 5 PNGs via `lovable-assets` (CDN, preserves transparency) and reference them via `.asset.json` pointers:

- `src/assets/buttons/shuffle-plate.png.asset.json` — red wax/dice horizontal plate
- `src/assets/buttons/choose-plate.png.asset.json` — cyan/checkmark horizontal plate
- `src/assets/frames/empty-killer.png.asset.json` — dark red portrait frame
- `src/assets/frames/empty-location.png.asset.json` — landscape surveillance frame
- `src/assets/frames/empty-finalgirl.png.asset.json` — portrait frame with red tick

Delete the old `shuffle-button.png` / `choose-button.png` after swap.

## 2. Slot geometry changes (visible layout change)

`src/components/CastingSlot.tsx`:

- Killer + Final Girl: change to portrait `aspect-[2/3]`, fixed width ~ `w-56 md:w-64`.
- Location: change to landscape `aspect-[3/2]`, width sized so **height matches** the portrait slots (~ `w-[24rem] md:w-[27rem]`).
- Row is now three same-height "files on a desk" rather than one giant panorama.

## 3. Empty slot: use frame PNG at natural aspect

For empty slots, render the frame PNG as the whole card (no dashed border). Center a small monospaced label **inside** the dark inner area:

- Killer → `UNIDENTIFIED`
- Location → `UNKNOWN SITE`
- Final Girl → `UNASSIGNED`

Below the frame, keep the existing `KILLER` / `LOCATION` / `FINAL GIRL` slot label.

## 4. Selected card: pure CSS frame (no PNG)

When a value is selected, the poster fills the same box with a CSS-only "case-file" treatment:

- 1px worn `border-neutral-700/60`, subtle inner shadow (`inset 0 0 24px rgba(0,0,0,.6)`).
- 4 corner brackets (cyan `hsl(var(--neon-cyan))`, 12px, 1px, absolutely positioned).
- Tiny registration crosshair top-right (cyan, 6px).
- Existing scanline + film-grain overlays retained.
- Metadata strip below (monospaced VT323):
  - `KILLER // {name}`, `SITE // {name}`, `SURVIVOR // {name}`.
- The current name + LoreInfoModal trigger moves into this strip.

Red is reserved: only the `SELECTED` stamp inside the picker and Press Play backlight use red.

## 5. Buttons — replace with the two plates

Under each slot, two equal-width buttons using the plate PNGs as background:

- Fixed height `h-14`, width auto, wrapped in `flex gap-3` with `flex-1` containers so Shuffle and Choose share the slot's width.
- Live HTML text (`font-display tracking-[0.25em]`): `SHUFFLE`, `CHOOSE`.
- **Shuffle right-side triangle fix:** apply `mask-image: linear-gradient(to right, black 92%, transparent 100%)` to fade the triangle edge, then absolutely position `SHUFFLE` label slightly right-of-center so text visually occupies the fade zone. No cropping of the actual PNG file.
- Hover: `translate-y-[-1px]` + a soft `drop-shadow` in that plate's accent (red-glow for shuffle, cyan-glow for choose) at ~30% opacity. No neon.
- Active: `translate-y-[2px]` + brief `animate-[vhs-flicker_120ms_ease-out]` (new tiny keyframe: opacity 1→.7→1).
- Disabled: `opacity-40 grayscale`.

Buttons render identically for all three slots.

## 6. Picker modal → Evidence Drawer

Rewrite `src/components/CastingPicker.tsx`:

- Root: `Dialog` from `@/components/ui/dialog` (already installed shadcn), backdrop `bg-black/70 backdrop-blur-md` blurring the page (not the modal).
- Panel: solid case-file surface `bg-[hsl(var(--card))]` with 1px worn border, corner tape pseudo-elements (::before/::after with slight rotation) referencing the cyan-frame asset's tape look. Rendered in CSS, not a PNG.
- Desktop size: `max-w-[1200px] w-[92vw] h-[82vh]`. Mobile: full-screen `w-screen h-[100dvh] max-w-none rounded-none`.
- **Sticky header inside modal** (not floating over grid): title + close button (X). Content scrolls below header, never underneath (`grid-rows-[auto_1fr]`, inner `overflow-y-auto`).
- Header titles:
  - `SELECT KILLER FILE`
  - `SELECT LOCATION FILE`
  - `SELECT FINAL GIRL FILE`

## 7. Picker grid cards

- Killer/Final Girl: portrait `aspect-[2/3]`. Desktop `grid-cols-4`, tablet `grid-cols-3`, mobile `grid-cols-2`.
- Location: landscape `aspect-[3/2]`. Desktop `grid-cols-2`, mobile `grid-cols-1`.
- Card: 1px worn border, inner shadow, name in `font-display` below.
- Hover/focus: `scale-[1.02]`, cyan edge glow `shadow-[0_0_0_1px_hsl(var(--neon-cyan)/0.5)]`, small red corner tick (5px triangle) top-right.
- Selected state: dual border (red inner + cyan outer) + tiny `SELECTED` monospaced stamp bottom-left.
- Keyboard focus: same treatment as hover, always visible via `focus-visible`.

## 8. Page hierarchy (`src/pages/CastingRoom.tsx`)

Vertical rhythm, all centered:

1. Feature row (3 slots side-by-side, each with slot label above, frame/poster, metadata, then Shuffle+Choose row).
2. Thin "case options" strip: existing `ScenarioDropdowns` restyled with a top hairline divider and monospaced `CASE OPTIONS //` label at the left.
3. Press Play block, centered, with more breathing room above.

Removes current oversized location column that dominated the row.

## 9. Press Play states

Existing `press-play-btn` in `src/index.css` gets two clear looks:

- **Disabled** (`cta-locked`): flat charcoal, no glow, `text-muted-foreground/40`, helper below: `Cast your feature to begin`.
- **Enabled** (`cta-unlocked`): faint red backlight `shadow-[0_0_28px_hsl(var(--blood-red)/0.35)]`, on hover apply the same `vhs-flicker` keyframe. Label unchanged (`PRESS PLAY`). Helper below: `Tape ready`.

## 10. Preserve

- Shuffle animation reel logic in `CastingSlot`.
- `useOwnedFilms`, `ownedContent`, `getRandomItem`, `handlePressPlay` — untouched.
- `ScenarioDropdowns` component — only wrapper styling changes.
- `LoreInfoModal` trigger — moves into metadata strip.
- All existing scanline/vignette/grain overlays.

## Technical notes

- Files touched:
  - `src/components/CastingSlot.tsx` (rewrite render, keep logic)
  - `src/components/CastingPicker.tsx` (replace overlay with Dialog)
  - `src/pages/CastingRoom.tsx` (spacing/hierarchy tweaks + removal of degraded-banner top margin)
  - `src/index.css` (add `vhs-flicker` keyframe, `.case-frame`, `.evidence-card`, `.corner-bracket` utilities)
  - 5 new `.asset.json` pointers under `src/assets/buttons/` and `src/assets/frames/`
- Tokens only — no hardcoded hex colors (uses `--blood-red`, `--neon-cyan`, `--card`, `--muted-foreground`).
- No new dependencies.
- No changes to backend, hooks, routing, or the `Index.tsx` state machine.

## Out of scope

- Poster generation, story generation, scrapbook — untouched.
- No per-slot color tinting on top of frame PNGs.
- No animated tape-peel / frame-shake effects.
