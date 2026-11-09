export const FALCONWOOD = 'Falconwood';
export const FALCONWOOD_MODULE = 'falconwood';

export const FALCONWOOD_MISSIONS = [
  { id: 'father', name: 'Save Your Father', friend: 'Adopted Father', completion: 'Record father freed',
    description: 'Government officials have imprisoned your father. Help him escape before they move him to another prison.' },
  { id: 'friend', name: 'Missing Friend', friend: 'Best Friend', completion: 'Record friend revived', item: 'Spell Book',
    description: 'They say your friend died, but it is a lie. Look for clues to find your friend.' },
  { id: 'hunt', name: 'Survive the Hunt', friend: 'Kind Scientist', completion: 'Record hunt survived', item: 'Telekinesis',
    description: 'Secret agents are in Falconwood to eliminate you. Defeat them before they get you.' },
  { id: 'lab', name: 'Expose the Lab', friend: 'Reporter', completion: 'Record evidence delivered',
    description: 'The lab is running experiments that are endangering Falconwood. Find evidence and expose them.' },
  { id: 'code', name: 'Crack the Code', friend: 'Jockette', completion: 'Record code cracked',
    description: 'Spies are communicating in code. Crack it to foil their plan.' },
] as const;

export type FalconwoodMission = typeof FALCONWOOD_MISSIONS[number];
export type MissionId = FalconwoodMission['id'];
export const missionByName = (name?: string | null) => FALCONWOOD_MISSIONS.find(m => m.name === name);
export const missionById = (id: unknown) => FALCONWOOD_MISSIONS.find(m => m.id === id);
export const FALCONWOOD_LEADS = ['Best Friend’s House', 'School', 'Library', 'Fanghorn Forest', 'Community Pool', 'Town Fair'] as const;
export const FALCONWOOD_EFFECTS = [
  ['dry', 'Dry Spell'], ['packed', 'Packed Bridge'], ['freaks', 'Freaks and Geeks'],
  ['opened', 'Grand Opening'], ['closed', 'Bridge Repair'], ['van', 'Pizza Delivery'],
] as const;
export const FALCONWOOD_PEOPLE = ['Conspiracy Theorist', 'Head Researcher'] as const;
const personStates = ['in-play', 'saved', 'killed', 'left', 'prone'] as const;
type PersonState = typeof personStates[number];
type Clue = 'A' | 'B' | 'C';
type Effect = typeof FALCONWOOD_EFFECTS[number][0];

export interface FalconwoodState {
  mission?: MissionId;
  complete?: boolean;
  count?: number;
  target?: number;
  tokens?: number[];
  clues?: Partial<Record<Clue, 1 | 2>>;
  lead?: number;
  proneAt?: string;
  started?: boolean;
  reduced?: boolean;
  attack3?: boolean;
  friend?: PersonState;
  uses?: number;
  effects: Partial<Record<Effect, boolean>>;
  people: Partial<Record<typeof FALCONWOOD_PEOPLE[number], PersonState>>;
}
type Fields = Record<string, unknown>;
type Entry = {id: string; moduleData?: {module: string; changes: Fields}};
type Command = 'mission' | 'count' | 'progress-count' | 'target' | 'token' | 'lose-token' | 'clue' | 'lead' | 'recover' | 'found'
  | 'start' | 'reduced' | 'attack' | 'complete' | 'attest' | 'correct-completion'
  | 'friend' | 'uses' | 'effect' | 'person';
export interface FalconwoodAction {
  parent: string;
  mission?: MissionId;
  command: Command;
  key?: string;
  value?: string | number | boolean | null;
}
const commands: readonly Command[] = [
  'mission', 'count', 'progress-count', 'target', 'token', 'lose-token', 'clue', 'lead', 'recover', 'found',
  'start', 'reduced', 'attack', 'complete', 'attest', 'correct-completion', 'friend', 'uses', 'effect', 'person',
];
const blank = (): FalconwoodState => ({effects: {}, people: {}});
const changes = (state: FalconwoodState) => ({snapshot: JSON.stringify(state)});
const inRange = (v: unknown, min: number, max: number): v is number =>
  typeof v === 'number' && Number.isInteger(v) && v >= min && v <= max;
const object = (v: unknown): v is Fields => !!v && typeof v === 'object' && !Array.isArray(v);

export function falconwoodDestination(clues?: FalconwoodState['clues']) {
  const { A, B, C } = clues ?? {};
  if (!A || !B || !C) return undefined;
  const destinations = [
    [['Library', 'Shopping Mall'], ['Community Pool', 'Town Fair']],
    [['Best Friend’s House', 'School'], ['Fanghorn Forest', 'Government Lab']],
  ];
  return destinations[A - 1][B - 1][C - 1];
}

export function initialFalconwood(name?: string | null, event?: string | null) {
  const mission = missionByName(name)?.id;
  if (!mission) return undefined;
  const state: FalconwoodState = {...blank(), mission, complete: false};
  if (mission === 'father' || mission === 'lab') {
    state.count = 0;
    state.target = 3;
  }
  if (mission === 'code') state.tokens = [];
  if (mission === 'friend') state.clues = {};
  if (mission === 'hunt') state.started = false;
  const effect = FALCONWOOD_EFFECTS.find(([key, label]) => label === event && key !== 'opened' && key !== 'closed');
  if (effect) state.effects[effect[0]] = true;
  const person = FALCONWOOD_PEOPLE.find(name => name === event);
  if (person) state.people[person] = 'in-play';
  return changes(state);
}

function parseSnapshot(value: unknown): FalconwoodState | undefined {
  if (typeof value !== 'string' || value.length > 1500) return;
  try {
    const s: unknown = JSON.parse(value);
    if (!object(s) || !object(s.effects) || !object(s.people)) return;
    if (s.mission !== undefined && !missionById(s.mission)) return;
    if (!Object.entries(s.effects).every(([key, v]) => typeof v === 'boolean' && FALCONWOOD_EFFECTS.some(([id]) => id === key))) return;
    if (!Object.entries(s.people).every(([key, v]) => FALCONWOOD_PEOPLE.some(name => name === key) && personStates.some(status => status !== 'prone' && status === v))) return;
    if (['complete', 'started', 'reduced', 'attack3'].some(key => s[key] !== undefined && typeof s[key] !== 'boolean')) return;
    if (s.count !== undefined && !inRange(s.count, 0, 6) || s.target !== undefined && !inRange(s.target, 1, 6)) return;
    if (s.lead !== undefined && !inRange(s.lead, 1, 6) || s.uses !== undefined && !inRange(s.uses, 0, 2)) return;
    if (s.tokens !== undefined && (!Array.isArray(s.tokens) || !s.tokens.every(n => inRange(n, 1, 6)) || new Set(s.tokens).size !== s.tokens.length)) return;
    if (s.clues !== undefined && (!object(s.clues) || !Object.entries(s.clues).every(([key, n]) => ['A','B','C'].includes(key) && inRange(n, 1, 2)))) return;
    if (s.friend !== undefined && !personStates.some(status => status === s.friend)) return;
    if (s.proneAt !== undefined && (typeof s.proneAt !== 'string' || s.proneAt.length > 50)) return;
    return s as unknown as FalconwoodState;
  } catch { return; }
}
export const falconwoodState = (fields: Fields): FalconwoodState => parseSnapshot(fields.snapshot) ?? blank();
export const validFalconwoodField = (key: string, value: unknown) => key === 'snapshot' && !!parseSnapshot(value);
export const falconwoodParent = (entries: readonly Entry[]) =>
  [...entries].reverse().find(e => e.moduleData?.module === FALCONWOOD_MODULE)?.id ?? 'root';

export function validFalconwoodAction(value: unknown): value is FalconwoodAction {
  return object(value) && typeof value.parent === 'string' && value.parent.length <= 100
    && (value.mission === undefined || !!missionById(value.mission))
    && commands.some(command => command === value.command)
    && (value.key === undefined || typeof value.key === 'string' && value.key.length <= 50)
    && (value.value == null || typeof value.value === 'boolean' || typeof value.value === 'number'
      || typeof value.value === 'string' && value.value.length <= 50);
}

function recordMissionSuccess(state: FalconwoodState, mission: MissionId) {
  state.complete = true;
  state.friend = 'in-play';
  if (mission === 'friend' && state.uses === undefined) state.uses = 1;
  if (mission === 'hunt' && state.uses === undefined) state.uses = 2;
}

export function resolveFalconwoodAction(action: FalconwoodAction, fields: Fields, entries: readonly Entry[]) {
  if (!validFalconwoodAction(action) || action.parent !== falconwoodParent(entries)) return;
  const state = falconwoodState(fields);
  const {command, key, value} = action;
  if (state.mission && action.mission && state.mission !== action.mission) return;
  const mission = state.mission ?? action.mission;
  const before = changes(state).snapshot;
  if (mission) state.mission = mission;
  switch (command) {
    case 'mission':
      if (!mission || value !== mission) return;
      break;
    case 'count':
    case 'progress-count': {
      if (command === 'progress-count' && mission !== 'father' && mission !== 'hunt') return;
      if (state.complete || !inRange(value, 0, mission === 'father' ? 6 : 4)
        || !['father', 'lab', 'hunt'].includes(mission ?? '') || mission === 'hunt' && !state.started) return;
      const previousCount = state.count;
      state.count = value;
      state.complete ??= false;
      if (command === 'progress-count' && (!state.friend || state.friend === 'prone') && (
        mission === 'father' && state.target !== undefined && (previousCount ?? 0) < state.target && value >= state.target ||
        mission === 'hunt' && previousCount !== 0 && value === 0
      )) recordMissionSuccess(state, mission);
      break;
    }
    case 'target':
      if ((mission !== 'father' && mission !== 'lab') || state.complete || !inRange(value, 1, mission === 'father' ? 6 : 4)) return;
      state.target = value;
      break;
    case 'token':
      if (mission !== 'code' || state.complete || !inRange(value, 1, 6)) return;
      state.tokens = state.tokens?.includes(value) ? state.tokens.filter(n => n !== value) : [...state.tokens ?? [], value].sort();
      state.complete ??= false;
      break;
    case 'lose-token':
      if (mission !== 'code' || state.complete || !state.tokens?.length || !state.tokens.includes(Number(value))) return;
      state.tokens = state.tokens.filter(n => n !== value);
      break;
    case 'clue': {
      if (mission !== 'friend' || state.complete || !key || !['A','B','C'].includes(key)) return;
      const letter = key as Clue;
      state.clues ??= {};
      if (value === null) delete state.clues[letter];
      else if (value === 1 || value === 2) {
        if (state.clues[letter] !== undefined) return;
        state.clues[letter] = value;
      } else return;
      state.complete ??= false;
      break;
    }
    case 'lead':
      if (mission !== 'lab' || state.complete || value !== null && !inRange(value, 1, 6)) return;
      state.lead = typeof value === 'number' ? value : undefined;
      break;
    case 'recover':
      if (mission !== 'lab' || state.complete || !state.lead || state.count === undefined || state.count >= 4
        || value !== null && !inRange(value, 1, 6)) return;
      state.count += 1;
      state.lead = typeof value === 'number' ? value : undefined;
      state.complete ??= false;
      break;
    case 'found': {
      const location = falconwoodDestination(state.clues);
      if (mission !== 'friend' || state.complete || !location || state.friend) return;
      state.friend = 'prone';
      state.proneAt = location;
      state.complete ??= false;
      break;
    }
    case 'start':
      if (mission !== 'hunt' || state.started || state.complete || !inRange(value, 1, 4)) return;
      state.started = true;
      state.count = value;
      state.complete = false;
      break;
    case 'reduced':
    case 'attack':
      if (mission !== 'hunt' || state.complete || typeof value !== 'boolean' || command === 'reduced' && state.started) return;
      if (command === 'reduced') state.reduced = value;
      else state.attack3 = value;
      break;
    case 'complete':
      if (!mission || state.complete || state.friend && state.friend !== 'prone') return;
      if (mission === 'father' && !(state.count !== undefined && state.target !== undefined && state.count >= state.target)) return;
      if (mission === 'lab' && !(state.count !== undefined && state.target !== undefined && state.count >= state.target)) return;
      if (mission === 'friend' && state.friend !== 'prone') return;
      if (mission === 'hunt' && (!state.started || state.count !== 0)) return;
      if (mission === 'code' && (!state.tokens || !inRange(value, 1, 20) || value + state.tokens.reduce((a,b) => a+b, 0) < 20)) return;
      recordMissionSuccess(state, mission);
      break;
    case 'attest':
      if (state.complete) return;
      state.complete = true;
      break;
    case 'correct-completion':
      if (value !== false && value !== null) return;
      state.complete = value === false ? false : undefined;
      break;
    case 'friend':
      if (!mission || !personStates.some(status => status !== 'prone' && status === value)) return;
      state.friend = value as PersonState;
      break;
    case 'uses':
      if ((mission !== 'friend' && mission !== 'hunt') || !inRange(value, 0, mission === 'friend' ? 1 : 2)) return;
      state.uses = value;
      break;
    case 'effect': {
      const effect = FALCONWOOD_EFFECTS.find(([id]) => id === key);
      if (!effect || typeof value !== 'boolean') return;
      state.effects[effect[0]] = value;
      break;
    }
    case 'person': {
      const person = FALCONWOOD_PEOPLE.find(name => name === key);
      if (!person || !personStates.some(status => status !== 'prone' && status === value)) return;
      state.people[person] = value as PersonState;
      break;
    }
  }
  const result = changes(state);
  if (result.snapshot !== before) return result;
}

export function falconwoodProgress(state: FalconwoodState) {
  if (state.complete) return 'Mission complete';
  switch (state.mission) {
    case 'father': return state.count === undefined ? 'Banked keys unrecorded' : `${state.count} of ${state.target ?? '?'} keys`;
    case 'lab': return state.count === undefined ? 'Evidence unrecorded' :
      state.target !== undefined && state.count >= state.target ? 'Deliver to Police Station' : `${state.count} of ${state.target ?? '?'} evidence`;
    case 'code': return state.tokens ? `Code total ${state.tokens.reduce((sum, token) => sum + token, 0)}` : 'Code tokens unrecorded';
    case 'friend': return state.friend === 'prone' ? 'Friend found · Revive' : falconwoodDestination(state.clues) ??
      (state.clues ? `${Object.keys(state.clues).length} of 3 clues` : 'Clues unrecorded');
    case 'hunt': return state.started ? `${state.count ?? '?'} Agents remaining` : state.started === false ? 'Waiting for Terror' : 'Hunt status unrecorded';
    default: return 'Mission unrecorded';
  }
}

export function falconwoodFacts(state: FalconwoodState) {
  const mission = missionById(state.mission);
  return [
    mission && `${mission.name}. ${falconwoodProgress(state)}.`,
    state.friend && mission && `${mission.friend} recorded ${state.friend}.`,
    state.uses !== undefined && mission && 'item' in mission && `${mission.item}: ${state.uses} uses remaining.`,
    ...FALCONWOOD_PEOPLE.filter(name => state.people[name]).map(name => `${name} recorded ${state.people[name]}.`),
    ...FALCONWOOD_EFFECTS.filter(([key]) => state.effects[key]).map(([,name]) => `${name} recorded.`),
  ].filter(Boolean).join(' ');
}

export interface FalconwoodReview {
  mission?: MissionId;
  complete: boolean | null;
  progress?: string;
  friend?: PersonState;
  uses?: number;
}
export function falconwoodReview(state: FalconwoodState, name?: string | null, complete?: boolean | null): FalconwoodReview {
  const mission = state.mission ?? missionByName(name)?.id;
  const status = complete === undefined ? state.complete ?? null : complete;
  return {
    mission,
    complete: status,
    ...(mission && status !== true && {progress:falconwoodProgress({...state,mission,complete:false})}),
    ...(state.friend && {friend:state.friend}),
    ...(state.uses !== undefined && {uses:state.uses}),
  };
}
export function falconwoodReviewText(review: FalconwoodReview) {
  const mission = missionById(review.mission);
  return [
    `${mission?.name ?? 'Mission identity unrecorded'} · ${review.complete === true ? 'Completed' : review.complete === false ? 'Incomplete' : 'Result unrecorded'}.`,
    review.progress && review.complete !== true && `${review.progress}.`,
    mission && review.friend && `${mission.friend}: ${review.friend.replace('-', ' ')}.`,
    mission && 'item' in mission && review.uses !== undefined && `${mission.item}: ${review.uses} uses remaining.`,
  ].filter(Boolean).join(' ');
}
