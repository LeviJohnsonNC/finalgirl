// Streams tokens from an edge function that forwards an OpenAI-style SSE
// chat-completions body (as generate-story and generate-ending do).
// Calls `onToken` with each delta and returns the full accumulated text.
import { supabase } from "@/integrations/supabase/client";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export interface StreamOptions {
  functionName: string;
  body: unknown;
  onToken: (delta: string, accumulated: string) => void;
  signal?: AbortSignal;
}

export const streamChatCompletion = async ({
  functionName,
  body,
  onToken,
  signal,
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
      if (err?.error) message = err.error;
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

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // Parse SSE frames: `data: {json}\n\n`
    let idx: number;
    while ((idx = buffer.indexOf("\n\n")) !== -1) {
      const frame = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);

      for (const line of frame.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const payload = trimmed.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const json = JSON.parse(payload);
          // A failure that happens after the response headers are sent can only
          // arrive as a frame. Without this it would look like a story that
          // simply stopped, with nothing shown to the reader.
          if (typeof json?.error === "string") {
            throw new Error(json.error);
          }
          const delta: string | undefined = json?.choices?.[0]?.delta?.content;
          if (delta) {
            accumulated += delta;
            onToken(delta, accumulated);
          }
        } catch (err) {
          // Rethrow our own error frame; ignore genuinely malformed JSON.
          if (err instanceof Error && !(err instanceof SyntaxError)) throw err;
        }
      }
    }
  }

  // An empty stream is a failure that reported itself as success — treat it as
  // one rather than handing back a blank story.
  if (!accumulated.trim()) {
    throw new Error("The reel came back blank. Try again.");
  }

  return accumulated;
};
