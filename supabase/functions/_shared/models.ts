// Single home for the model ids every AI function uses.
//
// Model availability on the Lovable AI Gateway changes over time, so each slot
// is a candidate chain rather than one hardcoded id: the gateway helper walks
// the chain when a model is rejected as unknown/unavailable and logs whichever
// one answered. Set LOVABLE_TEXT_MODEL / LOVABLE_IMAGE_MODEL in the platform
// secret store to pin a specific model without a code change — the override is
// tried first and the chain remains as a safety net.
//
// Run the `ai-capabilities` function against the gateway to see what is
// actually on offer before changing these.

const envOverride = (name: string): string[] => {
  const value = Deno.env.get(name)?.trim();
  return value ? [value] : [];
};

// Text: story, ending, shot briefs, visual bible. Cheap Flash-tier only —
// nothing here needs a frontier model.
export const TEXT_MODEL_CANDIDATES: string[] = [
  ...envOverride("LOVABLE_TEXT_MODEL"),
  "google/gemini-3.5-flash",
  "google/gemini-2.5-flash",
  "google/gemini-2.5-flash-lite",
];

// Image: opening scene still and closing poster.
export const IMAGE_MODEL_CANDIDATES: string[] = [
  ...envOverride("LOVABLE_IMAGE_MODEL"),
  "google/gemini-3.1-flash-image",
  "google/gemini-2.5-flash-image",
  "google/gemini-2.5-flash-image-preview",
];

export const TEXT_MODEL = TEXT_MODEL_CANDIDATES[0];
export const IMAGE_MODEL = IMAGE_MODEL_CANDIDATES[0];
