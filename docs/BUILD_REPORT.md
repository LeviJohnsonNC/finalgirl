# Build Report — Final Girl Case Files (Unofficial)

Last reviewed: 2026-07-05

## Product summary
An unofficial fan-made single-player web app that supports playthroughs of the tabletop game *Final Girl* (Van Ryder Games). Users cast a game (killer, location, Final Girl, scenario/event), play through it with an AI-generated intro story and scene imagery, then log the outcome with an AI-written ending narration, movie-style poster, and stats. All plays are archived in a "scrapbook" and rolled up into a stats dashboard.

Not endorsed by or affiliated with Van Ryder Games. A footer disclaimer is a hard requirement.

### Primary user goals
- Enhance solo tabletop play with atmospheric AI-generated narration and imagery.
- Keep a nostalgic, personalized log of past plays (scrapbook + poster).
- Review long-term stats, trends, and a playstyle "archetype".
- Browse rules and lore for owned content.

## Feature map
- **Marquee / entry screen** (`src/components/Marquee.tsx`) — VHS projector slideshow, entry points to play / archive / scrapbooks / stats / rules.
- **Casting Room** (`src/pages/CastingRoom.tsx`, `CastingPicker`, `CastingSlot`, `SelectionSlot`) — pick killer / location / Final Girl / setup scenario / starting event, slot-machine animation.
- **Now Playing** (`src/pages/NowPlaying.tsx`) — session runtime: AI intro story, scene image, session log, image controls, special rules modal.
- **Game Outcome** (`src/pages/GameOutcome.tsx` + `GameOutcomeForm`) — record win/loss and end-of-game stats.
- **The End** (`src/pages/TheEnd.tsx`) — AI-generated ending narration + poster prompt/gen.
- **Scrapbooks** (`src/pages/Scrapbooks.tsx`, `ScrapbookGrid`, `ScrapbookBook`, `ScrapbookPolaroid`, `ScrapbookStoryPage`) — 3D book of past plays, polaroids, story pages.
- **Stats** (`src/pages/Stats.tsx`, `BreakdownTabs`, `TrendsSection`, `PlayerArchetype`, `RecordJacket`, `NarrativeBadgeModal`) — dashboards over recorded games.
- **Rules** (`src/pages/Rules.tsx`, `RuleChapter/Section/Block/SubTabs`, `GlossaryTerm`) — browsable core + module rules with glossary.
- **Archive** (`src/pages/Archive.tsx`) — collection browser (films / owned content).
- **Auth** (`src/pages/Auth.tsx`) — email/password + Google OAuth.
- **News Ticker** (`src/components/NewsTicker.tsx`) — decorative horror headline scroller.
- **Narration playback** — audio via Inworld TTS, chunked and stitched (`src/lib/audioUtils.ts`).
- **AI image + story generation** — `useImageGeneration`, `StoryGenerator`, `ImagePromptModal`, `PosterPromptModal`.
- **Bring-your-own image API keys** (`src/components/ApiKeyManager.tsx`, rendered inside `Archive.tsx`) — user saves an encrypted Google / OpenAI / Stability key (`public.user_api_keys`) and toggles auto-generation + preferred provider (`public.user_image_settings`); consumed by `useImageGeneration` and the `generate-scene-image` edge function.

## Main user flows
1. **First-time sign-in**: Marquee → Sign In → Google OAuth (via `@lovable.dev/cloud-auth-js`) or email/password → session persisted → local guest history migrated to cloud on first authenticated load (per project memory).
2. **Play a game**: Marquee → Casting Room → select all slots → Now Playing (AI intro story + optional scene image) → mark outcome → Game Outcome form → The End (ending narration + poster) → save → Stats/Scrapbooks.
3. **Review past play**: Scrapbooks grid (uses lightweight summary RPC) → open a specific game (lazy full-detail fetch via `fetchGameDetails`) → story page + polaroids.
4. **Browse stats**: Stats page reads from `GameHistoryContext` and renders trends / archetype / narrative badges.
5. **Browse rules**: Rules page renders static rules corpus from `src/data/rules/*`.

## Architecture overview
- **Client-only SPA** built with Vite. Only two React Router routes: `/` and `/auth`. All in-app "navigation" is a `currentPage` state machine inside `src/pages/Index.tsx`.
- **Providers** (in `src/App.tsx`, outer → inner): `ErrorBoundary` → `QueryClientProvider` → `AuthProvider` → `TooltipProvider` → toasters → `BrowserRouter`.
- **Game history** wrapped by `GameHistoryProvider` inside `Index.tsx`.
- **Backend** is Lovable Cloud (Supabase under the hood):
  - Postgres tables with RLS.
  - Storage bucket `posters` for images.
  - Deno edge functions for AI generation (story/ending/images/narration) and one migration helper.
  - Auth via Supabase + Lovable OAuth wrapper.
- **AI providers** are called from edge functions:
  - Chat/text: Lovable AI Gateway (`https://ai.gateway.lovable.dev`, `LOVABLE_API_KEY`) — confirmed for both `generate-story` and `generate-ending`.
  - Text-to-speech: Inworld (`INWORLD_API_KEY`, see `narrate-story`).
  - Images: two different key strategies. `generate-story-image` (poster) calls **Google Gemini** with the platform-managed `GOOGLE_API_KEY`. `generate-scene-image` (mid-game scene) uses the **signed-in user's own** provider key, read from `public.user_api_keys`, and dispatches to Google, OpenAI (`images/generations`), or Stability (`stable-image/generate/core`) depending on the stored provider.
- **Caching**: `useLocalStorage` + a slimmed cloud-history cache key (`final-girl-cloud-game-history-cache-v2`); large `data:` URIs are stripped before caching to avoid quota errors.

## Routes / pages
- `/` → `src/pages/Index.tsx`
  - Internal state machine `currentPage`: `dashboard | archive | nowPlaying | outcome | ending | scrapbooks | stats | rules`
  - `Scrapbooks`, `Stats`, and `Rules` are code-split via `React.lazy` + `Suspense`.
- `/auth` → `src/pages/Auth.tsx`
- `*` → `src/pages/NotFound.tsx`

## Key components
- Composition / shell: `AppHeader`, `Marquee`, `NewsTicker`, `ErrorBoundary`, `NavLink`, `VCRNavigation`.
- Casting: `CastingPicker`, `CastingSlot`, `SelectionSlot`, `ScenarioDropdowns`, `FilmToggle`, `GameIcon`, `LoreInfoModal`.
- Session runtime: `StoryGenerator`, `SessionLogPanel`, `SceneImageControls`, `StoryImageSlot`, `ImageUploadSlot`, `ImagePromptModal`, `PosterPromptModal`, `SpecialRulesModal`.
- Scrapbook: `ScrapbookGrid`, `ScrapbookBook`, `ScrapbookPolaroid`, `ScrapbookStoryPage`, `ProjectorSlideshow`.
- Stats: `BreakdownTabs`, `TrendsSection`, `PlayerArchetype`, `RecordJacket`, `NarrativeBadgeModal`.
- Rules: `RuleChapter`, `RuleSection`, `RuleBlock`, `RuleSubTabs`, `GlossaryTerm`.
- UI primitives: `src/components/ui/*` (shadcn/Radix).

## Data model / state management
- **Auth**: `useAuth` (in `src/hooks/useAuth.ts`) exposes `user`, `session`, `isLoading`, `isAuthReady`, `authError`, `signIn`, `signUp`, `signInWithGoogle`, `signOut`. Restores session on mount with a 10s timeout and a localStorage fallback.
- **Game history**: `useGameHistory` (`src/hooks/useGameHistory.ts`) + `GameHistoryContext`.
  - Table: `public.game_history` (owner-scoped by `auth.uid()`).
  - Summary read via RPC `get_game_history_summary()` (strips `data:image/…;base64,…` URIs, adds `has_legacy_poster` / `has_legacy_scene` flags).
  - Full row fetched on-demand via `fetchGameDetails(id)`.
  - Local cache key: `final-girl-cloud-game-history-cache-v2`.
  - Cheap list-equality guard (`listsShallowEqual`) avoids `JSON.stringify` over megabytes.
  - Sanitizer allows `http(s)` URLs plus legacy `data:image/*` up to a size bound.
- **Stats / archetype**: `useGameStats`, `useArchetypeScoring` derive from history in memory.
- **Owned films / assets**: `useOwnedFilms`, `useActiveImages`.
- **Persistence**: `useLocalStorage` for many small preferences; auth-scoped Supabase storage bucket `posters` for images.
- **User settings**: `public.user_settings` (holds `owned_films` JSONB; delete policy added in migration `20260329…`).
- **Image settings**: `public.user_image_settings` (`auto_generate_images`, `preferred_provider`).
- **API keys**: `public.user_api_keys` (per-user encrypted provider keys for scene-image generation).
- **Profiles**: `public.profiles` **does exist** — but it is minimal (`id` referencing `auth.users`, plus timestamps). It carries no roles or privileged columns.
- **Rate limiting / usage**: `public.ai_usage_events` (used by `_shared/guard.ts`).

Full table set (from `supabase/migrations/`): `profiles`, `game_history`, `user_settings`, `user_image_settings`, `user_api_keys`, `ai_usage_events`. All are RLS-enabled and owner-scoped by `auth.uid()`.

## API / backend / integration points
Edge functions in `supabase/functions/`:
- `generate-story/` — AI intro story. Uses `LOVABLE_API_KEY`. Rate limit: 30/hr.
- `generate-ending/` — AI ending narration. Rate limit: 30/hr.
- `generate-story-image/` — poster image generation via Google Gemini using platform `GOOGLE_API_KEY`; returns base64. Rate limit: 40/hr.
- `generate-scene-image/` — scene image generation using the user's own `user_api_keys` provider key (Google/OpenAI/Stability); uploads via service role. Rate limit: 40/hr.
- `narrate-story/` — Inworld TTS (`INWORLD_API_KEY`) with sentence-boundary chunking; base64 audio in/out. Rate limit: 60/hr.
- `migrate-legacy-images/` — one-shot migration of inline `data:` posters/scenes into the `posters` bucket. Rate limit: 10/hr.
- `_shared/auth.ts` — CORS.
- `_shared/guard.ts` — `requireUser()`: verifies JWT via anon client, then uses service role for rate check + insert into `ai_usage_events`.
- `_shared/validation.ts` + `validation_test.ts` — Zod input schemas.

Client hooks that talk to the above: `useImageGeneration`, `StoryGenerator` (client), and audio utilities in `src/lib/audioUtils.ts`.

Third-party services (from code):
- **Lovable AI Gateway** — text generation (story + ending).
- **Google Gemini** — poster image (`generate-story-image`, platform key) and one of the scene-image providers.
- **OpenAI** and **Stability AI** — alternative scene-image providers (user-supplied keys).
- **Inworld** — TTS.
- **Supabase** — Postgres, auth, storage, edge functions.
- **Google OAuth** — via `@lovable.dev/cloud-auth-js`.

## Authentication / permissions
- Email + password and Google OAuth (Lovable auth wrapper), session managed by `@supabase/supabase-js`.
- No anonymous sign-ups.
- Every edge AI function uses `requireUser`; unauthenticated calls return 401 and over-limit calls return 429.
- RLS is enabled on every user-owned table (`profiles`, `game_history`, `user_settings`, `user_image_settings`, `user_api_keys`, `ai_usage_events`); policies scope by `auth.uid()`. Exact per-table policy wording: see the migrations.
- No roles system currently in the client. A minimal `profiles` table exists but has no role column — if roles are added later, use a separate `user_roles` table with a `security definer` `has_role` function rather than a column on `profiles`.
- The `posters` storage bucket is **public-read** and its object policies currently allow open insert/update/delete (created in the pre-auth migration with "since we don't have auth yet" comments) — worth tightening now that auth exists.

## Styling / design system
- Tailwind CSS 3 with `@tailwindcss/typography` and `tailwindcss-animate`.
- All colors, gradients, and shadows are HSL CSS variables in `src/index.css` under `@layer base` (`--background`, `--foreground`, `--primary` [blood red], `--secondary` [neon cyan], `--accent` [VHS yellow], `--blood-red-glow`, `--neon-cyan-glow`, `--vhs-static`, gradient tokens, etc.).
- Fonts:
  - Roslindale Display Condensed (headline; loaded in `index.html`).
  - VT323, Bebas Neue, Creepster (loaded in `src/index.css`).
  - `font-vhs` utility maps to the VHS voice.
- Global effects: film grain, scanlines, vignette, ticker scroll animation defined outside `@layer` to survive JIT purge (`.news-ticker`, keyframes `ticker-scroll`).
- shadcn/ui primitives live in `src/components/ui/`. Theme through tokens, not hardcoded colors.
- Mobile: `safe-area-bottom`, viewport-sensitive header hiding when scrapbook is open, min 44px touch targets in the footer nav.

## Environment variables
Client env vars in `.env` (all `VITE_`-prefixed):
- `VITE_SUPABASE_URL` — validated at startup in `src/main.tsx`.
- `VITE_SUPABASE_PUBLISHABLE_KEY` — validated at startup in `src/main.tsx`.
- `VITE_SUPABASE_PROJECT_ID` — present in `.env` but **not** validated at startup.

Edge functions read (via `Deno.env.get`):
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (managed by the platform).
- `LOVABLE_API_KEY` — confirmed in `generate-story` **and** `generate-ending` (text). Image functions do **not** use it.
- `GOOGLE_API_KEY` — platform key used by `generate-story-image` (poster). `generate-scene-image` does not use a platform image key; it reads the user's key from `public.user_api_keys`.
- `INWORLD_API_KEY` — confirmed for `narrate-story` TTS.

No secrets or credential values should ever be committed. Do not add secrets to `.env`; use the platform's secret store.

## Known limitations / fragile areas
- **Single-route state machine** in `Index.tsx`: deep-linking to a sub-view (e.g. "open a specific scrapbook") is not possible; back-button behavior is limited to the two real routes.
- **Legacy inline images**: earlier plays stored full base64 image payloads in `game_history` rows. Fixed via `get_game_history_summary()` RPC + `migrate-legacy-images` edge function + `Scrapbooks.tsx` background backfill. Old caches invalidated by bumping the cache key to `-v2`. Users with many legacy rows still pay a one-time migration cost on next sign-in.
- **Cache equality** is intentionally shallow (`listsShallowEqual`); edits that don't change list length or first/last id+timestamp won't invalidate the cache. In practice acceptable because updates go through `updateGame`, which rewrites the state.
- **Auth restoration timeout** (`useAuth.ts`) is 10s; on very slow networks, users may see a warning banner while the archive reconnects.
- **Rate limiter fails open** if the count query errors — logged but not blocked.
- **No integration/e2e tests**; only a small handful of Vitest unit tests exist (`useArchetypeScoring.test.ts`, `useGameHistory.test.ts`, `useLocalStorage.test.ts`, `featureFilmDetails.test.ts`, `gameData.test.ts`, `_shared/validation_test.ts`).
- **Two auth helper files** exist in `supabase/functions/_shared/` (`auth.ts` for CORS and `guard.ts` for the real guard). The name `auth.ts` is misleading; be careful not to confuse them.
- **Inworld chunking** uses a fixed `MAX_CHUNK_SIZE = 1900`. Longer narrations produce multiple audio segments that must be stitched client-side (`audioUtils.ts`).
- **Marquee slideshow** is time-based (16s cycle, 3s crossfade); no user control.
- **`Dashboard.tsx`** exists in `src/pages/` but is **dead code**: it is imported nowhere (confirmed — no `import Dashboard` anywhere in `src/`). Safe to delete; the real dashboard view is the `dashboard` case in `Index.tsx` (which renders `CastingRoom`).

## Deployment / build notes
- Deployed via Lovable (`vite build` output). Hosting/domain is managed in the Lovable project (Project → Settings → Domains); the specific production hostname is not recorded in-repo (README only carries the generic `lovable.dev/projects/…` placeholder).
- Vite server dev port: `8080` (see `vite.config.ts`).
- `lovable-tagger` runs only in development mode.
- `index.html` sets real `<title>`, `description`, OG, and Twitter meta; the OG image URL points at a hosted Google Storage asset.
- Edge functions are deployed through the Supabase project associated with Lovable Cloud; database changes are done via migrations in `supabase/migrations/`.

## Testing status and gaps
- Framework: Vitest 3 + Testing Library + jsdom (`src/test/setup.ts`, `vitest.config.ts`).
- Coverage:
  - Unit tests exist for `useArchetypeScoring`, `useGameHistory`, `useLocalStorage`, `featureFilmDetails`, `gameData`, and edge `validation`.
  - **No component tests** for pages or major UI (`Scrapbooks`, `Stats`, `CastingRoom`, `NowPlaying`, `TheEnd`).
  - **No edge-function integration tests** beyond `validation_test.ts`.
  - **No end-to-end tests** (Playwright is not part of the project; the Lovable environment has it for one-off checks only).
- No CI configuration file is checked in — Needs verification.

## Suggested next improvements
- **Real routes for sub-views** (`/scrapbooks`, `/scrapbooks/:id`, `/stats`, `/rules`) so users can deep-link and use the browser back button; keep `Index.tsx` as the shell.
- **Broaden test coverage**: at minimum a component test for `Scrapbooks` (summary + backfill), an integration test for `useGameHistory` cloud-fetch path with a mocked Supabase client, and a rendering smoke test for `NowPlaying`.
- **Adopt TanStack Query for `game_history` reads/writes** to replace the bespoke cache + shallow equality; would give free stale-while-revalidate, retries, and cross-component subscriptions.
- **Migrate the last of the client-side inline `data:` sanitization** once the legacy backfill is verified complete for all users; then remove the `has_legacy_*` code paths.
- **Schema-typed RPC calls**: `get_game_history_summary` is called via `supabase.rpc(...)`; wrap it in a typed helper so `types.ts` stays the single source of truth.
- **Consolidate `_shared/auth.ts` and `_shared/guard.ts`** or rename `auth.ts` → `cors.ts` to remove ambiguity.
- **Add a `typecheck` npm script** (`tsc --noEmit`) and wire lint + typecheck + vitest into CI.
- **Instrument edge functions** with structured logs including function name, user id hash, and latency, to make rate-limit tuning data-driven.
- **Extract prompt templates** for story/ending/image gen into `src/data/prompts/` (or a shared edge module) so tuning them doesn't require editing function code.
- **Accessibility pass** on the VHS effects (scanlines, ticker) — provide a "reduce effects" toggle honoring `prefers-reduced-motion`.
- **Bundle audit**: with `Scrapbooks`/`Stats`/`Rules` already lazy-loaded, next targets are `recharts`, `embla-carousel`, and `date-fns` (tree-shake or route-scope).
