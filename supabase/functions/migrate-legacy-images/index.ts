// Migrates a signed-in user's legacy inline data: URI posters/scenes out of
// the game_history row and into the public `posters` storage bucket, then
// rewrites the row with a public URL. Idempotent; safe to invoke multiple
// times.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { requireUser } from "../_shared/guard.ts";

interface LegacyRow {
  id: string;
  poster_image_url: string | null;
  scene_image_url: string | null;
}

// Parse a data: URI into { mime, bytes }. Returns null if malformed.
const parseDataUri = (uri: string): { mime: string; ext: string; bytes: Uint8Array } | null => {
  const match = uri.match(/^data:([^;,]+)(;base64)?,(.*)$/);
  if (!match) return null;
  const mime = match[1] || "image/jpeg";
  const isBase64 = !!match[2];
  const payload = match[3];
  if (!isBase64) return null; // we only care about base64 image payloads

  let binary: string;
  try {
    binary = atob(payload);
  } catch {
    return null;
  }
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const ext = mime.includes("png") ? "png" : mime.includes("webp") ? "webp" : "jpg";
  return { mime, ext, bytes };
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  // Cheap to run and only migrates the caller's own rows; keep the hourly cap
  // generous so a user with many legacy images isn't blocked mid-migration.
  const guard = await requireUser(req, corsHeaders, {
    functionName: "migrate-legacy-images",
    hourlyLimit: 10,
  });
  if (!guard.ok) return guard.response;

  const { user, adminClient } = guard;

  const { data: rows, error: selectError } = await adminClient
    .from("game_history")
    .select("id, poster_image_url, scene_image_url")
    .eq("user_id", user.id)
    .or("poster_image_url.like.data:%,scene_image_url.like.data:%");

  if (selectError) {
    console.error("select legacy rows failed:", selectError);
    return new Response(JSON.stringify({ error: "Failed to load legacy rows" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const legacyRows = (rows ?? []) as LegacyRow[];
  let migratedPosters = 0;
  let migratedScenes = 0;
  const failures: Array<{ id: string; kind: string; reason: string }> = [];

  const uploadOne = async (
    row: LegacyRow,
    kind: "poster" | "scene",
    dataUri: string,
  ): Promise<string | null> => {
    const parsed = parseDataUri(dataUri);
    if (!parsed) {
      failures.push({ id: row.id, kind, reason: "unparseable data uri" });
      return null;
    }
    const path = `game-posters/${user.id}/${row.id}-${kind}.${parsed.ext}`;
    const { error: uploadError } = await adminClient.storage
      .from("posters")
      .upload(path, parsed.bytes, {
        contentType: parsed.mime,
        upsert: true,
      });
    if (uploadError) {
      failures.push({ id: row.id, kind, reason: uploadError.message });
      return null;
    }
    const { data: urlData } = adminClient.storage.from("posters").getPublicUrl(path);
    return urlData.publicUrl;
  };

  for (const row of legacyRows) {
    const updates: Record<string, string> = {};

    if (row.poster_image_url?.startsWith("data:")) {
      const url = await uploadOne(row, "poster", row.poster_image_url);
      if (url) {
        updates.poster_image_url = url;
        migratedPosters++;
      }
    }
    if (row.scene_image_url?.startsWith("data:")) {
      const url = await uploadOne(row, "scene", row.scene_image_url);
      if (url) {
        updates.scene_image_url = url;
        migratedScenes++;
      }
    }

    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await adminClient
        .from("game_history")
        .update(updates)
        .eq("id", row.id)
        .eq("user_id", user.id);
      if (updateError) {
        failures.push({ id: row.id, kind: "update", reason: updateError.message });
      }
    }
  }

  return new Response(
    JSON.stringify({
      scanned: legacyRows.length,
      migratedPosters,
      migratedScenes,
      failures,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
  );
});
