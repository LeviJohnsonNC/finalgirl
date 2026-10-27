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
import { ownedOpeningReference } from "../_shared/imageReference.ts";
import { hasMechanicalShotLeak } from "../_shared/fictionBoundary.ts";
import { openingReferences } from "../_shared/openingReferences.ts";
import { getCorsHeaders } from "../_shared/auth.ts";
import { isDiscardedGame } from "../_shared/discardedGame.ts";
import { requireUser } from "../_shared/guard.ts";
import { SceneImageRequestSchema, validateRequest } from "../_shared/validation.ts";
import { GatewayError, generateImage, generateShotPlanText, statusFor, userFacingMessage } from "../_shared/aiGateway.ts";
import {
  buildBeginningPrompt,
  buildPosterPrompt,
  buildShotBriefPrompt,
  SceneContext,
  buildShotBriefSystem,
  parseShotPlan,
  parseArtPlan,
  fallbackPosterCopy,
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

    const validation = validateRequest(SceneImageRequestSchema, await req.json(), cors);
    if (!validation.success) return validation.error;
    const body = validation.data;
    if (await isDiscardedGame(guard.adminClient, user.id, body.gameId))
      return json({ error: "This game was discarded.", discarded: true }, 410);

    const isPoster = body.sceneType === "ending";
    const context: SceneContext = { ...body };

    // Compare three story-specific compositions in one utility call, then generate
    // only the selected image. Never spend an opening image call on a broken plan.
    let briefModel: string | undefined;
    let posterCopy = fallbackPosterCopy(context);
    try {
      const brief = await generateShotPlanText({
        system: buildShotBriefSystem(context),
        user: buildShotBriefPrompt(context),
        maxTokens: 4000,
        reasoningEffort: "low",
        requireComplete: true,
      });
      const posterPlan = isPoster ? parseArtPlan(brief.text) : null;
      const plan = isPoster ? posterPlan : parseShotPlan(brief.text);
      if (plan) {
        const selectedShot = plan.concepts[plan.selected];
        if (!isPoster && hasMechanicalShotLeak(selectedShot, body.location))
          throw new GatewayError("incomplete_response", "The scene plan included game procedures. Please reshoot.");
        context.shotBrief = selectedShot;
        if (posterPlan) posterCopy = { title: posterPlan.title, tagline: posterPlan.tagline };
      } else {
        if (!isPoster) throw new GatewayError("incomplete_response", "The opening shot plan was incomplete.");
        console.warn('Invalid art plan; using fact-constrained story fallback.');
      }
      briefModel = brief.model;
    } catch (err) {
      if (!isPoster) throw err;
      console.warn("Shot brief failed, falling back to full-story prompt:", err);
    }

    const prompt = isPoster ? buildPosterPrompt(context) : buildBeginningPrompt(context);
    const reference = isPoster ? ownedOpeningReference(body.referenceImageUrl, Deno.env.get("SUPABASE_URL") ?? '', user.id, body.gameId) : undefined;
    const image = await generateImage(prompt, reference, isPoster ? undefined : {
      aspectRatio: "16:9", references,
    });

    // --- Persist to storage; never hand back a data: URI ---
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const mimeType = isPoster ? "image/png" : image.mimeType;
    const extension = EXTENSION[mimeType] ?? "png";
    const kind = isPoster ? "poster" : "scene";
    const id = body.gameId ?? crypto.randomUUID();
    const path = `game-posters/${user.id}/${id}-${kind}-${Date.now()}.${extension}`;

    let bytes: Uint8Array = Uint8Array.from(atob(image.base64), (c) => c.charCodeAt(0));
    if (isPoster) {
      const { composePoster } = await import('../_shared/poster.ts');
      bytes = await composePoster(bytes, posterCopy);
    }
    const { error: uploadError } = await adminClient.storage
      .from("posters")
      .upload(path, bytes, { contentType: mimeType, upsert: true });

    if (uploadError) {
      console.error("Poster upload failed:", uploadError);
      return json({ error: "The image developed but could not be filed. Try again." }, 500);
    }

    // A discard can complete while the provider is working. Never attach or return
    // its late image, and invalidate any earlier storage-cleanup acknowledgement.
    if (body.gameId && await isDiscardedGame(adminClient, user.id, body.gameId)) {
      await adminClient.rpc('queue_discarded_image_cleanup', { p_user_id: user.id, p_game_id: body.gameId });
      await adminClient.storage.from('posters').remove([path]);
      return json({ error: "This game was discarded.", discarded: true }, 410);
    }

    const { data: urlData } = adminClient.storage.from("posters").getPublicUrl(path);

    // A closing poster can finish after SAVE or a browser reload. Attach it
    // server-side if the corresponding owned record already exists.
    let attached = false;
    if (body.gameId) {
      const column = isPoster ? 'poster_image_url' : 'scene_image_url';
      const { data: rows, error: attachError } = await adminClient.from('game_history')
        .update({ [column]: urlData.publicUrl }).eq('id', body.gameId).eq('user_id', user.id).select('id');
      if (attachError) console.warn('Image attachment will need a client retry:', attachError);
      attached = !attachError && Boolean(rows?.length);
    }

    // Never delete an archived image until its replacement is attached.
    if (attached && body.previousImageUrl) {
      const previousPath = body.previousImageUrl.match(/\/posters\/(.+)$/)?.[1];
      if (previousPath && previousPath.startsWith(`game-posters/${user.id}/`)) {
        const { error } = await adminClient.storage.from('posters').remove([previousPath]);
        if (error) console.warn('Could not remove replaced image:', error);
      }
    }

    await logUsage({ model: [briefModel, image.model].filter(Boolean).join(" + "), kind });

    return json({ imageUrl: urlData.publicUrl, model: image.model });
  } catch (error) {
    console.error("Error in generate-scene-image:", error);
    return json({ error: userFacingMessage(error) }, statusFor(error));
  }
});

