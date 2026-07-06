import { GameResult } from './useGameHistory';
import { getFinalGirlHealth } from '@/data/finalGirlHealth';
import { PlayerArchetype } from './useGameStats';

interface ArchetypeScore {
  archetype: PlayerArchetype;
  score: number;
  reason: string;
}

/** Narrative context passed in from useGameStats for profile generation */
export interface NarrativeContext {
  nemesis: { killer: string; losses: number } | null;
  usualSuspect: { killer: string; wins: number } | null;
  cursedSite: { location: string; losses: number } | null;
  homeTurf: { location: string; wins: number } | null;
  comfortZone: { finalGirl: string; wins: number } | null;
  grinder: { finalGirl: string; plays: number } | null;
}

// --- Individual scoring functions (0–100) ---

function scoreProtector(
  totalSaved: number,
  totalKilled: number,
  gamesPlayed: number,
): ArchetypeScore {
  const totalVictims = totalSaved + totalKilled;
  const saveRatio = totalVictims > 0 ? totalSaved / totalVictims : 0;
  const avgSaved = gamesPlayed > 0 ? totalSaved / gamesPlayed : 0;

  const ratioComponent = saveRatio * 60;
  const volumeComponent = Math.min(avgSaved / 8, 1) * 40;
  const score = ratioComponent + volumeComponent;

  const pct = Math.round(saveRatio * 100);
  const reason =
    avgSaved >= 5
      ? `You average ${avgSaved.toFixed(1)} rescues per game — ${pct}% of all victims walk away alive.`
      : `${pct}% of victims survive your games, with ${avgSaved.toFixed(1)} saved per outing.`;

  return { archetype: 'protector', score, reason };
}

function scoreSurvivor(wins: GameResult[]): ArchetypeScore {
  if (wins.length === 0) {
    return { archetype: 'survivor', score: 0, reason: '' };
  }

  const clutchWins = wins.filter((g) => {
    if (g.finalGirlHealth == null) return false;
    const maxHP = getFinalGirlHealth(g.finalGirl);
    return g.finalGirlHealth / maxHP <= 0.33;
  });

  const clutchRatio = clutchWins.length / wins.length;
  const score = clutchRatio * 100;

  const oneHPWins = clutchWins.filter((g) => g.finalGirlHealth === 1).length;
  let reason: string;
  if (oneHPWins >= 2) {
    reason = `You've clawed your way to victory at 1 HP ${oneHPWins} times — death can't keep up with you.`;
  } else if (clutchWins.length >= 2) {
    reason = `${clutchWins.length} of your ${wins.length} wins came at a sliver of health. You live on the edge.`;
  } else if (clutchWins.length === 1) {
    const g = clutchWins[0];
    reason = `${g.finalGirl} limped away with just ${g.finalGirlHealth} HP against ${g.killer}. A true survivor moment.`;
  } else {
    reason = 'You tend to finish fights with health to spare — not quite the near-death type.';
  }

  return { archetype: 'survivor', score, reason };
}

function scoreDuelist(
  winRate: number,
  wins: GameResult[],
): ArchetypeScore {
  const winFactor = Math.min(winRate / 80, 1) * 50;

  const winsWithHorror = wins.filter((g) => g.finalHorrorLevel != null);
  const avgHorrorOnWins =
    winsWithHorror.length > 0
      ? winsWithHorror.reduce((s, g) => s + (g.finalHorrorLevel || 0), 0) / winsWithHorror.length
      : 4;
  const controlFactor = Math.max(0, 1 - avgHorrorOnWins / 7) * 50;

  const score = winFactor + controlFactor;

  const wrPct = Math.round(winRate);
  let reason: string;
  if (wrPct >= 70 && avgHorrorOnWins <= 2) {
    reason = `A ${wrPct}% win rate with an average horror of just ${avgHorrorOnWins.toFixed(1)} on wins. Clinical precision.`;
  } else if (wrPct >= 60) {
    reason = `${wrPct}% win rate while keeping horror at ${avgHorrorOnWins.toFixed(1)} — controlled and efficient.`;
  } else {
    reason = `You fight smart, maintaining horror at ${avgHorrorOnWins.toFixed(1)} when you win.`;
  }

  return { archetype: 'duelist', score, reason };
}

function scoreGambler(games: GameResult[]): ArchetypeScore {
  const gamesWithHorror = games.filter((g) => g.finalHorrorLevel != null);
  if (gamesWithHorror.length < 2) {
    return { archetype: 'gambler', score: 0, reason: '' };
  }

  const horrorLevels = gamesWithHorror.map((g) => g.finalHorrorLevel!);
  const mean = horrorLevels.reduce((a, b) => a + b, 0) / horrorLevels.length;
  const stdDev = Math.sqrt(
    horrorLevels.reduce((sum, h) => sum + (h - mean) ** 2, 0) / horrorLevels.length,
  );

  const varianceScore = Math.min(stdDev / 3, 1) * 80;

  const hasCalm = horrorLevels.some((h) => h <= 2);
  const hasChaos = horrorLevels.some((h) => h >= 6);
  const extremesBonus = hasCalm && hasChaos ? 20 : 0;

  const score = varianceScore + extremesBonus;

  const minH = Math.min(...horrorLevels);
  const maxH = Math.max(...horrorLevels);
  let reason: string;
  if (hasCalm && hasChaos) {
    reason = `Your horror levels swing from ${minH} to ${maxH} — every game is a coin flip between calm and carnage.`;
  } else {
    reason = `With a horror spread of ${minH}–${maxH}, your games are anything but predictable.`;
  }

  return { archetype: 'gambler', score, reason };
}

// --- Tie-breaking order (most "dramatic" wins ties) ---
const TIEBREAK_ORDER: PlayerArchetype[] = ['survivor', 'gambler', 'duelist', 'protector'];

// --- Profile generation ---

const ARCHETYPE_INTROS: Record<Exclude<PlayerArchetype, 'newcomer'>, (ctx: ProfileBuildContext) => string> = {
  protector: (ctx) => {
    const totalVictims = ctx.totalSaved + ctx.totalKilled;
    const saveRatio = totalVictims > 0 ? Math.round((ctx.totalSaved / totalVictims) * 100) : 0;
    const avgSaved = ctx.gamesPlayed > 0 ? (ctx.totalSaved / ctx.gamesPlayed).toFixed(1) : '0';
    return `The body count matters to you — but not the way it does for most. Across ${ctx.gamesPlayed} sessions, ${saveRatio}% of all victims have walked away alive, averaging ${avgSaved} rescues per game. You don't just fight the killer; you fight the clock, the board, and the odds to drag one more survivor out of the dark. Every victim lost is personal.`;
  },
  survivor: (ctx) => {
    const clutchWins = ctx.wins.filter((g) => {
      if (g.finalGirlHealth == null) return false;
      const maxHP = getFinalGirlHealth(g.finalGirl);
      return g.finalGirlHealth / maxHP <= 0.33;
    });
    const oneHPWins = clutchWins.filter((g) => g.finalGirlHealth === 1).length;
    if (oneHPWins >= 2) {
      return `You don't win clean — you win bloody. ${oneHPWins} of your victories came at 1 HP, the kind of wins that shouldn't exist. Across ${ctx.gamesPlayed} games, you've turned certain death into a habit. The killer had you cornered, the horror was climbing, and somehow you crawled out the other side. That's not luck. That's instinct.`;
    }
    if (clutchWins.length >= 2) {
      return `${clutchWins.length} of your ${ctx.wins.length} wins came at a sliver of health — the kind where one more hit would've ended it. Over ${ctx.gamesPlayed} sessions, you've developed a pattern: let the situation get dire, then find a way out. You play best with your back against the wall, and the walls are usually covered in blood.`;
    }
    return `You have a knack for surviving what shouldn't be survivable. Across ${ctx.gamesPlayed} games with a ${Math.round(ctx.winRate)}% win rate, your victories tend to come down to the wire. You don't dominate — you endure, outlast, and walk away when the killer can't.`;
  },
  duelist: (ctx) => {
    const winsWithHorror = ctx.wins.filter((g) => g.finalHorrorLevel != null);
    const avgHorror = winsWithHorror.length > 0
      ? (winsWithHorror.reduce((s, g) => s + (g.finalHorrorLevel || 0), 0) / winsWithHorror.length).toFixed(1)
      : '—';
    return `Precision runs through every session. A ${Math.round(ctx.winRate)}% win rate across ${ctx.gamesPlayed} games, with an average horror level of just ${avgHorror} on your victories. You don't scramble — you execute. The board is a problem to be solved, and you solve it with methodical, clinical efficiency. Killers don't scare you; they're just obstacles with a health bar.`;
  },
  gambler: (ctx) => {
    const gamesWithHorror = ctx.games.filter((g) => g.finalHorrorLevel != null);
    const horrorLevels = gamesWithHorror.map((g) => g.finalHorrorLevel!);
    const minH = horrorLevels.length > 0 ? Math.min(...horrorLevels) : 0;
    const maxH = horrorLevels.length > 0 ? Math.max(...horrorLevels) : 0;
    const mean = horrorLevels.length > 0 ? horrorLevels.reduce((a, b) => a + b, 0) / horrorLevels.length : 0;
    const stdDev = horrorLevels.length > 0
      ? Math.sqrt(horrorLevels.reduce((sum, h) => sum + (h - mean) ** 2, 0) / horrorLevels.length).toFixed(1)
      : '0';
    return `Your games are a study in chaos. Horror levels swing from ${minH} to ${maxH} across ${ctx.gamesPlayed} sessions — calm, controlled outings one night, full-blown carnage the next. With a standard deviation of ${stdDev}, no two games feel the same. You don't play for consistency; you play to see what happens.`;
  },
};

interface ProfileBuildContext {
  games: GameResult[];
  wins: GameResult[];
  winRate: number;
  gamesPlayed: number;
  totalSaved: number;
  totalKilled: number;
  narrative: NarrativeContext;
  scores: ArchetypeScore[];
}

function buildRunnerUpSentence(winner: ArchetypeScore, runnerUp: ArchetypeScore, ctx: ProfileBuildContext): string {
  const gap = winner.score - runnerUp.score;
  const names: Record<string, string> = {
    protector: 'Protector',
    survivor: 'Survivor',
    duelist: 'Duelist',
    gambler: 'Gambler',
  };
  const winnerName = names[winner.archetype] || winner.archetype;
  const runnerName = names[runnerUp.archetype] || runnerUp.archetype;

  if (gap <= 15) {
    // Close — highlight the tension
    const bridges: Record<string, string> = {
      protector: `your ${Math.round((ctx.totalSaved / Math.max(ctx.totalSaved + ctx.totalKilled, 1)) * 100)}% save ratio hints at a Protector's instinct`,
      survivor: `your clutch-win tendencies suggest a Survivor lurking underneath`,
      duelist: `your ${Math.round(ctx.winRate)}% win rate carries a Duelist's edge`,
      gambler: `the volatility in your horror levels betrays a Gambler's restlessness`,
    };
    return `You're a ${winnerName} at heart, but ${bridges[runnerUp.archetype] || `there's a strong ${runnerName} streak in your data`}. The line between the two is razor-thin — ${gap < 5 ? 'almost indistinguishable' : 'close enough to shift with a few more games'}.`;
  }
  // Moderate gap — brief nod
  const nods: Record<string, string> = {
    protector: `a quiet dedication to keeping victims alive`,
    survivor: `an ability to pull through when it counts`,
    duelist: `a competitive streak that keeps the win rate climbing`,
    gambler: `an appetite for unpredictability`,
  };
  return `There's also ${nods[runnerUp.archetype] || `a trace of the ${runnerName}`} in your play — not dominant, but present enough to notice.`;
}

function buildNarrativeCloser(ctx: ProfileBuildContext): string {
  const parts: string[] = [];

  if (ctx.narrative.nemesis) {
    parts.push(`${ctx.narrative.nemesis.killer} has beaten you ${ctx.narrative.nemesis.losses} times — a nemesis that keeps dragging you back`);
  }
  if (ctx.narrative.comfortZone) {
    parts.push(`${ctx.narrative.comfortZone.finalGirl} is your go-to with ${ctx.narrative.comfortZone.wins} wins`);
  }
  if (ctx.narrative.homeTurf) {
    parts.push(`${ctx.narrative.homeTurf.location} is where you fight best`);
  }

  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0] + '.';
  if (parts.length === 2) return parts[0] + ', and ' + parts[1] + '.';
  return parts[0] + '. ' + parts.slice(1).map((p, i) => i === parts.length - 2 ? p : p).join(', and ') + '.';
}

function buildProfile(
  winner: ArchetypeScore,
  scores: ArchetypeScore[],
  ctx: ProfileBuildContext,
): string {
  const archetype = winner.archetype as Exclude<PlayerArchetype, 'newcomer'>;
  const paragraphs: string[] = [];

  // Paragraph 1 — Archetype identity
  paragraphs.push(ARCHETYPE_INTROS[archetype](ctx));

  // Paragraph 2 — Cross-archetype color + narrative stats
  const otherScores = scores.filter((s) => s.archetype !== winner.archetype && s.score > 0);
  const runnerUp = otherScores.length > 0 ? otherScores[0] : null;

  const p2Parts: string[] = [];
  if (runnerUp) {
    p2Parts.push(buildRunnerUpSentence(winner, runnerUp, ctx));
  }

  const closer = buildNarrativeCloser(ctx);
  if (closer) {
    p2Parts.push(closer);
  }

  if (p2Parts.length > 0) {
    paragraphs.push(p2Parts.join(' '));
  }

  return paragraphs.join('\n\n');
}

/**
 * Compute the player's archetype using independent scoring.
 * Returns the archetype with the highest score (ties broken by drama).
 */
export function computeArchetype(
  games: GameResult[],
  wins: GameResult[],
  winRate: number,
  totalSaved: number,
  totalKilled: number,
  narrative?: NarrativeContext,
): { archetype: PlayerArchetype; reason: string; profile: string } {
  if (games.length < 3) {
    return { archetype: 'newcomer', reason: 'Play more games to discover your style', profile: 'Play more games to discover your style.' };
  }

  const scores: ArchetypeScore[] = [
    scoreProtector(totalSaved, totalKilled, games.length),
    scoreSurvivor(wins),
    scoreDuelist(winRate, wins),
    scoreGambler(games),
  ];

  // Sort by score descending, then by tiebreak order
  scores.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return TIEBREAK_ORDER.indexOf(a.archetype) - TIEBREAK_ORDER.indexOf(b.archetype);
  });

  const winner = scores[0];

  const ctx: ProfileBuildContext = {
    games,
    wins,
    winRate,
    gamesPlayed: games.length,
    totalSaved,
    totalKilled,
    narrative: narrative || {
      nemesis: null,
      usualSuspect: null,
      cursedSite: null,
      homeTurf: null,
      comfortZone: null,
      grinder: null,
    },
    scores,
  };

  const profile = buildProfile(winner, scores, ctx);

  return { archetype: winner.archetype, reason: winner.reason, profile };
}
