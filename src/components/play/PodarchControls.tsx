import { useState } from 'react';
import { PODARCHS, PODARCH_MODULE, PODARCH_MINORS, PODARCH_FINALES } from '../../../supabase/functions/_shared/play/podarchs';
import { newPlayEvent, summarizePlay } from '@/lib/play/events';
import { moduleState, type ModuleValue } from '@/lib/play/modules';
import { HealthlessMinorControl } from './HealthlessMinorControl';
import { HealthTokens } from './HealthTokens';
import { IllustratedTile } from './IllustratedTile';
import { KillerCards } from './KillerCards';
import { MinorPowerSection } from './MinorPowerSection';
import { ModuleArtwork, type ModuleArt } from './ModuleArtwork';
import { PlaySelect } from './PlaySelect';
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
  const {record,message} = useModuleRecord(events,onEvent);
  const [more, setMore] = useState(false);
  const recorded = PODARCH_MINORS.filter(c => fields[c.id] != null);
  const activeFinale = PODARCH_FINALES.find(c => c.name === entries.find(e => e.momentType === 'finale')?.killerCard);
  const change = (changes:Record<string,ModuleValue>) => record(newPlayEvent({kind:'module',moduleData:{module:PODARCH_MODULE,changes}}));
  const objective = activeFinale?.id;
  const cap = objective === 'leader' ? 5 : 6;
  const value = objective ? Number(fields[objective] ?? cap) : undefined;
  return <div className="podarch-controls">
    <IllustratedTile className="module-control-tile" art={podarchArt('assimilation')} title="Victim assimilated" status="Remember this moment"
      disabled={blocked} onClick={() => change({assimilated:true})} />
    <MinorPowerSection>
      <div className="module-minor-grid">
        {(recorded.length && !more ? recorded : PODARCH_MINORS).map(c => <PodarchMinor key={c.id} {...c} art={podarchArt(c.id)} events={events} onEvent={onEvent} blocked={blocked}/>)}
      </div>
      {recorded.length === 1 && <button type="button" className="module-change-choice" onClick={() => setMore(!more)}>{more ? 'Done choosing Minor Powers' : 'Add another Minor Power'}</button>}
    </MinorPowerSection>
    <KillerCards killer={PODARCHS} events={events} onEvent={onEvent} disabled={blocked}/>
    {objective && value !== undefined && <section className="podarch-objective" aria-label="Finale objective">
      <ModuleArtwork art={podarchArt(objective === 'greenhouse' && value === 0 ? 'ruins' : objective)}/>
      <div><h3>{objective === 'greenhouse' ? 'The Greenhouse' : objective === 'leader' ? 'The Leader' : 'Countdown'}</h3>
        {objective === 'countdown' ? <PlaySelect aria-label="Countdown remaining" value={String(value)} disabled={blocked} onChange={e=>change({countdown:Number(e.target.value)})}>
          {[6,5,4,3,2,1,0].map(n=><option key={n} value={n}>{n} remaining</option>)}
        </PlaySelect> : <HealthTokens name={objective === 'leader' ? 'Leader' : 'Greenhouse'} health={value} maxHealth={cap} disabled={blocked}
          onChange={n=>change({[objective]:n})}/>}
        {objective === 'greenhouse' && value === 0 && <p>Escape at an exit with no Assimilated there.</p>}
        {objective === 'countdown' && value === 0 && <p>Check the loss condition at the start of the Killer phase.</p>}
        {objective === 'leader' && (value === 0 || fields.leaderFinal) &&
          <PlaySelect aria-label="Leader Final Health" disabled={blocked} value={String(fields.leaderFinal ?? 'unresolved')}
            onChange={e=>change({leaderFinal:e.target.value})}>
            <option value="unresolved">Check Final Health</option><option value="recovered">Recovered · record Health</option><option value="defeated">Leader defeated</option>
          </PlaySelect>}
      </div>
    </section>}
    {message && <p role="alert">{message}</p>}
  </div>;
}
