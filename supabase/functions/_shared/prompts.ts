// Every image prompt in the app is built here.
//
// These builders used to exist in four drifting copies (two edge functions and
// two client-side "copy this prompt" modals). The modals are gone and the
// functions share this module, so the house voice lives in one place.

export interface SceneContext {
  story: string;
  killer: string;
  killerDescription?: string;
  finalGirl: string;
  finalGirlDescription?: string;
  location: string;
  locationDescription?: string;
  moduleVisualGuidance?: string;
  /** Per-game look description, so the opening still and closing poster match. */
  visualBible?: string;
  /** Distilled single-moment brief from the cinematographer pass. */
  shotBrief?: string;
  outcome?: "won" | "lost";
}

const describeCast = (ctx: SceneContext): string => {
  const lines: string[] = [];
  if (ctx.finalGirlDescription) lines.push(`FINAL GIRL - ${ctx.finalGirl}: ${ctx.finalGirlDescription}`);
  if (ctx.killerDescription) lines.push(`KILLER - ${ctx.killer}: ${ctx.killerDescription}`);
  if (ctx.locationDescription) lines.push(`LOCATION - ${ctx.location}: ${ctx.locationDescription}`);
  return lines.length > 0 ? lines.join("\n\n") : "No detailed visual descriptions available.";
};

const optionalBlock = (label: string, value: string | undefined): string =>
  value ? `\n${label}:\n${value}\n` : "";

// ---- Cinematographer pass -------------------------------------------------
// A cheap text call that picks ONE moment out of the story before the image
// model sees it. Without this the image model has to both comprehend a long
// story and compose a frame, and it averages the two into mush.

export const SHOT_BRIEF_SYSTEM = `You are a horror film cinematographer breaking down a script.
Given a story, you select the single most photographable moment and describe it as a shot.
You never describe the whole story. You never write prose or preamble.
You reply with at most 60 words covering: subject, framing, light source, and palette.`;

export const buildShotBriefPrompt = (ctx: SceneContext): string => {
  const kind = ctx.outcome
    ? `This is the CLOSING image — the story has ended and ${ctx.outcome === "won" ? `${ctx.finalGirl} survived` : `${ctx.killer} prevailed`}.`
    : "This is the OPENING image — the night is just beginning and nothing has been resolved.";

  return `${kind}

Pick ONE moment from this story and describe it as a single shot.

Favour implication over display: aftermath, discovery, dread, false calm, or a distorted view.
Do not default to hero-versus-monster. Characters may be off-frame entirely.

STORY:
${ctx.story}`;
};

// ---- Per-game visual bible ------------------------------------------------
// Generated once when a game starts and reused by both images, so a session's
// two pictures look like frames from the same film.

export const VISUAL_BIBLE_SYSTEM = `You are a horror film's director of photography writing a one-paragraph look book.
You describe only the visual grammar of the film: film stock, palette, key light quality, lens character, weather and texture.
You never describe plot, characters or events. Maximum 70 words. No preamble.`;

export const buildVisualBiblePrompt = (opts: {
  killer: string;
  finalGirl: string;
  location: string;
  locationDescription?: string;
}): string =>
  `Define the look of a 1980s horror film set at ${opts.location}, where ${opts.finalGirl} is hunted by ${opts.killer}.
${opts.locationDescription ? `\nThe location: ${opts.locationDescription}` : ""}

Commit to specific, repeatable choices a second shot could match exactly.`;

// ---- Image prompts --------------------------------------------------------

export const buildBeginningPrompt = (ctx: SceneContext): string => {
  const moment = ctx.shotBrief
    ? `THE SHOT:\n${ctx.shotBrief}`
    : `THE SHOT:
From the story below, select ONE moment with the strongest emotional impact — dread, discovery,
aftermath, transformation, or false safety. Do NOT default to a hero-versus-monster composition.
The frame may show only the environment, only a fragment of a character, only evidence of horror,
or a distorted view. Either character may be entirely off-screen.

STORY:
${ctx.story}`;

  return `You are a horror film cinematographer.

${moment}
${optionalBlock("FILM LOOK (match this exactly)", ctx.visualBible)}
CAST (use visual details ONLY if they appear in the shot):
${describeCast(ctx)}
${optionalBlock("MODULE VISUAL GUIDANCE", ctx.moduleVisualGuidance)}
Generate an ultra photorealistic 1980s horror film still of that shot.
Style: practical lighting, shallow depth of field, cinematic tension, 35mm film grain.
Muted, desaturated palette. Widescreen composition.
PG-13: imply threat through atmosphere, posture and shadow — no explicit gore.
DO NOT create a movie poster or a group portrait. No text or titles.`;
};

const POSTER_COMPOSITIONS = [
  "Close-up portrait: the Final Girl's face fills the frame, the killer's presence suggested only by a shadow or reflection.",
  "Wide establishing shot: the location dominates, with small figures dwarfed by the environment. The horror is in the scale.",
  "Over-the-shoulder: we see what the Final Girl sees—or what's behind her. One figure in focus, threat in bokeh.",
  "Extreme low angle: looking up at the dominant figure, architecture or trees looming overhead.",
  "Reflection: the scene is shown through a window, puddle, broken mirror, TV screen, or knife blade.",
  "Split composition: divided diagonally, one half the killer's world, the other the Final Girl's.",
];

export const buildPosterPrompt = (ctx: SceneContext): string => {
  const isVictory = ctx.outcome === "won";
  const composition = POSTER_COMPOSITIONS[Math.floor(Math.random() * POSTER_COMPOSITIONS.length)];

  const outcomeMood = isVictory
    ? `${ctx.finalGirl} survived. Convey this through ONE of: exhaustion in her posture, a weapon held loosely at her side, smoke or dust still settling, the stillness after violence ends, a first hint of dawn that feels more eerie than hopeful. The killer's defeat is implied — never show police tape or crime-scene imagery.`
    : `${ctx.killer} prevailed. Convey this through ONE of: the killer's silhouette filling the frame with nothing left to oppose them, an empty space where someone used to stand, a flickering light illuminating absence, a personal item left on the ground, a door hanging open to darkness. The Final Girl's fate is implied, never shown.`;

  const moment = ctx.shotBrief
    ? `THE IMAGE:\n${ctx.shotBrief}`
    : `THE IMAGE:\nExtract the single most powerful visual moment from this ending and build the entire poster around it. Less is more.\n\nSTORY:\n${ctx.story}`;

  return `Generate a painted 1980s horror movie poster. Vertical 2:3 aspect ratio, high resolution.

${moment}
${optionalBlock("FILM LOOK (match this exactly)", ctx.visualBible)}
CAST:
${describeCast(ctx)}
${optionalBlock("MODULE VISUAL GUIDANCE", ctx.moduleVisualGuidance)}
OUTCOME: ${outcomeMood}

COMPOSITION: ${composition}

STYLE: Painterly realism in the tradition of 1980s VHS box art and horror paperback covers.
Dramatic chiaroscuro lighting, visible brushwork, subtle film grain and paper texture.
NOT photorealistic, NOT digital/glossy, NOT cartoonish.
PG-13: imply threat through atmosphere, posture and shadow — no explicit gore.

PALETTE: Draw from the location's natural atmosphere — neon for malls, moonlight for woods,
sodium lamps for streets, fluorescent for institutions. Warmer if she survived, cooler if she fell.

TYPOGRAPHY (painted into the image, not floating): invent a punchy 1-3 word horror title inspired
by the story, one tagline of at most 10 words reflecting the outcome, and a small billing block at the bottom.`;
};
