import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { getCorsHeaders } from "../_shared/auth.ts";
import { requireUser } from "../_shared/guard.ts";

serve(async (req) => {
  const cors = getCorsHeaders(req.headers.get('origin'));

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: cors });
  }

  try {
    // Auth + rate limit
    const guard = await requireUser(req, cors, { functionName: "generate-scene-image", hourlyLimit: 40 });
    if (!guard.ok) return guard.response;
    const user = guard.user;

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // --- Parse request body ---

    const {
      story,
      killer,
      killerDescription,
      finalGirl,
      finalGirlDescription,
      location,
      locationDescription,
      moduleVisualGuidance,
      sceneType,
      outcome,
    } = await req.json();

    if (!story || !killer || !finalGirl || !location) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // --- Look up user's API key + preferred provider using service role ---
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: settingsRow } = await adminClient
      .from('user_image_settings')
      .select('preferred_provider')
      .eq('user_id', user.id)
      .maybeSingle();

    const preferredProvider = settingsRow?.preferred_provider;

    const { data: keys } = await adminClient
      .from('user_api_keys')
      .select('provider, api_key_encrypted')
      .eq('user_id', user.id);

    if (!keys || keys.length === 0) {
      return new Response(JSON.stringify({ error: 'No API key configured. Add one in My Collection.' }), {
        status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    const chosenKey = keys.find(k => k.provider === preferredProvider) ?? keys[0];
    const provider = chosenKey.provider;
    const apiKey = chosenKey.api_key_encrypted;

    // --- Build rich prompt directly (no extraction step) ---
    const isPoster = sceneType === 'ending';
    let imagePrompt: string;

    if (isPoster) {
      imagePrompt = buildPosterPrompt(story, killer, killerDescription, finalGirl, finalGirlDescription, location, locationDescription, outcome, moduleVisualGuidance);
    } else {
      imagePrompt = buildBeginningPrompt(story, killer, killerDescription, finalGirl, finalGirlDescription, location, locationDescription, moduleVisualGuidance);
    }

    // --- Generate image using user's chosen provider ---
    let imageUrl: string;

    if (provider === 'google') {
      imageUrl = await generateWithGoogle(apiKey, imagePrompt, isPoster);
    } else if (provider === 'openai') {
      imageUrl = await generateWithOpenAI(apiKey, imagePrompt, isPoster);
    } else if (provider === 'stability') {
      imageUrl = await generateWithStability(apiKey, imagePrompt, isPoster);
    } else {
      throw new Error(`Unknown provider: ${provider}`);
    }

    return new Response(
      JSON.stringify({ imageUrl }),
      { headers: { ...cors, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-scene-image:', error);
    const msg = error instanceof Error ? error.message : 'Image generation failed';
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } }
    );
  }
});

// ---- Prompt builders ----

function buildPosterPrompt(
  story: string,
  killer: string,
  killerDescription: string | undefined,
  finalGirl: string,
  finalGirlDescription: string | undefined,
  location: string,
  locationDescription: string | undefined,
  outcome: string | undefined,
  moduleVisualGuidance: string | undefined,
): string {
  const isVictory = outcome === 'won';

  const compositions = [
    `Close-up portrait: the Final Girl's face fills the frame, the killer's presence suggested only by a shadow or reflection.`,
    `Wide establishing shot: the location dominates, with small figures dwarfed by the environment. The horror is in the scale.`,
    `Over-the-shoulder: we see what the Final Girl sees—or what's behind her. One figure in focus, threat in bokeh.`,
    `Extreme low angle: looking up at the dominant figure (winner of the encounter), architecture or trees looming overhead.`,
    `Reflection or mirror: the scene is shown through a reflective surface—a window, puddle, broken mirror, TV screen, knife blade.`,
    `Split composition: the poster is divided diagonally or vertically, one half showing the killer's world, the other the Final Girl's.`,
  ];
  const compositionSeed = compositions[Math.floor(Math.random() * compositions.length)];

  const outcomeMood = isVictory
    ? `${finalGirl} survived. Convey this through ONE of these (pick the most cinematic for the story): exhaustion in her posture, a weapon held loosely at her side, smoke or dust still settling, the quiet stillness after violence ends, a first hint of dawn light that feels more eerie than hopeful. The killer's defeat should be implied—never show police tape, chalk outlines, or explicit crime scene imagery.`
    : `${killer} prevailed. Convey this through ONE of these (pick the most cinematic for the story): the killer's silhouette filling the frame with nothing left to oppose them, an empty space where someone used to stand, a flickering light illuminating absence, a personal item left behind on the ground, a door hanging open to darkness. The Final Girl's fate is implied, never shown.`;

  return `Generate a painted 1980s horror movie poster image. Vertical 2:3 aspect ratio, high resolution.

SCENE — based on this story:
${story}

CHARACTERS:
• ${finalGirl}: ${finalGirlDescription || 'A resourceful survivor. Use story context for appearance.'}
• ${killer}: ${killerDescription || 'A terrifying antagonist. Use story context for appearance.'}

LOCATION: ${location} — ${locationDescription || 'Use story context for setting details.'}

MODULE VISUAL GUIDANCE:
${moduleVisualGuidance || 'No additional module-specific visual guidance.'}

OUTCOME: ${outcomeMood}

COMPOSITION: ${compositionSeed}

STYLE: Painterly realism in the tradition of 1980s VHS box art and horror paperback covers. Dramatic chiaroscuro lighting, visible brushwork, subtle film grain and paper texture. NOT photorealistic, NOT digital/glossy, NOT cartoonish. PG-13: imply threat through atmosphere, posture, and shadow — no explicit gore.

PALETTE: Draw colors from the location's natural atmosphere (neon for malls, moonlight for woods, sodium lamps for streets, fluorescent for institutions). Let the mood shift based on outcome — warmer if survived, cooler if fallen — but don't force a single accent color.

TYPOGRAPHY (painted into the image, not floating): Invent a punchy 1–3 word horror movie title inspired by the story. Add one tagline (max 10 words) reflecting the outcome. Small billing block at the bottom.

Extract the single most powerful visual moment from the ending story and build the entire poster around that one image. Less is more.`;
}

function buildBeginningPrompt(
  story: string,
  killer: string,
  killerDescription: string | undefined,
  finalGirl: string,
  finalGirlDescription: string | undefined,
  location: string,
  locationDescription: string | undefined,
  moduleVisualGuidance: string | undefined,
): string {
  const characterSection: string[] = [];
  if (finalGirlDescription) {
    characterSection.push(`FINAL GIRL - ${finalGirl}: ${finalGirlDescription}`);
  }
  if (killerDescription) {
    characterSection.push(`KILLER - ${killer}: ${killerDescription}`);
  }
  if (locationDescription) {
    characterSection.push(`LOCATION - ${location}: ${locationDescription}`);
  }

  const characterBlock = characterSection.length > 0
    ? characterSection.join('\n\n')
    : 'No detailed visual descriptions available.';

  return `You are a horror film cinematographer.

From the story, select ONE moment that creates the strongest emotional impact. The impact may come from dread, discovery, aftermath, transformation, or false safety—not just confrontation.

Do NOT default to a hero vs. monster composition.

COMPOSITION RULES:
The frame may show:
- Only the environment
- Only a fragment of a character
- Only evidence of horror
- Or a distorted/obstructed view

The killer or final girl may be completely off-screen.
Favor implication over direct display.
Use negative space, occlusion, reflections, silhouettes, or foreground obstruction.
The camera can be low, high, tilted, partially hidden, or from an inhuman perspective.

VARIETY RULE (important):
Before choosing the shot, randomly pick ONE category and base the image on it:
- Aftermath
- Discovery
- Pursuit
- Transformation
- Dread
- False calm

MAIN CHARACTERS (use visual details ONLY if they appear in your chosen moment):
${characterBlock}

STORY:
${story}

MODULE VISUAL GUIDANCE:
${moduleVisualGuidance || 'No additional module-specific visual guidance.'}

---

Generate an ultra photorealistic 1980s horror film still based on your chosen moment.
Style: Practical lighting, shallow depth of field, cinematic tension, 35mm film grain.
DO NOT create a movie poster or group portrait.
Muted, desaturated color palette. Widescreen composition. No text or titles.`;
}

// ---- Provider implementations ----

async function generateWithGoogle(apiKey: string, prompt: string, isPoster: boolean): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ["image", "text"] },
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    console.error('Google API error:', response.status, errText);
    throw new Error('Google image generation failed. Check your API key and quota.');
  }

  const data = await response.json();
  const parts = data.candidates?.[0]?.content?.parts;
  const imagePart = parts?.find((p: any) => p.inlineData);

  if (!imagePart?.inlineData) {
    throw new Error('No image returned from Google');
  }

  return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
}

async function generateWithOpenAI(apiKey: string, prompt: string, isPoster: boolean): Promise<string> {
  const size = isPoster ? "1024x1536" : "1536x1024";
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt,
      moderation: "low",
      n: 1,
      size,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('OpenAI API error:', response.status, errText);
    try {
      const errJson = JSON.parse(errText);
      const code = errJson?.error?.code;
      if (code === 'content_policy_violation') {
        throw new Error('OpenAI rejected this prompt due to content policy. Try switching to Google Gemini which handles horror themes better.');
      }
      if (code === 'invalid_api_key') {
        throw new Error('Invalid OpenAI API key. Please check your key in My Collection.');
      }
      if (code === 'insufficient_quota') {
        throw new Error('OpenAI quota exceeded. Please check your billing at platform.openai.com.');
      }
    } catch (e) {
      if (e instanceof Error && e.message.startsWith('OpenAI')) throw e;
    }
    throw new Error('OpenAI image generation failed. Check your API key and quota.');
  }

  const data = await response.json();
  const b64 = data.data?.[0]?.b64_json;
  if (!b64) {
    throw new Error('No image returned from OpenAI');
  }

  return `data:image/png;base64,${b64}`;
}

async function generateWithStability(apiKey: string, prompt: string, isPoster: boolean): Promise<string> {
  const formData = new FormData();
  formData.append('prompt', prompt);
  formData.append('output_format', 'png');
  formData.append('aspect_ratio', isPoster ? '2:3' : '3:2');

  const response = await fetch(
    "https://api.stability.ai/v2beta/stable-image/generate/core",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    console.error('Stability API error:', response.status, errText);
    throw new Error('Stability AI image generation failed. Check your API key and quota.');
  }

  const data = await response.json();
  const b64 = data.image;
  if (!b64) {
    throw new Error('No image returned from Stability AI');
  }

  return `data:image/png;base64,${b64}`;
}
