import { PlayerArchetype as ArchetypeType } from '@/hooks/useGameStats';
import { ArchetypeStanding } from '@/hooks/useArchetypeScoring';

interface PlayerArchetypeProps {
  archetype: ArchetypeType;
  reason: string;
  profile: string;
  scores: ArchetypeStanding[];
}

const archetypeConfig: Record<ArchetypeType, { name: string; color: string; bgClass: string; blurb: string }> = {
  protector: {
    name: 'The Protector',
    color: 'text-neon-cyan',
    bgClass: 'archetype-protector',
    blurb: 'Victims saved',
  },
  duelist: {
    name: 'The Duelist',
    color: 'text-vhs-yellow',
    bgClass: 'archetype-duelist',
    blurb: 'Clean, efficient wins',
  },
  survivor: {
    name: 'The Survivor',
    color: 'text-blood-red',
    bgClass: 'archetype-survivor',
    blurb: 'Wins at a sliver of health',
  },
  gambler: {
    // Was text-purple-400. The design system has no purple in it, and CLAUDE.md
    // rules it out by name; sickly green is the palette's own fourth voice.
    name: 'The Gambler',
    color: 'text-archetype-gambler',
    bgClass: 'archetype-gambler',
    blurb: 'Wild swings in horror',
  },
  newcomer: {
    name: 'Newcomer',
    color: 'text-dim',
    bgClass: 'archetype-newcomer',
    blurb: 'Not enough games yet',
  },
};

/**
 * The player's style, as a profile card rather than a footnote.
 *
 * The scoring already computed all four archetypes and the page kept only the
 * winner — throwing away the interesting part. A 62/58 split says more about
 * how someone plays than the winning label does, so the ranking is shown.
 */
export const PlayerArchetypeBadge = ({ archetype, profile, scores }: PlayerArchetypeProps) => {
  const config = archetypeConfig[archetype];
  const paragraphs = profile.split('\n\n').filter(Boolean);
  const leader = scores[0];
  const runnerUp = scores[1];
  // "Razor-thin" is a claim the prose already makes; this is the number behind it.
  const margin = leader && runnerUp ? leader.score - runnerUp.score : null;

  return (
    <section className={`archetype-badge ${config.bgClass}`} aria-label="Player archetype">
      <div className="archetype-content">
        <header className="archetype-head">
          <div>
            <p className="archetype-eyebrow">Your style</p>
            <h3 className={`archetype-name ${config.color}`}>{config.name}</h3>
          </div>
          {margin !== null && (
            <p className="archetype-margin">
              {margin === 0
                ? 'Dead tie with '
                : margin <= 5
                  ? 'Just ahead of '
                  : `${margin} points clear of `}
              <span className={archetypeConfig[runnerUp.archetype].color}>
                {archetypeConfig[runnerUp.archetype].name}
              </span>
            </p>
          )}
        </header>

        <div className="archetype-profile">
          {paragraphs.map((p, i) => (
            <p key={i} className="archetype-reason">
              {p}
            </p>
          ))}
        </div>

        {scores.length > 1 && (
          <div className="archetype-scores">
            <p className="archetype-scores-label">
              How you score on each · sessions the score is built from
            </p>
            <dl className="archetype-score-list">
              {scores.map((standing) => {
                const cfg = archetypeConfig[standing.archetype];
                return (
                  <div key={standing.archetype} className="archetype-score-row">
                    <dt
                      className={`archetype-score-name ${
                        standing.support === 0
                          ? 'text-dimmer'
                          : standing.archetype === archetype
                            ? cfg.color
                            : 'text-dim'
                      }`}
                    >
                      {cfg.name.replace('The ', '')}
                      <span className="archetype-score-blurb">{cfg.blurb}</span>
                    </dt>
                    <dd className="archetype-score-meter">
                      <span
                        className={`archetype-score-fill archetype-fill-${standing.archetype}`}
                        style={{ width: `${standing.score}%` }}
                      />
                    </dd>
                    <dd className="archetype-score-value">
                      {standing.score}
                      {/* What the number is built on. A 71 from four sessions
                          and a 71 from forty are not the same claim. */}
                      <span className="archetype-score-support">
                        {standing.support === 0
                          ? 'not recorded'
                          : `${standing.support}/${standing.of}`}
                      </span>
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>
        )}
      </div>
    </section>
  );
};
