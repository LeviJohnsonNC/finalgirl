import type { ModuleValue } from './modules.ts';
import { STATION_ALLIES, STATION_MODULE, STATION_OUTDOORS, STATION_ROLES, STATION_SPACES, stationNameKey } from './stationCatalog.ts';
export * from './stationCatalog.ts';

export const STATION_ROUTE = ['helipad', 'station', 'air', 'airport'] as const;
export const STATION_POSITIONS = { helipad: 'Helipad', station: 'Station 2891 departure', air: 'In the air', airport: 'Arctic Airport' };
export const STATION_MOVE_SOURCES = ['Fly Faster!', 'Terror card', 'Comms Specialist'] as const;
type Position = typeof STATION_ROUTE[number];
type Role = typeof STATION_ROLES[number]['id'];
type RoleState = 'present' | 'saved' | 'killed' | 'left';
type Status = 'clear' | 'marked';
type Frost = 'girl' | Role | 'killer' | 'enemy' | 'victim';
type Source = typeof STATION_MOVE_SOURCES[number];
const roleIds = STATION_ROLES.map(role => role.id);
export const STATION_FROST_TARGETS = ['girl', ...roleIds, 'killer', 'enemy', 'victim'] as const;
const skidozerStates = ['parked', 'in-use'] as const;
const breachStates = ['intact', 'keys', 'accident', 'open'] as const;
const cacheStates = ['unsearched', 'hidden', 'revealed'] as const;
type Skidozer = typeof skidozerStates[number];
type Breach = typeof breachStates[number];
type Cache = typeof cacheStates[number];
type Ally = typeof STATION_ALLIES[number]['id'];
type Outdoor = typeof STATION_OUTDOORS[number];
type Group = { count: number | null; roles: Role[] };
type Flight = Group & { position: Position; pending: boolean; direction?: 'outbound' | 'return' };
export type StationState = {
  flight?: Flight;
  roles?: Partial<Record<Role, RoleState>>;
  frost?: Partial<Record<Frost, Status>>;
  generator?: boolean;
  storm?: boolean;
  skidozer?: Skidozer;
  skidozerSpace?: Outdoor;
  breach?: Breach;
  cache?: Cache;
  armorySpace?: Exclude<Outdoor, 'helipad'>;
  allies?: Partial<Record<Ally, 'present' | 'spent'>>;
  rescued?: number;
  uncountedRescue?: boolean;
};
export type StationCommand =
  | ({ kind: 'depart' } & Group)
  | { kind: 'move'; direction: 'outbound' | 'return'; source?: Source; arrival?: 'action' | 'later' }
  | { kind: 'land' | 'help' | 'confirm-rescue' | 'upkeep' | 'generator' }
  | { kind: 'flight-correction'; flight: Flight | null }
  | { kind: 'role'; id: Role; status: RoleState | null; correction?: true }
  | { kind: 'frost'; target: Frost; status: Status | null }
  | { kind: 'storm'; active: boolean | null }
  | { kind: 'skidozer'; status: Skidozer | null; space?: Outdoor }
  | { kind: 'breach'; status: Breach | null }
  | { kind: 'cache'; status: Cache | null; space?: Exclude<Outdoor, 'helipad'> }
  | { kind: 'ally'; id: Ally; status: 'present' | 'spent' | null };
export type StationAction = StationCommand & { parent: string };

const oneOf = <T>(values: readonly T[], value: unknown): value is T => values.includes(value as T);
const nullable = <T>(values: readonly T[], value: unknown): value is T | null => value === null || oneOf(values, value);
const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const keys = (v: Record<string, unknown>, allowed: readonly string[]) => Object.keys(v).every(key => allowed.includes(key));
const roleStates = ['present', 'saved', 'killed', 'left'] as const;
const frostStates = ['clear', 'marked'] as const;
const allyStates = ['present', 'spent'] as const;
const armorySpaces = STATION_OUTDOORS.filter(space => space !== 'helipad');
const count = (v: unknown): v is number | null => v === null || typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= 3;

function validGroup(v: Record<string, unknown>): boolean {
  return count(v.count) && Array.isArray(v.roles) && v.roles.length <= (v.count ?? 3) &&
    new Set(v.roles).size === v.roles.length && v.roles.every(role => oneOf(roleIds, role));
}

function validFlight(v: unknown): v is Flight {
  if (!record(v) || !keys(v, ['count','roles','position','direction','pending']) || !validGroup(v) ||
      !oneOf(STATION_ROUTE, v.position) || typeof v.pending !== 'boolean') return false;
  if (v.direction !== undefined && (v.position !== 'air' || !oneOf(['outbound','return'], v.direction))) return false;
  if (v.position === 'helipad') return v.count === 0 && !v.pending;
  if (v.pending) return v.position === 'airport' && v.count !== 0;
  if (v.position === 'airport' || v.direction === 'return') return v.count === 0;
  return true;
}

export function validStationAction(input: unknown): input is StationAction {
  if (!record(input) || typeof input.parent !== 'string' || input.parent.length < 1 || input.parent.length > 100) return false;
  const allowed = (...fields: string[]) => keys(input, ['kind','parent',...fields]);
  switch (input.kind) {
    case 'depart': return allowed('count','roles') && validGroup(input);
    case 'move': return allowed('direction','source','arrival') && oneOf(['outbound','return'], input.direction) &&
      (input.source === undefined || oneOf(STATION_MOVE_SOURCES,input.source)) && (input.arrival === undefined || oneOf(['action','later'],input.arrival));
    case 'land': case 'help': case 'confirm-rescue': case 'upkeep': case 'generator': return allowed();
    case 'flight-correction': return allowed('flight') && (input.flight === null || validFlight(input.flight));
    case 'role': return allowed('id','status','correction') && oneOf(roleIds,input.id) && nullable(roleStates,input.status) && (input.correction === undefined || input.correction === true);
    case 'frost': return allowed('target','status') && oneOf(STATION_FROST_TARGETS,input.target) && nullable(frostStates,input.status);
    case 'storm': return allowed('active') && (input.active === null || typeof input.active === 'boolean');
    case 'skidozer': return allowed('status','space') && nullable(skidozerStates,input.status) &&
      (input.space === undefined || input.status !== null && oneOf(STATION_OUTDOORS,input.space));
    case 'breach': return allowed('status') && nullable(breachStates,input.status);
    case 'cache': return allowed('status','space') && nullable(cacheStates,input.status) &&
      (input.space === undefined || input.status === 'revealed' && oneOf(armorySpaces,input.space));
    case 'ally': return allowed('id','status') && STATION_ALLIES.some(ally => ally.id === input.id) && nullable(allyStates,input.status);
    default: return false;
  }
}

const stateKeys = ['flight','roles','frost','generator','storm','skidozer','skidozerSpace','breach','cache','armorySpace','allies','rescued','uncountedRescue'] as const;
function validMap<T>(v: unknown, fields: readonly string[], values: readonly T[]) {
  return v === undefined || record(v) && keys(v, fields) && Object.values(v).every(item => oneOf(values,item));
}
function parseStation(value: unknown): StationState | undefined {
  if (typeof value !== 'string' || value.length > 2000) return;
  let s: unknown;
  try { s = JSON.parse(value); } catch { return; }
  if (!record(s) || !keys(s,stateKeys) ||
      (s.flight !== undefined && !validFlight(s.flight)) ||
      !validMap(s.roles,roleIds,roleStates) || !validMap(s.frost,STATION_FROST_TARGETS,frostStates) ||
      !validMap(s.allies,STATION_ALLIES.map(ally => ally.id),allyStates) ||
      ['generator','storm','uncountedRescue'].some(k => s[k] !== undefined && typeof s[k] !== 'boolean') ||
      (s.skidozer !== undefined && !oneOf(skidozerStates,s.skidozer)) ||
      (s.skidozerSpace !== undefined && (!s.skidozer || !oneOf(STATION_OUTDOORS,s.skidozerSpace))) ||
      (s.breach !== undefined && !oneOf(breachStates,s.breach)) ||
      (s.cache !== undefined && !oneOf(cacheStates,s.cache)) ||
      (s.armorySpace !== undefined && (s.cache !== 'revealed' || !oneOf(armorySpaces,s.armorySpace))) ||
      (s.rescued !== undefined && (typeof s.rescued !== 'number' || !Number.isInteger(s.rescued) || s.rescued < 1 || s.rescued > 3000))) return;
  return s as StationState;
}

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (record(value)) return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]));
  return value;
}
const snapshot = (state: StationState) => JSON.stringify(canonical(state));
const emptyFlight = (position: Position): Flight => ({position, count:0, roles:[], pending:false});
export const stationState = (fields: Record<string, ModuleValue>): StationState => parseStation(fields.snapshot) ?? {};
export const validStationField = (key: string, value: unknown) => key === 'snapshot' && typeof value === 'string' &&
  parseStation(value) !== undefined && value === snapshot(parseStation(value)!);
export const initialStation = (event?: string | null) => ({
  snapshot:snapshot({flight:emptyFlight('helipad'),skidozer:'parked',breach:'intact',generator:false,frost:{girl:'clear'},
    ...(stationNameKey(event ?? '') === 'heavystorm' && {storm:true})}),
});
export const isInitialStation = (fields: Record<string,ModuleValue>) => fields.snapshot === initialStation().snapshot ||
  fields.snapshot === initialStation('Heavy Storm').snapshot;

type Entry = { id: string; moduleData?: {module: string} };
export const stationParent = (entries: readonly Entry[]) => [...entries].reverse().find(entry => entry.moduleData?.module === STATION_MODULE)?.id ?? 'root';
const update = <K extends string,V>(map: Partial<Record<K,V>> | undefined, id: K, value: V | null) => {
  const next: Partial<Record<K,V>> = {...map};
  if (value === null) delete next[id];
  else next[id] = value;
  return next;
};

function rescue(s: StationState, flight: Flight) {
  s.roles = {...s.roles};
  for (const role of flight.roles) s.roles[role] = 'saved';
  if (flight.count === null) s.uncountedRescue = true;
  const amount = flight.count ?? flight.roles.length;
  if (amount) s.rescued = (s.rescued ?? 0) + amount;
  s.flight = emptyFlight('airport');
}

function stationTransition(current: StationState, action: StationAction): StationState | undefined {
  const s = {...current};
  const f = s.flight;
  switch (action.kind) {
    case 'depart':
      if (f?.position !== 'helipad' || action.roles.some(id => s.roles?.[id] !== 'present')) return;
      s.flight = {position:'station',count:action.count,roles:[...action.roles].sort(),pending:false};
      break;
    case 'land':
      if (f?.position !== 'station' || f.count !== 0) return;
      s.flight = emptyFlight('helipad');
      break;
    case 'help':
      if (f?.count !== 0) return;
      s.flight = emptyFlight('helipad');
      break;
    case 'flight-correction':
      if (action.flight?.roles.some(id => s.roles?.[id] !== 'present')) return;
      if (action.flight) s.flight = {...action.flight,roles:[...action.flight.roles].sort()};
      else delete s.flight;
      break;
    case 'move': {
      if (!f || f.position === 'helipad' || f.pending || action.direction === 'return' && f.count !== 0 ||
          action.source === 'Comms Specialist' && (s.roles?.comms !== 'present' || f.roles.includes('comms'))) return;
      const index = STATION_ROUTE.indexOf(f.position) + (action.direction === 'outbound' ? 1 : -1);
      if (index < 1 || index >= STATION_ROUTE.length) return;
      const position = STATION_ROUTE[index];
      if (position === 'airport' && f.count !== 0) {
        if (!action.arrival || action.arrival === 'later' && action.source && action.source !== 'Terror card') return;
        if (action.arrival === 'action') rescue(s,f);
        else s.flight = {...f,position,pending:true,direction:undefined};
      } else {
        if (action.arrival) return;
        s.flight = {...f,position,direction:position === 'air' ? action.direction : undefined};
      }
      break;
    }
    case 'confirm-rescue':
      if (!f?.pending) return;
      rescue(s,f);
      break;
    case 'role': {
      const prior = s.roles?.[action.id];
      if (f?.roles.includes(action.id)) return;
      if (!action.correction && (action.status === 'saved' || action.status === null ||
          (action.status !== 'present' ? prior !== 'present' : prior === 'saved' || prior === 'killed'))) return;
      s.roles = update(s.roles,action.id,action.status);
      if (action.status !== 'present' && s.frost?.[action.id]) s.frost = update(s.frost,action.id,null);
      break;
    }
    case 'frost':
      if (roleIds.some(id => id === action.target && (f?.roles.includes(id) || s.roles?.[id] !== 'present'))) return;
      s.frost = update(s.frost,action.target,action.status);
      break;
    case 'generator': s.generator = true; break;
    case 'upkeep':
      if (s.generator !== true) return;
      s.generator = false;
      break;
    case 'storm': s.storm = action.active ?? undefined; break;
    case 'skidozer':
      s.skidozer = action.status ?? undefined;
      s.skidozerSpace = action.space;
      break;
    case 'breach': s.breach = action.status ?? undefined; break;
    case 'cache':
      s.cache = action.status ?? undefined;
      s.armorySpace = action.space;
      break;
    case 'ally': s.allies = update(s.allies,action.id,action.status); break;
  }
  return s;
}

export function resolveStationAction(action: StationAction, fields: Record<string, ModuleValue>, entries: readonly Entry[]) {
  if (!validStationAction(action) || stationParent(entries) !== action.parent) return;
  const current = stationState(fields);
  const next = stationTransition(current,action);
  if (!next || snapshot(current) === snapshot(next)) return;
  return {snapshot:snapshot(next)};
}

export function stationSummary(s: StationState) {
  const f = s.flight;
  if (!f) return 'Helicopter position unrecorded';
  const direction = f.position === 'air' && f.direction ? (f.direction === 'return' ? ' · Returning' : ' · Outbound') : '';
  const aboard = f.count === null ? 'Passenger count unrecorded' : `${f.count}/3 aboard`;
  return `${STATION_POSITIONS[f.position]}${direction} · ${f.pending ? 'Rescue effects pending' : aboard}`;
}

export function stationFacts(s: StationState) {
  const parts: string[] = [];
  if (s.flight?.pending) parts.push('The helicopter reached Arctic Airport; rescue effects are still pending.');
  else if (s.flight) parts.push(`Helicopter last recorded: ${STATION_POSITIONS[s.flight.position]}.`);
  if (s.rescued) parts.push(`Confirmed helicopter evacuations: ${s.rescued}${s.uncountedRescue ? ' known passengers plus uncounted passengers' : ' passengers'}.`);
  else if (s.uncountedRescue) parts.push('A helicopter rescue was confirmed; passenger count unrecorded.');
  if (s.breach && s.breach !== 'intact') parts.push(`The Lab has a breach${s.breach === 'keys' ? ' made by the Skidozer' : s.breach === 'accident' ? ' from the Lab accident' : ''}.`);
  if (s.frost?.girl === 'marked') parts.push('The Final Girl had a recorded Frostbite token.');
  if (s.storm) parts.push('Heavy Storm was active.');
  if (s.generator) parts.push('Frostbite clearing is suspended at the next Upkeep.');
  if (s.skidozer) parts.push(`Skidozer: ${s.skidozer === 'in-use' ? 'in use' : 'parked'}${s.skidozerSpace ? ` at ${STATION_SPACES[s.skidozerSpace]}` : ''}.`);
  if (s.cache === 'revealed') parts.push(`Armory discovered${s.armorySpace ? ` at ${STATION_SPACES[s.armorySpace]}` : ''}.`);
  for (const role of STATION_ROLES) {
    const status = s.roles?.[role.id];
    if (status) parts.push(`${role.name}: ${s.flight?.roles.includes(role.id) ? 'aboard' : status === 'left' ? 'left play' : status}.`);
  }
  return parts.join(' ');
}
