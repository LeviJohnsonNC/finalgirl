import { useId, useState } from 'react';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import type { computeArchetype, StyleDimension } from '@/hooks/useArchetypeScoring';
import type { usePlayStyle } from '@/hooks/usePlayStyle';
import type { StyleFinding } from '@/lib/playStyle';

interface PlayerArchetypeProps {
  profile: ReturnType<typeof computeArchetype>;
  play: ReturnType<typeof usePlayStyle>;
  onOpenSession?: (gameId: string) => void;
}

const dimensions: Record<StyleDimension, { title: string; measure: string; color: string; unit: string }> = {
  duelist: { title: 'Duelist', measure: 'Low-Horror finishes', color: 'text-vhs-yellow', unit: 'games' },
  protector: { title: 'Protector', measure: 'Victim rescues', color: 'text-neon-cyan', unit: 'games' },
  survivor: { title: 'Survivor', measure: 'Close finishes', color: 'text-blood-red', unit: 'wins' },
  gambler: { title: 'Gambler', measure: 'Pressure swings', color: 'text-archetype-gambler', unit: 'comparisons' },
};

const caseDate = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' });

function Finding({ finding, onOpenSession }: { finding: StyleFinding; onOpenSession?: PlayerArchetypeProps['onOpenSession'] }) {
  const example = finding.cases[0];
  const [expanded, setExpanded] = useState(false);
  const caseListId = useId();
  return (
    <article className="style-finding">
      <p className="style-kicker">{finding.label}</p>
      <h4>{finding.title}</h4>
      <p className="archetype-reason">{finding.detail}</p>
      <div className="style-finding-actions">
        {onOpenSession && example && (
          <button type="button" onClick={() => onOpenSession(example.id)}>
            Open example <ArrowUpRight aria-hidden="true" />
          </button>
        )}
        <button type="button" aria-expanded={expanded} aria-controls={caseListId} onClick={() => setExpanded(value => !value)}>
          {expanded ? 'Hide cases' : `See ${finding.cases.length} cases`} <ChevronDown aria-hidden="true" />
        </button>
      </div>
      <div className="style-cases" id={caseListId} hidden={!expanded}>
        {expanded && <ul aria-label={`Cases for ${finding.title}`} tabIndex={finding.cases.length > 3 ? 0 : undefined}>
          {finding.cases.map(item => (
            <li key={item.id}>
              <p className="style-case-cast">{item.finalGirl} vs. {item.killer}</p>
              <p>{item.location} · {item.outcome === 'won' ? 'Won' : 'Lost'} · {caseDate.format(item.timestamp)}</p>
              <p className="style-case-note">{item.note}</p>
              {item.beats.length > 0 && (
                <ol>{item.beats.map((beat, index) => <li key={index}>{beat}</li>)}</ol>
              )}
              {onOpenSession && (
                <button type="button" onClick={() => onOpenSession(item.id)} aria-label={`Open case for ${item.finalGirl} vs. ${item.killer} at ${item.location}, ${caseDate.format(item.timestamp)}`}>
                  Open case <ArrowUpRight aria-hidden="true" />
                </button>
              )}
            </li>
          ))}
        </ul>}
      </div>
    </article>
  );
}

export function PlayerArchetypeBadge({ profile, play, onOpenSession }: PlayerArchetypeProps) {
  const { archetype, blend, summary, scores } = profile;
  const lead = archetype === 'newcomer' ? undefined : dimensions[archetype];
  const runnerUp = blend ? dimensions[blend] : undefined;
  return (
    <section className={`archetype-badge archetype-${archetype}`} aria-labelledby="style-title">
      <div className="archetype-content">
        <header>
          <p className="archetype-eyebrow">// Your style</p>
          <p className="style-kicker">Career profile</p>
          <h3 className="archetype-name" id="style-title">
            {lead ? <span className={lead.color}>{runnerUp ? lead.title : `The ${lead.title}`}</span> : 'Style in the making'}
            {runnerUp && <> <span className="style-title-divider">/</span> <span className={runnerUp.color}>{runnerUp.title}</span></>}
          </h3>
        </header>

        <ul className="style-profile-facts">
          {summary.map(fact => <li key={fact} className="archetype-reason">{fact}</li>)}
        </ul>

        <section className="style-reel" aria-labelledby="style-reel-title">
          <div className="style-reel-head">
            <h4 id="style-reel-title">From recent Play logs</h4>
            {play.report && <p>{play.report.recorded} of {play.report.total} recent games with usable logs</p>}
          </div>
          {play.status === 'loading' && <p className="archetype-reason" role="status">Loading Play evidence…</p>}
          {play.status === 'error' && (
            <p className="archetype-reason" role="status">
              Play evidence is temporarily unavailable. <button className="style-retry" type="button" onClick={play.retry}>Retry</button>
            </p>
          )}
          {play.report && play.report.findings.length === 0 && (
            <p className="archetype-reason">
              {play.report.recorded === 0
                ? 'Finish a game with rounds, rescues or tracker changes recorded in Play to start building this reel.'
                : 'The logs are coming in. Findings appear when a pattern has enough recorded games behind it.'}
            </p>
          )}
          {play.report?.findings.map(finding => <Finding key={finding.id} finding={finding} onOpenSession={onOpenSession} />)}
        </section>

        <details className="archetype-more">
          <summary>How your style is measured</summary>
          <p className="archetype-reason">
            The profile looks across your saved archive, with more weight on recent games. Similar patterns share the title.
          </p>
          <dl className="style-dimensions">
            {scores.map(standing => {
              const cfg = dimensions[standing.archetype];
              return (
                <div className="archetype-score-row" key={standing.archetype}>
                  <dt className={cfg.color}>{cfg.measure}</dt>
                  <dd className="archetype-reason">
                    {standing.support ? standing.evidence : 'No usable observations yet.'}
                    {standing.of > 0 && <small>{standing.support} of {standing.of} {cfg.unit} included</small>}
                  </dd>
                </div>
              );
            })}
          </dl>
        </details>
      </div>
    </section>
  );
}
