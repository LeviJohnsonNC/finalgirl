-- Run only on a disposable database after bootstrap.sql and the catalog migration.
-- Synthetic fixtures: never read or reproduce the real private catalog.
BEGIN;
INSERT INTO public.final_girl_secret_items(girl,name,effect,image_path)
VALUES ('Laurie','Synthetic photo','Synthetic effect','99999999-9999-4999-8999-999999999999.webp');
INSERT INTO storage.objects(bucket_id,name)
VALUES ('final-girl-secret-items','99999999-9999-4999-8999-999999999999.webp'),
       ('final-girl-secret-items','88888888-8888-4888-8888-888888888888.webp');
INSERT INTO auth.users(id) VALUES
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
INSERT INTO public.final_girl_unlocks(user_id,girl,unlocked)
VALUES ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Laurie',true);
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',true);
DO $$ BEGIN
 ASSERT (SELECT count(*) FROM storage.objects WHERE bucket_id='final-girl-secret-items')=0,
   'Another account must not inherit an unlock';
END $$;
SELECT set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',true);
DO $$ BEGIN
 ASSERT (SELECT count(*) FROM storage.objects WHERE bucket_id='final-girl-secret-items')=1,
   'Confirmed unlock must allow only its catalog photo';
END $$;
UPDATE public.final_girl_unlocks SET unlocked=false WHERE user_id=auth.uid() AND girl='Laurie';
DO $$ BEGIN
 ASSERT (SELECT count(*) FROM storage.objects WHERE bucket_id='final-girl-secret-items')=0,
   'Hidden item must deny photo access';
END $$;
SELECT set_config('request.jwt.claim.sub','',true);
DO $$ BEGIN
 ASSERT (SELECT count(*) FROM storage.objects WHERE bucket_id='final-girl-secret-items')=0,
   'Missing caller identity must deny photo access';
END $$;
SET LOCAL ROLE anon;
DO $$ BEGIN
 ASSERT (SELECT count(*) FROM storage.objects WHERE bucket_id='final-girl-secret-items')=0,
   'Anonymous caller must not read private photos';
END $$;
ROLLBACK;