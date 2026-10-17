-- Additive production migration. Historical migration corrections in this PR
-- only make fresh installs replayable; do not replay old migrations in production.

CREATE OR REPLACE FUNCTION public.reserve_ai_usage(
  p_user_id uuid,
  p_function_name text,
  p_hourly_limit integer,
  p_daily_limit integer DEFAULT NULL
)
RETURNS TABLE (allowed boolean, event_id bigint, reason text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  hourly_count bigint;
  daily_count bigint;
  reserved_id bigint;
BEGIN
  IF p_user_id IS NULL OR p_function_name IS NULL OR length(p_function_name) NOT BETWEEN 1 AND 100
     OR p_hourly_limit < 1 OR p_hourly_limit IS NULL
     OR (p_daily_limit IS NOT NULL AND p_daily_limit < 1) THEN
    RAISE EXCEPTION 'Invalid usage reservation' USING ERRCODE = '22023';
  END IF;

  -- The check and insert share a transaction-scoped, per-user/function lock.
  PERFORM pg_advisory_xact_lock(hashtextextended(p_user_id::text || ':' || p_function_name, 0));
  SELECT count(*) FILTER (WHERE created_at >= now() - interval '1 hour'), count(*)
    INTO hourly_count, daily_count
    FROM public.ai_usage_events
    WHERE user_id = p_user_id AND function_name = p_function_name
      AND created_at >= now() - interval '24 hours';

  IF hourly_count >= p_hourly_limit THEN
    RETURN QUERY SELECT false, NULL::bigint, 'Hourly allowance reached'::text;
    RETURN;
  END IF;
  IF p_daily_limit IS NOT NULL AND daily_count >= p_daily_limit THEN
    RETURN QUERY SELECT false, NULL::bigint, 'Daily allowance reached'::text;
    RETURN;
  END IF;

  INSERT INTO public.ai_usage_events (user_id, function_name)
    VALUES (p_user_id, p_function_name) RETURNING id INTO reserved_id;
  RETURN QUERY SELECT true, reserved_id, NULL::text;
END;
$$;

-- Callers cannot manufacture allowance reservations or edit the ledger.
REVOKE ALL ON FUNCTION public.reserve_ai_usage(uuid, text, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_ai_usage(uuid, text, integer, integer) TO service_role;
REVOKE INSERT, UPDATE, DELETE ON public.ai_usage_events FROM anon, authenticated;
REVOKE USAGE, SELECT ON SEQUENCE public.ai_usage_events_id_seq FROM anon, authenticated;
GRANT SELECT ON public.ai_usage_events TO authenticated;
GRANT ALL ON public.ai_usage_events TO service_role;
GRANT ALL ON SEQUENCE public.ai_usage_events_id_seq TO service_role;
DROP POLICY IF EXISTS "Users can insert own usage events" ON public.ai_usage_events;

-- Collection deltas are merged under the account lock, including across tabs
-- and devices. SECURITY INVOKER retains the existing row ownership policies.
CREATE OR REPLACE FUNCTION public.apply_collection_delta(p_add text[], p_remove text[])
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  caller uuid := auth.uid();
  previous jsonb;
  merged jsonb;
BEGIN
  IF caller IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;
  IF cardinality(p_add) > 500 OR cardinality(p_remove) > 500
     OR EXISTS (SELECT 1 FROM unnest(coalesce(p_add, '{}'::text[]) || coalesce(p_remove, '{}'::text[])) id
                WHERE id IS NULL OR length(id) NOT BETWEEN 1 AND 100) THEN
    RAISE EXCEPTION 'Invalid collection change' USING ERRCODE = '22023';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(caller::text || ':collection', 0));
  SELECT owned_films INTO previous FROM public.user_settings WHERE user_id = caller;
  previous := coalesce(previous, '[]'::jsonb);
  IF jsonb_typeof(previous) <> 'array' THEN previous := '[]'::jsonb; END IF;
  SELECT coalesce(jsonb_agg(value ORDER BY first_position), '[]'::jsonb) INTO merged
  FROM (
    SELECT value, min(position) AS first_position
    FROM (
      SELECT value, ordinality AS position
        FROM jsonb_array_elements_text(previous) WITH ORDINALITY
        WHERE NOT value = ANY(coalesce(p_remove, '{}'::text[]))
      UNION ALL
      SELECT value, jsonb_array_length(previous) + ordinality
        FROM unnest(coalesce(p_add, '{}'::text[])) WITH ORDINALITY AS additions(value, ordinality)
    ) changes
    GROUP BY value
  ) deduplicated;
  INSERT INTO public.user_settings (user_id, owned_films) VALUES (caller, merged)
    ON CONFLICT (user_id) DO UPDATE SET owned_films = EXCLUDED.owned_films;
  RETURN merged;
END;
$$;
REVOKE ALL ON FUNCTION public.apply_collection_delta(text[], text[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.apply_collection_delta(text[], text[]) TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_settings TO authenticated;

-- Reconcile all known old write policies, even if production applied only part
-- of the historical storage-policy change. Public URL reads remain supported.
DROP POLICY IF EXISTS "Anyone can upload posters" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update posters" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete posters" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow public deletes" ON storage.objects;
DROP POLICY IF EXISTS "Public can view posters" ON storage.objects;
DROP POLICY IF EXISTS "Posters are publicly readable" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own posters" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own posters" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own posters" ON storage.objects;
DROP POLICY IF EXISTS "Users can list their own posters" ON storage.objects;
CREATE POLICY "Users can upload their own posters" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'posters' AND (storage.foldername(name))[1] = 'game-posters' AND (storage.foldername(name))[2] = auth.uid()::text);
CREATE POLICY "Users can update their own posters" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'posters' AND (storage.foldername(name))[1] = 'game-posters' AND (storage.foldername(name))[2] = auth.uid()::text)
  WITH CHECK (bucket_id = 'posters' AND (storage.foldername(name))[1] = 'game-posters' AND (storage.foldername(name))[2] = auth.uid()::text);
CREATE POLICY "Users can delete their own posters" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'posters' AND (storage.foldername(name))[1] = 'game-posters' AND (storage.foldername(name))[2] = auth.uid()::text);
CREATE POLICY "Users can list their own posters" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'posters' AND (storage.foldername(name))[1] = 'game-posters' AND (storage.foldername(name))[2] = auth.uid()::text);
