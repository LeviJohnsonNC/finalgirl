SET ROLE service_role;
DO $$ DECLARE a jsonb;b jsonb; BEGIN
 a:=public.claim_death_scene('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','22222222-2222-4222-8222-222222222222','33333333-3333-4333-8333-333333333333',repeat('a',64),0);
 ASSERT a->>'action'='generate';
 b:=public.claim_death_scene('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','22222222-2222-4222-8222-222222222222','33333333-3333-4333-8333-333333333333',repeat('a',64),0);
 ASSERT b->>'action'='busy';
 UPDATE public.play_death_scenes SET status='ready',scene_text='An original saved scene.' WHERE id=(a->>'id')::uuid AND lease=(a->>'lease')::uuid;
 b:=public.claim_death_scene('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','22222222-2222-4222-8222-222222222222','33333333-3333-4333-8333-333333333333',repeat('a',64),0);
 ASSERT b->>'action'='cached' AND b->>'text'='An original saved scene.';
 BEGIN
 PERFORM public.claim_death_scene('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','22222222-2222-4222-8222-222222222222','33333333-3333-4333-8333-333333333333',repeat('a',64),0);
 RAISE EXCEPTION 'wrong owner was allowed';
 EXCEPTION WHEN insufficient_privilege THEN NULL;
 END;
END $$;
RESET ROLE;
DO $$ BEGIN
 ASSERT NOT has_function_privilege('authenticated','public.claim_death_scene(uuid,uuid,uuid,text,integer)','execute');
 ASSERT NOT has_function_privilege('anon','public.claim_death_scene(uuid,uuid,uuid,text,integer)','execute');
 ASSERT NOT has_table_privilege('authenticated','public.play_death_scenes','insert');
 ASSERT NOT has_table_privilege('authenticated','public.play_death_scenes','update');
 ASSERT NOT has_table_privilege('anon','public.play_death_scenes','select');
END $$;
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',false);
DO $$ BEGIN ASSERT (SELECT count(*) FROM public.play_death_scenes)=0; END $$;
SELECT set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',false);
DO $$ BEGIN ASSERT (SELECT count(*) FROM public.play_death_scenes)=1; END $$;
RESET ROLE;
