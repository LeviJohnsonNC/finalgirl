// Thin client for the Lovable AI Gateway (OpenAI-compatible surface).
//
// Everything AI in this app goes through here so that retry, credit/rate-limit
// handling and model fallback are written once. Callers get a typed
// GatewayError they can map to a user-facing message.
import { IMAGE_MODEL_CANDIDATES, TEXT_MODEL_CANDIDATES, usesResponsesApi } from "./models.ts";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const RESPONSES_URL = "https://ai.gateway.lovable.dev/v1/responses";

export type GatewayErrorKind =
  | "no_key"
  | "rate_limit"
  | "credits"
  | "model_unavailable"
  | "content_policy"
  | "empty_response"
  | "upstream";

export class GatewayError extends Error {
  constructor(readonly kind: GatewayErrorKind, message: string, readonly status = 500) {
    super(message);
    this.name = "GatewayError";
  }
}

/** Message shown to the player. Never leaks provider details. */
export const userFacingMessage = (err: unknown): string => {
  if (err instanceof GatewayError) {
    switch (err.kind) {
      case "rate_limit":
        return "The projector is overheating. Try again in a moment.";
      case "credits":
        return "AI credits depleted. Please add credits to continue.";
      case "content_policy":
        return "That scene was too dark even for the censors. Try regenerating.";
      default:
        return "The reel jammed. Try again.";
    }
  }
  return "The reel jammed. Try again.";
};

/** HTTP status to hand back to the client for a given failure. */
export const statusFor = (err: unknown): number =>
  err instanceof GatewayError && (err.status === 429 || err.status === 402) ? err.status : 500;

const apiKey = () => {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new GatewayError("no_key", "LOVABLE_API_KEY is not configured");
  return key;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const classify = (status: number, body: string): GatewayError => {
  if (status === 429) return new GatewayError("rate_limit", "Gateway rate limit", 429);
  if (status === 402) return new GatewayError("credits", "AI credits depleted", 402);
  if (status === 400 && /safety|content.?polic|blocked/i.test(body)) {
    return new GatewayError("content_policy", "Prompt rejected by content policy", 400);
  }
  if (status === 404 || (status === 400 && /model/i.test(body))) {
    return new GatewayError("model_unavailable", `Model rejected by gateway: ${body.slice(0, 200)}`, status);
  }
  return new GatewayError("upstream", `Gateway error ${status}: ${body.slice(0, 200)}`, status);
};

interface GatewayCall {
  model: string;
  messages: Array<{ role: string; content: unknown }>;
  modalities?: string[];
  max_tokens?: number;
  temperature?: number;
}

/**
 * POSTs one request, retrying once on a transient failure (5xx or rate limit).
 * Model-level rejections are thrown immediately so the caller can fall back.
 */
const post = async (body: GatewayCall): Promise<Record<string, unknown>> => {
  let lastError: GatewayError | null = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt > 0) await sleep(600);

    const response = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey()}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (response.ok) return await response.json();

    const text = await response.text().catch(() => "");
    const error = classify(response.status, text);
    console.error(`Gateway ${body.model} failed:`, response.status, text.slice(0, 300));

    // Not worth a second attempt — either the model is wrong or the account is out.
    if (error.kind === "model_unavailable" || error.kind === "credits" || error.kind === "content_policy") {
      throw error;
    }
    lastError = error;
  }

  throw lastError ?? new GatewayError("upstream", "Gateway request failed");
};

/**
 * Runs `call` against each candidate model in turn, moving on only when a model
 * is rejected as unknown/unavailable. Returns the result plus the model that
 * answered, so usage logging records what was really billed.
 */
const withModelFallback = async <T>(
  candidates: string[],
  call: (model: string) => Promise<T>,
): Promise<{ result: T; model: string }> => {
  let lastError: unknown;

  for (const model of candidates) {
    try {
      return { result: await call(model), model };
    } catch (err) {
      lastError = err;
      if (err instanceof GatewayError && err.kind === "model_unavailable") {
        console.warn(`Model ${model} unavailable, trying next candidate`);
        continue;
      }
      throw err;
    }
  }

  throw lastError ?? new GatewayError("model_unavailable", "No candidate model was available");
};

// ---------------------------------------------------------------------------
// Responses API (/v1/responses) — used for `openai/*` text models.
//
// Every call here streams, because reasoning-capable models can run for minutes
// and a buffered request would be severed by a platform timeout. No reasoning
// options are requested: these are one-shot generations and the app never shows
// a thinking trace. No abort/deadline is ever wrapped around these fetches.
// ---------------------------------------------------------------------------

/** Opens a streaming /v1/responses request and hands back the raw SSE body. */
const postResponsesStream = async (
  model: string,
  system: string,
  user: string,
): Promise<ReadableStream<Uint8Array>> => {
  const key = apiKey();
  const response = await fetch(RESPONSES_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Lovable-API-Key": key,
      "Content-Type": "application/json",
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model,
      // No temperature / max_completion_tokens: these models reject a non-default
      // temperature, and length limits live in the prompt text instead.
      input: [
        { role: "system", content: [{ type: "input_text", text: system }] },
        { role: "user", content: [{ type: "input_text", text: user }] },
      ],
      stream: true,
      store: false,
    }),
  });

  if (!response.ok || !response.body) {
    const text = await response.text().catch(() => "");
    console.error(`Responses ${model} failed:`, response.status, text.slice(0, 300));
    throw classify(response.status, text);
  }
  return response.body;
};

/** Walks SSE frames out of a byte stream, yielding each parsed `data:` payload. */
const eachSseEvent = (chunk: string, buffer: string, onEvent: (event: Record<string, unknown>) => void): string => {
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
      try {
        onEvent(JSON.parse(payload));
      } catch {
        /* ignore malformed frame */
      }
    }
  }
  return buffer;
};

/**
 * Re-emits a /v1/responses SSE stream in the OpenAI chat-completions frame shape
 * the browser already parses, so the client stays untouched.
 */
const responsesToChatFrames = (
  upstream: ReadableStream<Uint8Array>,
  model: string,
): ReadableStream<Uint8Array> => {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  return upstream.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        buffer = eachSseEvent(decoder.decode(chunk, { stream: true }), buffer, (event) => {
          if (event.type === "response.output_text.delta" && typeof event.delta === "string") {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ model, choices: [{ delta: { content: event.delta } }] })}\n\n`,
              ),
            );
          }
        });
      },
      flush(controller) {
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      },
    }),
  );
};

/** Consumes a streaming /v1/responses call and returns the joined text. */
const collectResponsesText = async (model: string, system: string, user: string): Promise<string> => {
  const upstream = await postResponsesStream(model, system, user);
  const reader = upstream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer = eachSseEvent(decoder.decode(value, { stream: true }), buffer, (event) => {
      if (event.type === "response.output_text.delta" && typeof event.delta === "string") {
        text += event.delta;
      }
    });
  }

  return text.trim();
};

/** Turns a token budget into a prompt-level word limit for models that reject max_tokens. */
const lengthHint = (maxTokens?: number): string =>
  maxTokens ? `\n\nHard limit: keep the response under ${Math.max(40, Math.round(maxTokens * 0.7))} words.` : "";

/**
 * Short internal text completion (shot briefs, visual bible). Streams under the
 * hood on the Responses path and returns the finished text either way.
 */
export const generateText = async (opts: {
  system: string;
  user: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<{ text: string; model: string }> => {
  const { result, model } = await withModelFallback(TEXT_MODEL_CANDIDATES, async (model) => {
    if (usesResponsesApi(model)) {
      const text = await collectResponsesText(
        model,
        opts.system + lengthHint(opts.maxTokens),
        opts.user,
      );
      if (!text) throw new GatewayError("empty_response", "Gateway returned no text");
      return text;
    }

    const data = await post({
      model,
      messages: [
        { role: "system", content: opts.system },
        { role: "user", content: opts.user },
      ],
      max_tokens: opts.maxTokens ?? 400,
      temperature: opts.temperature ?? 0.9,
    });

    const choices = data.choices as Array<{ message?: { content?: string } }> | undefined;
    const text = choices?.[0]?.message?.content?.trim();
    if (!text) throw new GatewayError("empty_response", "Gateway returned no text");
    return text;
  });

  return { text: result, model };
};

/**
 * Image generation. The gateway exposes images through the chat surface with
 * `modalities`, but the exact response shape varies by provider, so every known
 * carrier is checked before giving up.
 */
export const generateImage = async (
  prompt: string,
): Promise<{ base64: string; mimeType: string; model: string }> => {
  const { result, model } = await withModelFallback(IMAGE_MODEL_CANDIDATES, async (model) => {
    const data = await post({
      model,
      messages: [{ role: "user", content: prompt }],
      modalities: ["image", "text"],
    });

    const image = extractImage(data);
    if (!image) {
      console.error("No image in gateway response:", JSON.stringify(data).slice(0, 500));
      throw new GatewayError("empty_response", "Gateway returned no image");
    }
    return image;
  });

  return { ...result, model };
};

/** Pulls a base64 image out of any of the response shapes the gateway may use. */
const extractImage = (data: Record<string, unknown>): { base64: string; mimeType: string } | null => {
  const fromDataUri = (uri: string) => {
    const match = uri.match(/^data:([^;]+);base64,(.+)$/);
    return match ? { mimeType: match[1], base64: match[2] } : null;
  };

  // OpenAI-compatible multimodal chat: choices[].message.images[].image_url.url
  const choices = data.choices as
    | Array<{ message?: { images?: Array<{ image_url?: { url?: string } }> } }>
    | undefined;
  const chatUrl = choices?.[0]?.message?.images?.[0]?.image_url?.url;
  if (chatUrl) return fromDataUri(chatUrl) ?? { mimeType: "image/png", base64: chatUrl };

  // Images API shape: data[].b64_json
  const images = data.data as Array<{ b64_json?: string }> | undefined;
  if (images?.[0]?.b64_json) return { mimeType: "image/png", base64: images[0].b64_json! };

  // Native Gemini shape, in case the gateway passes it through untouched.
  const candidates = data.candidates as
    | Array<{ content?: { parts?: Array<{ inlineData?: { mimeType: string; data: string } }> } }>
    | undefined;
  const inline = candidates?.[0]?.content?.parts?.find((p) => p.inlineData)?.inlineData;
  if (inline) return { mimeType: inline.mimeType, base64: inline.data };

  return null;
};

/**
 * Streaming chat completion. Returns the raw SSE body for the caller to forward
 * to the browser, having already walked the model fallback chain — so a retired
 * model id degrades to the next candidate instead of failing the request.
 */
export const streamChat = async (opts: {
  system: string;
  user: string;
}): Promise<{ body: ReadableStream<Uint8Array>; model: string }> => {
  const { result, model } = await withModelFallback(TEXT_MODEL_CANDIDATES, async (model) => {
    const response = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey()}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: opts.system },
          { role: "user", content: opts.user },
        ],
        stream: true,
      }),
    });

    if (!response.ok || !response.body) {
      const text = await response.text().catch(() => "");
      console.error(`Gateway stream ${model} failed:`, response.status, text.slice(0, 300));
      throw classify(response.status, text);
    }
    return response.body;
  });

  return { body: result, model };
};
