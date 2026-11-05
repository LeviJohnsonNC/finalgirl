// Streams tokens from an edge function that forwards an OpenAI-style SSE
// chat-completions body (as generate-story and generate-ending do).
// Calls `onToken` with each delta and returns the full accumulated text.
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export interface StreamOptions {
  functionName: string;
  body: unknown;
  onToken: (delta: string, accumulated: string) => void;
  signal?: AbortSignal;
  requireComplete?: boolean;
  onRestart?: () => void;
}

export const streamChatCompletion = async ({
  functionName,
  body,
  onToken,
  signal,
  requireComplete = false,
  onRestart,
}: StreamOptions): Promise<string> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error("You must be signed in to generate.");
  }

  const response = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      apikey: SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    // Try to parse a JSON error payload
    let message = `Request failed (${response.status})`;
    try {
      const err = await response.json();
      if (err?.error) message = err.code === 'content_policy' || err.error === 'content_filter' ? 'The AI provider declined this depiction. Your game result is safe.' : typeof err.error === 'string' ? err.error : message;
    } catch {
      /* not JSON */
    }
    if (response.status === 429) throw new Error(message || "Rate limit exceeded.");
    if (response.status === 402) throw new Error(message || "AI credits depleted.");
    throw new Error(message);
  }

  if (!response.body) throw new Error("No response body");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let accumulated = "";

  let completed = false;
  const consume = (chunk: string) => {
    buffer += chunk;
    let idx: number;
    while ((idx = buffer.indexOf("\n\n")) !== -1) {
      const frame = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      for (const line of frame.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const payload = trimmed.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        let json;
        try { json = JSON.parse(payload); }
        catch {
          if (requireComplete) throw new Error('The ending stream was interrupted. Please try again.');
          continue;
        }
        signal?.throwIfAborted();
        if (json?.recovery?.kind === 'ending' && json.recovery.state === 'reframing') {
          accumulated = '';
          completed = false;
          onToken('', '');
          onRestart?.();
          continue;
        }
        if (json?.error) {
          const policy = json.code === 'content_policy' || json.error === 'content_filter';
          throw new Error(policy ? 'The ending could not be written in a non-graphic form. Your game result is safe. You can revise your notes and try again.' : typeof json.error === 'string' ? json.error : 'The story was interrupted. Please try again.');
        }
        const choice = json?.choices?.[0];
        const finish = choice?.finish_reason?.toLowerCase();
        const nativeFinish = choice?.native_finish_reason?.toLowerCase();
        const block = (json?.promptFeedback?.blockReason ?? json?.prompt_feedback?.block_reason)?.toLowerCase();
        const policyReasons = ['content_filter','safety','blocklist','prohibited_content','spii'];
        if ([finish,nativeFinish,block].some(reason=>policyReasons.includes(reason)) || choice?.delta?.refusal || choice?.message?.refusal) throw new Error('The AI provider declined this depiction. Your game result is safe.');
        if (choice?.finish_reason) {
          completed = ['stop','end_turn'].includes(finish) && (!nativeFinish || ['stop','end_turn'].includes(nativeFinish));
          if (requireComplete && !completed) throw new Error('The ending stopped before it was finished. Please try again.');
        }
        if (json?.evaluation?.saved === false) {
          toast.warning("Generation evaluation wasn't saved", {
            description: "The evaluation archive is unavailable. This attempt won't be in your export.",
          });
        }
        const delta: string | undefined = choice?.delta?.content;
        if (delta) {
          const cleanDelta = delta.replace(/\u2014/g, ', ');
          accumulated += cleanDelta;
          onToken(cleanDelta, accumulated);
        }
      }
    }
  };

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      consume(decoder.decode(value, {stream:true}));
    }
    consume(decoder.decode() + '\n\n');
    signal?.throwIfAborted();
    if (requireComplete && !completed) throw new Error('The ending stopped before it was finished. Please try again.');
    if (!accumulated.trim()) throw new Error("The reel came back blank. Try again.");
    return accumulated;
  } finally {
    await reader.cancel().catch(()=>{});
    reader.releaseLock();
  }
};
