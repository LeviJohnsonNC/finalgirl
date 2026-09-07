-- Move image generation onto the platform's own AI key.
--
-- Three changes, all additive:
--   1. Split the overloaded auto_generate_images flag. It used to mean BOTH
--      "auto-generate scene images" AND "show the AI casting art variants".
--      Now that images generate by default, those must be separate settings or
--      every existing player's casting art would silently change.
--   2. Give each game a visual bible so its two images share one look.
--   3. Record which model served each AI call, for cost visibility.

-- 1. Casting-art preference, backfilled from the old combined flag so nobody's
--    existing look changes.
ALTER TABLE public.user_image_settings
  ADD COLUMN IF NOT EXISTS use_ai_casting_art BOOLEAN NOT NULL DEFAULT false;

UPDATE public.user_image_settings
  SET use_ai_casting_art = auto_generate_images;

-- Auto-generation is now the default behaviour rather than an opt-in that
-- required pasting in an API key.
ALTER TABLE public.user_image_settings
  ALTER COLUMN auto_generate_images SET DEFAULT true;

UPDATE public.user_image_settings
  SET auto_generate_images = true
  WHERE auto_generate_images = false;

-- preferred_provider described which third-party provider's key to use. There
-- is only one provider now, and the app no longer reads this column.
ALTER TABLE public.user_image_settings
  DROP COLUMN IF EXISTS preferred_provider;

-- 2. Per-game visual bible, written once when the game starts.
ALTER TABLE public.game_history
  ADD COLUMN IF NOT EXISTS visual_bible TEXT;

-- 3. Cost visibility: which model answered, and what kind of call it was.
ALTER TABLE public.ai_usage_events
  ADD COLUMN IF NOT EXISTS model TEXT,
  ADD COLUMN IF NOT EXISTS kind TEXT;

-- The guard now updates the row it reserved, so authenticated users need UPDATE
-- on their own events. (The guard itself runs as service_role; this keeps the
-- grant surface consistent with the existing SELECT/INSERT grants.)
GRANT UPDATE ON public.ai_usage_events TO service_role;