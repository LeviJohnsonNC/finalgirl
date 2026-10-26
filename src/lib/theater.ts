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

/** A small reel with session-random ordering, then a different matchup when possible.
 * The hook supplies stable random ranks so refreshes do not reshuffle the screen.
 * Posters belong in the lobby; unavailable stills are skipped. */
export function buildScreenings(games: GameResult[], failed: ReadonlySet<string> = new Set(), ranks?: ReadonlyMap<string, number>): Screening[] {
  const seenIds = new Set<string>();
  const seenImages = new Set<string>();
  const pool: Screening[] = [];
  const ordered = [...games].sort((a, b) => ((ranks?.get(a.id) ?? 0) - (ranks?.get(b.id) ?? 0)) || (b.timestamp || 0) - (a.timestamp || 0) || a.id.localeCompare(b.id));
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

/** Show the recorded result; it does not imply whether the Final Girl survived. */
export function screeningVerdict(game: Pick<Screening, 'outcome' | 'finalGirlHealth'>): string {
  return game.outcome === 'won' ? 'Won' : 'Lost';
}
