-- Schema only. The photographed secret catalog and images are provisioned
-- privately after this migration; never put their identities in Git history.
CREATE TABLE public.final_girl_unlocks (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  girl text NOT NULL CHECK (girl = ANY(ARRAY['Rena','Gwynn','Janelle','Octavia','Alice','Ava','Tali','Gretel','Ginny','Veronica','Heather','Selena','Charlie','Maureen','Red','Sheila','Adrianne','Vicky','Adelaide','Joy','Nancy','Mandy','Cassie','Barbara','Ellen','Jenette','Kat','Reiko','Laurie','Uki','Asami','Kate'])),
  unlocked boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(user_id,girl)
);
REVOKE ALL ON public.final_girl_unlocks FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.final_girl_unlocks TO authenticated;
GRANT ALL ON public.final_girl_unlocks TO service_role;
ALTER TABLE public.final_girl_unlocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_final_girl_unlocks ON public.final_girl_unlocks FOR ALL TO authenticated
  USING(user_id=auth.uid()) WITH CHECK(user_id=auth.uid());

CREATE TABLE public.final_girl_secret_items (
  girl text PRIMARY KEY,
  name text NOT NULL CHECK(length(name) BETWEEN 1 AND 100),
  effect text NOT NULL CHECK(length(effect) BETWEEN 1 AND 2000),
  image_path text NOT NULL UNIQUE CHECK(image_path ~ '^[a-f0-9-]{36}\.webp$'),
  source text NOT NULL DEFAULT 'Owner photo IMG_9328.jpg'
);
REVOKE ALL ON public.final_girl_secret_items FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.final_girl_secret_items TO authenticated;
GRANT ALL ON public.final_girl_secret_items TO service_role;
ALTER TABLE public.final_girl_secret_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY revealed_final_girl_item ON public.final_girl_secret_items FOR SELECT TO authenticated
  USING(EXISTS(SELECT 1 FROM public.final_girl_unlocks u WHERE u.user_id=auth.uid() AND u.girl=final_girl_secret_items.girl AND u.unlocked));

CREATE FUNCTION public.get_final_girl_unlocks(p_owner uuid DEFAULT auth.uid()) RETURNS SETOF jsonb
LANGUAGE sql STABLE SECURITY INVOKER SET search_path=public AS $$
  SELECT jsonb_build_object('girl',girl,'unlocked',unlocked) FROM public.final_girl_unlocks WHERE user_id=auth.uid() AND auth.uid()=p_owner;
$$;
CREATE FUNCTION public.set_final_girl_unlock(p_girl text,p_unlocked boolean,p_owner uuid DEFAULT auth.uid()) RETURNS SETOF jsonb
LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
BEGIN
  IF auth.uid() IS NULL OR auth.uid() IS DISTINCT FROM p_owner OR p_unlocked IS NULL THEN RAISE EXCEPTION 'Sign in to save your unlocks' USING ERRCODE='42501'; END IF;
  INSERT INTO public.final_girl_unlocks(user_id,girl,unlocked) VALUES(auth.uid(),p_girl,p_unlocked)
    ON CONFLICT(user_id,girl) DO UPDATE SET unlocked=excluded.unlocked,updated_at=now();
  RETURN QUERY SELECT * FROM public.get_final_girl_unlocks();
END $$;
CREATE FUNCTION public.get_final_girl_item(p_girl text,p_owner uuid DEFAULT auth.uid()) RETURNS jsonb
LANGUAGE sql STABLE SECURITY INVOKER SET search_path=public AS $$
  SELECT jsonb_build_object('girl',girl,'name',name,'effect',effect,'image_path',image_path)
    FROM public.final_girl_secret_items WHERE girl=p_girl AND auth.uid()=p_owner;
$$;
REVOKE ALL ON FUNCTION public.get_final_girl_unlocks(uuid),public.set_final_girl_unlock(text,boolean,uuid),public.get_final_girl_item(text,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.get_final_girl_unlocks(uuid),public.set_final_girl_unlock(text,boolean,uuid),public.get_final_girl_item(text,uuid) TO authenticated;

INSERT INTO storage.buckets(id,name,public) VALUES('final-girl-secret-items','final-girl-secret-items',false);
CREATE POLICY unlocked_item_photo ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id='final-girl-secret-items' AND EXISTS(
    SELECT 1 FROM public.final_girl_secret_items i WHERE i.image_path=storage.objects.name
  )
);
-- Never make this bucket public or expose it through a public poster URL.

ALTER TABLE public.game_history ADD COLUMN final_girl_max_health integer CHECK(final_girl_max_health BETWEEN 1 AND 10);
COMMENT ON COLUMN public.game_history.final_girl_max_health IS 'Session-specific reference. NULL preserves legacy interpretation; never backfill from a changed catalog.';
