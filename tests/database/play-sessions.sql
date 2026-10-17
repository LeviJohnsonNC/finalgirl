SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',false);
DO $$ DECLARE s jsonb; r jsonb; BEGIN
 s := '{"version":1,"id":"22222222-2222-4222-8222-222222222222","phase":"nowPlaying","selection":{"killer":"Hans","location":"Camp Happy Trails","finalGirl":"Laurie"}}';
 r := public.save_play_session('22222222-2222-4222-8222-222222222222',0,s,false);
 ASSERT r->>'ok'='true' AND r->>'revision'='1';
 r := public.save_play_session('22222222-2222-4222-8222-222222222222',0,s,false);
 ASSERT r->>'revision'='1', 'lost-response retry must be idempotent';
 r := public.save_play_session('22222222-2222-4222-8222-222222222222',0,s || '{"introStory":"other device"}',false);
 ASSERT r->>'ok'='false' AND r->>'revision'='1', 'stale writes must conflict';
 r := public.save_play_session('22222222-2222-4222-8222-222222222222',1,s || '{"introStory":"new story"}',false);
 ASSERT r->>'ok'='true' AND r->>'revision'='2';
END $$;
SELECT set_config('request.jwt.claim.sub','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',false);
DO $$ BEGIN
 ASSERT (SELECT count(*) FROM public.play_sessions)=0;
 BEGIN
 PERFORM public.save_play_session('22222222-2222-4222-8222-222222222222',2,'{"version":1,"id":"22222222-2222-4222-8222-222222222222","phase":"nowPlaying","selection":{}}',false);
 RAISE EXCEPTION 'cross-account update unexpectedly succeeded';
 EXCEPTION WHEN insufficient_privilege THEN NULL;
 END;
END $$;
RESET ROLE;
DO $$ BEGIN
 ASSERT NOT has_function_privilege('anon','public.save_play_session(uuid,bigint,jsonb,boolean)','execute');
 ASSERT NOT has_table_privilege('anon','public.play_sessions','select');
 ASSERT (SELECT rounds_played FROM public.game_history LIMIT 1) IS NULL;
END $$;
