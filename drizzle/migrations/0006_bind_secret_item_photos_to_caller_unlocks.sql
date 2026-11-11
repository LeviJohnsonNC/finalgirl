ALTER POLICY unlocked_item_photo ON storage.objects
TO authenticated
USING (
  bucket_id = 'final-girl-secret-items'
  AND EXISTS (
    SELECT 1
    FROM public.final_girl_secret_items AS i
    JOIN public.final_girl_unlocks AS u ON u.girl = i.girl
    WHERE i.image_path = storage.objects.name
      AND u.user_id = (SELECT auth.uid())
      AND u.unlocked = true
  )
);
COMMENT ON POLICY unlocked_item_photo ON storage.objects IS 'Shared catalog photos require the calling account''s confirmed unlock; upload ownership is not entitlement.';