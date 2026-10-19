SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',false);
SELECT public.save_play_session('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',0,
 '{"version":1,"id":"eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee","phase":"nowPlaying","selection":{"killer":"Hans","location":"Camp Happy Trails","finalGirl":"Laurie"},"introStory":"The story that will be removed."}',false);
INSERT INTO public.game_history(id,user_id,timestamp,outcome,killer,location,final_girl)
 VALUES('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',auth.uid(),1,'won','Hans','Camp Happy Trails','Laurie');
RESET ROLE;
INSERT INTO public.play_death_scenes(user_id,session_id,event_id,signature,status,scene_text)
 VALUES('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee','eeeeeeee-eeee-4eee-8eee-111111111111',repeat('d',64),'ready','A complete saved scene.');

SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',false);
DO $$ BEGIN
 BEGIN
  PERFORM public.discard_game_session('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee');
  RAISE EXCEPTION 'Foreign deletion succeeded';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 ASSERT (SELECT count(*) FROM public.discarded_games)=0;
END $$;
SELECT set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',false);
DO $$ DECLARE result jsonb; BEGIN
 result:=public.discard_game_session('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee');
 ASSERT result->>'discarded'='true';
 ASSERT result->'session'->>'introStory'='The story that will be removed.';
 ASSERT result->'history'->>'outcome'='won';
 ASSERT jsonb_array_length(result->'scenes')=1;
 ASSERT NOT EXISTS(SELECT 1 FROM public.play_sessions WHERE id='eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee');
 ASSERT NOT EXISTS(SELECT 1 FROM public.game_history WHERE id='eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee');
 ASSERT NOT EXISTS(SELECT 1 FROM public.play_death_scenes WHERE session_id='eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee');
 ASSERT public.discard_game_session('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee')->>'discarded'='true';
 result:=public.save_play_session('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',0,'{"version":1,"id":"eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee","phase":"nowPlaying","selection":{}}',false);
 ASSERT result->>'discarded'='true', 'An older device must acknowledge deletion instead of resurrecting the draft';
 BEGIN
  INSERT INTO public.game_history(id,user_id,timestamp,outcome,killer,location,final_girl)
   VALUES('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',auth.uid(),1,'won','Hans','Camp Happy Trails','Laurie');
  RAISE EXCEPTION 'Stale history insert succeeded';
 EXCEPTION WHEN SQLSTATE 'PT410' THEN NULL; END;
 BEGIN
  INSERT INTO public.play_sessions(id,user_id,state) VALUES('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',auth.uid(),'{}');
  RAISE EXCEPTION 'Direct session insert bypassed deletion';
 EXCEPTION WHEN SQLSTATE 'PT410' THEN NULL; END;
 BEGIN
  DELETE FROM public.discarded_games WHERE game_id='eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';
  RAISE EXCEPTION 'Client erased a deletion marker';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
-- A local draft can be discarded before its first cloud snapshot reaches the server.
SELECT public.discard_game_session('ffffffff-ffff-4fff-8fff-ffffffffffff');
RESET ROLE;
DO $$ BEGIN
 ASSERT EXISTS(SELECT 1 FROM public.play_sessions WHERE id='22222222-2222-4222-8222-222222222222'), 'Unrelated game was removed';
 ASSERT NOT has_function_privilege('anon','public.discard_game_session(uuid)','execute');
 ASSERT NOT has_function_privilege('authenticated','public.queue_discarded_image_cleanup(uuid,uuid)','execute');
 ASSERT (SELECT count(*) FROM public.discarded_games WHERE game_id='eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee')=1;
END $$;
SET ROLE service_role;
SELECT public.queue_discarded_image_cleanup('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee');
DO $$ BEGIN
 ASSERT (SELECT cleanup_revision FROM public.discarded_games WHERE game_id='eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee')=1;
END $$;
RESET ROLE;
