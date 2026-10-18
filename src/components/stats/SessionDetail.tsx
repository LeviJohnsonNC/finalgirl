import { ComputedStats } from '@/hooks/useGameStats';

interface SessionDetailProps {
  stats: ComputedStats;
  /** Open this session in its scrapbook. Rows are inert without it. */
  onOpenSession?: (gameId: string) => void;
}

const formatDate = (ts: number) => {
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()}/${String(d.getFullYear()).slice(2)}`;
};

/**
 * The three things the app has always recorded and never shown: how tense the
 * games got, what was in her hands, and what happened lately.
 *
 * All three read off fields already on GameResult — finalHorrorLevel,
 * weaponUsed and the session list — which until now existed only to be fed to
 * the archetype prose.
 */
export const SessionDetail = ({ stats, onOpenSession }: SessionDetailProps) => {
  const { horrorBins, horrorRecorded, weapons, recentSessions } = stats;
  const peakHorror = Math.max(...horrorBins.map((b) => b.games), 1);
  const mostUsed = weapons[0]?.uses ?? 1;

  if (
    horrorRecorded === 0 &&
    weapons.length === 0 &&
    recentSessions.length === 0
  )
    return null;

  return (
    <div className="session-detail">
      <h2 className="section-title">// THE TAPE LOG</h2>

      <div className="session-detail-grid">
        {stats.playStats && (
          <section
            className="session-card"
            aria-label="Recorded play statistics"
          >
            <header className="session-card-head">
              <h4 className="session-card-title">How long the night lasted</h4>
              <p className="session-card-sub">
                {stats.playStats.roundsRecorded} of {stats.gamesPlayed} sessions
                recorded rounds
              </p>
            </header>
            <p className="font-vhs text-4xl text-secondary">
              {stats.playStats.averageRounds?.toFixed(1) ?? '—'}{' '}
              <span className="type-caption text-muted-foreground">
                rounds on average
              </span>
            </p>
            <dl className="type-body-sm text-muted-foreground mt-3 space-y-2">
              <div className="flex justify-between">
                <dt>Wins</dt>
                <dd>{stats.playStats.wonAverageRounds?.toFixed(1) ?? '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Losses</dt>
                <dd>{stats.playStats.lostAverageRounds?.toFixed(1) ?? '—'}</dd>
              </div>
            </dl>
            <p className="type-caption text-muted-foreground mt-4">
              Victim totals recorded: {stats.playStats.savedRecorded} saved /{' '}
              {stats.playStats.killedRecorded} killed sessions. Missing values
              are excluded from averages.
            </p>
          </section>
        )}

        {horrorRecorded > 0 && (
          <section
            className="session-card"
            aria-label="Horror level at the end of each game"
          >
            <header className="session-card-head">
              <h4 className="session-card-title">Horror at the end</h4>
              <p className="session-card-sub">
                {horrorRecorded} of {stats.gamesPlayed} sessions recorded
              </p>
            </header>
            {/* Level is on the axis, so the bars are one colour: ramping them
                would encode the level twice and say nothing new. */}
            <ol className="horror-chart">
              {horrorBins.map((bin) => (
                <li key={bin.level} className="horror-col">
                  <span className="horror-count">{bin.games || ''}</span>
                  <span className="horror-track">
                    <span
                      className="horror-bar"
                      style={{ height: `${(bin.games / peakHorror) * 100}%` }}
                    />
                  </span>
                  <span className="horror-level">{bin.level}</span>
                  <span className="sr-only">
                    {bin.games} {bin.games === 1 ? 'game' : 'games'} ended at
                    horror level {bin.level}
                  </span>
                </li>
              ))}
            </ol>
            <p className="horror-scale">
              <span>Calm</span>
              <span>Carnage</span>
            </p>
          </section>
        )}

        {weapons.length > 0 && (
          <section className="session-card" aria-label="Weapons used">
            <header className="session-card-head">
              <h4 className="session-card-title">In her hands</h4>
              <p className="session-card-sub">Most-used weapons</p>
            </header>
            <dl className="weapon-list stats-scroll-list" tabIndex={0} aria-label="All recorded weapons">
              {weapons.map((weapon) => (
                <div key={weapon.name} className="weapon-row">
                  <dt className="weapon-name" title={weapon.name}>{weapon.name}</dt>
                  <dd className="weapon-meter">
                    <span
                      className="weapon-bar"
                      style={{ width: `${(weapon.uses / mostUsed) * 100}%` }}
                    />
                  </dd>
                  <dd className="weapon-count">
                    <span aria-hidden="true">{weapon.uses}</span>
                    <span className="sr-only">
                      {weapon.uses} {weapon.uses === 1 ? 'use' : 'uses'},
                    </span>
                    <span className="weapon-wins">{weapon.wins} won</span>
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {recentSessions.length > 0 && (
          <section
            className="session-card session-card-wide"
            aria-label="Recent sessions"
          >
            <header className="session-card-head">
              <h4 className="session-card-title">Recent sessions</h4>
              <p className="session-card-sub">Newest first</p>
            </header>
            <ol className="session-list stats-scroll-list" tabIndex={0} aria-label="Latest recorded sessions">
              {recentSessions.map((session) => {
                const body = (
                  <>
                    <span
                      className={`session-outcome ${
                        session.outcome === 'won'
                          ? 'session-outcome-won'
                          : 'session-outcome-lost'
                      }`}
                    >
                      {session.outcome === 'won' ? 'Won' : 'Lost'}
                    </span>
                    <span className="session-cast">
                      <span className="session-girl">{session.finalGirl}</span>
                      <span className="session-vs">vs</span>
                      <span className="session-killer">{session.killer}</span>
                    </span>
                    <span className="session-place">{session.location}</span>
                    <span className="session-meta">
                      {session.horror !== null && (
                        <span className="session-horror">
                          H{session.horror}
                        </span>
                      )}
                      <span className="session-date">
                        {formatDate(session.timestamp)}
                      </span>
                    </span>
                  </>
                );

                // A row is a button only when there is somewhere for it to go.
                return (
                  <li key={session.id} className="session-item">
                    {onOpenSession ? (
                      <button
                        type="button"
                        className="session-row session-row-link"
                        onClick={() => onOpenSession(session.id)}
                      >
                        {body}
                        <span className="sr-only">
                          — open this session in the{' '}
                          {session.outcome === 'won' ? 'Final Girl' : 'killer'}{' '}
                          scrapbook
                        </span>
                      </button>
                    ) : (
                      <span className="session-row">{body}</span>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>
        )}
      </div>
    </div>
  );
};
