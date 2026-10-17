CREATE TABLE public.play_death_scenes (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 session_id uuid NOT NULL REFERENCES public.play_sessions(id) ON DELETE CASCADE,
 event_id uuid NOT NULL,
 signature text NOT NULL CHECK(signature ~ '^[0-9a-f]{64}$'),
 take integer NOT NULL DEFAULT 0 CHECK(take BETWEEN 0 AND 2),
 status text NOT NULL CHECK(status IN ('pending','ready','failed')),
 scene_text text CHECK(length(scene_text) BETWEEN 10 AND 1600),
 model text,
 lease uuid NOT NULL DEFAULT gen_random_uuid(),
 lease_until timestamptz NOT NULL DEFAULT now()+interval '3 minutes',
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(session_id,event_id,signature,take),
 CHECK(status <> 'ready' OR scene_text IS NOT NULL)
);
REVOKE ALL ON public.play_death_scenes FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.play_death_scenes TO authenticated;
GRANT ALL ON public.play_death_scenes TO service_role;
ALTER TABLE public.play_death_scenes ENABLE ROW LEVEL SECURITY;
CREATE POLICY death_scene_owner ON public.play_death_scenes FOR SELECT TO authenticated USING(user_id=auth.uid());
CREATE INDEX death_scene_session ON public.play_death_scenes(user_id,session_id,created_at);

CREATE FUNCTION public.claim_death_scene(p_user_id uuid,p_session_id uuid,p_event_id uuid,p_signature text,p_take integer)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE r public.play_death_scenes; inserted_id uuid;
BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.play_sessions WHERE id=p_session_id AND user_id=p_user_id) THEN
  RAISE EXCEPTION 'Session unavailable' USING ERRCODE='42501';
 END IF;
 INSERT INTO public.play_death_scenes(user_id,session_id,event_id,signature,take,status)
 VALUES(p_user_id,p_session_id,p_event_id,p_signature,p_take,'pending')
 ON CONFLICT(session_id,event_id,signature,take) DO NOTHING RETURNING id INTO inserted_id;
 SELECT * INTO r FROM public.play_death_scenes WHERE session_id=p_session_id AND event_id=p_event_id AND signature=p_signature AND take=p_take FOR UPDATE;
 IF r.status='ready' THEN RETURN jsonb_build_object('action','cached','id',r.id,'text',r.scene_text,'model',r.model); END IF;
 IF inserted_id IS NULL AND r.status='pending' AND r.lease_until>now() THEN RETURN jsonb_build_object('action','busy','id',r.id); END IF;
 IF inserted_id IS NULL THEN
  UPDATE public.play_death_scenes SET status='pending',lease=gen_random_uuid(),lease_until=now()+interval '3 minutes'
  WHERE id=r.id RETURNING * INTO r;
 END IF;
 RETURN jsonb_build_object('action','generate','id',r.id,'lease',r.lease);
END $$;
REVOKE ALL ON FUNCTION public.claim_death_scene(uuid,uuid,uuid,text,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.claim_death_scene(uuid,uuid,uuid,text,integer) TO service_role;