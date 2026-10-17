# CLAUDE.md — Working notes for Claude on this repo

Last reviewed: 2026-10-17

## What this app is
An **unofficial, fan-made** companion-style web app for the tabletop game *Final Girl* by Van Ryder Games. It is a solo-play aid that:
- Lets a player cast a game (killer + location + Final Girl + scenario/starting event)
- Generates an AI intro story, scene image, ending narration, and movie-style poster
- Records each play as a "scrapbook" entry with stats, archetype scoring, and narration audio
- Presents everything in a 1980s VHS-horror visual style

The word **"companion"** must never appear in user-facing copy. The footer legal disclaimer (not endorsed by Van Ryder Games) is required.

## Tech stack (real, from `package.json` / config)
- Vite 5 + React 18 + TypeScript 5
- React Router v7 (only two routes: `/` and `/auth`)
- Tailwind CSS 3 + shadcn/ui (Radix primitives) + `tailwindcss-animate` + `@tailwindcss/typography`
- TanStack Query 5 (provider mounted, minimal current usage)
- Supabase JS 2 (branded to the user as **Lovable Cloud**)
- Lovable Cloud auth wrapper: `@lovable.dev/cloud-auth-js` (Google OAuth)
- Zod, react-hook-form, sonner (toasts), lucide-react, recharts, embla-carousel
- Vitest 4 + Testing Library + jsdom (Node 22)
- ESLint 9 (`typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`)
- Edge functions: Deno, deployed via Supabase

## Run / build / test / lint
```sh
nvm use             # Node 22
npm ci
npm run dev         # Vite dev server on :8080 (see vite.config.ts)
npm run build       # production build
npm run build:dev   # build in development mode
npm run preview     # preview production build
npm run lint        # eslint
npm test            # run frontend tests
npm run test:edge   # guard/schema regressions
npm run typecheck   # frontend and build/browser test configs
npm run test:browser # desktop/mobile Playwright suite (after build)
```

Vite builds do not typecheck. Run `npm run check` and `npm run build`. CI also checks actual artwork, native Deno code, and database replay/concurrency. See `docs/RELIABILITY_ROLLOUT.md` before deployments.
Important folders

* `src/pages/` — top-level views. All rendering is orchestrated by `src/pages/Index.tsx` (a single-page state machine); most "pages" are not real routes.
* `src/components/` — feature components (VHS UI, casting, scrapbook, story generation).
   * `src/components/ui/` — shadcn primitives. Do not restyle wholesale; theme via CSS tokens in `src/index.css`.
   * `src/components/rules/` and `src/components/stats/` — rules browser and stats dashboard widgets.
* `src/hooks/` — app-level hooks (`useAuth`, `useGameHistory`, `useGameStats`, `useImageGeneration`, `useArchetypeScoring`, `useLocalStorage`, `useOwnedFilms`, `useScreenEffects`, `useActiveImages`). `useImageGeneration` owns image generation plus `user_image_settings`; `useActiveImages` reads only `use_ai_casting_art`.
* **Images generate automatically on the platform key.** There is no bring-your-own-key path and no copy/paste prompt: `generate-scene-image` runs on `LOVABLE_API_KEY` via the AI Gateway and uploads to the `posters` bucket. `src/components/ImageSettingsPanel.tsx` (rendered inside `Archive.tsx`) exposes the only two preferences — `auto_generate_images` (scene + poster, default on) and `use_ai_casting_art` (AI casting-room art, default off). Keep those two separate; they were one overloaded flag historically. `useOwnedFilms` is backed by `public.user_settings.owned_films` (JSONB).
* `src/contexts/GameHistoryContext.tsx` — wraps `useGameHistory` for the whole session.
* `src/data/` — static game data (killer/final girl/location descriptions, health, special rules, film themes, ticker headlines, and `rules/` corpus).
* `src/types/gameData.ts` — the source of truth for killer/location/Final Girl identifiers and film mapping.
* `src/lib/` — `streamChatCompletion.ts`, `audioUtils.ts`, `textFormatting.ts`, `utils.ts`.
* `src/integrations/supabase/` — auto-generated client + generated `types.ts`. Do not edit.
* `src/integrations/lovable/index.ts` — auto-generated Lovable auth wrapper. Do not edit.
* `supabase/functions/` — Deno edge functions (see below).
* `supabase/migrations/` — SQL migrations (chronological).
Edge functions (Deno, `supabase/functions/*/index.ts`)

* `generate-story` — intro story text (Lovable AI Gateway `https://ai.gateway.lovable.dev`; `LOVABLE_API_KEY`). 30/hr.
* `generate-ending` — ending narration text (Lovable AI Gateway; `LOVABLE_API_KEY`). 30/hr.
* `generate-scene-image` — opening still (3:4) and closing poster (2:3). Runs a cheap text "shot brief" pass, then the image model, both on the gateway; uploads to the `posters` bucket and returns a **public URL, never a `data:` URI** (the history layer strips those). 20/hr, 60/day, fails closed.
* `generate-visual-bible` — one short look-book paragraph per game, reused by both images so they match. 30/hr.
* `ai-capabilities` — diagnostic: lists what the gateway actually offers. Delete once model ids are pinned.
* `narrate-story` — Inworld TTS (`INWORLD_API_KEY`) with sentence-boundary chunking (`MAX_CHUNK_SIZE = 1900`); base64 audio in/out. 60/hr.
* `migrate-legacy-images` — one-shot migration of inline `data:` URIs out of `game_history` into `posters` bucket. 10/hr.
* `_shared/auth.ts` — `getCorsHeaders(origin)` (CORS only, despite the name) + a static `corsHeaders` export.
* `_shared/guard.ts` — `requireUser()` enforces auth, atomically reserves hourly + optional daily allowance via `public.reserve_ai_usage`, and returns `logUsage()` to record the model that answered.
* `_shared/models.ts` — model id candidate chains, overridable with `LOVABLE_TEXT_MODEL` / `LOVABLE_IMAGE_MODEL`. Change models here, nowhere else.
* `_shared/aiGateway.ts` — the only place that talks to the gateway: retry, 402/429 classification, model fallback.
* `_shared/prompts.ts` — the only place image prompts are written.
* `_shared/validation.ts` — Zod schemas for edge inputs
All user-facing generation functions require an authenticated user and an acknowledged `reserve_ai_usage` reservation. All paid calls fail closed if reservation fails; image generation also has a daily cap. `apply_collection_delta` merges collection edits transactionally across devices. Deploy the Stage 2 migration before these callers; see the rollout document.
Coding conventions already in the repo

* Path alias: import from `@/...` (see `vite.config.ts` and `tsconfig`).
* Design tokens: colors/gradients/shadows live as HSL CSS variables in `src/index.css` under `@layer base`, consumed via Tailwind. Do not hardcode colors like `text-white`, `bg-[#...]`, or `text-red-500` — use semantic tokens (`text-primary`, `bg-card`, `text-secondary`, etc.).
* Fonts: `Roslindale Display Condensed` (titles, via `index.html`), `VT323` / `Bebas Neue` / `Creepster` (loaded in `index.css`). VT323 is the "VHS" mono voice; class `font-vhs` is used throughout.
* State machine: `Index.tsx` owns the `currentPage` state. Add new "pages" there rather than adding routes, unless a real URL is required.
* Game history: always go through `GameHistoryContext` / `useGameHistory`. The hook maintains an account-scoped cache (`final-girl-history-v3:<user-id>`), a durable write-ahead log (`final-girl-history-outbox-v1:<user-id>`), and a summary RPC (`get_game_history_summary`) that strips large inline images. Never import the old cache without a known owner. `useDurableQueue` persists before acknowledging writes; `useActiveGame` checkpoints recoverable drafts.
* Numeric inputs on mobile: use `type="text" inputMode="numeric" pattern="[0-9]*"` and minimum `text-base` to avoid iOS zoom.
* Toasts: `sonner` (`import { toast } from 'sonner'`).
* Loading copy: use the "PROJECTOR WARMING UP..." VHS voice for global loaders (see `PageLoading` in `Index.tsx`).
* Never call the backend "Supabase" in user-facing UI; call it Lovable Cloud / the archive / the backend.
* Tests live next to source (`*.test.ts`) and run with Vitest + jsdom (`src/test/setup.ts`).
UI / design principles to preserve

* 1980s VHS horror: film grain, scanlines, vignette, blood-red primary, neon-cyan secondary, VHS yellow accent.
* Semantic color logic: blue = survival, yellow = false hope, green = sickly, red = blood.
* Scrapbook: 3D CSS book, floating polaroids, `formatStoryText` for typography.
* Poster images: 2:3 vertical.
* Tactile buttons with hover-lift/press-drop drop-shadow effects.
* The Marquee entry screen uses a 16s slideshow with 3s crossfade.
Common mistakes to avoid

* Editing `src/integrations/supabase/client.ts`, `src/integrations/supabase/types.ts`, `src/integrations/lovable/index.ts`, `supabase/config.toml`, or the Supabase-related keys in `.env`. These are auto-generated.
* Adding new top-level React Router routes for what is really an internal view. Extend the `Index.tsx` state machine instead.
* Storing user roles on the `profiles` table. A minimal `profiles` table exists (only `id` + timestamps, no roles, no privileged columns). Do **not** add a role/permission column to it — if you introduce roles, keep them in a dedicated `user_roles` table with a `security definer` `has_role` function.
* Creating a `public` table without accompanying `GRANT` statements — PostgREST will 401/403.
* Persisting AI-generated images as `data:` base64 in DB rows. The `posters` storage bucket is the correct home; a legacy-migration function already exists (`migrate-legacy-images`). An edge function returning a `data:` URI is a silent data-loss bug — `sanitizeStoredImageUrl` drops it and the image never reaches the scrapbook.
* Re-introducing per-user provider API keys, a "copy this prompt" modal, or a second copy of an image prompt. All three were removed on purpose.
* Introducing purple/indigo/generic "AI" gradients or default fonts (Inter/Poppins). This app has a strong VHS identity — do not dilute it.
* Using the word "companion" in copy.
* Removing the footer legal disclaimer.
Central files to read first

1. `src/App.tsx` — provider tree and (only) two routes.
2. `src/pages/Index.tsx` — the real navigation and page composition.
3. `src/hooks/useAuth.ts` — session restoration, Google OAuth, timeouts.
4. `src/hooks/useGameHistory.ts` — data model, cache strategy, RPC use, legacy backfill.
5. `src/contexts/GameHistoryContext.tsx` — session-wide history provider.
6. `src/types/gameData.ts` — canonical IDs (killer/location/Final Girl → film mapping).
7. `src/index.css` — full design system (tokens, animations, VHS effects).
8. `supabase/functions/_shared/guard.ts` — how every AI function authenticates & rate-limits.
9. Any one of `supabase/functions/generate-*` — canonical edge-function shape.
10. Latest migration in `supabase/migrations/` — current schema shape.
Before making changes

* Read the file(s) you're editing — do not rely on filenames alone.
* Confirm it isn't auto-generated (`integrations/supabase/*`, `integrations/lovable/*`, `supabase/config.toml`).
* Are you extending the `Index.tsx` state machine (usually yes) or adding a real route (rare)?
* Are you touching AI/edge-function behavior? Also update the matching client hook.
* Do color/typography changes go through CSS tokens in `src/index.css`?
* If adding a `public` table: `CREATE TABLE` → `GRANT` → `ENABLE RLS` → `CREATE POLICY`, in one migration.
* Run `npm run lint` and, when relevant, `npx vitest run`.
* Verify the change visibly (screenshot / manual click-through) before declaring done.
* Do not commit secrets. Only `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID` belong in `.env` (all three are present; `src/main.tsx` hard-requires only the first two at startup). Edge-function/provider secrets (`LOVABLE_API_KEY`, `GOOGLE_API_KEY`, `INWORLD_API_KEY`, service-role key) live in the platform secret store, never `.env`.


## Reliability invariants

- A record is acknowledged by the UI only after its operation is durably queued. Preserve failed operations for retry; never roll back by deleting the only copy.
- Account IDs scope every cache, outbox and active draft. Ignore late responses from a different account/session.
- Outcome recording must remain available without AI. Save form details before optional ending generation.
- Generated images use the session/record UUID, and late completion attaches to the existing owned row.
- Never edit generated `src/integrations/*` just to satisfy lint. They remain under typecheck and are excluded from authored-source lint.
- Browser tests must mock all external backend/provider calls; never spend credits or use production data.
