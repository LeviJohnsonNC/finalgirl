import type { PlayEvent } from './events.ts';
import type { ModuleState } from './modules.ts';
import { PESADILLA, PESADILLA_MODULE, PESADILLA_EVENTS, PESADILLA_PEOPLE, PESADILLA_REACHES } from './pesadillaCatalog.ts';

export const SOLDIER_UPGRADES = {
  move: 'Starting Move', moveExtra: 'Extra Move', attack: 'Starting Attack', attackExtra: 'Extra Attack',
  saving: 'Saving Soldiers', range: 'Attack Range', damage: 'Damage', friendly: 'No Friendly Fire',
} as const;
type Upgrade = keyof typeof SOLDIER_UPGRADES;
type Person = keyof typeof PESADILLA_PEOPLE;
type PersonState = 'present' | 'saved' | 'killed' | 'left';
type Reach = typeof PESADILLA_REACHES[number];

export type PesadillaCommand =
  | { command: 'evacuate'; count: number }
  | { command: 'huey'; grounded: boolean }
  | { command: 'choppa' }
  | { command: 'upgrade'; id: Upgrade; unlocked: boolean }
  | { command: 'effect'; id: 'twitchy' | 'rain' | 'temple' | 'idol' | 'cave'; active: boolean }
  | { command: 'piranhas'; reach: Reach | 'unrecorded' | 'absent' }
  | { command: 'person'; id: Person; status: PersonState; resolve: boolean }
  | { command: 'minor'; health: number | null };
export type PesadillaAction = PesadillaCommand & { parent: string };
const own = (object: object, key: string) => Object.prototype.hasOwnProperty.call(object, key);
const effects = ['twitchy', 'rain', 'temple', 'idol', 'cave', 'choppa', 'huey'];
const peopleStates = ['present', 'saved', 'killed', 'left'];
const riverStates = [...PESADILLA_REACHES, 'unrecorded', 'absent'];

export const pesadillaRescueSeparately = (killer: string) =>
  ['The Podarchs', 'Birds', 'Mort the Teenage Dirtbag'].includes(killer);
export const pesadillaPersonEvents = (killer?: string | null) =>
  killer !== 'The Podarchs' && killer !== 'Birds';

export function freshPesadilla(killer?: string | null, event?: string | null): ModuleState {
  const state: ModuleState = {
    initialized: true, huey: true, cave: false, rain: false, temple: false, twitchy: false,
    choppa: false, piranhas: 'absent',
  };
  for (const id of Object.keys(SOLDIER_UPGRADES)) state['upgrade.' + id] = id === 'move' || id === 'attack';
  const id = PESADILLA_EVENTS.find(card => card.name === event)?.id;
  if (!id) return state;
  if (own(PESADILLA_PEOPLE, id) && pesadillaPersonEvents(killer)) state['person.' + id] = 'present';
  if (id === 'piranhas') state.piranhas = 'unrecorded';
  if (['choppa', 'rain', 'temple', 'twitchy'].includes(id)) state[id] = true;
  return state;
}

export function validPesadillaField(key: string, value: unknown): boolean {
  if (key === 'initialized') return value === true;
  if (effects.includes(key) || key.startsWith('upgrade.') && own(SOLDIER_UPGRADES, key.slice(8))) return typeof value === 'boolean';
  if (key.startsWith('person.') && own(PESADILLA_PEOPLE, key.slice(7))) return typeof value === 'string' && peopleStates.includes(value);
  if (key === 'piranhas') return typeof value === 'string' && riverStates.includes(value);
  if (key === 'minor') return value === null || value === 0 || value === 1 || value === 2;
  return false;
}

export function validPesadillaAction(input: unknown): input is PesadillaAction {
  if (!input || typeof input !== 'object') return false;
  const a = input as PesadillaAction;
  if (typeof a.parent !== 'string' || !/^(root|[0-9a-f-]{36})$/i.test(a.parent)) return false;
  switch (a.command) {
    case 'evacuate': return Number.isInteger(a.count) && a.count >= 0 && a.count <= 50;
    case 'huey': return typeof a.grounded === 'boolean';
    case 'choppa': return true;
    case 'upgrade': return typeof a.id === 'string' && own(SOLDIER_UPGRADES, a.id) && typeof a.unlocked === 'boolean';
    case 'effect': return ['twitchy', 'rain', 'temple', 'idol', 'cave'].includes(a.id) && typeof a.active === 'boolean' && (a.id !== 'twitchy' || a.active);
    case 'piranhas': return riverStates.includes(a.reach);
    case 'person': return typeof a.id === 'string' && own(PESADILLA_PEOPLE, a.id) && peopleStates.includes(a.status) && typeof a.resolve === 'boolean';
    case 'minor': return validPesadillaField('minor', a.health);
    default: return false;
  }
}

export const pesadillaParent = (entries: readonly PlayEvent[]) =>
  [...entries].reverse().find(entry => entry.moduleData?.module === PESADILLA_MODULE)?.id ?? 'root';

export function resolvePesadilla(a: PesadillaCommand, state: ModuleState): ModuleState | null {
  switch (a.command) {
    case 'evacuate': return state.huey === false ? null : { huey: false, choppa: false };
    case 'huey': return state.huey === a.grounded ? null : a.grounded ? { huey: true } : { huey: false, choppa: false };
    case 'choppa': return state.choppa === true ? null : { huey: true, choppa: true };
    case 'upgrade': {
      const key = 'upgrade.' + a.id;
      if (state[key] === a.unlocked) return null;
      const endsTwitchy = a.id === 'friendly' && a.unlocked && state.twitchy === true;
      return { [key]: a.unlocked, ...(endsTwitchy && { twitchy: false }) };
    }
    case 'effect':
      if (state[a.id] === a.active) return null;
      return a.id === 'twitchy' ? { twitchy: true, 'upgrade.friendly': false } : { [a.id]: a.active };
    case 'piranhas': return state.piranhas === a.reach ? null : { piranhas: a.reach };
    case 'person': {
      const key = 'person.' + a.id;
      if (state[key] === a.status || (a.resolve && state[key] !== 'present')) return null;
      return { [key]: a.status };
    }
    case 'minor': return state.minor === a.health || (state.minor === undefined && a.health === null) ? null : { minor: a.health };
  }
}

export function pesadillaOwnsLog(selection: { location?: string | null; killer?: string | null; startingEvent?: string | null }, entries: readonly PlayEvent[]) {
  return entries.every(entry => {
    if (!entry) return false;
    if (entry.organismAction?.command === 'minor' && entry.organismAction.card === 'rivermaster') {
      return selection.killer === 'The Organism' && selection.location === PESADILLA;
    }
    if (entry.moduleData?.module !== PESADILLA_MODULE) return true;
    if (selection.location !== PESADILLA) return false;
    const a = entry.pesadillaAction;
    if (!a) return !('startingEvent' in selection) || samePesadillaFields(entry.moduleData.changes, freshPesadilla(selection.killer, selection.startingEvent));
    if (a.command === 'evacuate' && a.count && pesadillaRescueSeparately(selection.killer ?? '')) return false;
    if (a.command === 'minor' && ['Birds','The Podarchs','The Organism'].includes(selection.killer ?? '')) return false;
    return a.command !== 'person' || pesadillaPersonEvents(selection.killer);
  });
}

export function samePesadillaFields(a: ModuleState, b: ModuleState) {
  const keys = Object.keys(a);
  return keys.length === Object.keys(b).length && keys.every(key => a[key] === b[key]);
}

export function describePesadilla(a: PesadillaAction, count?: number) {
  switch (a.command) {
    case 'evacuate': return count ? `Huey departed · ${count} saved` : 'Huey departed';
    case 'huey': return a.grounded ? 'Huey in the Clearing' : 'Huey away';
    case 'choppa': return 'Get to the Choppa! · Huey in the Clearing';
    case 'upgrade': return SOLDIER_UPGRADES[a.id] + (a.unlocked ? ' unlocked' : ' locked');
    case 'effect': {
      const name = a.id === 'cave' ? 'Cave Exit' : a.id === 'idol' ? 'Cursed Idol' : PESADILLA_EVENTS.find(card=>card.id===a.id)!.name;
      return name + (a.id === 'cave' ? a.active ? ' closed' : ' open' : a.active ? ' active' : ' ended');
    }
    case 'piranhas': return a.reach === 'unrecorded' ? 'Piranhas! · Reach unrecorded' :
      a.reach === 'absent' ? 'Piranhas placement cleared' : `Piranhas! · ${a.reach}`;
    case 'person': return PESADILLA_PEOPLE[a.id] + ' · ' + a.status;
    case 'minor': return a.health === null ? 'Rivermaster record cleared' :
      a.health === 0 ? 'Rivermaster removed' : `Rivermaster · ${a.health}/2 health`;
  }
}

export function pesadillaFacts(state: ModuleState) {
  const facts: string[] = [];
  if (state.huey === true) facts.push('The Huey was recorded in the Clearing.');
  if (state.huey === false) facts.push('The Huey is away from the Clearing.');
  if (state.choppa === true) facts.push('The Huey rescue Event is active.');
  if (state.cave === true) facts.push('The Cave collapsed and lost its Exit.');
  if (state.piranhas === 'unrecorded') facts.push('Piranhas were reported with the river reach unrecorded.');
  if (typeof state.piranhas === 'string' && PESADILLA_REACHES.some(reach => reach === state.piranhas)) facts.push('Piranhas were reported at ' + state.piranhas + '.');
  if (state.rain === true) facts.push('Heavy Rains are active.');
  if (state.temple === true) facts.push('The Temple curse is active.');
  if (state.idol === true) facts.push('The Cursed Idol is faceup and blocks searches.');
  if (state.twitchy === true) facts.push('Twitchy Soldiers increases the risk of friendly fire.');
  const abilities = (['saving','range','damage','friendly'] as const)
    .filter(id => state['upgrade.' + id] === true).map(id => SOLDIER_UPGRADES[id]);
  if (abilities.length) facts.push('Unlocked Soldier abilities: ' + abilities.join(', ') + '.');
  if (typeof state.minor === 'number') facts.push(state.minor > 0 ? 'Rivermaster is active.' : 'Rivermaster has been removed.');
  for (const [id, name] of Object.entries(PESADILLA_PEOPLE)) {
    const status = state['person.' + id];
    if (status) facts.push(name + ': ' + status + '.');
  }
  return facts.join(' ');
}
