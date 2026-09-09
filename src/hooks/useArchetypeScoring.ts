import { GameResult } from './useGameHistory';
import { getFinalGirlHealth } from '@/data/finalGirlHealth';
import { PlayerArchetype } from './useGameStats';

interface ArchetypeScore {
  archetype: PlayerArchetype;
  score: number;
  reason: string;
  evidence: RateEvidence;
}

/** One archetype's standing, for the ranked read-out on the stats page. */
export interface ArchetypeStanding {
  archetype: PlayerArchetype;
  /** 0–100, rounded. A rate, comparable with the other three. */
  score: number;
  /** Sessions that carried the fields this score needs. */
  support: number;
  /** Sessions in the history, so support reads as a fraction. */
  of: number;
}

export interface ArchetypeResult {
  archetype: PlayerArchetype;
  reason: string;
  profile: string;
  /** Every archetype, highest first. Empty until the third game. */
  scores: ArchetypeStanding[];
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

// --- Scoring ---
//
// Every archetype is scored the same way: as a *rate* — the share of the
// player's games that show that behaviour — so the four numbers mean the same
// thing and can honestly be ranked against each other. The previous version
// mixed a ratio (Survivor: clutch wins / wins), a two-part weighted sum
// (Protector, Duelist) and a standard deviation with a near-automatic +20
// bonus (Gambler), so "71 vs 70" compared two different scales.
//
// Two corrections apply to every rate:
//
//  - Recency. Games are weighted with a half-life, so the profile describes
//    how someone plays now rather than averaging a year of change flat.
//  - Shrinkage. A rate from three games is pulled toward the middle, so one
//    lucky night cannot max a meter. With a full history it barely moves.

/** Games of history after which a session counts half as much. */
const RECENCY_HALF_LIFE = 12;
/** Games-equivalent of "no evidence", pulling a thin rate toward the middle. */
const PRIOR_WEIGHT = 6;
const PRIOR_RATE = 0.5;

interface Weighted {
  game: GameResult;
  weight: number;
}

/** Oldest first, weighted so the newest game counts 1 and older ones decay. */
function weighDecay(games: GameResult[]): Weighted[] {
  const ordered = [...games].sort((a, b) => a.timestamp - b.timestamp);
  const last = ordered.length - 1;
  return ordered.map((game, i) => ({
    game,
    weight: Math.pow(0.5, (last - i) / RECENCY_HALF_LIFE),
  }));
}

interface RateEvidence {
  /** Weighted sum of per-game shares in 0–1. */
  hits: number;
  /** Weighted count of games that carried the fields this rate needs. */
  weight: number;
  /** Raw count of those games, for the confidence read-out. */
  support: number;
}

const NO_EVIDENCE: RateEvidence = { hits: 0, weight: 0, support: 0 };

/** A rate in 0–100, pulled toward the middle while the evidence is thin. */
function shrinkToScore(evidence: RateEvidence): number {
  return ((evidence.hits + PRIOR_WEIGHT * PRIOR_RATE) / (evidence.weight + PRIOR_WEIGHT)) * 100;
}

/** Collect a per-game share into a rate. `share` returns null when the game
 *  did not record what this rate needs — which is not the same as a zero. */
function collect(weighted: Weighted[], share: (game: GameResult) => number | null): RateEvidence {
  return weighted.reduce<RateEvidence>((acc, { game, weight }) => {
    const value = share(game);
    if (value === null) return acc;
    return { hits: acc.hits + weight * value, weight: acc.weight + weight, support: acc.support + 1 };
  }, NO_EVIDENCE);
}

const isClutch = (game: GameResult): boolean => {
  if (game.finalGirlHealth == null) return false;
  const maxHP = getFinalGirlHealth(game.finalGirl);
  return maxHP > 0 && game.finalGirlHealth / maxHP <= 0.33;
};

function scoreProtector(weighted: Weighted[]): ArchetypeScore {
  // Share of the victims in play who walked out, per game. Counted per game
  // rather than per victim so one crowded location cannot carry the score.
  const evidence = collect(weighted, (game) => {
    const saved = game.victimsSaved;
    const killed = game.victimsKilled;
    // Neither recorded: the game says nothing about rescuing, so it is left
    // out. Treating it as zero saved is what made an unfilled form read as
    // callousness.
    if (saved == null && killed == null) return null;
    const total = (saved ?? 0) + (killed ?? 0);
    if (total === 0) return null;
    return (saved ?? 0) / total;
  });

  const pct = evidence.weight > 0 ? Math.round((evidence.hits / evidence.weight) * 100) : 0;
  const reason =
    evidence.support === 0
      ? 'No victim counts recorded yet.'
      : `${pct}% of the victims in your games walk out alive.`;

  return { archetype: 'protector', score: shrinkToScore(evidence), evidence, reason };
}

function scoreSurvivor(weighted: Weighted[]): ArchetypeScore {
  const wins = weighted.filter(({ game }) => game.outcome === 'won');
  // Over wins whose health was recorded. Dividing by *all* wins, as this used
  // to, meant an unrecorded health bar counted as a comfortable win.
  const evidence = collect(wins, (game) => (game.finalGirlHealth == null ? null : isClutch(game) ? 1 : 0));

  const clutchCount = wins.filter(({ game }) => isClutch(game)).length;
  const oneHPWins = wins.filter(({ game }) => game.finalGirlHealth === 1).length;

  let reason: string;
  if (evidence.support === 0) {
    reason = 'No health recorded on your wins yet.';
  } else if (oneHPWins >= 2) {
    reason = `You've won at 1 HP ${oneHPWins} times — death can't keep up with you.`;
  } else if (clutchCount >= 2) {
    reason = `${clutchCount} of your ${evidence.support} recorded wins came at a sliver of health.`;
  } else if (clutchCount === 1) {
    reason = 'One win came down to the last hit point.';
  } else {
    reason = 'You tend to finish fights with health to spare.';
  }

  return { archetype: 'survivor', score: shrinkToScore(evidence), evidence, reason };
}

function scoreDuelist(weighted: Weighted[]): ArchetypeScore {
  // One rate: how often a game ends as a *controlled* win. A loss is not a
  // clean win, so it counts as a zero without needing any terror data; a win
  // needs the terror level to be judged, and is left out when it is missing.
  const evidence = collect(weighted, (game) => {
    if (game.outcome !== 'won') return 0;
    if (game.finalHorrorLevel == null) return null;
    return game.finalHorrorLevel <= 3 ? 1 : 0;
  });

  const wins = weighted.filter(({ game }) => game.outcome === 'won');
  const clean = wins.filter(({ game }) => game.finalHorrorLevel != null && game.finalHorrorLevel <= 3).length;
  const pct = evidence.weight > 0 ? Math.round((evidence.hits / evidence.weight) * 100) : 0;
  const reason =
    evidence.support === 0
      ? 'No horror levels recorded yet.'
      : `${pct}% of your games end as a controlled win — ${clean} of them at horror 3 or below.`;

  return { archetype: 'duelist', score: shrinkToScore(evidence), evidence, reason };
}

function scoreGambler(weighted: Weighted[]): ArchetypeScore {
  // Volatility *between* sessions: the share of back-to-back games whose
  // terror levels are far apart. Two earlier definitions were wrong in the
  // same way — a standard deviation plus a +20 bonus that fired whenever any
  // game had ever ended calm and any in carnage (all but automatic over a long
  // history), and then "ended at either extreme", which counts a dominant win
  // at terror 1 as wildness and puts this axis in direct conflict with the
  // Duelist over the very same games. Swing is what "no two games feel the
  // same" actually means, and nothing else measures it.
  const recorded = weighted.filter(({ game }) => game.finalHorrorLevel != null);

  let hits = 0;
  let weight = 0;
  for (let i = 1; i < recorded.length; i++) {
    const swing = Math.abs(recorded[i].game.finalHorrorLevel! - recorded[i - 1].game.finalHorrorLevel!);
    // The later game of the pair carries the weight, so recent swings count most.
    const pairWeight = recorded[i].weight;
    hits += pairWeight * (swing >= 3 ? 1 : 0);
    weight += pairWeight;
  }
  const evidence: RateEvidence = { hits, weight, support: Math.max(recorded.length - 1, 0) };

  const levels = recorded.map(({ game }) => game.finalHorrorLevel!);
  const pct = weight > 0 ? Math.round((hits / weight) * 100) : 0;
  const reason =
    evidence.support === 0
      ? 'Not enough horror levels recorded to see a pattern yet.'
      : `${pct}% of your sessions swing to a wildly different horror level than the one before (${Math.min(...levels)}–${Math.max(...levels)}).`;

  return { archetype: 'gambler', score: shrinkToScore(evidence), evidence, reason };
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
    const levels = ctx.games
      .slice()
      .sort((a, b) => a.timestamp - b.timestamp)
      .map((g) => g.finalHorrorLevel)
      .filter((level): level is number => level != null);
    const minH = levels.length > 0 ? Math.min(...levels) : 0;
    const maxH = levels.length > 0 ? Math.max(...levels) : 0;
    let swings = 0;
    for (let i = 1; i < levels.length; i++) {
      if (Math.abs(levels[i] - levels[i - 1]) >= 3) swings += 1;
    }
    return `Your games are a study in chaos. Horror levels run from ${minH} to ${maxH} across ${ctx.gamesPlayed} sessions, and ${swings} ${swings === 1 ? 'time' : 'times'} a session has landed somewhere wildly different from the one before it — calm, controlled outings one night, full-blown carnage the next. You don't play for consistency; you play to see what happens.`;
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
  // A close gap between two thinly-supported scores is noise, not a finding.
  // Calling that "razor-thin" is the kind of confident nonsense that makes a
  // read-out worth skipping.
  const wellEvidenced = winner.evidence.support >= 5 && runnerUp.evidence.support >= 5;
  const names: Record<string, string> = {
    protector: 'Protector',
    survivor: 'Survivor',
    duelist: 'Duelist',
    gambler: 'Gambler',
  };
  const winnerName = names[winner.archetype] || winner.archetype;
  const runnerName = names[runnerUp.archetype] || runnerUp.archetype;

  if (gap <= 15 && wellEvidenced) {
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
  // Oxford-ish list: "a, b, and c". The previous version mapped
  // (p, i) => i === parts.length - 2 ? p : p — both arms returned p, so it was
  // a no-op and the sentence ran "a. b, and c".
  return `${parts.slice(0, -1).join(', ')}, and ${parts[parts.length - 1]}.`;
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
  narrative?: NarrativeContext,
): ArchetypeResult {
  // Derived here rather than passed in. Every one of these was previously a
  // parameter the caller computed separately, which meant the scoring could
  // silently disagree with the numbers on the rest of the page.
  const wins = games.filter((g) => g.outcome === 'won');
  const winRate = games.length > 0 ? (wins.length / games.length) * 100 : 0;
  const totalSaved = games.reduce((sum, g) => sum + (g.victimsSaved || 0), 0);
  const totalKilled = games.reduce((sum, g) => sum + (g.victimsKilled || 0), 0);

  if (games.length < 3) {
    return {
      archetype: 'newcomer',
      reason: 'Play more games to discover your style',
      profile: 'Play more games to discover your style.',
      scores: [],
    };
  }

  const weighted = weighDecay(games);
  const scores: ArchetypeScore[] = [
    scoreProtector(weighted),
    scoreSurvivor(weighted),
    scoreDuelist(weighted),
    scoreGambler(weighted),
  ];

  // Sort by score descending, then by tiebreak order. An axis with no
  // supporting games sits on the prior at 50, which must not be allowed to
  // outrank a measured one — so it sorts last regardless of that number.
  scores.sort((a, b) => {
    const aBlind = a.evidence.support === 0;
    const bBlind = b.evidence.support === 0;
    if (aBlind !== bBlind) return aBlind ? 1 : -1;
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

  return {
    archetype: winner.archetype,
    reason: winner.reason,
    profile,
    // All four, ranked. The page used to throw three of them away, which is
    // where the interesting fact lives: a 62/58 split says more about how you
    // play than the winning label does.
    scores: scores.map(({ archetype, score, evidence }) => ({
      archetype,
      score: Math.round(score),
      support: evidence.support,
      of: games.length,
    })),
  };
}
