-- Duplicate removal: the table was already dropped by 20260907120100.
-- DROP POLICY ... ON a missing table still fails even with IF EXISTS.
DROP TABLE IF EXISTS public.user_api_keys;
