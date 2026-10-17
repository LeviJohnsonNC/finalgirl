CREATE TABLE public.play_sessions (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  revision bigint NOT NULL DEFAULT 1 CHECK (revision > 0),
  state jsonb NOT NULL CHECK (jsonb_typeof(state) = 'object' AND octet_length(state::text) <= 1000000),
  closed boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON public.play_sessions FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.play_sessions TO authenticated;
GRANT ALL ON public.play_sessions TO service_role;
ALTER TABLE public.play_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY play_sessions_owner ON public.play_sessions FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE INDEX play_sessions_resume ON public.play_sessions(user_id, closed, updated_at DESC);

CREATE FUNCTION public.save_play_session(p_id uuid, p_revision bigint, p_state jsonb, p_closed boolean DEFAULT false)
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
  IF p_revision = 0 THEN
    INSERT INTO public.play_sessions(id,user_id,state,closed) VALUES(p_id,auth.uid(),p_state,p_closed)
      ON CONFLICT (id) DO NOTHING;
  END IF;
  SELECT * INTO current_row FROM public.play_sessions WHERE id=p_id AND user_id=auth.uid() FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Play session unavailable' USING ERRCODE='42501'; END IF;
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

ALTER TABLE public.game_history ADD COLUMN rounds_played integer CHECK (rounds_played BETWEEN 1 AND 999);
ALTER TABLE public.game_history ADD COLUMN play_events jsonb CHECK (play_events IS NULL OR jsonb_typeof(play_events)='array' AND jsonb_array_length(play_events)<=1000 AND octet_length(play_events::text)<=750000);
DROP FUNCTION public.get_game_history_summary();
CREATE FUNCTION public.get_game_history_summary() RETURNS SETOF jsonb LANGUAGE sql STABLE SECURITY INVOKER SET search_path=public AS $$
 SELECT (to_jsonb(g) - 'intro_story' - 'ending_narration' - 'game_highlights' - 'visual_bible' - 'play_events' - 'poster_image_url' - 'scene_image_url') || jsonb_build_object(
  'poster_image_url',CASE WHEN g.poster_image_url LIKE 'data:%' THEN NULL ELSE g.poster_image_url END,
  'scene_image_url',CASE WHEN g.scene_image_url LIKE 'data:%' THEN NULL ELSE g.scene_image_url END,
  'has_legacy_poster',coalesce(g.poster_image_url LIKE 'data:%',false),
  'has_legacy_scene',coalesce(g.scene_image_url LIKE 'data:%',false))
 FROM public.game_history g WHERE user_id=auth.uid() ORDER BY timestamp DESC;
$$;
REVOKE ALL ON FUNCTION public.get_game_history_summary() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_game_history_summary() TO authenticated;