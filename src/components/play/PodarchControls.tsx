import { useState } from 'react';
import { PODARCHS, PODARCH_MODULE, PODARCH_MINORS, PODARCH_FINALES } from '../../../supabase/functions/_shared/play/podarchs';
import { newPlayEvent, summarizePlay } from '@/lib/play/events';
import { moduleState } from '@/lib/play/modules';
import { HealthlessMinorControl } from './HealthlessMinorControl';
import { KillerCards } from './KillerCards';
import { MinorPowerSection } from './MinorPowerSection';
import type { ModuleArt } from './ModuleArtwork';
import { PodarchAssimilation } from './PodarchAssimilation';
import { podarchArt } from './podarchArt';
import { useModuleRecord } from './useModuleRecord';
import type { ControlsProps } from './moduleDefinitions';

type Props = Pick<ControlsProps, 'events' | 'onEvent' | 'blocked'>;

export function PodarchMinor({ id, name, art, events, onEvent, blocked }: Props & { id:string; name:string; art:ModuleArt }) {
  const entries = summarizePlay(events).entries;
  const fields = moduleState(entries, PODARCH_MODULE);
  const revealed = entries.some(e => e.momentType === 'finale');
  const { record, message } = useModuleRecord(events, onEvent);
  const change = (value: string | null) => record(newPlayEvent({kind:'module',moduleData:{module:PODARCH_MODULE,changes:{[id]:value}}}));
  return <><HealthlessMinorControl name={name} value={fields[id] as string | undefined} art={art}
    disabled={Boolean(blocked || revealed)} activationBlocked={revealed}
    onActivate={() => change('active')} onEnd={() => change('removed')} onCorrect={change} />
    {message && <p role="alert">{message}</p>}</>;
}

export function PodarchControls({events,onEvent,blocked}: Props) {
  const entries = summarizePlay(events).entries;
  const fields = moduleState(entries, PODARCH_MODULE);
  const [more, setMore] = useState(false);
  const recorded = PODARCH_MINORS.filter(c => fields[c.id] != null);
  const activeFinale = PODARCH_FINALES.find(c => c.name === entries.find(e => e.momentType === 'finale')?.killerCard);
  return <div className="podarch-controls">
    {activeFinale?.id !== 'countdown' && <PodarchAssimilation entries={entries} events={events} onEvent={onEvent} disabled={blocked} />}
    <MinorPowerSection>
      <div className="module-minor-grid">
        {(recorded.length && !more ? recorded : PODARCH_MINORS).map(c => <PodarchMinor key={c.id} {...c} art={podarchArt(c.id)} events={events} onEvent={onEvent} blocked={blocked}/>)}
      </div>
      {recorded.length === 1 && <button type="button" className="module-change-choice" onClick={() => setMore(!more)}>{more ? 'Done choosing Minor Powers' : 'Add another Minor Power'}</button>}
    </MinorPowerSection>
    <KillerCards killer={PODARCHS} events={events} onEvent={onEvent} disabled={blocked}/>
  </div>;
}
