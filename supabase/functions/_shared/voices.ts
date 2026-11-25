import { DEFAULT_NARRATOR } from "./narration.ts";

/** The original narrator, and the last resort for every persona. */
export const FALLBACK_VOICE = "Blake";

export type NarrationKind = "intro" | "ending" | "death";
export type Outcome = "won" | "lost";

export interface VoicePersona {
  /** Inworld voice ids, tried in order. Always ends at FALLBACK_VOICE. */
  candidates: string[];
  /** Recorded on the usage row so we can see what actually read the line. */
  label: string;
}

// The same storyteller stays with the film. Scene and outcome change the read.
function persona(label: string, overrideName: string): VoicePersona {
  const override = Deno.env.get(overrideName)?.trim();
  const defaults = [DEFAULT_NARRATOR, "Lucian", FALLBACK_VOICE];
  return { label, candidates: [...new Set(override ? [override, ...defaults] : defaults)] };
}

export const PERSONAS = {
  dread: persona("dread", "INWORLD_VOICE_DREAD"),
  survivor: persona("survivor", "INWORLD_VOICE_SURVIVOR"),
  cold: persona("cold", "INWORLD_VOICE_COLD"),
};

/** Picks the persona for a narration. Scene and outcome select the performance direction. */
export const castVoice = (opts: {
  kind?: NarrationKind;
  outcome?: Outcome;
  filmId?: string;
}): VoicePersona => {
  if (opts.kind === "death") return PERSONAS.cold;
  if (opts.kind === "ending") {
    return opts.outcome === "won" ? PERSONAS.survivor : PERSONAS.cold;
  }
  return PERSONAS.dread;
};
