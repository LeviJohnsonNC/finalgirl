import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

export async function isDiscardedGame(
  client: SupabaseClient,
  owner: string,
  gameId?: string,
) {
  if (!gameId) return false;
  const { data, error } = await client
    .from("discarded_games")
    .select("game_id")
    .eq("user_id", owner)
    .eq("game_id", gameId)
    .maybeSingle();
  if (error)
    throw new Error("Could not verify whether this game was discarded.");
  return Boolean(data);
}

/** Managed images have a per-owner folder and exact game-ID prefix. Never follow caller URLs. */
export async function removeDiscardedImages(
  client: SupabaseClient,
  owner: string,
  gameId: string,
) {
  const bucket = client.storage.from("posters");
  const folder = `game-posters/${owner}`;
  const paths: string[] = [];
  for (let offset = 0; ; offset += 100) {
    const { data, error } = await bucket.list(folder, {
      limit: 100,
      offset,
      search: `${gameId}-`,
    });
    if (error || !Array.isArray(data))
      throw new Error("Image cleanup could not be completed.");
    for (const file of data) {
      if (
        file.name.startsWith(`${gameId}-scene-`) ||
        file.name.startsWith(`${gameId}-poster-`)
      ) {
        if (!file.name.includes("/")) paths.push(`${folder}/${file.name}`);
      }
    }
    if (data.length < 100) break;
  }
  for (let start = 0; start < paths.length; start += 100) {
    const { error } = await bucket.remove(paths.slice(start, start + 100));
    if (error) throw new Error("Image cleanup could not be completed.");
  }
}
