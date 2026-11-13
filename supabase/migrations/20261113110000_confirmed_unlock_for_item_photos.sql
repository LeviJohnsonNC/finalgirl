ALTER POLICY unlocked_item_photo ON storage.objects USING (
  bucket_id = 'final-girl-secret-items' AND EXISTS (
    SELECT 1
    FROM public.final_girl_secret_items AS item
    JOIN public.final_girl_unlocks AS unlock ON unlock.girl = item.girl
    WHERE item.image_path = storage.objects.name
      AND unlock.user_id = auth.uid()
      AND unlock.unlocked
  )
);
