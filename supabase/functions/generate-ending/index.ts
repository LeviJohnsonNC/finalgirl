import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders } from "../_shared/auth.ts";
import { validateRequest, EndingRequestSchema } from "../_shared/validation.ts";
import { requireUser } from "../_shared/guard.ts";

serve(async (req) => {
  const cors = getCorsHeaders(req.headers.get('origin'));

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: cors });
  }

  try {
    // Auth + rate limit
    const guard = await requireUser(req, cors, { functionName: "generate-ending", hourlyLimit: 30 });
    if (!guard.ok) return guard.response;

    const body = await req.json();

    // Validate request
    const validation = validateRequest(EndingRequestSchema, body);
    if (!validation.success) {
      return validation.error;
    }


    const {
      introStory,
      outcome,
      killer,
      location,
      finalGirl,
      finalHorrorLevel,
      weaponUsed,
      finalGirlHealth,
      killerHealth,
      victimsSaved,
      victimsKilled,
      endingSubLocation,
      gameHighlights,
      finalGirlMaxHealth,
    } = validation.data;

    // Build the system prompt with refined instructions
    const systemPrompt = `You are a skilled horror storyteller writing the ending scene for a completed game of Final Girl (solo slasher survival).

Your task: Write a gripping, cinematic closing scene in 3–4 paragraphs (250–450 words) that feels like the final pages of a classic 1980s paperback horror: slow dread, sharp sensory details, uneasy normality trying (and failing) to come back.

Style constraints:
- Do not imitate or reference any real author.
- PG-13 only: no explicit gore or sexual content. Imply danger; keep violence off-camera or described obliquely.
- Maintain continuity with the cold open's details, tone, and any named elements. Don't rewrite the opening—continue from it.
- Don't immediately resolve the opening's cliffhanger. Build your own tension before the resolution.
- Avoid clichés (e.g., "dark and stormy night," "too quiet," etc.).
- Use occasional dark wit only if it fits the moment.
- Keep the ending decisive based on the outcome, but leave a final sting (a last image, a discovery, a call, a sound, a surviving rumor) that makes the reader go: "It's not over, is it?"

Outcome logic:
- If WON: the Final Girl survives and the Killer is stopped/killed. Don't make it feel easy. Relief should taste temporary.
- If LOST: the Killer prevails. The Final Girl's end should be implied with restraint; focus on aftermath, witnesses, unanswered questions, or a chilling continuation.

How to use optional details (only if present):
- Final Horror Level (1-7 scale, 7 = maximum terror) influences intensity and atmosphere.
- Weapon Used should appear naturally (object, weight, smell, memory).
- Final Girl Health is on a 5-6 HP scale depending on the character (NOT 0-20). A value like 1/6 or 2/5 is dangerously low—she's been through hell. Use this to color physicality: limping, trembling hands, ragged breath, stubborn endurance.
- Killer Health (0-20 scale) indicates how damaged the killer is.
- Victims Saved / Killed should shape emotional aftermath (guilt, gratitude, emptiness, survivors' statements).
- Ending Location anchors the final scene.
- Game Highlights are "key beats"—pick the 2-3 most dramatic and weave them in as quick flashes, consequences, or callbacks.

Output Rules:
Return ONLY the story text. No headings, bullet points, or meta commentary.`;

    // Build character context strings
    const killerContext = [
      `Killer: ${killer.name}`,
      killer.description ? `Description: ${killer.description}` : null,
      killer.specialRules
        ? `IMPORTANT — Killer-specific rules (respect these in the narrative):\n${killer.specialRules}`
        : null,
    ].filter(Boolean).join('\n');
    
    const finalGirlContext = finalGirl.backstory
      ? `Final Girl: ${finalGirl.name}\nBackstory: ${finalGirl.backstory}`
      : `Final Girl: ${finalGirl.name}`;
    
    const locationContext = location.description
      ? `Location: ${location.name}\nDescription: ${location.description}`
      : `Location: ${location.name}`;

    const locationRulesContext = location.specialRules
      ? `IMPORTANT — Location/module rules (respect these in the narrative):\n${location.specialRules}`
      : null;

    // Build optional stats section with character-specific max health
    const maxHealth = finalGirlMaxHealth ?? 5;  // Default to 5 if not provided
    const optionalStats = [
      finalHorrorLevel !== undefined ? `Final Horror Level: ${finalHorrorLevel}/7` : null,
      weaponUsed ? `Weapon Used: ${weaponUsed}` : null,
      finalGirlHealth !== undefined ? `Final Girl Health: ${finalGirlHealth}/${maxHealth}` : null,
      killerHealth !== undefined ? `Killer Health: ${killerHealth}/20` : null,
      victimsSaved !== undefined ? `Victims Saved: ${victimsSaved}` : null,
      victimsKilled !== undefined ? `Victims Killed: ${victimsKilled}` : null,
      endingSubLocation ? `Ending Location: ${endingSubLocation}` : null,
      gameHighlights ? `Game Highlights: ${gameHighlights}` : null,
    ].filter(Boolean).join('\n');

    const userPrompt = `Initial Opening Story:
${introStory}

${killerContext}

${finalGirlContext}

${locationContext}
${locationRulesContext ? `\n\n${locationRulesContext}` : ''}

Outcome: ${outcome.toUpperCase()}

${optionalStats ? `Optional Details:\n${optionalStats}` : ''}`.trim();


    // Call Lovable AI Gateway
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!upstream.ok || !upstream.body) {
      const errorText = await upstream.text().catch(() => "");
      console.error("AI Gateway error:", upstream.status, errorText);
      const status = upstream.status === 429 || upstream.status === 402 ? upstream.status : 500;
      const message = upstream.status === 429
        ? "Rate limit exceeded. Please wait a moment before generating again."
        : upstream.status === 402
        ? "AI credits depleted. Please add credits to continue."
        : "Failed to generate ending";
      return new Response(JSON.stringify({ error: message }),
        { status, headers: { ...cors, "Content-Type": "application/json" } });
    }

    return new Response(upstream.body, {
      status: 200,
      headers: {
        ...cors,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in generate-ending:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...cors, "Content-Type": "application/json" } }
    );
  }
});
