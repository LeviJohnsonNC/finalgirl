// Single home for the model ids every AI function uses.
//
// Model availability on the Lovable AI Gateway changes over time, so each slot
// is a candidate chain rather than one hardcoded id: the gateway helper walks
// the chain when a model is rejected as unknown/unavailable and logs whichever
// one answered. Set LOVABLE_TEXT_MODEL / LOVABLE_IMAGE_MODEL in the platform
// secret store to pin a specific model without a code change — the override is
// tried first and the chain remains as a safety net.
//
// Two text slots, deliberately: PROSE is what the player reads, UTILITY is what
// only the image model reads. See the comments on each below.
//
// Run the `ai-capabilities` function against the gateway to see what is
// actually on offer before changing these.

const envOverride = (name: string): string[] => {
  const value = Deno.env.get(name)?.trim();
  return value ? [value] : [];
};

// Prose the player actually reads: the intro story and the ending narration.
// Worth a strong model — this is the app's whole point.
//
// The head of the chain is an OpenAI model, which the gateway serves through the
// Responses API (/v1/responses) rather than /v1/chat/completions. `aiGateway.ts`
// routes per model id — anything starting with `openai/` takes the Responses
// path, everything else stays on chat completions — so the Gemini fallbacks below
// still work unchanged.
export const TEXT_MODEL_CANDIDATES: string[] = [
  ...envOverride("LOVABLE_TEXT_MODEL"),
  "openai/gpt-5.6-sol",
  "google/gemini-3.8-flash",
  "google/gemini-2.5-flash",
];

// Internal utility text: the shot brief and the visual bible. Nobody ever reads
// these — they are 60-to-70-word notes handed straight to the image model. A
// frontier model adds cost and, worse, seconds of latency in front of an already
// slow pro image call, for output the player never sees. Flash tier is the right
// tool; override with LOVABLE_UTILITY_MODEL if that ever stops being true.
export const UTILITY_MODEL_CANDIDATES: string[] = [
  ...envOverride("LOVABLE_UTILITY_MODEL"),
  "google/gemini-3.8-flash",
  "google/gemini-2.5-flash",
];

// Image: opening scene still and closing poster.
export const IMAGE_MODEL_CANDIDATES: string[] = [
  ...envOverride("LOVABLE_IMAGE_MODEL"),
  "google/gemini-3-pro-image",
  "google/gemini-3.1-flash-image",
  "google/gemini-2.5-flash-image",
];

export const TEXT_MODEL = TEXT_MODEL_CANDIDATES[0];
export const IMAGE_MODEL = IMAGE_MODEL_CANDIDATES[0];

/** True when the gateway serves this model through /v1/responses. */
export const usesResponsesApi = (model: string): boolean => model.startsWith("openai/");
