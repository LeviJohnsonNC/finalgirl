## Goal
Make the scrapbook adventure readout (THE BEGINNING / THE END) substantially more readable, and add tasteful emphasis so key story beats punch through.

## Problems today
- `.story-text` is 14px (15px ≥640px) with `line-height: 1.8` in a condensed display serif — small, airy, and hard to read on mobile especially.
- Section headings are only 18px, so hierarchy is weak once text gets larger.
- All paragraphs are visually identical — no lead-in, no emphasis. The `**bold**` / `*italic*` support exists in `ScrapbookStoryPage` + `RuleBlock` but the AI narrations rarely use it, and when they do it's barely distinguishable (weight bump + slight color shift only).
- The auto-chunking in `renderStoryText` splits by every 4 sentences when there are no paragraph breaks — produces oddly-sized blobs rather than intentional paragraphs.

## Plan

### 1. Typography overhaul (`src/index.css`, `.story-*` rules)
- Bump `.story-text` to `16px` mobile / `18px` ≥640px / `19px` ≥1024px.
- Tighten leading to `1.65` (down from 1.8) — feels tighter and more novel-like at the larger size.
- Add `letter-spacing: 0.005em` and `text-wrap: pretty` (fallback to normal) to reduce ragged lines.
- Increase paragraph spacing to `1.15em` and add a subtle first-paragraph lead-in:
  - `.story-text p:first-of-type::first-letter` — 2.4em drop cap, display font, blood-red, float left with small right/bottom margin. Only in the intro section (add a `.story-intro` modifier from `ScrapbookStoryPage`).
  - `.story-text p:first-of-type::first-line` — `font-variant: small-caps; letter-spacing: 0.08em;` for the classic pulp opener.
- Headings: bump `.story-heading` to 22px mobile / 26px ≥640px, add slight `text-shadow` in the theme color so THE BEGINNING / THE END read as chapter titles, not labels.
- Strengthen emphasis styles:
  - `strong`: heavier weight, warmer near-black, `letter-spacing: 0.01em`.
  - `em`: keep italic but shift to a deeper blood tone and add a very subtle underline-from-below via `background-image` gradient so italicized proper nouns feel like "notes underlined in the case file".
- Add a new `.story-text mark` style for future AI use: aged-paper highlighter (muted yellow, slightly rotated, no border-radius).

### 2. Smarter paragraphing (`src/components/ScrapbookStoryPage.tsx`)
- Replace the "every 4 sentences" fallback with a smarter splitter: chunk on sentence boundaries into 2–3 sentence paragraphs, but never break inside quoted dialogue.
- Detect single-sentence dramatic lines (short, ends with `!` or `…`) and render them as their own paragraph with a `.story-beat` class (centered, slightly larger, italic, extra top/bottom margin) to give ending narrations a cinematic punch.
- Pass a `variant` ("intro" | "ending") into the render helper so the drop cap only applies to the intro's first paragraph.

### 3. Encourage the AI to use emphasis (edge functions)
Update the system prompts in `supabase/functions/generate-story/index.ts` and `supabase/functions/generate-ending/index.ts` to instruct the model to:
- Use `**bold**` sparingly for the killer's name on first mention, the Final Girl's name on first mention, and one climactic action verb per beat.
- Use `*italics*` for the location, whispered/remembered lines, and internal thoughts.
- Keep paragraphs to 2–3 sentences; leave a blank line between them.
- Never bold/italicize more than ~5% of the text.

This makes existing `renderFormattedInline` markdown support actually get exercised.

### 4. Apply the same treatment where the same stories are shown mid-session
- `NowPlaying.tsx` reuses `formatStoryText` / similar rendering for the live intro. Mirror the size bump + lead-in styling via a shared class so the reading experience is consistent between the live page and the scrapbook.

### Out of scope
- No changes to story data model, DB, or history caching.
- No changes to poster/scene image layout.
- Footer stats block stays at current size (it's meta, not story).

## Technical notes
- CSS `text-wrap: pretty` is progressive-enhancement; no fallback needed.
- Drop-cap uses `::first-letter` so it works on server-rendered HTML without extra DOM.
- The `.story-intro` modifier gets added to the intro's `.story-text` wrapper in `ScrapbookStoryPage.tsx`; the ending gets `.story-ending` (no drop cap, but enables `.story-beat` styling).
- Bold/italic already render via `renderFormattedInline`; only the CSS + prompt updates are needed to make them pop.
