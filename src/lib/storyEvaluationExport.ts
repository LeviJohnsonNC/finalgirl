import { supabase } from "@/integrations/supabase/client";

export interface StoryEvaluation {
  id: string;
  sequence: number;
  game_id: string | null;
  kind: "opening" | "ending";
  status: "generating" | "complete" | "incomplete" | "failed" | "cancelled";
  story_text: string;
  system_prompt: string;
  user_prompt: string;
  model_context: unknown;
  diagnostic_context: unknown;
  [key: string]: unknown;
}

// The table is read only on an explicit export, never during play or history loads.
// Keyset pagination avoids PostgREST's row cap and changing offsets. The ceiling
// excludes later attempts; an in-flight row can still finish during the export.
export async function loadStoryEvaluations(owner: string, signal: AbortSignal) {
  const table = () => supabase.from("story_evaluations" as never);
  const { data: latest, error: latestError } = await table()
    .select("sequence")
    .eq("user_id", owner)
    .order("sequence", { ascending: false })
    .limit(1)
    .abortSignal(signal);
  if (latestError) throw latestError;
  const ceiling = (latest as unknown as Array<{ sequence: number }>)?.[0]
    ?.sequence;
  const attempts: StoryEvaluation[] = [];
  if (ceiling === undefined) return attempts;
  let cursor = 0;
  while (cursor < ceiling) {
    const { data, error } = await table()
      .select("*")
      .eq("user_id", owner)
      .gt("sequence", cursor)
      .lte("sequence", ceiling)
      .order("sequence", { ascending: true })
      .limit(50)
      .abortSignal(signal);
    if (error) throw error;
    const rows = data as unknown as StoryEvaluation[];
    if (!rows?.length) break;
    attempts.push(...rows);
    const next = rows[rows.length - 1].sequence;
    if (next <= cursor)
      throw new Error("The evaluation export could not advance. Please retry.");
    cursor = next;
  }
  return attempts;
}

export function storyEvaluationDocument(attempts: StoryEvaluation[]) {
  return {
    format: "final-girl-story-evaluations",
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    attemptCount: attempts.length,
    notes: [
      "Evaluation only. This corpus is never used to generate stories in the app.",
      "Each row is a separate request, including retries. Pair opening and ending attempts by game_id; null means an older client supplied no valid ID.",
      "system_prompt includes the gateway punctuation rule. user_prompt is the exact submitted user message. model_context contains the validated facts used to build it.",
      "diagnostic_context is untrusted client-supplied selection, full recorded play log and reviewed result, never sent to the model. Check diagnostic_status for missing or invalid snapshots.",
      "story_text is the full normalized server output, including partial output. It does not prove browser receipt or which retry the player kept.",
      "complete requires an explicit provider stop signal and nonblank text. incomplete can mean an absent stop signal; generating can mean an active or interrupted server attempt. Check status before grading.",
      "Only attempts captured after deployment are included. Existing stories and historical prompts are not reconstructed.",
      "This export contains private backstories, gameplay notes and prompts. Share it only when you intend to.",
      "Evaluation data survives deletion/reset of game history. Clear it separately in Collection. Rows can finish during export; this is not a transaction snapshot.",
    ],
    attempts: attempts.map(
      ({ user_id: _owner, sequence: _sequence, ...attempt }) => attempt,
    ),
  };
}

export function downloadStoryEvaluations(attempts: StoryEvaluation[]) {
  const blob = new Blob(
    [JSON.stringify(storyEvaluationDocument(attempts), null, 2)],
    { type: "application/json" },
  );
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `final-girl-story-evaluations-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
