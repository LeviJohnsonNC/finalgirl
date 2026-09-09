import { GameRecord, describeRun, describeStreak } from '@/lib/gameRecord';

interface RecordPanelProps {
  record: GameRecord;
}

/** Bubbles are hand-placed rather than random so the tube looks the same on
 *  every render — a bubble field that reshuffles on each re-render reads as a
 *  glitch, not as liquid. */
const WIN_BUBBLES = [
  { left: 10, size: 6, bottom: 14 },
  { left: 24, size: 11, bottom: 30 },
  { left: 40, size: 5, bottom: 9 },
  { left: 56, size: 10, bottom: 22 },
  { left: 72, size: 7, bottom: 38 },
  { left: 86, size: 4, bottom: 17 },
];
const LOSS_BUBBLES = [
  { left: 12, size: 8, bottom: 22 },
  { left: 28, size: 5, bottom: 10 },
  { left: 44, size: 12, bottom: 32 },
  { left: 60, size: 6, bottom: 16 },
  { left: 76, size: 9, bottom: 26 },
  { left: 90, size: 4, bottom: 38 },
];

const formatDay = (ts: number) => {
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

/**
 * The win/loss tube, and the numbers it was never carrying.
 *
 * The glass and the liquid are unchanged — they are the best-looking thing on
 * the page. What changed is what they say: the tube used to encode exactly one
 * number (the split) and not even print it. Now the rate is labelled on the
 * mark itself, an etched mark shows where even is so the split is readable as
 * above or below it, and the run of form underneath answers the question a
 * player actually asks a record: how am I doing *lately*.
 */
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
          aria-valuenow={rounded}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuetext={`${rounded} percent win rate, ${wins} ${wins === 1 ? 'win' : 'wins'} and ${losses} ${losses === 1 ? 'loss' : 'losses'}`}
        >
          {/* Cyan liquid (wins) */}
          <div className="winloss-wins" style={{ width: `${winRate}%` }}>
            {WIN_BUBBLES.map((b, i) => (
              <div
                key={`w${i}`}
                className="winloss-bubble"
                style={{
                  left: `${b.left}%`,
                  bottom: `${b.bottom}%`,
                  width: b.size,
                  height: b.size,
                  background:
                    'radial-gradient(circle at 33% 28%, rgba(255,255,255,0.92) 0%, rgba(160,255,255,0.55) 28%, rgba(0,200,230,0.14) 65%, transparent 100%)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.4), inset 0 -1px 2px rgba(0,150,190,0.25)',
                  '--bubble-dur': `${6 + i * 3.5}s`,
                  '--bubble-delay': `${i * 1.7}s`,
                } as React.CSSProperties}
              />
            ))}
            <div className="winloss-liquid-caustic" />
            <div className="winloss-liquid-caustic-2" />
          </div>

          {/* Red liquid (losses) */}
          <div className="winloss-losses" style={{ width: `${100 - winRate}%` }}>
            {LOSS_BUBBLES.map((b, i) => (
              <div
                key={`l${i}`}
                className="winloss-bubble"
                style={{
                  left: `${b.left}%`,
                  bottom: `${b.bottom}%`,
                  width: b.size,
                  height: b.size,
                  background:
                    'radial-gradient(circle at 33% 28%, rgba(255,255,255,0.78) 0%, rgba(255,175,155,0.50) 28%, rgba(215,45,45,0.12) 65%, transparent 100%)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.4), inset 0 -1px 2px rgba(150,15,15,0.25)',
                  '--bubble-dur': `${8 + i * 3.1}s`,
                  '--bubble-delay': `${i * 2.0 + 1.3}s`,
                } as React.CSSProperties}
              />
            ))}
            <div className="winloss-liquid-caustic" style={{ animationDelay: '-3.5s' }} />
            <div className="winloss-liquid-caustic-2" style={{ animationDelay: '-7s' }} />
          </div>

          {/* Boundary swirl */}
          <div className="winloss-swirl" style={{ left: `${winRate}%` }} />

          {/* Glass overlays */}
          <div className="winloss-glass-specular" />
          <div className="winloss-glass-diffuse" />
          <div className="winloss-glass-edges" />
          <div className="winloss-glass-bottom" />

          {/* The gauge mark: where an even record would sit. Without it the
              boundary is just a position; with it, it is a verdict. */}
          <div className="winloss-even-mark" aria-hidden="true">
            <span className="winloss-even-notch winloss-even-notch-top" />
            <span className="winloss-even-notch winloss-even-notch-bottom" />
          </div>

          {/* The rate, printed on the mark it describes. Dark ink over the
              bright cyan; light ink when it has to sit out over the red. */}
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
              className="record-form-body"
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
                  title={`${entry.outcome === 'won' ? 'Survived' : 'Died'} — ${entry.finalGirl} vs ${entry.killer}, ${formatDay(entry.timestamp)}`}
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
