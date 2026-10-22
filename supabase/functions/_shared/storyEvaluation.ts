import type { GuardResult } from "./guard.ts";
import { effectiveTextSystem, streamChat } from "./aiGateway.ts";

type Guard = Extract<GuardResult, { ok: true }>;
type EvaluationStatus = "complete" | "incomplete" | "failed" | "cancelled";
const TIMEOUT_MS = 5000;

/** Optional, untrusted client diagnostics. Kept separate from validated model facts.
 * Refuse an oversized snapshot rather than silently truncate an evaluation log. */
export function evaluationMetadata(request: unknown) {
  const value = (request as { evaluation?: unknown } | null)?.evaluation;
  if (value === undefined)
    return {
      game_id: null,
      diagnostic_context: null,
      diagnostic_status: "not_provided",
    };
  if (!value || typeof value !== "object" || Array.isArray(value))
    return {
      game_id: null,
      diagnostic_context: null,
      diagnostic_status: "invalid",
    };
  const { gameId, context } = value as { gameId?: unknown; context?: unknown };
  const id =
    typeof gameId === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      gameId,
    )
      ? gameId.toLowerCase()
      : null;
  const valid =
    !!context &&
    typeof context === "object" &&
    !Array.isArray(context) &&
    new TextEncoder().encode(JSON.stringify(context)).length <= 2_000_000;
  return {
    game_id: id,
    diagnostic_context: valid ? context : null,
    diagnostic_status: valid && id ? "provided" : "invalid",
  };
}

/** Observes the same bytes sent to the browser, with backpressure and cancellation.
 * DONE alone is not proof of completion: the gateway may synthesize it at EOF. */
export function observeStoryStream(
  upstream: ReadableStream<Uint8Array>,
  finalize: (result: {
    status: EvaluationStatus;
    story_text: string;
    word_count: number;
    finish_reason: string | null;
    error_code: string | null;
  }) => Promise<boolean>,
  id: string | null,
): ReadableStream<Uint8Array> {
  const reader = upstream.getReader(),
    decoder = new TextDecoder(),
    encoder = new TextEncoder();
  let buffer = "",
    text = "",
    reason: string | null = null,
    error: string | null = null,
    finalized = false,
    cancelled = false;
  function consume(chunk: string) {
    buffer += chunk;
    let index: number;
    while ((index = buffer.indexOf("\n\n")) !== -1) {
      const frame = buffer.slice(0, index);
      buffer = buffer.slice(index + 2);
      for (const line of frame.split("\n")) {
        if (!line.trim().startsWith("data:")) continue;
        const payload = line.trim().slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const event = JSON.parse(payload);
          const choice = event.choices?.[0];
          if (typeof choice?.delta?.content === "string")
            text += choice.delta.content;
          if (typeof choice?.finish_reason === "string")
            reason = choice.finish_reason;
          // Never persist upstream error bodies: they can contain private provider details.
          if (event.error) error = "upstream_stream_error";
        } catch {
          error = "malformed_stream_frame";
        }
      }
    }
  }
  async function finish(status?: EvaluationStatus) {
    if (finalized) return false;
    finalized = true;
    consume(decoder.decode() + "\n\n");
    const finalStatus =
      status ??
      (error
        ? text.trim()
          ? "incomplete"
          : "failed"
        : !text.trim()
          ? "failed"
          : reason === "stop"
            ? "complete"
            : "incomplete");
    return finalize({
      status: finalStatus,
      story_text: text,
      word_count: text.trim() ? text.trim().split(/\s+/u).length : 0,
      finish_reason: reason,
      error_code: error ?? (!text.trim() ? "empty_output" : null),
    });
  }
  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const { value, done } = await reader.read();
        if (cancelled) return;
        if (!done) {
          consume(decoder.decode(value, { stream: true }));
          controller.enqueue(value);
          return;
        }
        const saved = await finish();
        if (cancelled) return;
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ evaluation: { id, saved } })}\n\n`,
          ),
        );
        controller.close();
        reader.releaseLock();
      } catch (cause) {
        error = "stream_transport_error";
        await finish(text.trim() ? "incomplete" : "failed");
        controller.error(cause);
        reader.releaseLock();
      }
    },
    async cancel(reason) {
      cancelled = true;
      try {
        await reader.cancel(reason);
      } finally {
        await finish("cancelled");
        reader.releaseLock();
      }
    },
  });
}

/** Every validated request gets its own record; telemetry failures never cost a story. */
export async function generateEvaluatedStory(options: {
  guard: Guard;
  kind: "opening" | "ending";
  request: unknown;
  context: unknown;
  system: string;
  user: string;
}) {
  const { guard, kind, request, context, system, user } = options;
  const started = Date.now();
  let id: string | null = crypto.randomUUID();
  async function write(values: Record<string, unknown>, insert = false) {
    try {
      const table = guard.adminClient.from("story_evaluations");
      const query = insert
        ? table.insert(values)
        : table.update(values).eq("id", id!).eq("user_id", guard.user.id);
      const { data, error } = await query
        .select("id")
        .abortSignal(AbortSignal.timeout(TIMEOUT_MS))
        .maybeSingle();
      if (error || !data) throw new Error("Evaluation write not acknowledged");
      return true;
    } catch {
      console.warn("Story evaluation persistence unavailable", { kind, id });
      return false;
    }
  }
  const inserted = await write(
    {
      id,
      user_id: guard.user.id,
      kind,
      prompt_version: "2026-10-22-v1",
      system_prompt: effectiveTextSystem(system),
      user_prompt: user,
      model_context: context,
      ...evaluationMetadata(request),
    },
    true,
  );
  if (!inserted) id = null;
  try {
    const { body, model } = await streamChat({ system, user });
    return {
      model,
      body: observeStoryStream(
        body,
        async (result) =>
          id
            ? write({
                ...result,
                model,
                finished_at: new Date().toISOString(),
                duration_ms: Date.now() - started,
              })
            : false,
        id,
      ),
    };
  } catch (error) {
    if (id)
      await write({
        status: "failed",
        finished_at: new Date().toISOString(),
        duration_ms: Date.now() - started,
        error_code: "generation_request_failed",
      });
    throw error;
  }
}
