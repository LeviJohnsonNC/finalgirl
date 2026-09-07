// Generates the opening scene still and the closing poster.
//
// Both images are produced on the platform's own Lovable AI Gateway key — there
// is no bring-your-own-key path any more. The result is uploaded to the
// `posters` storage bucket and returned as a public URL; it must never be
// returned as a data: URI, because the history layer strips those before saving
// and the image would silently vanish from the scrapbook.
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { getCorsHeaders } from "../_shared/auth.ts";
import { requireUser } from "../_shared/guard.ts";
import { SceneImageRequestSchema, validateRequest } from "../_shared/validation.ts";
import { generateImage, generateText, statusFor, userFacingMessage } from "../_shared/aiGateway.ts";
import {
  buildBeginningPrompt,
  buildPosterPrompt,
  buildShotBriefPrompt,
  SceneContext,
  SHOT_BRIEF_SYSTEM,
} from "../_shared/prompts.ts";

const EXTENSION: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

serve(async (req) => {
  const cors = getCorsHeaders(req.headers.get("origin"));
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

  try {
    // Images cost real money now, so this cap fails closed.
    const guard = await requireUser(req, cors, {
      functionName: "generate-scene-image",
      hourlyLimit: 20,
      dailyLimit: 60,
      failClosed: true,
    });
    if (!guard.ok) return guard.response;
    const { user, logUsage } = guard;

    const validation = validateRequest(SceneImageRequestSchema, await req.json());
    if (!validation.success) return validation.error;
    const body = validation.data;

    const isPoster = body.sceneType === "ending";
    const context: SceneContext = { ...body };

    // Cinematographer pass: distil the story to one shot before the image model
    // sees it. Cheap, and it stops the image model from averaging the whole
    // story into mush. A failure here is not fatal — the image prompt falls
    // back to carrying the full story itself.
    let briefModel: string | undefined;
    try {
      const brief = await generateText({
        system: SHOT_BRIEF_SYSTEM,
        user: buildShotBriefPrompt(context),
        maxTokens: 200,
      });
      context.shotBrief = brief.text;
      briefModel = brief.model;
    } catch (err) {
      console.warn("Shot brief failed, falling back to full-story prompt:", err);
    }

    const prompt = isPoster ? buildPosterPrompt(context) : buildBeginningPrompt(context);
    const image = await generateImage(prompt);

    // --- Persist to storage; never hand back a data: URI ---
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const extension = EXTENSION[image.mimeType] ?? "png";
    const kind = isPoster ? "poster" : "scene";
    const id = body.gameId ?? crypto.randomUUID();
    const path = `game-posters/${user.id}/${id}-${kind}-${Date.now()}.${extension}`;

    const bytes = Uint8Array.from(atob(image.base64), (c) => c.charCodeAt(0));
    const { error: uploadError } = await adminClient.storage
      .from("posters")
      .upload(path, bytes, { contentType: image.mimeType, upsert: true });

    if (uploadError) {
      console.error("Poster upload failed:", uploadError);
      return json({ error: "The image developed but could not be filed. Try again." }, 500);
    }

    const { data: urlData } = adminClient.storage.from("posters").getPublicUrl(path);

    // Regeneration replaces the previous image; clean up the file it orphaned.
    if (body.previousImageUrl) {
      const previousPath = body.previousImageUrl.match(/\/posters\/(.+)$/)?.[1];
      if (previousPath && previousPath.startsWith(`game-posters/${user.id}/`)) {
        adminClient.storage.from("posters").remove([previousPath]).then(({ error }) => {
          if (error) console.warn("Could not remove replaced image:", error);
        });
      }
    }

    logUsage({ model: [briefModel, image.model].filter(Boolean).join(" + "), kind });

    return json({ imageUrl: urlData.publicUrl, model: image.model });
  } catch (error) {
    console.error("Error in generate-scene-image:", error);
    return json({ error: userFacingMessage(error) }, statusFor(error));
  }
});
