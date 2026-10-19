import { narrationKey, removeGameNarration } from "@/lib/play/narrationCache";
import { getFilmIdByLocation } from "@/types/gameData";
import type { ActiveGame } from "@/lib/activeGame";
import type { GameResult } from "@/hooks/useGameHistory";

export interface DiscardReply {
  discarded: true;
  cleanupPending?: boolean;
  session?: ActiveGame | null;
  history?: {
    intro_story?: string;
    ending_narration?: string;
    location?: string;
    outcome?: string;
  } | null;
  scenes?: { id: string; text: string }[];
}
export async function clearDiscardedNarration(
  owner: string,
  gameId: string,
  reply: DiscardReply,
  local?: ActiveGame | GameResult | null,
) {
  const session =
    reply.session ?? (local && "selection" in local ? local : null);
  const history = reply.history;
  const location =
    session?.selection.location ??
    history?.location ??
    (local && "location" in local ? local.location : "");
  const filmId = getFilmIdByLocation(location);
  const keys: string[] = [];
  const intros = new Set([
    session?.introStory,
    history?.intro_story,
    local?.introStory,
  ]);
  for (const text of intros)
    if (text) keys.push(await narrationKey(text, { kind: "intro", filmId }));
  const ending =
    session?.endingStory ??
    history?.ending_narration ??
    (local && "endingNarration" in local ? local.endingNarration : undefined);
  if (ending)
    keys.push(
      await narrationKey(ending, {
        kind: "ending",
        outcome: session?.result?.outcome ?? history?.outcome,
        filmId,
      }),
    );
  for (const scene of reply.scenes ?? [])
    keys.push(
      await narrationKey(scene.text, {
        kind: "death",
        filmId,
        deathSceneId: scene.id,
      }),
    );
  await removeGameNarration(owner, gameId, keys);
}
