import type { GameResult } from '@/hooks/useGameHistory';
import type { ActiveGame } from '@/lib/activeGame';
import { summarizePlay } from '@/lib/play/events';

export interface Screening {
  id: string;
  key: string;
  imageUrl: string;
  kind: 'scene';
  finalGirl: string;
  killer: string;
  location: string;
  outcome?: 'won' | 'lost';
  finalGirlHealth?: number;
  timestamp: number;
}

/** A small, stable reel: newest first, then a different matchup when possible.
 * Re-evaluating after a history refresh never randomly reshuffles the screen.
 * Posters belong in the lobby; unavailable stills are skipped. */
export function buildScreenings(games: GameResult[], failed: ReadonlySet<string> = new Set()): Screening[] {
  const seenIds = new Set<string>();
  const seenImages = new Set<string>();
  const pool: Screening[] = [];
  const ordered = [...games].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0) || a.id.localeCompare(b.id));
  for (const game of ordered) {
    const scene = game.sceneImageUrl && !failed.has(game.sceneImageUrl) ? game.sceneImageUrl : null;
    const imageUrl = scene;
    if (!imageUrl || seenIds.has(game.id) || seenImages.has(imageUrl)) continue;
    seenIds.add(game.id); seenImages.add(imageUrl);
    pool.push({ id: game.id, key: `${game.id}:${imageUrl}`, imageUrl, kind: 'scene',
      finalGirl: game.finalGirl, killer: game.killer, location: game.location, outcome: game.outcome, finalGirlHealth: game.finalGirlHealth, timestamp: game.timestamp });
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

export function activeScreeningStatus(game: ActiveGame): string {
  if (game.phase === 'outcome') return 'Your result is waiting for review';
  if (game.phase === 'ending') return 'Your ending is waiting';
  const summary = summarizePlay(game.playEvents);
  if (!summary.tracked) return game.introStory ? 'The night is still unfolding' : 'Ready for the opening scene';
  return [summary.round !== null ? `Round ${summary.round}` : 'Round not recorded',
    summary.saved !== null ? `${summary.saved} saved` : '', summary.killed !== null ? `${summary.killed} killed` : ''].filter(Boolean).join(' · ');
}

export function activeScreenings(game: ActiveGame, failed: ReadonlySet<string>): Screening[] {
  const scene = game.sceneImageUrl && !failed.has(game.sceneImageUrl) ? game.sceneImageUrl : null;
  return scene ? [{ ...game.selection, id: game.id, key: `${game.id}:${scene}`, imageUrl: scene, kind: 'scene', timestamp: 0 }] : [];
}

/** A result alone cannot establish survival (simultaneous deaths can win). */
export function screeningVerdict(game: Pick<Screening, 'outcome' | 'finalGirlHealth'>): string {
  if (game.outcome === 'won') return game.finalGirlHealth === 0 ? 'Sacrificial victory' : game.finalGirlHealth !== undefined && game.finalGirlHealth > 0 ? 'Survived' : 'Victory';
  return game.finalGirlHealth !== undefined && game.finalGirlHealth > 0 ? 'Alive · Defeat' : 'Lost to the night';
}
