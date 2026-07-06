
-- Lock down SECURITY DEFINER functions: revoke broad EXECUTE, grant only where needed.
REVOKE ALL ON FUNCTION public.handle_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_game_history_summary() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_game_history_summary() TO authenticated;

-- Remove broad SELECT policies on the public 'posters' bucket to prevent anonymous listing.
-- Direct public URL access still works because the bucket is public.
DROP POLICY IF EXISTS "Posters are publicly readable" ON storage.objects;
DROP POLICY IF EXISTS "Public can view posters" ON storage.objects;

-- Owner-scoped listing only.
CREATE POLICY "Users can list their own posters"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'posters' AND (storage.foldername(name))[2] = (auth.uid())::text);
