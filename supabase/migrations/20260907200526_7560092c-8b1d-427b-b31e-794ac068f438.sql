-- Remove the bring-your-own-key mechanism.
--
-- Image generation now runs on the platform's Lovable AI Gateway key, so this
-- table holds nothing but third-party credentials the app can no longer use.
-- Dropping it removes those stored secrets rather than leaving them orphaned.
--
-- Irreversible: any keys users saved here are deleted. They remain valid with
-- their original providers; only our copy goes away.

DROP POLICY IF EXISTS "Users can view their own API keys" ON public.user_api_keys;
DROP POLICY IF EXISTS "Users can insert their own API keys" ON public.user_api_keys;
DROP POLICY IF EXISTS "Users can update their own API keys" ON public.user_api_keys;
DROP POLICY IF EXISTS "Users can delete their own API keys" ON public.user_api_keys;

DROP TABLE IF EXISTS public.user_api_keys;