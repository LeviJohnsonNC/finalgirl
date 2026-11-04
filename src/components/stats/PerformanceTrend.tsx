import { useMemo } from 'react';
import { buildPerformanceTrend, MIN_MATCHED_PAIRS, type PerformanceGame } from '@/lib/performanceTrend';

const date = (timestamp: number) => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(timestamp);
const range = (games: PerformanceGame[]) => games.length ? `${date(games[games.length - 1].timestamp)} – ${date(games[0].timestamp)}` : 'No earlier games yet';
const rate = (wins: number, total: number) => total ? `${Math.round(100 * wins / total)}%` : '—';

export function PerformanceTrend({ games, onOpenSession }: { games: PerformanceGame[]; onOpenSession?: (id: string) => void }) {
  const report = useMemo(() => buildPerformanceTrend(games), [games]);
  const { matched, pairs } = report;
  const direction = matched.difference === 0 ? 'The same win rate in repeated casts' : matched.difference! > 0 ? 'A higher win rate in repeated casts' : 'A lower win rate in repeated casts';
  return <section className="performance-trend" aria-label="Recent versus earlier results">
    <p className="style-kicker">Recent vs. earlier</p>
    <h4>{report.comparable ? direction : 'Your recent results'}</h4>
    <div className="performance-periods">
      {(['earlier', 'recent'] as const).map(period => <div key={period}>
        <p className="style-kicker">{period === 'recent' ? 'Latest' : 'Previous'} {report[period].length} games</p>
        <strong>{rate(report[`${period}Wins`], report[period].length)}</strong>
        <p>{report[`${period}Wins`]} wins / {report[period].length} games</p>
        <small>{range(report[period])}</small>
      </div>)}
    </div>
    <p className="performance-note">Wins and losses are both included. Different casts can change these results.</p>
    {report.comparable ? <>
      <div className="performance-matched">
        <p className="style-kicker">Same Final Girl · Killer · Location</p>
        <p><strong>{rate(matched.earlierWins, pairs.length)} → {rate(matched.recentWins, pairs.length)}</strong>
          {' · '}{matched.difference! > 0 ? '+' : ''}{Number(matched.difference!.toFixed(1))} percentage points</p>
        <p>{matched.earlierWins} → {matched.recentWins} wins across {pairs.length} matched pairs.</p>
      </div>
      <p className="performance-note">{pairs.length < 10 ? 'Small sample. ' : ''}This describes your results, not proof of improved skill. Card draws, setups and difficulty may differ.</p>
      <dl className="performance-metrics">
        {([{ key: 'rescues', title: 'Victims saved per game' }, { key: 'horror', title: 'Horror at the finish' }] as const).map(({ key, title }) => {
          const metric = report[key];
          return <div key={key}><dt>{title}</dt><dd>{metric.pairs >= MIN_MATCHED_PAIRS
            ? `${metric.earlier!.toFixed(1)} → ${metric.recent!.toFixed(1)} · ${metric.pairs} pairs`
            : `${metric.pairs} pairs with both values recorded · more needed`}</dd></div>;
        })}
      </dl>
      <p className="performance-note">Supporting measures describe different outcomes; they are not combined into a score.</p>
    </> : <p className="archetype-reason">{report.earlier.length === 0
      ? 'Earlier comparisons begin after 20 recorded games.'
      : `${pairs.length} matched ${pairs.length === 1 ? 'pair' : 'pairs'} across these periods. At least ${MIN_MATCHED_PAIRS} are needed for a same-cast comparison.`}</p>}
    <details className="performance-evidence">
      <summary>How this comparison works{pairs.length ? ` · ${pairs.length} matched pairs` : ''}</summary>
      <p>Latest 20 completed games versus the previous 20, newest first. Each game is used once. Matching uses the same Final Girl, killer and location, includes wins and losses, and never chooses games by their result. Missing values stay unknown.</p>
      {pairs.length > 0 && <ol tabIndex={0} aria-label="Games included in the matched comparison">{pairs.map(pair => <li key={pair.recent.id}>
        <strong>{pair.recent.finalGirl} vs. {pair.recent.killer}</strong><p>{pair.recent.location}</p>
        {(['earlier', 'recent'] as const).map(period => <div key={period}>
          {onOpenSession ? <button type="button" onClick={() => onOpenSession(pair[period].id)} aria-label={`Open ${period} case for ${pair[period].finalGirl} vs. ${pair[period].killer}, ${date(pair[period].timestamp)}`}>
            {period === 'recent' ? 'Recent' : 'Earlier'} · {date(pair[period].timestamp)} · {pair[period].outcome === 'won' ? 'Won' : 'Lost'}
          </button> : <span>{period} · {date(pair[period].timestamp)} · {pair[period].outcome}</span>}
        </div>)}
      </li>)}</ol>}
    </details>
  </section>;
}
