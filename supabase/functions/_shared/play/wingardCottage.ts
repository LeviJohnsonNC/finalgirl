import { WINGARD_MODULE, WINGARD_SPACES, WINGARD_SUPPLIES, WINGARD_CRAFTS, WINGARD_EVENTS, wingardCraft } from './wingardCatalog.ts';

type Person = 'outsider' | 'boyfriend' | 'neighbor';
type Outcome = 'present' | 'saved' | 'killed' | 'left';
type Trap = 'snare' | 'nail-trap';
type Recipe = 'offered' | 'crafted';
type Acquisition = { status: Recipe; uses?: number };
export type WingardState = {
  recipes: Record<string, Acquisition>;
  supplies: Record<string, 'available' | 'held'>;
  traps: { type: Trap; space: string }[];
  people: Partial<Record<Person, Outcome>>;
  alarm?: 'ready' | 'disabled' | number;
  scooter?: 'parked' | 'with-you';
  resourceful?: boolean;
  boatSaved?: number;
  initialEvent?: string;
};

type Observation = { id?: string; moduleData?: { module: string } };
export type WingardCommand =
  | { command:'offer' | 'clear-offer' | 'return' | 'use' | 'refill'; id:string }
  | { command:'craft'; id:string; uses?:number }
  | { command:'uses'; id:string; uses:number | null }
  | { command:'supply'; id:string; value:'available' | 'held' | null }
  | { command:'place' | 'trigger' | 'remove'; id:Trap; space:string }
  | { command:'person'; id:Person; value:Outcome | null; boatSaved?:number }
  | { command:'alarm'; value:'ready' | 'activate' | 'block' | 'cross' | 'clear' }
  | { command:'scooter'; value:'parked' | 'with-you' | null }
  | { command:'resourceful'; value:boolean };
export type WingardAction = WingardCommand & { parent:string };

export const wingardParent = (entries: readonly Observation[]) =>
  [...entries].reverse().find(entry => entry.moduleData?.module === WINGARD_MODULE)?.id ?? 'root';

function emptyWingard(): WingardState {
  return {recipes:{}, supplies:{}, traps:[], people:{}};
}
export function wingardState(fields: { snapshot?: unknown }): WingardState {
  if (typeof fields.snapshot !== 'string') return emptyWingard();
  try { return JSON.parse(fields.snapshot) as WingardState; }
  catch { return emptyWingard(); }
}
const snapshot = (state:WingardState) => ({snapshot:JSON.stringify(state)});

export function initialWingard(eventName?: string | null) {
  const state = emptyWingard();
  for (const supply of WINGARD_SUPPLIES) state.supplies[supply.id] = 'available';
  const id = WINGARD_EVENTS.find(event => event.name.toLowerCase() === eventName?.trim().toLowerCase())?.id;
  switch (id) {
    case 'outsider': case 'boyfriend': case 'neighbor':
      // Boyfriend needs an actual eligible Victim before he can be recorded.
      if (id !== 'boyfriend') state.people[id] = 'present';
      break;
    case 'alarm': state.alarm = 'ready'; break;
    case 'scooter': state.scooter = 'parked'; break;
    case 'resourceful': state.resourceful = true; break;
  }
  if (id) state.initialEvent = id;
  return snapshot(state);
}
export function isInitialWingard(fields: { snapshot?: unknown }) {
  return [undefined, ...WINGARD_EVENTS.map(card => card.name)].some(name => initialWingard(name).snapshot === fields.snapshot);
}
export function validWingardField(key:string, value:unknown) {
  if (key !== 'snapshot' || typeof value !== 'string' || value.length > 4000) return false;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed);
  } catch { return false; }
}

export function validWingardAction(value:unknown): value is WingardAction {
  if (!value || typeof value !== 'object') return false;
  const a = value as WingardAction;
  if (typeof a.parent !== 'string' || !/^(root|[a-f0-9-]{36})$/i.test(a.parent)) return false;
  const card = 'id' in a ? wingardCraft(a.id) : undefined;
  const count = (uses:unknown) => typeof uses === 'number' && Number.isInteger(uses) && uses >= 0 && uses <= (card?.uses ?? -1);
  switch (a.command) {
    case 'offer': case 'clear-offer': case 'return': case 'use': case 'refill': return !!card;
    case 'craft': return !!card && (a.uses === undefined || (!!card.inherits && count(a.uses)));
    case 'uses': return !!card?.uses && (a.uses === null || count(a.uses));
    case 'supply': return WINGARD_SUPPLIES.some(s => s.id === a.id) && [null,'available','held'].includes(a.value);
    case 'place': case 'trigger': case 'remove':
      return (a.id === 'snare' || a.id === 'nail-trap') && WINGARD_SPACES.some(space => space === a.space);
    case 'person':
      return ['outsider','boyfriend','neighbor'].includes(a.id) && [null,'present','saved','killed','left'].includes(a.value) &&
        (a.boatSaved === undefined || (a.id === 'neighbor' && a.value === 'saved' && Number.isInteger(a.boatSaved) && a.boatSaved >= 1 && a.boatSaved <= 4));
    case 'alarm': return ['ready','activate','block','cross','clear'].includes(a.value);
    case 'scooter': return [null,'parked','with-you'].includes(a.value);
    case 'resourceful': return typeof a.value === 'boolean';
    default: return false;
  }
}

export function resolveWingardAction(action:WingardAction, fields:{snapshot?:unknown}, entries:readonly Observation[]) {
  if (!validWingardAction(action) || action.parent !== wingardParent(entries)) return null;
  const state = wingardState(fields);
  const before = snapshot(state).snapshot;
  const card = 'id' in action ? wingardCraft(action.id) : undefined;
  const item = card && state.recipes[card.id];
  const setUses = (uses:number | null) => {
    if (!card) return;
    state.recipes[card.id] = uses === 0 && card.id !== 'slingshot'
      ? {status:'offered'}
      : {status:'crafted', ...(uses !== null && {uses})};
  };
  switch (action.command) {
    case 'offer':
      if (item) return null;
      state.recipes[action.id] = {status:'offered'};
      break;
    case 'clear-offer':
      if (item?.status !== 'offered') return null;
      delete state.recipes[action.id];
      break;
    case 'craft':
      if (!card || item?.status === 'crafted' || action.uses === 0) return null;
      setUses(card.inherits ? action.uses ?? null : card.uses ?? null);
      for (const id of card.supplies) state.supplies[id] = 'available';
      break;
    case 'return':
      if (item?.status !== 'crafted') return null;
      state.recipes[action.id] = {status:'offered'};
      break;
    case 'use':
      if (!card?.uses || card.id === 'snare' || card.id === 'nail-trap' || item?.status !== 'crafted' || !item.uses) return null;
      setUses(item.uses - 1);
      break;
    case 'uses':
      if (item?.status !== 'crafted') return null;
      setUses(action.uses);
      break;
    case 'refill':
      if (action.id !== 'slingshot' || item?.status !== 'crafted' || item.uses === card?.uses) return null;
      setUses(3);
      state.supplies.nails = 'available';
      break;
    case 'supply':
      if (action.value === null) delete state.supplies[action.id];
      else state.supplies[action.id] = action.value;
      break;
    case 'place':
      if (item?.status !== 'crafted' || item.uses === 0 || state.traps.some(trap => trap.type === action.id && trap.space === action.space)) return null;
      state.traps.push({type:action.id, space:action.space});
      setUses(item.uses === undefined ? null : item.uses - 1);
      break;
    case 'trigger': case 'remove':
      state.traps = state.traps.filter(trap => trap.type !== action.id || trap.space !== action.space);
      break;
    case 'person':
      if (action.boatSaved !== undefined && state.people.neighbor !== 'present' && state.people.neighbor !== 'saved') return null;
      if (action.value === null) delete state.people[action.id];
      else state.people[action.id] = action.value;
      if (action.id === 'neighbor') {
        if (action.boatSaved === undefined) delete state.boatSaved;
        else state.boatSaved = action.boatSaved;
      }
      break;
    case 'alarm':
      switch (action.value) {
        case 'ready': state.alarm = 'ready'; break;
        case 'activate': if (state.alarm !== 'ready') return null; state.alarm = 0; break;
        case 'block': if (typeof state.alarm !== 'number') return null; state.alarm = state.alarm === 2 ? 'disabled' : state.alarm + 1; break;
        case 'cross': if (typeof state.alarm !== 'number') return null; state.alarm = 'disabled'; break;
        case 'clear': delete state.alarm; break;
      }
      break;
    case 'scooter':
      if (action.value === null) delete state.scooter;
      else state.scooter = action.value;
      break;
    case 'resourceful': state.resourceful = action.value; break;
  }
  const result = snapshot(state);
  return result.snapshot === before ? null : result;
}

export function wingardFacts(state: WingardState) {
  const crafted = WINGARD_CRAFTS.filter(card => state.recipes[card.id]?.status === 'crafted').map(card => card.name);
  const people = Object.entries(state.people).map(([id,status]) => `${id === 'boyfriend' ? 'Boyfriend' : id === 'neighbor' ? 'Neighbor' : 'Outsider'} ${status === 'present' ? 'in play' : status}`);
  return [
    crafted.length ? `Crafted and currently held: ${crafted.join(', ')}.` : '',
    state.traps.length ? `Still set: ${state.traps.map(trap => `${wingardCraft(trap.type)?.name} at ${trap.space}`).join(', ')}.` : '',
    people.length ? `Recorded Cottage roles: ${people.join(', ')}.` : '',
    state.boatSaved !== undefined ? `Observed boat escape: ${state.boatSaved} saved including the Neighbor.` : '',
    state.people.neighbor === 'present' ? 'The Neighbor has keys to the boat.' : '',
    typeof state.alarm === 'number' ? 'Home Security is active.' : state.alarm === 'disabled' ? 'Home Security is disabled.' : '',
    state.scooter ? `Scooter ${state.scooter === 'parked' ? 'parked outside' : 'with the Final Girl'}.` : '',
  ].filter(Boolean);
}


export function describeWingardAction(action:WingardAction) {
  const name='id' in action ? wingardCraft(action.id)?.name ?? action.id : '';
  switch (action.command) {
    case 'offer': return `${name} available to craft`;
    case 'clear-offer': return `${name} offer cleared`;
    case 'craft': return `Crafted ${name}`;
    case 'return': return `${name} returned to the Workbench`;
    case 'use': return `Used ${name}`;
    case 'uses': return `${name} uses corrected`;
    case 'refill': return `Refilled ${name}`;
    case 'supply': return `${WINGARD_SUPPLIES.find(supply=>supply.id===action.id)?.name}: ${action.value??'unrecorded'}`;
    case 'place': return `Set ${name} at ${action.space}`;
    case 'trigger': return `${name} triggered at ${action.space}`;
    case 'remove': return `${name} placement cleared at ${action.space}`;
    case 'person': return action.boatSaved ? `Boat escape: ${action.boatSaved} saved including the Neighbor` :
      `${name[0].toUpperCase()}${name.slice(1)}: ${action.value==='present'?'in play':action.value??'unrecorded'}`;
    case 'alarm': return {ready:'Home Security ready',activate:'Home Security activated',block:'Home Security blocked entry',cross:'House crossing disabled Home Security',clear:'Home Security record cleared'}[action.value];
    case 'scooter': return `Scooter: ${action.value==='with-you'?'with the Final Girl':action.value??'unrecorded'}`;
    case 'resourceful': return action.value?'Getting Resourceful active':'Getting Resourceful record cleared';
  }
}
