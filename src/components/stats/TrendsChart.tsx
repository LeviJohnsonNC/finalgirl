import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from 'recharts';
import { Table2, BarChart3 } from 'lucide-react';
import { GameResult } from '@/hooks/useGameHistory';
import { RANGE_OPTIONS, TrendBucket, TrendRange, buildTrend } from '@/lib/statsTrends';

type ChartView = 'victims' | 'games' | 'winloss';

interface SeriesSpec {
  key: 'saved' | 'killed' | 'games' | 'wins' | 'losses';
  name: string;
  color: string;
}

/**
 * Series colours come from the design tokens, but not the ones the old chart
 * used: `--blood-red` (#9e0000) sits at 2.3:1 against the 4%-lightness page and
 * is not readable as a mark. `--blood-red-glow` clears 3:1 and keeps the wider
 * separation from cyan under deuteranopia (ΔE 34.5 vs 41.8 — both far above the
 * threshold), so the blood/survival semantics survive intact.
 */
const SERIES: Record<ChartView, SeriesSpec[]> = {
  victims: [
    { key: 'saved', name: 'Saved', color: 'hsl(var(--neon-cyan))' },
    { key: 'killed', name: 'Killed', color: 'hsl(var(--blood-red-glow))' },
  ],
  games: [{ key: 'games', name: 'Games', color: 'hsl(var(--vhs-yellow))' }],
  winloss: [
    { key: 'wins', name: 'Wins', color: 'hsl(var(--neon-cyan))' },
    { key: 'losses', name: 'Losses', color: 'hsl(var(--blood-red-glow))' },
  ],
};

const VIEW_OPTIONS: { key: ChartView; label: string; title: string }[] = [
  { key: 'victims', label: 'Victims', title: 'Victims' },
  { key: 'games', label: 'Games', title: 'Sessions' },
  { key: 'winloss', label: 'W / L', title: 'Wins & Losses' },
];

const GRANULARITY_NOUN = { day: 'day', week: 'week', month: 'month' } as const;

const TrendTooltip = ({
  active,
  payload,
  series,
}: TooltipProps<number, string> & { series: SeriesSpec[] }) => {
  if (!active || !payload?.length) return null;
  const bucket = payload[0].payload as TrendBucket;

  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-head">{bucket.fullLabel}</div>
      {bucket.games === 0 ? (
        <div className="chart-tooltip-empty">No sessions</div>
      ) : (
        <>
          {series.map((s) => (
            <div key={s.key} className="chart-tooltip-row">
              <span className="chart-tooltip-key" style={{ background: s.color }} />
              {/* Value leads, series name follows — the reader already knows
                  which series they are pointing at; they came for the number. */}
              <span className="chart-tooltip-value">{bucket[s.key]}</span>
              <span className="chart-tooltip-name">{s.name}</span>
            </div>
          ))}
          <div className="chart-tooltip-foot">
            {bucket.games} {bucket.games === 1 ? 'session' : 'sessions'}
          </div>
        </>
      )}
    </div>
  );
};

interface TrendsChartProps {
  games: GameResult[];
}

export const TrendsChart = ({ games }: TrendsChartProps) => {
  const [range, setRange] = useState<TrendRange>('90d');
  const [view, setView] = useState<ChartView>('victims');
  const [asTable, setAsTable] = useState(false);

  const trend = useMemo(() => buildTrend(games, range), [games, range]);
  const series = SERIES[view];
  const viewMeta = VIEW_OPTIONS.find((v) => v.key === view)!;
  const rangeMeta = RANGE_OPTIONS.find((r) => r.key === range)!;

  return (
    <div className="trends-chart">
      {/* Range chips scope everything in the card below them, and sit outside
          it: the record jacket above is all-time and stays all-time. */}
      <div className="chart-filter-row">
        <span className="chart-filter-label">Window</span>
        <div className="time-filter">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              className={`filter-chip ${range === opt.key ? 'filter-chip-active' : ''}`}
              onClick={() => setRange(opt.key)}
              aria-pressed={range === opt.key}
              title={opt.full}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-container">
        <div className="chart-header">
          <div>
            <h4 className="chart-title">
              {viewMeta.title} per {GRANULARITY_NOUN[trend.granularity]}
            </h4>
            <p className="chart-subtitle">
              {rangeMeta.full} · {trend.gamesInRange} {trend.gamesInRange === 1 ? 'session' : 'sessions'}
            </p>
          </div>
          <div className="chart-controls">
            <div className="chart-toggle">
              {VIEW_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  className={`chart-toggle-btn ${view === opt.key ? 'chart-toggle-btn-active' : ''}`}
                  onClick={() => setView(opt.key)}
                  aria-pressed={view === opt.key}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {/* The table is the chart's accessible twin: every value the bars
                and the tooltip carry is readable here without a pointer. */}
            <button
              className="chart-view-btn"
              onClick={() => setAsTable((t) => !t)}
              aria-pressed={asTable}
            >
              {asTable ? <BarChart3 className="w-3.5 h-3.5" /> : <Table2 className="w-3.5 h-3.5" />}
              {asTable ? 'Chart' : 'Table'}
            </button>
          </div>
        </div>

        {series.length > 1 && (
          <div className="chart-legend">
            {series.map((s) => (
              <span key={s.key} className="chart-legend-item">
                <span className="chart-legend-key" style={{ background: s.color }} />
                {s.name}
              </span>
            ))}
          </div>
        )}

        {trend.gamesInRange === 0 ? (
          <p className="chart-empty">
            No sessions in this window. Try a wider one.
          </p>
        ) : asTable ? (
          <div className="chart-table-scroll">
            <table className="chart-table">
              <caption className="sr-only">
                {viewMeta.title} per {GRANULARITY_NOUN[trend.granularity]}, {rangeMeta.full}
              </caption>
              <thead>
                <tr>
                  <th scope="col">Period</th>
                  <th scope="col">Sessions</th>
                  {series.map((s) => (
                    <th key={s.key} scope="col">
                      {s.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {trend.buckets
                  .filter((b) => b.games > 0)
                  .map((b) => (
                    <tr key={b.start}>
                      <th scope="row">{b.fullLabel}</th>
                      <td>{b.games}</td>
                      {series.map((s) => (
                        <td key={s.key}>{b[s.key]}</td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              {/* Bars, not a line. The periods with no play are real periods
                  with a real value of zero; a spline through them draws games
                  that were never played. */}
              <BarChart data={trend.buckets} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <CartesianGrid stroke="hsl(0 0% 100% / 0.06)" vertical={false} />
                <XAxis
                  dataKey="label"
                  // Let the axis drop its own colliding ticks. A fixed interval
                  // computed from the bucket count is blind to the container
                  // width, and ran "8/17" into "8/31" on a phone.
                  interval="preserveStartEnd"
                  minTickGap={44}
                  stroke="hsl(var(--muted-foreground) / 0.5)"
                  tick={{ fontSize: 13, fontFamily: 'var(--font-vhs)' }}
                  tickLine={false}
                  axisLine={{ stroke: 'hsl(0 0% 100% / 0.12)' }}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground) / 0.5)"
                  tick={{ fontSize: 13, fontFamily: 'var(--font-vhs)' }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  width={34}
                />
                <Tooltip
                  cursor={{ fill: 'hsl(0 0% 100% / 0.05)' }}
                  content={<TrendTooltip series={series} />}
                />
                {series.map((s) => (
                  <Bar
                    key={s.key}
                    dataKey={s.key}
                    stackId="a"
                    fill={s.color}
                    name={s.name}
                    // Painted in the surface colour, this reads as a gap between
                    // stacked segments rather than as a border around them.
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                    maxBarSize={34}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};
