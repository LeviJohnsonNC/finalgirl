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

-- New owner observations use the existing opaque, revision-guarded JSONB session contract.
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',false);
DO $$ DECLARE s jsonb; r jsonb; BEGIN
 s := '{"version":1,"id":"eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee","phase":"nowPlaying","evomorphSetupVersion":1,"selection":{"killer":"Evomorph","location":"Maple Lane","finalGirl":"Nancy"},"playEvents":[{"kind":"start","saved":0,"killed":0,"round":1,"id":"335db101-4116-47ff-b849-37f09abfcb62","at":1793242883020},{"kind":"module","moduleData":{"module":"evomorph","changes":{"initialized":true,"stage":"hatchling","presence":"on-board","scansKnown":true,"scan.1":null,"scan.2":null,"scan.3":null,"scan.4":null,"scan.5":null,"scan.6":null,"scanRemoved":0,"skipPhase":false,"extraHealthToken":false,"toying":false}},"id":"420c5214-2cf8-4d79-94dc-6ebda0a6f916","at":1793242883020},{"kind":"module","evomorphAction":{"command":"evolve","parent":"420c5214-2cf8-4d79-94dc-6ebda0a6f916"},"moduleData":{"module":"evomorph","changes":{"stage":"youngling","presence":"vanished","room":null}},"id":"42e2b941-644c-47af-a87f-35eaf46ea289","at":1793242883021},{"kind":"module","evomorphAction":{"command":"ambush","key":"ambush-y10","face":"youngling","parent":"42e2b941-644c-47af-a87f-35eaf46ea289"},"moduleData":{"module":"evomorph","changes":{"ambushId":"ambush-y10","ambushFace":"youngling"}},"id":"f38941b0-6bf2-43ae-8494-ec58027676c5","at":1793242883021},{"kind":"module","evomorphAction":{"command":"scan-place","slot":1,"space":"Ordinary space","parent":"f38941b0-6bf2-43ae-8494-ec58027676c5"},"moduleData":{"module":"evomorph","changes":{"scan.1":"Ordinary space"}},"id":"b95938fa-48de-4f83-9507-7ede50f75dc0","at":1793242883021}]}';
 r := public.save_play_session('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',0,s,false);
 ASSERT r->>'ok'='true';
 ASSERT (SELECT state->>'evomorphSetupVersion' FROM public.play_sessions WHERE id='eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee')='1';
 ASSERT (SELECT state#>>'{playEvents,3,moduleData,changes,ambushFace}' FROM public.play_sessions WHERE id='eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee')='youngling';
END $$;
RESET ROLE;
