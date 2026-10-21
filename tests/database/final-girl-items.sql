-- Synthetic fixtures only: no photographed secret identities in tests or Git.
INSERT INTO public.final_girl_secret_items(girl,name,effect,image_path) VALUES
 ('Laurie','Private test reference','Synthetic test effect.','11111111-1111-4111-8111-111111111111.webp');
INSERT INTO storage.objects(bucket_id,name) VALUES('final-girl-secret-items','11111111-1111-4111-8111-111111111111.webp');
DO $$ BEGIN
 ASSERT NOT has_table_privilege('anon','public.final_girl_secret_items','select');
 ASSERT NOT has_function_privilege('anon','public.get_final_girl_item(text,uuid)','execute');
 ASSERT NOT (SELECT public FROM storage.buckets WHERE id='final-girl-secret-items');
END $$;
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',false);
DO $$ BEGIN
 ASSERT public.get_final_girl_item('Laurie') IS NULL;
 ASSERT (SELECT count(*) FROM public.final_girl_secret_items)=0;
 ASSERT (SELECT count(*) FROM storage.objects WHERE bucket_id='final-girl-secret-items')=0;
 BEGIN
  PERFORM public.set_final_girl_unlock('Laurie',true,'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
  RAISE EXCEPTION 'Mismatched account request unexpectedly succeeded';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 ASSERT public.get_final_girl_item('Laurie','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb') IS NULL;
 PERFORM public.set_final_girl_unlock('Laurie',true);
 ASSERT public.get_final_girl_item('Laurie')->>'name'='Private test reference';
 ASSERT (SELECT count(*) FROM storage.objects WHERE bucket_id='final-girl-secret-items')=1;
 BEGIN
  INSERT INTO public.final_girl_unlocks(user_id,girl,unlocked) VALUES('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','Kate',true);
  RAISE EXCEPTION 'Cross-account unlock unexpectedly succeeded';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN
  UPDATE public.final_girl_secret_items SET effect='Overwrite';
  RAISE EXCEPTION 'Catalog write unexpectedly succeeded';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN
  PERFORM public.set_final_girl_unlock('Unknown character',true);
  RAISE EXCEPTION 'Invalid character unexpectedly accepted';
 EXCEPTION WHEN check_violation THEN NULL; END;
END $$;
SELECT set_config('request.jwt.claim.sub','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',false);
DO $$ BEGIN
 ASSERT (SELECT count(*) FROM public.get_final_girl_unlocks())=0;
 ASSERT public.get_final_girl_item('Laurie') IS NULL;
 ASSERT (SELECT count(*) FROM storage.objects WHERE bucket_id='final-girl-secret-items')=0;
END $$;
SELECT set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',false);
DO $$ BEGIN
 PERFORM public.set_final_girl_unlock('Laurie',false);
 ASSERT public.get_final_girl_item('Laurie') IS NULL;
 ASSERT (SELECT count(*) FROM storage.objects WHERE bucket_id='final-girl-secret-items')=0;
 PERFORM public.set_final_girl_unlock('Kate',true);
 ASSERT public.get_final_girl_item('Kate') IS NULL; -- not supplied is not a made-up reference
END $$;
RESET ROLE;
-- Verify old game rows remain untouched and the new denominator is optional.
DO $$ BEGIN
 ASSERT (SELECT final_girl_max_health FROM public.game_history WHERE id='11111111-1111-4111-8111-111111111111') IS NULL;
END $$;
