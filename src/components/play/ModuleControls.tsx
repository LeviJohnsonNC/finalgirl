import { CarnivalControls } from './CarnivalControls';
import carnivalBanner from '@/assets/play/carnival/banner.webp';
import { carnivalSummary } from '@/lib/play/modules';
import { GeppettoControls } from './GeppettoControls';
import geppettoBanner from '@/assets/play/geppetto/banner.webp';
import { geppettoPuppetCounts } from '@/lib/play/modules';
import { useAuth } from '@/hooks/useAuth';
import { summarizePlay, type PlayEvent } from '@/lib/play/events';
import { moduleState } from '@/lib/play/modules';
import { BUDDIES, SPECIAL_VICTIMS } from '../../../supabase/functions/_shared/play/buddyland';
import { CAMP_VICTIMS, HANS_MINOR_POWERS } from '../../../supabase/functions/_shared/play/camp';
import banners from '@/assets/play/modules/buddyland-banners.webp';
import hansBanner from '@/assets/play/modules/hans-header.webp';
import campBanner from '@/assets/play/camp/camp-header.webp';
import { BuddylandControls } from './BuddylandControls';
import { CampControls } from './CampControls';
import { ModulePanel } from './ModulePanel';
import type { ModuleArt } from './ModuleArtwork';

interface ControlsProps {
  killer: string; location: string; finalGirl: string; events: PlayEvent[];
  onEvent: (event: PlayEvent) => boolean;
}
type State = ReturnType<typeof moduleState>;
interface Definition {
  id: 'billy' | 'hans' | 'buddyland' | 'camp' | 'geppetto' | 'carnival'; owner: 'killer' | 'location'; match: string;
  title: string; art: ModuleArt; summary: (state: State) => string;
  Controls: (props: ControlsProps) => React.ReactNode;
}
const atlas = (y: number): ModuleArt => ({ src: banners, atlas: { width: 1536, height: 1024, x: 0, y, cellWidth: 1536, cellHeight: 512 } });
const peopleSummary = (state: State, ids: readonly { id: string }[], prefix: string, active: string) => {
  const recorded = ids.filter(person => state[`${prefix}.${person.id}`] !== undefined);
  if (!recorded.length) return 'No people recorded';
  const count = recorded.filter(person => state[`${prefix}.${person.id}`] === active).length;
  return `${count} in play · ${recorded.length} recorded`;
};
// Adding a module registers its owner, artwork and controls here. Location
// never determines the killer's controls (and vice versa).
const modules: Definition[] = [
  {id:'geppetto',owner:'killer',match:'Geppetto',title:'Geppetto & his Puppets',art:{src:geppettoBanner},summary:state=>{
    const c=geppettoPuppetCounts(state);return c.recorded?`${c.onBoard} on board · ${c.ready} ready · ${c.exhausted} exhausted`:'Puppet tray not recorded';
  },Controls:props=><GeppettoControls {...props}/>},
  { id: 'billy', owner: 'killer', match: 'Billy the Bear', title: 'Billy & his Buddies', art: atlas(0),
    summary: state => {
      const active = BUDDIES.filter(b => state[`buddy.${b.id}.status`] === 'active').length;
      const sources = [1, 2, 3, 4, 5].filter(id => ['active', 'inactive'].includes(String(state[`source.${id}.status`])));
      const on = sources.filter(id => state[`source.${id}.status`] === 'active').length;
      return `${active} Buddies in play · ${sources.length ? `${on}/${sources.length} sources on` : 'Sources not recorded'}`;
    }, Controls: props => <BuddylandControls {...props} part="killer" embedded /> },
  { id: 'hans', owner: 'killer', match: 'Hans', title: 'Hans the Butcher', art: { src: hansBanner, atlas: { width: 1536, height: 1024, x: 0, y: 0, cellWidth: 1536, cellHeight: 512 } },
    summary: state => HANS_MINOR_POWERS.map(power => {
      const health = state[`minor.${power.id}.health`];
      return `${power.name}: ${health === undefined ? 'unrevealed' : `${health}/2`}`;
    }).join(' · '), Controls: props => <CampControls {...props} part="killer" /> },
  { id: 'buddyland', owner: 'location', match: 'Buddyland', title: 'Inside Buddyland', art: atlas(512),
    summary: state => peopleSummary(state, SPECIAL_VICTIMS, 'victim', 'on-board'),
    Controls: props => <BuddylandControls {...props} part="location" embedded /> },
  { id: 'camp', owner: 'location', match: 'Camp Happy Trails', title: 'Inside Camp Happy Trails', art: { src: campBanner },
    summary: state => {
      const active = Object.entries(state).filter(([key, value]) => key.startsWith('event.') && value === 'active').length;
      return `${peopleSummary(state, CAMP_VICTIMS, 'victim', 'in-play')} · ${active} active effects`;
    }, Controls: props => <CampControls {...props} part="location" /> },
  {id:'carnival',owner:'location',match:'Carnival of Blood',title:'Inside Carnival of Blood',art:{src:carnivalBanner},summary:carnivalSummary,Controls:props=><CarnivalControls {...props}/>},
];
export function ModuleControls({ sessionId, ...props }: ControlsProps & { sessionId: string }) {
  const { user } = useAuth();
  const entries = summarizePlay(props.events).entries;
  return <div className="play-module-stack">{modules.filter(module => props[module.owner] === module.match).map(module => {
    const key = `final-girl-module-panel-v1:${user?.id ?? 'guest'}:${sessionId}:${module.id}`;
    return <ModulePanel key={key} id={module.id} title={module.title} kind={module.owner === 'killer' ? 'Killer' : 'Location'}
      art={module.art} summary={module.summary(moduleState(entries, module.id))} preferenceKey={key}>
      <module.Controls {...props} />
    </ModulePanel>;
  })}</div>;
}
