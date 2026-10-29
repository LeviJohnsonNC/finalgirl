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
-- Isolate this fixture from later discard/death suites, including their session IDs.
BEGIN;
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',false);
DO $$ DECLARE s jsonb; r jsonb; BEGIN
 s := '{"version":1,"id":"45454545-4545-4545-8545-454545454545","phase":"nowPlaying","evomorphSetupVersion":1,"selection":{"killer":"Evomorph","location":"Maple Lane","finalGirl":"Nancy"},"playEvents":[{"kind":"start","saved":0,"killed":0,"round":1,"id":"335db101-4116-47ff-b849-37f09abfcb62","at":1793242883020},{"kind":"module","moduleData":{"module":"evomorph","changes":{"initialized":true,"stage":"hatchling","presence":"on-board","scansKnown":true,"scan.1":null,"scan.2":null,"scan.3":null,"scan.4":null,"scan.5":null,"scan.6":null,"scanRemoved":0,"skipPhase":false,"extraHealthToken":false,"toying":false}},"id":"420c5214-2cf8-4d79-94dc-6ebda0a6f916","at":1793242883020},{"kind":"module","evomorphAction":{"command":"evolve","parent":"420c5214-2cf8-4d79-94dc-6ebda0a6f916"},"moduleData":{"module":"evomorph","changes":{"stage":"youngling","presence":"vanished","room":null}},"id":"42e2b941-644c-47af-a87f-35eaf46ea289","at":1793242883021},{"kind":"module","evomorphAction":{"command":"ambush","key":"ambush-y10","face":"youngling","parent":"42e2b941-644c-47af-a87f-35eaf46ea289"},"moduleData":{"module":"evomorph","changes":{"ambushId":"ambush-y10","ambushFace":"youngling"}},"id":"f38941b0-6bf2-43ae-8494-ec58027676c5","at":1793242883021},{"kind":"module","evomorphAction":{"command":"scan-place","slot":1,"space":"Ordinary space","parent":"f38941b0-6bf2-43ae-8494-ec58027676c5"},"moduleData":{"module":"evomorph","changes":{"scan.1":"Ordinary space"}},"id":"b95938fa-48de-4f83-9507-7ede50f75dc0","at":1793242883021}]}';
 r := public.save_play_session('45454545-4545-4545-8545-454545454545',0,s,false);
 ASSERT r->>'ok'='true';
 ASSERT (SELECT state->>'evomorphSetupVersion' FROM public.play_sessions WHERE id='45454545-4545-4545-8545-454545454545')='1';
 ASSERT (SELECT state#>>'{playEvents,3,moduleData,changes,ambushFace}' FROM public.play_sessions WHERE id='45454545-4545-4545-8545-454545454545')='youngling';
END $$;
RESET ROLE;
ROLLBACK;

-- USS Konrad: opaque session and archived review use existing JSONB/outcome columns.
-- Unique fixture and rollback prevent leaking state into later suites.
BEGIN;
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',false);
DO $$ DECLARE events jsonb; s jsonb; r jsonb; BEGIN
 events := '[{"kind":"start","saved":0,"killed":0,"round":1,"id":"944b2f85-18ec-4aeb-af6c-a1217dee0318","at":1793285545247},{"kind":"module","moduleData":{"module":"konrad","changes":{"snapshot":"{\"tokens\":{\"space:0\":1,\"space:1\":0,\"space:2\":0,\"space:3\":0,\"space:4\":0,\"space:5\":0,\"space:6\":0,\"space:7\":0,\"space:8\":1,\"space:9\":0,\"space:10\":0,\"space:11\":0,\"space:12\":0,\"space:13\":0,\"space:14\":0,\"space:15\":0,\"shaft:upper-left\":0,\"shaft:upper-right\":0,\"shaft:lower-left\":0,\"shaft:lower-right\":0,\"function:crusher\":0,\"function:incinerator\":0,\"function:airlock\":0,\"function:self-destruct\":0},\"held\":1,\"systems\":{},\"airlock\":\"inactive\",\"countdown\":\"inactive\",\"events\":{},\"people\":{},\"captainSpace\":null,\"jonasSpace\":null,\"orphanTogether\":null,\"slippery\":null,\"temporaryShafts\":false,\"loader\":\"parked\",\"loaderSpace\":\"Hangar\",\"beaconSpace\":null,\"beacon\":\"absent\",\"breach\":null,\"fate\":\"unknown\"}"}},"id":"6b6ccc8a-16dc-4777-b85e-69a54a170499","at":1793285545248},{"kind":"module","konradAction":{"command":"solar","counts":{"shaft:upper-left":2},"complete":true,"parent":"6b6ccc8a-16dc-4777-b85e-69a54a170499"},"moduleData":{"module":"konrad","changes":{"snapshot":"{\"tokens\":{\"space:0\":0,\"space:1\":0,\"space:2\":0,\"space:3\":0,\"space:4\":0,\"space:5\":0,\"space:6\":0,\"space:7\":0,\"space:8\":0,\"space:9\":0,\"space:10\":0,\"space:11\":0,\"space:12\":0,\"space:13\":0,\"space:14\":0,\"space:15\":0,\"shaft:upper-left\":2,\"shaft:upper-right\":0,\"shaft:lower-left\":0,\"shaft:lower-right\":0,\"function:crusher\":0,\"function:incinerator\":0,\"function:airlock\":0,\"function:self-destruct\":0},\"held\":1,\"systems\":{},\"airlock\":\"inactive\",\"countdown\":\"inactive\",\"events\":{},\"people\":{},\"captainSpace\":null,\"jonasSpace\":null,\"orphanTogether\":null,\"slippery\":null,\"temporaryShafts\":false,\"loader\":\"parked\",\"loaderSpace\":\"Hangar\",\"beaconSpace\":null,\"beacon\":\"absent\",\"breach\":null,\"fate\":\"unknown\"}"}},"id":"3faef214-6699-4349-ac3b-6d0678eaba42","at":1793285545249},{"kind":"module","konradAction":{"command":"observe","key":"fate","value":"explosion-loss","parent":"3faef214-6699-4349-ac3b-6d0678eaba42"},"moduleData":{"module":"konrad","changes":{"snapshot":"{\"tokens\":{\"space:0\":0,\"space:1\":0,\"space:2\":0,\"space:3\":0,\"space:4\":0,\"space:5\":0,\"space:6\":0,\"space:7\":0,\"space:8\":0,\"space:9\":0,\"space:10\":0,\"space:11\":0,\"space:12\":0,\"space:13\":0,\"space:14\":0,\"space:15\":0,\"shaft:upper-left\":2,\"shaft:upper-right\":0,\"shaft:lower-left\":0,\"shaft:lower-right\":0,\"function:crusher\":0,\"function:incinerator\":0,\"function:airlock\":0,\"function:self-destruct\":0},\"held\":1,\"systems\":{},\"airlock\":\"inactive\",\"countdown\":\"inactive\",\"events\":{},\"people\":{},\"captainSpace\":null,\"jonasSpace\":null,\"orphanTogether\":null,\"slippery\":null,\"temporaryShafts\":false,\"loader\":\"parked\",\"loaderSpace\":\"Hangar\",\"beaconSpace\":null,\"beacon\":\"absent\",\"breach\":null,\"fate\":\"explosion-loss\"}"}},"id":"7dba5e2e-a8e9-4aa3-91d1-4a533713a79a","at":1793285545250}]'::jsonb;
 INSERT INTO public.game_history(id,user_id,timestamp,outcome,killer,location,final_girl,final_girl_health,play_events) VALUES('61616161-6161-4161-8161-616161616161',auth.uid(),1,'won','Poltergeist','USS Konrad','Laurie',5,events);
 UPDATE public.game_history SET outcome='lost',play_events=events WHERE id='61616161-6161-4161-8161-616161616161';
 ASSERT (SELECT outcome FROM public.game_history WHERE id='61616161-6161-4161-8161-616161616161')='lost';
 ASSERT (SELECT final_girl_health FROM public.game_history WHERE id='61616161-6161-4161-8161-616161616161')=5;
 ASSERT (SELECT ((play_events#>>'{3,moduleData,changes,snapshot}')::jsonb)->>'fate' FROM public.game_history WHERE id='61616161-6161-4161-8161-616161616161')='explosion-loss';
 ASSERT (SELECT (((play_events#>>'{2,moduleData,changes,snapshot}')::jsonb)#>>'{tokens,shaft:upper-left}')::int FROM public.game_history WHERE id='61616161-6161-4161-8161-616161616161')=2;
 s:=jsonb_build_object('version',1,'id','61616161-6161-4161-8161-616161616161','phase','nowPlaying','selection',jsonb_build_object('killer','Poltergeist','location','USS Konrad','finalGirl','Laurie'),'playEvents',events);
 r:=public.save_play_session('61616161-6161-4161-8161-616161616161',0,s,false);ASSERT r->>'ok'='true';
END $$;
SELECT set_config('request.jwt.claim.sub','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',false);
DO $$ BEGIN ASSERT NOT EXISTS(SELECT 1 FROM public.game_history WHERE id='61616161-6161-4161-8161-616161616161');ASSERT NOT EXISTS(SELECT 1 FROM public.play_sessions WHERE id='61616161-6161-4161-8161-616161616161');END $$;
RESET ROLE;
ROLLBACK;
