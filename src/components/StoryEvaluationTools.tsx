import { useEffect, useRef, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  downloadStoryEvaluations,
  loadStoryEvaluations,
} from "@/lib/storyEvaluationExport";

export function StoryEvaluationTools() {
  const { user, isAuthReady } = useAuth();
  const [confirmClear, setConfirmClear] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const owner = user?.id;
  const currentOwner = useRef(owner);
  currentOwner.current = owner;
  const pending = useRef<AbortController | null>(null);
  useEffect(() => {
    setMessage("");
    setConfirmClear(false);
    setBusy(false);
    return () => {
      pending.current?.abort();
      pending.current = null;
    };
  }, [owner]);
  if (!isAuthReady || !owner) return null;

  async function run(clear = false) {
    if (pending.current) return;
    const controller = new AbortController();
    pending.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 120000);
    setBusy(true);
    setMessage("");
    try {
      if (clear) {
        const { error } = await supabase
          .from("story_evaluations" as never)
          .delete()
          .eq("user_id", owner)
          .abortSignal(controller.signal);
        if (error) throw error;
        if (currentOwner.current === owner && !controller.signal.aborted)
          setMessage(
            "Evaluation data cleared. New stories will start a new set.",
          );
      } else {
        const attempts = await loadStoryEvaluations(owner, controller.signal);
        if (currentOwner.current !== owner || controller.signal.aborted) return;
        if (!attempts.length)
          setMessage(
            "No evaluation data yet. Generate a new opening or ending, then export again.",
          );
        else {
          downloadStoryEvaluations(attempts);
          setMessage(
            `Exported ${attempts.length} generation attempts, including any retries and partial stories.`,
          );
        }
      }
    } catch {
      if (currentOwner.current === owner && pending.current === controller) {
        const text = clear
          ? "Evaluation data could not be cleared. Please retry."
          : "Evaluation export failed. Nothing was downloaded. Check your connection and try again.";
        setMessage(text);
        toast.error(text);
        if (clear) throw new Error(text);
      }
    } finally {
      window.clearTimeout(timeout);
      if (pending.current === controller) {
        pending.current = null;
        setBusy(false);
      }
    }
  }

  return (
    <details className="collection-evaluation">
      <summary className="cursor-pointer text-sm font-medium">
        Story evaluation
      </summary>
      <div className="mt-2 space-y-2 text-xs leading-relaxed text-muted-foreground">
        <p>
          Export new openings and endings with their full text, prompts, model
          details and game context for review.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => void run()}
            className="inline-flex min-h-[44px] items-center gap-2 border border-primary/40 px-3 py-2 type-label text-primary hover:bg-primary/10 disabled:opacity-50"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {busy ? "PLEASE WAIT" : "EXPORT JSON"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => setConfirmClear(true)}
            className="inline-flex min-h-[44px] items-center underline underline-offset-4 hover:text-foreground disabled:opacity-50"
          >
            Clear evaluation data
          </button>
        </div>
        <p>
          Includes private notes. Evaluation copies survive resetting your
          plays; clear them here. Wait for generation to finish before clearing.
          Older stories aren’t backfilled.
        </p>
        <p role="status" aria-live="polite">
          {message}
        </p>
      </div>
      <DeleteConfirmModal
        isOpen={confirmClear}
        onClose={() => setConfirmClear(false)}
        confirmationKey={owner}
        onConfirm={() => run(true)}
        title="Clear evaluation data?"
        description="Permanently clear your saved story evaluation data? Your games and stories in game history will remain available. This cannot be undone."
        confirmLabel="Clear evaluation data"
      />
    </details>
  );
}
