-- New preference rows match the app defaults. Existing saved choices stay intact.
ALTER TABLE public.user_image_settings
  ALTER COLUMN use_ai_casting_art SET DEFAULT true,
  ALTER COLUMN auto_generate_images SET DEFAULT true;
