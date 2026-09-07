// Voice casting for narration.
//
// Every narration used to be read by one voice — the same read for a hopeful
// opening and a grim ending, across every film. This maps the moment being
// narrated to a voice, so the app's two halves sound different from each other.
//
// IMPORTANT: `Blake` is the only voice id verified against the live Inworld API.
// Every other id here is a candidate: the narrator tries a persona's candidates
// in order and falls back to Blake, so an id that does not exist costs one
// retry and then sounds exactly like today rather than failing. Run the
// `tts-voices` function to list what Inworld actually offers for this account,
// then keep the ids that appear and delete the rest.

/** The one id known to work. Never remove it from the end of a chain. */
export const FALLBACK_VOICE = "Blake";

export type NarrationKind = "intro" | "ending";
export type Outcome = "won" | "lost";

export interface VoicePersona {
  /** Inworld voice ids, tried in order. Always ends at FALLBACK_VOICE. */
  candidates: string[];
  /** Recorded on the usage row so we can see what actually read the line. */
  label: string;
}

const envVoice = (name: string): string[] => {
  const value = Deno.env.get(name)?.trim();
  return value ? [value] : [];
};

/**
 * Three reads, matching the three emotional registers the app actually has.
 * Ordered most-preferred first; unknown ids simply fall through.
 */
export const PERSONAS: Record<string, VoicePersona> = {
  // The opening: something is wrong, but nothing has happened yet. Close,
  // hushed, unhurried — the voice of a film before the first kill.
  dread: {
    label: "dread",
    candidates: [...envVoice("INWORLD_VOICE_DREAD"), "Theodore", "Edward", FALLBACK_VOICE],
  },
  // She survived. Big trailer-announcer read — the only time this app is
  // allowed to sound triumphant, and even then it should feel a little wrong.
  survivor: {
    label: "survivor",
    candidates: [...envVoice("INWORLD_VOICE_SURVIVOR"), "Mark", "Ronald", FALLBACK_VOICE],
  },
  // She didn't. Flat, cold, final. No relish, no menace — just the report of
  // something that has already finished happening.
  cold: {
    label: "cold",
    candidates: [...envVoice("INWORLD_VOICE_COLD"), "Hades", "Dennis", FALLBACK_VOICE],
  },
};

/**
 * Per-film casting override, keyed by the film ids in `src/types/gameData.ts`.
 * Left deliberately sparse: a film only belongs here when its voice should
 * differ from what the scene and outcome already imply. Fill in as you listen.
 */
const FILM_PERSONA: Record<string, keyof typeof PERSONAS> = {};

/** Picks the persona for a narration. Scene and outcome decide; film can override. */
export const castVoice = (opts: {
  kind?: NarrationKind;
  outcome?: Outcome;
  filmId?: string;
}): VoicePersona => {
  const override = opts.filmId ? FILM_PERSONA[opts.filmId] : undefined;
  if (override && PERSONAS[override]) return PERSONAS[override];

  if (opts.kind === "ending") {
    return opts.outcome === "won" ? PERSONAS.survivor : PERSONAS.cold;
  }
  return PERSONAS.dread;
};
