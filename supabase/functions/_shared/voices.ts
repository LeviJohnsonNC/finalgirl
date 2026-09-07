// Voice casting for narration.
//
// Every narration used to be read by one voice — the same read for a hopeful
// opening and a grim ending, across every film. This maps the moment being
// narrated to a voice, so the app's two halves sound different from each other.
//
// Every id below was confirmed to exist against the live Inworld API, and is
// chosen from Inworld's own description of the voice rather than its name —
// see the comment above each. `tts-voices` lists all 282 with descriptions.
// They still have not been listened to, so treat this as an informed casting
// call, not a finished one; the env overrides below make auditioning cheap.
//
// The chains are kept anyway: a voice can be withdrawn from the account, and a
// persona that falls back to Blake still narrates. Never remove Blake from the
// end of a chain.

/** The original narrator, and the last resort for every persona. */
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
 * Each candidate carries Inworld's own description of it, because the first
 * cast was chosen by name and two of the three turned out to be wrong: `Mark`
 * is a corporate-training voice and `Hades` is a fantasy castle guard.
 */
export const PERSONAS: Record<string, VoicePersona> = {
  // The opening: something is wrong, but nothing has happened yet. Close,
  // hushed, unhurried — the voice of a film before the first kill.
  dread: {
    label: "dread",
    candidates: [
      ...envVoice("INWORLD_VOICE_DREAD"),
      // "Measured, ominous male voice, ideal for suspense narration, dark
      // fantasy storytelling, and composed dramatic monologues."
      "Levi",
      // "Calm, raspy male voice, suited for moody narration ... with subtle tension."
      "Damon",
      // "Gravelly male voice, with a time-worn quality." Reads elderly and wise
      // rather than menacing — kept only as a fallback.
      "Theodore",
      FALLBACK_VOICE,
    ],
  },
  // She survived. Big trailer-announcer read — the only time this app is
  // allowed to sound triumphant, and even then it should feel a little wrong.
  survivor: {
    label: "survivor",
    candidates: [
      ...envVoice("INWORLD_VOICE_SURVIVOR"),
      // "Mature, resonant male voice with a classic announcer quality."
      "Warren",
      // "Energetic, mature radio announcer-style male voice, great for
      // storytelling, pep talks, and voiceovers."
      "Carter",
      // "Resonant, commanding British male voice, ideal for ... epic film
      // trailers." British, so third rather than first.
      "Rupert",
      FALLBACK_VOICE,
    ],
  },
  // She didn't. Flat, cold, final. No relish, no menace — just the report of
  // something that has already finished happening.
  cold: {
    label: "cold",
    candidates: [
      ...envVoice("INWORLD_VOICE_COLD"),
      // "Gruff, weathered male voice, perfect for detective archetypes ... and
      // serious investigative narration." Tagged somber — a report, not a gloat.
      "Conrad",
      // "Ominous, sinister male voice, ideal for dark conspiracies, eerie
      // suspense scenes." Closer to villainy than to finality.
      "Victor",
      // "Deep, controlled female voice ... measured authority-led explainers."
      "Bianca",
      FALLBACK_VOICE,
    ],
  },
};

/**
 * Per-film casting override, keyed by the film ids in `src/types/gameData.ts`.
 * Left deliberately sparse: a film only belongs here when its voice should
 * differ from what the scene and outcome already imply. Fill in as you listen.
 *
 * Two voices worth a persona of their own if you ever want one:
 *   `Morgana` — "Cold, calculated female voice, ideal for gaming, audiobook
 *     villains, and horror." The only voice in the catalogue tagged `horror`.
 *   `Lucian`  — "Brooding, foreboding male voice, suited for villainous
 *     character arcs, gothic drama scenes, and dark narrative worldbuilding."
 *     A natural fit for the abbey and other gothic locations.
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
