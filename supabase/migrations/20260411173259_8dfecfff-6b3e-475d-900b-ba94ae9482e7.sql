
-- Fix 1: Drop existing permissive storage policies on posters bucket and add ownership-scoped ones
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow public deletes" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read posters" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload posters" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update posters" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete posters" ON storage.objects;

-- Public read (posters are displayed publicly)
CREATE POLICY "Posters are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'posters');

-- Only authenticated users can upload to their own folder
CREATE POLICY "Users can upload their own posters"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'posters'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = 'game-posters'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Only owners can update their posters
CREATE POLICY "Users can update their own posters"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'posters'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Only owners can delete their posters
CREATE POLICY "Users can delete their own posters"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'posters'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Fix 2: Add missing DELETE policy on user_settings
DROP POLICY IF EXISTS "Users can delete their own settings" ON public.user_settings;
CREATE POLICY "Users can delete their own settings"
ON public.user_settings
FOR DELETE
USING (auth.uid() = user_id);

