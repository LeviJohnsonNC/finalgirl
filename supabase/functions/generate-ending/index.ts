import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders } from "../_shared/auth.ts";
import { validateRequest, EndingRequestSchema } from "../_shared/validation.ts";
import { requireUser } from "../_shared/guard.ts";
import { ENDING_SYSTEM, buildEndingUser } from "../_shared/storyPrompts.ts";
import { statusFor, streamChat, userFacingMessage } from "../_shared/aiGateway.ts";

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
    const validation = validateRequest(EndingRequestSchema, body, cors);
    if (!validation.success) {
      return validation.error;
    }


    const systemPrompt = ENDING_SYSTEM;
    const userPrompt = buildEndingUser(validation.data);

    // Call Lovable AI Gateway
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    const { body: stream, model } = await streamChat({ system: systemPrompt, user: userPrompt });
    await guard.logUsage({ model, kind: "ending" });

    return new Response(stream, {
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
      JSON.stringify({ error: userFacingMessage(error) }),
      { status: statusFor(error), headers: { ...cors, "Content-Type": "application/json" } }
    );
  }
});

