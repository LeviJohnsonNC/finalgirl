import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders } from "../_shared/auth.ts";
import { StoryRequestSchema, validateRequest } from "../_shared/validation.ts";
import { requireUser } from "../_shared/guard.ts";

serve(async (req) => {
  const cors = getCorsHeaders(req.headers.get('origin'));

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: cors });
  }

  try {
    // Auth + rate limit
    const guard = await requireUser(req, cors, { functionName: "generate-story", hourlyLimit: 30 });
    if (!guard.ok) return guard.response;

    const body = await req.json();
    const validation = validateRequest(StoryRequestSchema, body);
    if (!validation.success) return validation.error;

    const { killer, location, finalGirl, startingEvent, startingSetup } = validation.data;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "Story generation service not configured" }),
        { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const killerInfo = killer.description
      ? `${killer.name}: ${killer.description}`
      : `A mysterious killer known as ${killer.name}`;
    const killerSpecialRulesInfo = killer.specialRules
      ? `IMPORTANT — Killer/module gameplay rules (respect these in the narrative):\n${killer.specialRules}`
      : null;
    const locationInfo = location.description
      ? `${location.name}: ${location.description}`
      : `A location called ${location.name}`;
    const locationSpecialRulesInfo = location.specialRules
      ? `IMPORTANT — Location/module gameplay rules (respect these in the narrative):\n${location.specialRules}`
      : null;
    const finalGirlInfo = finalGirl.backstory
      ? `${finalGirl.name}: ${finalGirl.backstory}`
      : `A survivor named ${finalGirl.name}`;
    const startingEventInfo = startingEvent
      ? `${startingEvent.name}: ${startingEvent.description || 'An event that sets the stage for terror.'}`
      : 'The calm before the storm...';
    const startingSetupInfo = startingSetup
      ? `${startingSetup.name}: ${startingSetup.description || 'The board is set for survival.'}`
      : 'Victims are scattered across the location...';

    const systemPrompt = `You are a skilled horror storyteller writing a cold open for Final Girl, a solo board game where one lone survivor must save victims from a relentless slasher killer.

The player is about to begin play as the Final Girl at a specific location against a specific killer.

Write a gripping, cinematic opening in 3–4 paragraphs.

Vibe: classic 1980s paperback horror (slow dread, sharp sensory details, uneasy normality turning wrong).

Tone: tense and ominous, with occasional dark wit if it fits.

Do not imitate or reference any real author.

Keep it PG-13: no explicit gore or sexual content; imply danger rather than describing it graphically.

Keep it reasonably short (aim ~250–450 words).

Stay consistent with the provided scenario facts. You may invent small details (minor NPCs, ambient moments, brief memories) as long as they don't contradict the inputs.

Avoid clichés ("dark and stormy night", "it was quiet… too quiet", etc.).

End with an immediate hook: a discovery, a scream, a missing person, a power outage, a chilling announcement—something that makes the player feel "okay, we're live."

Formatting:
- Break the story into paragraphs of 2–3 sentences each, separated by a blank line.
- Use **bold** sparingly — only for the killer's name on first mention, the Final Girl's name on first mention, and at most one climactic action verb per paragraph.
- Use *italics* for the location on first mention, whispered or remembered dialogue, and brief internal thoughts.
- Never emphasize more than roughly 5% of the words. Restraint is the point.

Output Rules:
Return only the story text (markdown bold/italics allowed). No headings, bullet points, or meta commentary.`;

    const userPrompt = `Scenario Inputs (use these explicitly):

Killer Info:
${killerInfo}
${killerSpecialRulesInfo ? `\n${killerSpecialRulesInfo}\n` : ''}
Final Girl Info:
${finalGirlInfo}

Location Info:
${locationInfo}
${locationSpecialRulesInfo ? `\n${locationSpecialRulesInfo}\n` : ''}

Starting Event Info:
${startingEventInfo}

Starting Setup Info:
${startingSetupInfo}`;

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
      console.error("AI gateway error:", upstream.status, errorText);
      const status = upstream.status === 429 || upstream.status === 402 ? upstream.status : 500;
      const message = upstream.status === 429
        ? "Rate limit exceeded. Please try again in a moment."
        : upstream.status === 402
        ? "AI credits depleted. Please add credits to continue."
        : "Failed to generate story. Please try again.";
      return new Response(JSON.stringify({ error: message }),
        { status, headers: { ...cors, "Content-Type": "application/json" } });
    }

    // Forward the SSE stream directly to the client.
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
    console.error("generate-story error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate story. Please try again." }),
      { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
