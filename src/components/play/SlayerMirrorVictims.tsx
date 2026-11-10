import { FALCONWOOD, FALCONWOOD_MISSIONS, FALCONWOOD_PEOPLE, missionById, missionByName } from '../../../supabase/functions/_shared/play/falconwood';
import { MAX_MIRROR_VICTIMS, SLAYER_MARKERS, slayerState, type SlayerCommand } from '@/lib/play/slayer';
import { falconwoodArt } from './falconwoodArt';
import { ModuleArtwork } from './ModuleArtwork';
import { PlaySelect } from './PlaySelect';
import { slayerArt } from './slayerArt';

const portraits = [
  ...FALCONWOOD_MISSIONS.map(mission => ({label:mission.friend, art:falconwoodArt(`${mission.id}-person`)})),
  ...FALCONWOOD_PEOPLE.map(label => ({label, art:falconwoodArt(label.toLowerCase().replace(/ /g, '-'))})),
];

export function SlayerMirrorVictims({state, act, blocked, location, mission}: {
  state: ReturnType<typeof slayerState>;
  act: (command: SlayerCommand) => boolean;
  blocked?: boolean;
  location: string;
  mission?: string | null;
}) {
  const count = state.mirrorVictims;
  const selected = missionById(mission) ?? missionByName(mission);
  const choices = location === FALCONWOOD
    ? portraits.filter(person => !selected || person.label === selected.friend || FALCONWOOD_PEOPLE.some(label => label === person.label))
    : [];
  const used = SLAYER_MARKERS.filter(id => state.markers[id]);
  const inMirror = used.filter(id => state.markers[id]?.dimension === 'mirror');
  const free = SLAYER_MARKERS.find(id => !state.markers[id]);
  const toggle = (label: string) => {
    const id = used.find(id => state.markers[id]?.label === label);
    if (id) act({command:'set-marker',id,to:state.markers[id]?.dimension === 'mirror' ? 'our' : 'mirror'});
    else if (free) act({command:'track-marker',id:free,label,dimension:'mirror'});
  };
  return <article className="slayer-tracker" aria-label="Mirror Dimension">
    <div className="slayer-tracker-photo slayer-mirror-photo">
      <ModuleArtwork art={slayerArt(`mirror-victims-${count ?? 0}`)}/>
      <div className="slayer-mirror-people" role="group" aria-label="Special Victims in Mirror Dimension">
        {inMirror.map(id => {
          const marker = state.markers[id]!;
          const person = portraits.find(person => location === FALCONWOOD && person.label === marker.label);
          const label = marker.label || `Special Victim ${id}`;
          return <button key={id} type="button" className="slayer-mirror-person" disabled={blocked}
            aria-label={`Return ${label} to Our Dimension`} onClick={() => act({command:'set-marker',id,to:'our'})}>
            {person ? <ModuleArtwork art={person.art}/> : <span className="slayer-marker-number">{id}</span>}
            <span>{label}</span>
          </button>;
        })}
      </div>
    </div>
    <div className="slayer-tracker-bar">
      <h3>Mirror Dimension</h3>
      <div className="slayer-mirror-stepper" role="group" aria-label="Mirror Dimension victims">
        <button type="button" aria-label="Remove a Mirror Dimension victim" disabled={blocked || count === undefined || count === 0}
          onClick={() => count !== undefined && act({command:'mirror-victims',count:count - 1})}>−</button>
        <output aria-label="Mirror Dimension victim count">{count ?? '?'}</output>
        <button type="button" aria-label="Add a Mirror Dimension victim" disabled={blocked || count === undefined || count === MAX_MIRROR_VICTIMS}
          onClick={() => count !== undefined && act({command:'mirror-victims',count:count + 1})}>+</button>
      </div>
      {count === undefined && <PlaySelect aria-label="Record Mirror Dimension victim count" value="" disabled={blocked}
        onChange={event => act({command:'mirror-victims',count:Number(event.target.value)})}>
        <option value="" disabled>Record count…</option>
        {Array.from({length:MAX_MIRROR_VICTIMS + 1}, (_, value) => <option key={value} value={String(value)}>{value}</option>)}
      </PlaySelect>}
    </div>
    {choices.length > 0 && <div className="slayer-special-choices" role="group" aria-label="Track Special Victims in Mirror Dimension">
      {choices.map(person => {
        const id = used.find(id => state.markers[id]?.label === person.label);
        const active = !!id && state.markers[id]?.dimension === 'mirror';
        return <button type="button" key={person.label} aria-pressed={active}
          disabled={blocked || (!id && !free)} onClick={() => toggle(person.label)}>
          <ModuleArtwork art={person.art}/>
          <span><strong>{person.label}</strong><small>{active ? 'In Mirror' : 'Add to Mirror'}</small></span>
        </button>;
      })}
    </div>}
  </article>;
}
