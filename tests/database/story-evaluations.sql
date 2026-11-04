-- Synthetic prose only. Clients may export/delete their corpus but cannot forge it.
INSERT INTO public.story_evaluations(user_id,kind,prompt_version,system_prompt,user_prompt,model_context,diagnostic_status,story_text)
VALUES ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','opening','test','system','user','{}','not_provided',repeat('Full prose. ',2000)),
       ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','ending','test','system','user','{}','not_provided','Other owner');
-- Reapplying the repair must preserve both owners' full records and permissions.
\ir ../../supabase/migrations/20261104150000_repair_story_evaluations.sql
DO $$ BEGIN ASSERT (SELECT count(*) FROM public.story_evaluations)=2; END $$;
DO $$ BEGIN
 ASSERT NOT has_table_privilege('anon','public.story_evaluations','select');
 ASSERT NOT has_table_privilege('authenticated','public.story_evaluations','insert');
 ASSERT NOT has_table_privilege('authenticated','public.story_evaluations','update');
END $$;
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',false);
DO $$ BEGIN
 ASSERT (SELECT count(*) FROM public.story_evaluations)=1;
 ASSERT (SELECT length(story_text) FROM public.story_evaluations)=24000;
 ASSERT (SELECT count(*) FROM public.story_evaluations WHERE user_id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb')=0;
 DELETE FROM public.story_evaluations WHERE user_id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
 BEGIN
  INSERT INTO public.story_evaluations(user_id,kind,prompt_version,system_prompt,user_prompt,model_context,diagnostic_status)
  VALUES(auth.uid(),'opening','fake','fake','fake','{}','not_provided');
  RAISE EXCEPTION 'Client unexpectedly forged an evaluation';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN
  UPDATE public.story_evaluations SET story_text='forged';
  RAISE EXCEPTION 'Client unexpectedly changed an evaluation';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 DELETE FROM public.story_evaluations WHERE user_id=auth.uid();
 ASSERT (SELECT count(*) FROM public.story_evaluations)=0;
END $$;
SELECT set_config('request.jwt.claim.sub','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',false);
DO $$ BEGIN ASSERT (SELECT count(*) FROM public.story_evaluations)=1; END $$;
RESET ROLE;

-- Exercise a deployment where the optional table was never created. This is a
-- disposable database only; roll back to the existing corpus after the check.
BEGIN;
DROP TABLE public.story_evaluations;
\ir ../../supabase/migrations/20261104150000_repair_story_evaluations.sql
DO $$ BEGIN
 ASSERT to_regclass('public.story_evaluations') IS NOT NULL;
 ASSERT (SELECT relrowsecurity FROM pg_class WHERE oid='public.story_evaluations'::regclass);
 ASSERT NOT has_table_privilege('anon','public.story_evaluations','select');
 ASSERT NOT has_table_privilege('authenticated','public.story_evaluations','insert');
 ASSERT has_table_privilege('authenticated','public.story_evaluations','select');
 ASSERT has_table_privilege('service_role','public.story_evaluations','insert');
END $$;
ROLLBACK;
