INSERT INTO auth.users VALUES ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'), ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
DO $$ BEGIN
  ASSERT NOT has_function_privilege('authenticated', 'public.reserve_ai_usage(uuid,text,integer,integer)', 'execute');
  ASSERT NOT has_function_privilege('anon', 'public.reserve_ai_usage(uuid,text,integer,integer)', 'execute');
  ASSERT has_function_privilege('service_role', 'public.reserve_ai_usage(uuid,text,integer,integer)', 'execute');
  ASSERT NOT has_table_privilege('authenticated', 'public.ai_usage_events', 'insert');
END $$;
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', false);
DO $$ BEGIN
  ASSERT public.apply_collection_delta(ARRAY['one','two'], ARRAY[]::text[]) = '["one","two"]'::jsonb;
  ASSERT public.apply_collection_delta(ARRAY['two','three'], ARRAY['one']) = '["two","three"]'::jsonb;
END $$;
INSERT INTO public.game_history (id,user_id,timestamp,outcome,killer,location,final_girl)
VALUES ('11111111-1111-4111-8111-111111111111',auth.uid(),1,'won','Hans','Camp Happy Trails','Laurie');
INSERT INTO storage.objects(bucket_id,name) VALUES ('posters','game-posters/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/scene.png');
SELECT set_config('request.jwt.claim.sub', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', false);
DO $$ BEGIN
  ASSERT (SELECT count(*) FROM public.game_history) = 0;
  ASSERT (SELECT count(*) FROM public.user_settings) = 0;
  ASSERT (SELECT count(*) FROM storage.objects) = 0;
  ASSERT public.apply_collection_delta(ARRAY['B-only'], ARRAY[]::text[]) = '["B-only"]'::jsonb;
  BEGIN
    INSERT INTO storage.objects(bucket_id,name) VALUES ('posters','game-posters/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/intrusion.png');
    RAISE EXCEPTION 'Cross-account upload unexpectedly succeeded';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    INSERT INTO public.game_history(user_id,timestamp,outcome,killer,location,final_girl)
    VALUES ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',1,'won','Hans','Camp Happy Trails','Laurie');
    RAISE EXCEPTION 'Cross-account insert unexpectedly succeeded';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
END $$;
RESET ROLE;
SET ROLE service_role;
DO $$ DECLARE slot record; BEGIN
  SELECT * INTO slot FROM public.reserve_ai_usage('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','hourly-test',1,NULL);
  ASSERT slot.allowed AND slot.event_id IS NOT NULL;
  SELECT * INTO slot FROM public.reserve_ai_usage('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','hourly-test',1,NULL);
  ASSERT NOT slot.allowed AND slot.event_id IS NULL;
  SELECT * INTO slot FROM public.reserve_ai_usage('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','daily-test',100,1);
  ASSERT slot.allowed;
  SELECT * INTO slot FROM public.reserve_ai_usage('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','daily-test',100,1);
  ASSERT NOT slot.allowed;
END $$;
RESET ROLE;
