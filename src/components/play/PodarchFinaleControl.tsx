import { PODARCH_MODULE } from '../../../supabase/functions/_shared/play/podarchs';
import { newPlayEvent, type PlayEvent } from '@/lib/play/events';
import { moduleState, type ModuleValue } from '@/lib/play/modules';
import { HealthTokens } from './HealthTokens';
import { PlaySelect } from './PlaySelect';
import { RevealedCard } from './RevealedCard';
import type { IllustratedKillerCard } from './killerPresentation';
import { podarchArt } from './podarchArt';
import { useModuleRecord } from './useModuleRecord';

export function PodarchFinaleControl({ card, entries, events, onEvent, disabled }: {
  card: IllustratedKillerCard;
  entries: readonly PlayEvent[];
  events: PlayEvent[];
  onEvent: (event: PlayEvent) => boolean;
  disabled: boolean;
}) {
  const fields = moduleState(entries, PODARCH_MODULE);
  const { record, message } = useModuleRecord(events, onEvent);
  const objective = card.id;
  const cap = objective === 'leader' ? 5 : 6;
  const value = Number(fields[objective] ?? cap);
  const formLabel = objective === 'leader' ? 'The Leader' : objective === 'greenhouse' ? 'The Greenhouse' : 'Countdown';
  const art = objective === 'countdown' ? podarchArt(`countdown-${value}`)
    : objective === 'greenhouse' && value === 0 ? podarchArt('ruins')
    : card.heroArt;
  const change = (changes: Record<string, ModuleValue>) => record(
    newPlayEvent({ kind: 'module', moduleData: { module: PODARCH_MODULE, changes } }),
  );

  return (
    <RevealedCard card={{ ...card, heroArt: art }} label="Finale">
      <section className="podarch-objective" data-module-control="objective" aria-label="Finale objective">
        <h5>{formLabel}</h5>
        {objective === 'countdown' ? (
          <PlaySelect aria-label="Countdown remaining" value={String(value)} disabled={disabled}
            onChange={event => change({ countdown: Number(event.target.value) })}>
            {[6, 5, 4, 3, 2, 1, 0].map(n => <option key={n} value={n}>{n} remaining</option>)}
          </PlaySelect>
        ) : (
          <HealthTokens name={objective === 'leader' ? 'Leader' : 'Greenhouse'} health={value} maxHealth={cap}
            disabled={disabled} onChange={n => change({ [objective]: n })} />
        )}
        {objective === 'greenhouse' && value === 0 && <p>Escape at an exit with no Assimilated there.</p>}
        {objective === 'countdown' && value === 0 && <p>Check the loss condition at the start of the Killer phase.</p>}
        {objective === 'leader' && value === 0 && (
          <PlaySelect aria-label="Leader Final Health" disabled={disabled} value={String(fields.leaderFinal ?? 'unresolved')}
            onChange={event => change({ leaderFinal: event.target.value })}>
            <option value="unresolved">Check Final Health</option>
            <option value="recovered">Recovered · record Health</option>
            <option value="defeated">Leader defeated</option>
          </PlaySelect>
        )}
        {message && <p role="alert">{message}</p>}
      </section>
    </RevealedCard>
  );
}
