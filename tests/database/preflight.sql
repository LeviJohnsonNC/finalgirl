-- Read-only production preflight. No gameplay or account data is returned.
SELECT to_regprocedure('public.reserve_ai_usage(uuid,text,integer,integer)') AS allowance_function,
       to_regprocedure('public.apply_collection_delta(text[],text[])') AS collection_function;
SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check
FROM pg_policies
WHERE (schemaname = 'storage' AND tablename = 'objects')
   OR (schemaname = 'public' AND tablename IN ('game_history','user_settings','ai_usage_events'))
ORDER BY schemaname, tablename, policyname;
SELECT table_name, column_name, data_type FROM information_schema.columns
WHERE table_schema = 'public' AND table_name IN ('game_history','user_settings','ai_usage_events')
ORDER BY table_name, ordinal_position;
