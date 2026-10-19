-- Re-states 0004_discard_game_session idempotently so the migration ledger can advance.
-- A content-free marker prevents delayed writes and older devices recreating a game.
CREATE TABLE IF NOT EXISTS public.discarded_games (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id uuid NOT NULL,
  discarded_at timestamptz NOT NULL DEFAULT now(),
  cleanup_pending boolean NOT NULL DEFAULT true,
  cleanup_revision bigint NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, game_id)
);
REVOKE ALL ON public.discarded_games FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.discarded_games TO authenticated;
GRANT ALL ON public.discarded_games TO service_role;
ALTER TABLE public.discarded_games ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS discarded_games_owner ON public.discarded_games;
CREATE POLICY discarded_games_owner ON public.discarded_games FOR SELECT TO authenticated USING (user_id=auth.uid());

CREATE OR REPLACE FUNCTION public.prevent_discarded_game_write() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(NEW.id::text, 0));
  IF EXISTS(SELECT 1 FROM public.discarded_games WHERE user_id=NEW.user_id AND game_id=NEW.id) THEN
    RAISE EXCEPTION 'This game was discarded.' USING ERRCODE='PT410';
  END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.prevent_discarded_game_write() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS guard_discarded_session ON public.play_sessions;
CREATE TRIGGER guard_discarded_session BEFORE INSERT OR UPDATE ON public.play_sessions
  FOR EACH ROW EXECUTE FUNCTION public.prevent_discarded_game_write();
DROP TRIGGER IF EXISTS guard_discarded_history ON public.game_history;
CREATE TRIGGER guard_discarded_history BEFORE INSERT OR UPDATE ON public.game_history
  FOR EACH ROW EXECUTE FUNCTION public.prevent_discarded_game_write();

CREATE OR REPLACE FUNCTION public.discard_game_session(p_game_id uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE owner_id uuid := auth.uid(); session_state jsonb; history_row jsonb; scenes jsonb;
BEGIN
  IF owner_id IS NULL OR p_game_id IS NULL THEN
    RAISE EXCEPTION 'Sign in to discard this game.' USING ERRCODE='42501';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(p_game_id::text, 0));
  IF EXISTS(SELECT 1 FROM public.play_sessions WHERE id=p_game_id AND user_id<>owner_id)
     OR EXISTS(SELECT 1 FROM public.game_history WHERE id=p_game_id AND user_id<>owner_id) THEN
    RAISE EXCEPTION 'Game unavailable.' USING ERRCODE='42501';
  END IF;
  SELECT state INTO session_state FROM public.play_sessions WHERE id=p_game_id AND user_id=owner_id;
  SELECT to_jsonb(g) INTO history_row FROM public.game_history g WHERE id=p_game_id AND user_id=owner_id;
  SELECT coalesce(jsonb_agg(jsonb_build_object('id',id,'text',scene_text)), '[]'::jsonb) INTO scenes
    FROM public.play_death_scenes WHERE session_id=p_game_id AND user_id=owner_id;
  -- Repeated deletion, including a lost-response retry, is safe. No game content is retained.
  INSERT INTO public.discarded_games(user_id,game_id) VALUES(owner_id,p_game_id)
    ON CONFLICT(user_id,game_id) DO NOTHING;
  DELETE FROM public.game_history WHERE id=p_game_id AND user_id=owner_id;
  -- Death scenes are deleted by the existing ON DELETE CASCADE foreign key.
  DELETE FROM public.play_sessions WHERE id=p_game_id AND user_id=owner_id;
  RETURN jsonb_build_object('discarded',true,'session',session_state,'history',history_row,'scenes',scenes);
END $$;
REVOKE ALL ON FUNCTION public.discard_game_session(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.discard_game_session(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.save_play_session(p_id uuid, p_revision bigint, p_state jsonb, p_closed boolean DEFAULT false)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE current_row public.play_sessions;
BEGIN
  IF auth.uid() IS NULL OR p_revision < 0 OR p_revision IS NULL OR p_closed IS NULL
    OR p_state IS NULL OR jsonb_typeof(p_state) <> 'object' OR p_state->>'id' IS DISTINCT FROM p_id::text
    OR p_state->>'version' IS DISTINCT FROM '1' OR p_state->>'phase' IS NULL OR p_state->>'phase' NOT IN ('nowPlaying','outcome','ending')
    OR jsonb_typeof(p_state->'selection') IS DISTINCT FROM 'object'
    OR octet_length(p_state::text) > 1000000 THEN
    RAISE EXCEPTION 'Invalid play session' USING ERRCODE = '22023';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(p_id::text, 0));
  IF EXISTS (SELECT 1 FROM public.discarded_games WHERE user_id=auth.uid() AND game_id=p_id) THEN
    RETURN jsonb_build_object('ok',true,'discarded',true);
  END IF;
  IF p_revision = 0 THEN
    INSERT INTO public.play_sessions(id,user_id,state,closed) VALUES(p_id,auth.uid(),p_state,p_closed)
      ON CONFLICT (id) DO NOTHING;
  END IF;
  SELECT * INTO current_row FROM public.play_sessions WHERE id=p_id AND user_id=auth.uid() FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Play session unavailable' USING ERRCODE='42501'; END IF;
  -- Lost-response retries acknowledge an identical snapshot without another revision.
  IF current_row.state = p_state AND current_row.closed = p_closed THEN
    RETURN jsonb_build_object('ok',true,'revision',current_row.revision);
  END IF;
  IF current_row.revision <> p_revision THEN
    RETURN jsonb_build_object('ok',false,'revision',current_row.revision,'state',current_row.state,'closed',current_row.closed);
  END IF;
  UPDATE public.play_sessions SET state=p_state,closed=p_closed,revision=revision+1,updated_at=now()
    WHERE id=p_id AND user_id=auth.uid() RETURNING * INTO current_row;
  RETURN jsonb_build_object('ok',true,'revision',current_row.revision);
END $$;
REVOKE ALL ON FUNCTION public.save_play_session(uuid,bigint,jsonb,boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_play_session(uuid,bigint,jsonb,boolean) TO authenticated;

-- Late image uploads invalidate an older cleanup acknowledgement.
CREATE OR REPLACE FUNCTION public.queue_discarded_image_cleanup(p_user_id uuid,p_game_id uuid) RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path=public AS $$
  UPDATE public.discarded_games SET cleanup_pending=true, cleanup_revision=cleanup_revision+1
    WHERE user_id=p_user_id AND game_id=p_game_id;
$$;
REVOKE ALL ON FUNCTION public.queue_discarded_image_cleanup(uuid,uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.queue_discarded_image_cleanup(uuid,uuid) TO service_role;