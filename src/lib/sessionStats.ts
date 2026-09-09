import { GameResult } from '@/hooks/useGameHistory';

/** Final Girl's horror track runs 1–7. */
export const HORROR_LEVELS = [1, 2, 3, 4, 5, 6, 7] as const;

export interface HorrorBin {
  level: number;
  games: number;
}

export interface WeaponTally {
  name: string;
  uses: number;
  wins: number;
}

export interface SessionEntry {
  id: string;
  timestamp: number;
  outcome: 'won' | 'lost';
  finalGirl: string;
  killer: string;
  location: string;
  horror: number | null;
}

/**
 * How many games ended at each horror level.
 *
 * Every level is emitted, including the ones never reached — the shape of the
 * distribution is the point, and a missing 7 says something a skipped column
 * cannot.
 */
export const buildHorrorDistribution = (games: GameResult[]): { bins: HorrorBin[]; recorded: number } => {
  const bins = HORROR_LEVELS.map((level) => ({ level, games: 0 }));
  let recorded = 0;

  games.forEach((game) => {
    const level = game.finalHorrorLevel;
    if (level == null) return;
    const bin = bins.find((b) => b.level === level);
    // A level outside 1–7 is bad data, not a new bin.
    if (!bin) return;
    bin.games += 1;
    recorded += 1;
  });

  return { bins, recorded };
};

/** Weapons actually used, most-used first. Blank entries are not a weapon. */
export const buildWeaponTally = (games: GameResult[], limit = 6): WeaponTally[] => {
  const byName = new Map<string, WeaponTally>();

  games.forEach((game) => {
    const name = game.weaponUsed?.trim();
    if (!name) return;
    const entry = byName.get(name.toLowerCase()) ?? { name, uses: 0, wins: 0 };
    entry.uses += 1;
    if (game.outcome === 'won') entry.wins += 1;
    byName.set(name.toLowerCase(), entry);
  });

  return Array.from(byName.values())
    .sort((a, b) => b.uses - a.uses || a.name.localeCompare(b.name))
    .slice(0, limit);
};

/** The latest sessions, newest first. */
export const buildRecentSessions = (games: GameResult[], limit = 8): SessionEntry[] =>
  [...games]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit)
    .map((game) => ({
      id: game.id,
      timestamp: game.timestamp,
      outcome: game.outcome === 'won' ? 'won' : 'lost',
      finalGirl: game.finalGirl,
      killer: game.killer,
      location: game.location,
      horror: game.finalHorrorLevel ?? null,
    }));
