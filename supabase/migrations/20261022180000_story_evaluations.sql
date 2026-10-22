-- Evaluation corpus only: never read by normal story generation or game history.
CREATE TABLE public.story_evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence bigint GENERATED ALWAYS AS IDENTITY UNIQUE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id uuid,
  kind text NOT NULL CHECK(kind IN ('opening','ending')),
  schema_version integer NOT NULL DEFAULT 1 CHECK(schema_version=1),
  prompt_version text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  status text NOT NULL DEFAULT 'generating' CHECK(status IN ('generating','complete','incomplete','failed','cancelled')),
  model text,
  system_prompt text NOT NULL,
  user_prompt text NOT NULL,
  model_context jsonb NOT NULL,
  diagnostic_context jsonb,
  diagnostic_status text NOT NULL CHECK(diagnostic_status IN ('provided','not_provided','invalid')),
  story_text text NOT NULL DEFAULT '',
  word_count integer NOT NULL DEFAULT 0 CHECK(word_count >= 0),
  duration_ms integer,
  finish_reason text,
  error_code text
);
CREATE INDEX story_evaluations_owner_sequence ON public.story_evaluations(user_id,sequence);
CREATE INDEX story_evaluations_owner_game ON public.story_evaluations(user_id,game_id);
REVOKE ALL ON public.story_evaluations FROM PUBLIC,anon,authenticated;
GRANT SELECT,DELETE ON public.story_evaluations TO authenticated;
GRANT ALL ON public.story_evaluations TO service_role;
GRANT USAGE,SELECT ON SEQUENCE public.story_evaluations_sequence_seq TO service_role;
ALTER TABLE public.story_evaluations ENABLE ROW LEVEL SECURITY;
CREATE POLICY read_own_story_evaluations ON public.story_evaluations FOR SELECT TO authenticated USING(user_id=auth.uid());
CREATE POLICY delete_own_story_evaluations ON public.story_evaluations FOR DELETE TO authenticated USING(user_id=auth.uid());
COMMENT ON TABLE public.story_evaluations IS 'Private evaluation corpus. Each validated generation request is a separate attempt, including retries. Retained independently of game history; owner may delete. No historical reconstruction.';
COMMENT ON COLUMN public.story_evaluations.model_context IS 'Validated facts actually used to build user_prompt; diagnostic_context is never supplied to the model.';
COMMENT ON COLUMN public.story_evaluations.story_text IS 'Full normalized text emitted by the server, including partial output. Does not assert browser receipt or final selection for game history.';
