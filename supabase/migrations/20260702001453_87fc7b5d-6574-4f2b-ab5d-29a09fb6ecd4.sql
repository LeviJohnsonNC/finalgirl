
-- Compound index for fast per-user history fetches
CREATE INDEX IF NOT EXISTS idx_game_history_user_timestamp
  ON public.game_history (user_id, timestamp DESC);

-- Rate-limit event log (used by edge functions to cap generation cost)
CREATE TABLE IF NOT EXISTS public.ai_usage_events (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  function_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_events_user_fn_time
  ON public.ai_usage_events (user_id, function_name, created_at DESC);

GRANT SELECT, INSERT ON public.ai_usage_events TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.ai_usage_events_id_seq TO authenticated;
GRANT ALL ON public.ai_usage_events TO service_role;
GRANT ALL ON SEQUENCE public.ai_usage_events_id_seq TO service_role;

ALTER TABLE public.ai_usage_events ENABLE ROW LEVEL SECURITY;

-- Users can only see and insert their own events
CREATE POLICY "Users can view own usage events"
  ON public.ai_usage_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage events"
  ON public.ai_usage_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);
