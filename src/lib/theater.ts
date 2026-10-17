import type { GameResult } from '@/hooks/useGameHistory';

export interface Screening {
  id: string;
  key: string;
  imageUrl: string;
  kind: 'scene' | 'poster';
  finalGirl: string;
  killer: string;
  location: string;
  outcome: 'won' | 'lost';
  timestamp: number;
}

/** A small, stable reel: newest first, then a different matchup when possible.
 * Re-evaluating after a history refresh never randomly reshuffles the screen.
 * Failed scenes can fall back to their own poster, without losing the case ID. */
export function buildScreenings(games: GameResult[], failed: ReadonlySet<string> = new Set()): Screening[] {
  const seenIds = new Set<string>();
  const seenImages = new Set<string>();
  const pool: Screening[] = [];
  const ordered = [...games].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0) || a.id.localeCompare(b.id));
  for (const game of ordered) {
    const scene = game.sceneImageUrl && !failed.has(game.sceneImageUrl) ? game.sceneImageUrl : null;
    const poster = game.posterImageUrl && !failed.has(game.posterImageUrl) ? game.posterImageUrl : null;
    const imageUrl = scene || poster;
    if (!imageUrl || seenIds.has(game.id) || seenImages.has(imageUrl)) continue;
    seenIds.add(game.id); seenImages.add(imageUrl);
    pool.push({ id: game.id, key: `${game.id}:${imageUrl}`, imageUrl, kind: scene ? 'scene' : 'poster',
      finalGirl: game.finalGirl, killer: game.killer, location: game.location, outcome: game.outcome, timestamp: game.timestamp });
  }
  const reel: Screening[] = [];
  while (pool.length && reel.length < 24) {
    const last = reel[reel.length - 1];
    const different = last ? pool.findIndex(s => s.killer !== last.killer && s.location !== last.location) : 0;
    reel.push(pool.splice(Math.max(0, different), 1)[0]);
  }
  return reel;
}

export function screeningDate(timestamp: number): string {
  return Number.isFinite(new Date(timestamp).getTime()) && timestamp > 0
    ? new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(timestamp)
    : '';
}
