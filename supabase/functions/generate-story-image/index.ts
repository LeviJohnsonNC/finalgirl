import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders } from "../_shared/auth.ts";
import { ImageRequestSchema, validateRequest } from "../_shared/validation.ts";
import { requireUser } from "../_shared/guard.ts";

serve(async (req) => {
  const cors = getCorsHeaders(req.headers.get('origin'));

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: cors });
  }

  try {
    // Auth + rate limit
    const guard = await requireUser(req, cors, { functionName: "generate-story-image", hourlyLimit: 40 });
    if (!guard.ok) return guard.response;

    // Parse and validate request body
    const body = await req.json();
    const validation = validateRequest(ImageRequestSchema, body);

    if (!validation.success) {
      return validation.error;
    }



    const { 
      position, 
      fullStory, 
      killer, 
      killerDescription, 
      finalGirl, 
      finalGirlDescription, 
      location, 
      locationDescription 
    } = validation.data;

    // Build character context block
    const characterSection: string[] = [];
    if (finalGirl && finalGirlDescription) {
      characterSection.push(`FINAL GIRL - ${finalGirl}: ${finalGirlDescription}`);
    }
    if (killer && killerDescription) {
      characterSection.push(`KILLER - ${killer}: ${killerDescription}`);
    }
    if (location && locationDescription) {
      characterSection.push(`LOCATION - ${location}: ${locationDescription}`);
    }

    const characterBlock = characterSection.length > 0
      ? characterSection.join('\n\n')
      : 'No detailed visual descriptions available.';

    const positionLabel = position === 1 ? 'first' : position === 2 ? 'second' : position === 3 ? 'third' : 'fourth';

    // Rich single-step prompt matching the manual ImagePromptModal
    const imagePrompt = `You are a horror film cinematographer.

From the story, select the ${positionLabel} most emotionally powerful moment. The impact may come from dread, discovery, aftermath, transformation, or false safety—not just confrontation.

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
${fullStory}

---

Generate an ultra photorealistic 1980s horror film still based on your chosen moment.
Style: Practical lighting, shallow depth of field, cinematic tension, 35mm film grain.
DO NOT create a movie poster or group portrait.
Muted, desaturated color palette. Widescreen composition. No text or titles.`;

    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY');
    if (!GOOGLE_API_KEY) {
      throw new Error('Image generation service not configured');
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: imagePrompt }] }],
          generationConfig: { 
            responseModalities: ["image", "text"]
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Image generation API error:', response.status, errorText);
      throw new Error('Failed to generate image');
    }

    const data = await response.json();

    // Extract the base64 image from Google's response format
    const candidates = data.candidates;
    const parts = candidates?.[0]?.content?.parts;
    const imagePart = parts?.find((part: { inlineData?: { mimeType: string; data: string } }) => part.inlineData);
    
    if (!imagePart?.inlineData) {
      console.error('No image in response:', JSON.stringify(data, null, 2));
      throw new Error('No image generated');
    }

    const imageUrl = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;

    return new Response(
      JSON.stringify({ imageUrl, position }),
      { headers: { ...cors, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating story image:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate image. Please try again.' }),
      { 
        status: 500,
        headers: { ...cors, 'Content-Type': 'application/json' }
      }
    );
  }
});
