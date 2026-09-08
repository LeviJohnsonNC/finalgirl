import { GameResult } from '@/hooks/useGameHistory';

export type TrendRange = '30d' | '90d' | '1y' | 'all';
export type Granularity = 'day' | 'week' | 'month';

export interface TrendBucket {
  /** Start of the bucket, local midnight, in ms. Also the React key. */
  start: number;
  /** Terse axis label. */
  label: string;
  /** Full label for the tooltip and the table view. */
  fullLabel: string;
  games: number;
  wins: number;
  losses: number;
  saved: number;
  killed: number;
}

export interface Trend {
  buckets: TrendBucket[];
  granularity: Granularity;
  /** Games inside the window — the chart's own count, which is not the all-time one. */
  gamesInRange: number;
}

export const RANGE_OPTIONS: { key: TrendRange; label: string; full: string }[] = [
  { key: '30d', label: '30D', full: 'Last 30 days' },
  { key: '90d', label: '90D', full: 'Last 90 days' },
  { key: '1y', label: '1Y', full: 'Last 12 months' },
  { key: 'all', label: 'All', full: 'All time' },
];

const DAY_MS = 86_400_000;

const startOfDay = (ts: number): number => {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

/** Monday-start week, so a weekend of play lands in one bucket. */
const startOfWeek = (ts: number): number => {
  const d = new Date(startOfDay(ts));
  // getDay(): 0 = Sunday. Shift so Monday is 0.
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d.getTime();
};

const startOfMonth = (ts: number): number => {
  const d = new Date(ts);
  return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
};

const bucketStart = (ts: number, granularity: Granularity): number =>
  granularity === 'day' ? startOfDay(ts) : granularity === 'week' ? startOfWeek(ts) : startOfMonth(ts);

const nextBucket = (start: number, granularity: Granularity): number => {
  const d = new Date(start);
  if (granularity === 'day') d.setDate(d.getDate() + 1);
  else if (granularity === 'week') d.setDate(d.getDate() + 7);
  else d.setMonth(d.getMonth() + 1);
  return d.getTime();
};

/**
 * The first instant the range includes. `all` starts at the earliest game.
 */
export const rangeStart = (range: TrendRange, games: GameResult[], now: number): number => {
  if (range === 'all') {
    if (games.length === 0) return startOfDay(now);
    return Math.min(...games.map((g) => g.timestamp));
  }
  const days = range === '30d' ? 30 : range === '90d' ? 90 : 365;
  return startOfDay(now - (days - 1) * DAY_MS);
};

/**
 * Bucket width is chosen so a range never renders more than ~60 columns: past
 * that the bars are thinner than the gaps between them and the axis is unreadable.
 */
export const granularityFor = (range: TrendRange, spanDays: number): Granularity => {
  if (range === '30d') return 'day';
  if (range === '90d') return 'week';
  if (range === '1y') return 'month';
  return spanDays <= 60 ? 'day' : spanDays <= 400 ? 'week' : 'month';
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const labelsFor = (start: number, granularity: Granularity): { label: string; fullLabel: string } => {
  const d = new Date(start);
  const md = `${d.getMonth() + 1}/${d.getDate()}`;
  if (granularity === 'month') {
    return { label: `${MONTHS[d.getMonth()]}`, fullLabel: `${MONTHS[d.getMonth()]} ${d.getFullYear()}` };
  }
  if (granularity === 'week') {
    const end = new Date(nextBucket(start, 'week') - DAY_MS);
    return { label: md, fullLabel: `Week of ${MONTHS[d.getMonth()]} ${d.getDate()} – ${MONTHS[end.getMonth()]} ${end.getDate()}` };
  }
  return { label: md, fullLabel: `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}` };
};

/**
 * Bucket games into a *continuous* series of periods across the range.
 *
 * The empty periods are the point. The previous version plotted only the days
 * that had games, on a time axis, joined with a monotone spline — so a two-month
 * gap between sessions was drawn as a confident curve through data that does not
 * exist. Emitting every period in the range, including the zero ones, is what
 * lets the chart show a quiet month as a quiet month.
 */
export const buildTrend = (games: GameResult[], range: TrendRange, now: number = Date.now()): Trend => {
  const from = rangeStart(range, games, now);
  const inRange = games.filter((g) => g.timestamp >= from && g.timestamp <= now);
  const spanDays = Math.max(1, Math.ceil((now - from) / DAY_MS));
  const granularity = granularityFor(range, spanDays);

  const byBucket = new Map<number, TrendBucket>();
  const first = bucketStart(from, granularity);
  const last = bucketStart(now, granularity);
  for (let start = first; start <= last; start = nextBucket(start, granularity)) {
    byBucket.set(start, { start, ...labelsFor(start, granularity), games: 0, wins: 0, losses: 0, saved: 0, killed: 0 });
  }

  inRange.forEach((g) => {
    const bucket = byBucket.get(bucketStart(g.timestamp, granularity));
    // A game timestamped after `now` (clock skew on another device) has no
    // bucket; drop it rather than inventing a period past the end of the axis.
    if (!bucket) return;
    bucket.games += 1;
    if (g.outcome === 'won') bucket.wins += 1;
    else bucket.losses += 1;
    bucket.saved += g.victimsSaved || 0;
    bucket.killed += g.victimsKilled || 0;
  });

  return {
    buckets: Array.from(byBucket.values()),
    granularity,
    gamesInRange: inRange.length,
  };
};
