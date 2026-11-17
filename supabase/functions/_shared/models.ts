// Single home for the model ids every AI function uses.
//
// Model availability on the Lovable AI Gateway changes over time, so each slot
// is a candidate chain rather than one hardcoded id: the gateway helper walks
// the chain when a model is rejected as unknown/unavailable and logs whichever
// one answered. Set LOVABLE_TEXT_MODEL / LOVABLE_IMAGE_MODEL in the platform
// secret store to pin a specific model without a code change — the override is
// tried first and the chain remains as a safety net when using Lovable.
//
// Two text slots, deliberately: PROSE is what the player reads, UTILITY is what
// only the image model reads. See the comments on each below.
//
// The diagnostic `ai-capabilities` can check available models for either provider.

const envOverride = (name: string): string[] => {
  const value = Deno.env.get(name)?.trim();
  return value ? [value] : [];
};

type AIProvider = "lovable" | "openai";

function configuredProvider(name: string): AIProvider {
  const value = Deno.env.get(name)?.trim().toLowerCase();
  if (!value || value === "lovable") return "lovable";
  if (value === "openai") return "openai";
  throw new Error(`${name} must be lovable or openai`);
}

// A key can be staged before any production traffic is switched.
export const TEXT_PROVIDER = configuredProvider("AI_TEXT_PROVIDER");
export const IMAGE_PROVIDER = configuredProvider("AI_IMAGE_PROVIDER");

export const OPENAI_MODELS = {
  prose: Deno.env.get("OPENAI_TEXT_MODEL")?.trim() || "gpt-5.6-sol",
  utility: Deno.env.get("OPENAI_UTILITY_MODEL")?.trim() || "gpt-6-luna",
  death: Deno.env.get("OPENAI_DEATH_MODEL")?.trim() || "gpt-6-luna",
  image: Deno.env.get("OPENAI_IMAGE_MODEL")?.trim() || "gpt-image-2.6-sunburst",
};

// Prose the player actually reads: the intro story and the ending narration.
// Worth a strong model — this is the app's whole point.
//
// The head of the chain is an OpenAI model, which the gateway serves through the
// Responses API (/v1/responses) rather than /v1/chat/completions. `aiGateway.ts`
// routes per model id — anything starting with `openai/` takes the Responses
// path, everything else stays on chat completions — so the Gemini fallbacks below
// still work unchanged.
export const LOVABLE_TEXT_MODELS = [
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
export const UTILITY_MODEL_CANDIDATES: string[] = TEXT_PROVIDER === "openai" ? [OPENAI_MODELS.utility] : [
  ...envOverride("LOVABLE_UTILITY_MODEL"),
  "google/gemini-3.8-flash",
  "google/gemini-2.5-flash",
];

// Image: opening scene still and closing poster.
export const LOVABLE_IMAGE_MODELS = [
  ...envOverride("LOVABLE_IMAGE_MODEL"),
  "google/gemini-3-pro-image",
  "google/gemini-3.1-flash-image",
  "google/gemini-2.5-flash-image",
];

export const TEXT_MODEL_CANDIDATES = TEXT_PROVIDER === "openai" ? [OPENAI_MODELS.prose] : LOVABLE_TEXT_MODELS;
export const IMAGE_MODEL_CANDIDATES = IMAGE_PROVIDER === "openai" ? [OPENAI_MODELS.image] : LOVABLE_IMAGE_MODELS;

export const TEXT_MODEL = TEXT_MODEL_CANDIDATES[0];
export const IMAGE_MODEL = IMAGE_MODEL_CANDIDATES[0];

/** True when the gateway serves this model through /v1/responses. */
export const usesResponsesApi = (model: string): boolean => TEXT_PROVIDER === "openai" || model.startsWith("openai/");

// Short original death vignettes: a separate configurable low-latency slot.
export const DEATH_MODEL_CANDIDATES = TEXT_PROVIDER === "openai" ? [OPENAI_MODELS.death] : [
  ...envOverride('LOVABLE_DEATH_MODEL'),
  'google/gemini-3.8-flash',
  'google/gemini-2.5-flash',
];
