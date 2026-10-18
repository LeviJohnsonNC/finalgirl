import { GameRecord, describeRun, describeStreak } from '@/lib/gameRecord';

interface RecordPanelProps {
  record: GameRecord;
}

const formatDay = (ts: number) => {
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

export const RecordPanel = ({ record }: RecordPanelProps) => {
  const { wins, losses, played, winRate, current, bestWinRun, worstLossRun, recent } = record;
  if (played === 0) return null;

  const rounded = Math.round(winRate);
  // Below this the cyan is too narrow to hold the readout, so it moves outside
  // the fill and sits against the boundary from the other side.
  const readoutInside = winRate >= 24;
  // Below five sessions there is no trend to read, and a two-tick strip in a
  // full-width tray reads as broken rather than as sparse.
  const showForm = recent.length >= 5;

  return (
    <section className="record-panel" aria-label="Win/loss record">
      <div className="winloss-bar-container relative">
        <div
          className="winloss-bar"
          role="meter"
          aria-label="All-time win rate"
          aria-valuenow={winRate}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuetext={`${rounded} percent win rate, ${wins} ${wins === 1 ? 'win' : 'wins'} and ${losses} ${losses === 1 ? 'loss' : 'losses'}`}
        >
          {/* Both photographs keep the full tube's dimensions. Only the masks
              move, so a 10% record never squeezes the forest or its figures. */}
          <div className="footage-scene footage-scene-wins" style={{ clipPath: `inset(0 ${100 - winRate}% 0 0)` }} aria-hidden="true" />
          <div className="footage-scene footage-scene-losses" style={{ clipPath: `inset(0 0 0 ${winRate}%)` }} aria-hidden="true" />
          <div className="footage-glass" aria-hidden="true" />
          {winRate > 0 && winRate < 100 && <div className="footage-boundary" style={{ left: `${winRate}%` }} aria-hidden="true" />}

          {/* The gauge mark: where an even record would sit. Without it the
              boundary is just a position; with it, it is a verdict. */}
          <div className="winloss-even-mark" aria-hidden="true">
            <span className="winloss-even-notch winloss-even-notch-top" />
            <span className="winloss-even-notch winloss-even-notch-bottom" />
          </div>

          {/* Place the live rate on the roomier side of the true boundary. */}
          <div
            className={`winloss-readout ${readoutInside ? 'winloss-readout-inside' : 'winloss-readout-outside'}`}
            style={{ left: `${winRate}%` }}
            aria-hidden="true"
          >
            {rounded}%
          </div>
        </div>

        <div className="winloss-labels">
          <span className="winloss-count">
            <span className="winloss-count-value text-neon-cyan">{wins}</span> Wins
          </span>
          <span className="winloss-even-caption" aria-hidden="true">
            Even
          </span>
          <span className="winloss-count">
            <span className="winloss-count-value text-blood-red">{losses}</span> Losses
          </span>
        </div>
      </div>

      <div className={`record-lower ${showForm ? '' : 'record-lower-solo'}`}>
        {/* The run you are on is the live number; best and worst are the
            context for it, so they are subordinate rather than three cards of
            equal weight. */}
        <div className="record-run">
          <span className="record-run-label">Current run</span>
          <span
            className={`record-run-value ${
              current?.outcome === 'won'
                ? 'text-neon-cyan'
                : current?.outcome === 'lost'
                  ? 'text-blood-red'
                  : 'text-dim'
            }`}
          >
            {describeStreak(current)}
          </span>
          {/* Two spans rather than one string, so a narrow card breaks between
              the two facts instead of through the middle of one. The gap does
              the separating — a middot would dangle at the end of the wrap. */}
          <span className="record-run-sub">
            <span className="whitespace-nowrap">Best {describeRun(bestWinRun, 'won')}</span>
            <span className="whitespace-nowrap">Worst {describeRun(worstLossRun, 'lost')}</span>
          </span>
        </div>

        {showForm && (
          <div className="record-form">
            {/* The tray is sized from the number of ticks rather than the card,
                so twenty sessions do not leave a void at the right end and five
                do not become slabs. */}
            <div
              className={`record-form-body ${recent.length >= 20 ? 'record-form-body-fill' : ''}`}
              style={{ '--tick-count': recent.length } as React.CSSProperties}
            >
            <div className="record-form-head">
              <span className="record-form-label">Last {recent.length} sessions</span>
              <span className="record-form-hint" aria-hidden="true">
                oldest → latest
              </span>
            </div>
            <ol className="record-form-strip">
              {recent.map((entry, i) => (
                <li
                  key={entry.id}
                  className={`record-form-tick ${
                    entry.outcome === 'won' ? 'record-form-tick-won' : 'record-form-tick-lost'
                  } ${i === recent.length - 1 ? 'record-form-tick-latest' : ''}`}
                  // Older sessions recede so the strip reads as a direction in
                  // time rather than as twenty facts of equal weight.
                  style={{ opacity: 0.58 + (0.42 * i) / Math.max(recent.length - 1, 1) }}
                  title={`${entry.outcome === 'won' ? 'Won' : 'Lost'} — ${entry.finalGirl} vs ${entry.killer}, ${formatDay(entry.timestamp)}`}
                >
                  <span className="sr-only">
                    {entry.outcome === 'won' ? 'Won' : 'Lost'}: {entry.finalGirl} vs {entry.killer} on{' '}
                    {formatDay(entry.timestamp)}
                  </span>
                </li>
              ))}
            </ol>
            </div>
          </div>
        )}
      </div>

    </section>
  );
};
