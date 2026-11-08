import type { ModuleState } from './modules.ts';

export const SLAYER = 'Slayer';
export const SLAYER_MODULE = 'slayer';
export const SLAYER_SOURCE = 'The Falconwood Files — Slayer killer board, booklet and cards';
export const SLAYER_VISUAL = 'A moss-green ridged humanoid creature with a gaunt skull-like face, tiny cold-blue eyes and long claws. It looks like a tangible practical creature suit under real light. Our Dimension and its cold, damp reflection share the same selected Location. Use restrained optical effects and plausible local light.';
export const SLAYER_RULE_GUIDANCE = 'Slayer normally hunts Victims from the Mirror Dimension, while it can sense and attack the Final Girl across dimensions. Damaging Actions and Items normally require the same dimension. A damage-dealing Reaction when attacked in Our Dimension is an exception. A confirmed Rift Collapse brings Slayer to Our Dimension. Separate a card reveal from a resolved event. Only observed crossings, pulls and outcomes establish what happened.';
export const SLAYER_SETUP = { killerHealth: 11, finalHorrorLevel: 4, bloodlust: 0 };
export const SLAYER_BLOODLUST = [
  [2, 2, 'Start'], [2, 2, ''], [2, 2, 'Increase Horror by 1'], [2, 3, ''],
  [2, 3, 'Recover 1 Killer Health'], [3, 3, 'Reveal Dark Power'],
  [3, 3, 'Increase Horror by 1'], [4, 4, ''], [4, 4, 'Recover 1 Killer Health'],
  [5, 4, ''], [5, 4, 'Increase Horror by 1'],
] as const;

const closest = 'Target the closer eligible Victim or Final Girl';
const victim = 'Target the closest eligible Victim';
const pull = 'Pull a Victim into the Mirror Dimension';
export const SLAYER_STARTING_ACTION = `${pull}, then ${closest.toLowerCase()} and attack without moving.`;
export const SLAYER_POWERS = [
  { id: 'mind-control', name: 'Mind Control', effect: 'During Upkeep, each Victim in Mirror moves one space toward Slayer.' },
  { id: 'renewed-determination', name: 'Renewed Determination', effect: 'Whenever you resolve the pull symbol on the Finale, Slayer immediately targets the closer eligible Victim or Final Girl and moves one space.' },
  { id: 'master-plan', name: 'Master Plan', effect: `With at least four Victims in Mirror, add this to the Finale Killer Action: ${closest}, move and attack.` },
  { id: 'in-my-head', name: 'It’s in My Head!', epic: true, effect: 'At the start of Action, randomly discard one Action card from hand or lose 1 Health to choose the card to discard.' },
];
export const SLAYER_COLLAPSE = 'Interdimensional Rift Collapse';
export const SLAYER_FINALES = [
  { id: 'rift-collapse', name: SLAYER_COLLAPSE, effect: `On reveal, everyone in Mirror loses 1 Health and returns to Our Dimension, including Slayer. Slayer can now target and attack there. Killer Action: ${closest}, move and attack twice.` },
  { id: 'welcome-to-my-world', name: 'Welcome to My World', effect: `On reveal, repeat the pull until no Victims remain in Our Dimension. Killer Action: ${pull}, then ${closest.toLowerCase()}, move, attack and increase Horror by 1.` },
  { id: 'lets-finish-this', name: 'Let’s Finish This', effect: `Killer Action: ${pull}, then ${closest.toLowerCase()}, move and attack twice.` },
];
export const SLAYER_MINORS = [
  { id: 'interdimensional-interference', name: 'Interdimensional Interference', health: 2, effect: 'Lose 1 additional Health whenever you lose Health from Open a Rift or from being in Mirror during Upkeep.' },
  { id: 'interdimensional-focus', name: 'Interdimensional Focus', health: 2, effect: 'Whenever you resolve the pull symbol on the Finale, immediately resolve it a second time.' },
  { id: 'zealous-attacks', name: 'Zealous Attacks', health: 2, effect: 'Increase Slayer’s Attack value by 1.' },
];
const emptyBoard = 'If there are no Victims on the board, discard this and draw the next Terror. Otherwise,';
export const SLAYER_TERRORS = [
  { id: 'sky-turned-black', name: '“The Sky Turned Black!”', quantity: 1, effect: 'If there are no Mirror Victims, discard this and draw the next Terror. Otherwise, panic every Mirror Victim, then kill any Victims in Slayer’s space or an adjacent space.' },
  { id: 'so-many-gone', name: '“So Many Are Gone!”', quantity: 1, effect: `${emptyBoard} increase Horror by 1 if at least four Victims are in Mirror. Then ${victim.toLowerCase()}, move and attack.` },
  { id: 'people-disappearing', name: '“People Are Disappearing.”', quantity: 2, effect: `${pull}, then ${closest.toLowerCase()}, move, attack and increase Horror by 1.` },
  { id: 'through-the-wall', name: '“It Came Through the Wall!”', quantity: 2, effect: `${closest}, move, attack twice and increase Horror by 1.` },
  { id: 'hyperdimensional-travel', name: 'Hyperdimensional Travel', quantity: 1, effect: `${closest}, move twice and attack. If there is a Mirror Victim, place Slayer with the farthest Mirror Victim, then target the closest eligible Victim and attack without moving.` },
  { id: 'detect-blood', name: '“It Can Detect Blood!”', quantity: 1, effect: `If you are below full Health, put Slayer in your space. Then ${closest.toLowerCase()}, move and attack.` },
  { id: 'after-me', name: '“It’s After Me!”', quantity: 2, effect: 'Target the Final Girl, move, attack and increase Horror by 1.' },
  { id: 'what-is-this-place', name: '“What Is This Place?”', quantity: 1, effect: `${emptyBoard} pull the farthest Victim in Our Dimension, if there is one. Then ${victim.toLowerCase()}, move and attack.` },
  { id: 'dark-and-cold', name: '“This Place Is Dark and Cold!”', quantity: 1, effect: `${emptyBoard} pull the farthest Special Victim in Our Dimension, if there is one. Then ${victim.toLowerCase()}, move and attack.` },
  { id: 'something-evil', name: '“I Feel Something Evil in This Place!”', quantity: 1, effect: `${emptyBoard} if Our Dimension has more Victims than Mirror, resolve two pulls, then increase Bloodlust twice.` },
];
export const OPEN_A_RIFT = 'Costs 2 Time to buy. On two successes, enter Mirror. On one, enter and lose 1 Time. On zero, choose either to enter and lose 1 Health and 2 Time or to end the Action phase. When you cross, eligible Special Victims in your space may come with you.';

export type Dimension = 'our' | 'mirror';
export type SlayerReview = { finalDimension: Dimension | null };
export function isDimension(value: unknown): value is Dimension {
  return value === 'our' || value === 'mirror';
}
export function dimensionLabel(dimension: Dimension | null) {
  return dimension === 'our' ? 'Our Dimension' : dimension === 'mirror' ? 'Mirror Dimension' : 'Unrecorded';
}
export const SLAYER_MARKERS = ['1', '2', '3'] as const;
export type SlayerMarker = typeof SLAYER_MARKERS[number];
type Marker = { label: string; dimension: Dimension | null };
type SlayerState = {
  girl: Dimension | null;
  slayer: Dimension | null;
  collapsed: boolean;
  markers: Partial<Record<SlayerMarker, Marker>>;
  minors: Record<string, number>;
};
const empty = (): SlayerState => ({ girl: null, slayer: null, collapsed: false, markers: {}, minors: {} });
const changesFor = (state: SlayerState) => ({ snapshot: JSON.stringify(state) });
export const initialSlayer = () => changesFor({ ...empty(), girl: 'our', slayer: 'mirror' });
const isMarker = (id: unknown): id is SlayerMarker => SLAYER_MARKERS.some(slot => slot === id);
const isMinor = (id: unknown): id is string => SLAYER_MINORS.some(card => card.id === id);
const isHealth = (value: unknown): value is number => typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 2;
const isLabel = (value: unknown): value is string => typeof value === 'string' && value.length <= 32 && value.trim() === value && [...value].every(character => character.charCodeAt(0) >= 32);
const isMap = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);

function parseSlayer(value: unknown): SlayerState | null {
  if (typeof value !== 'string' || value.length > 600) return null;
  try {
    const state: unknown = JSON.parse(value);
    if (!isMap(state) || !(state.girl === null || isDimension(state.girl)) ||
        !(state.slayer === null || isDimension(state.slayer)) || typeof state.collapsed !== 'boolean' ||
        !isMap(state.markers) || !isMap(state.minors) || Object.keys(state).length !== 5) return null;
    if (!Object.entries(state.markers).every(([id, marker]) => isMarker(id) && isMap(marker) &&
        Object.keys(marker).length === 2 && isLabel(marker.label) && (marker.dimension === null || isDimension(marker.dimension)))) return null;
    if (!Object.entries(state.minors).every(([id, health]) => isMinor(id) && isHealth(health))) return null;
    return state as SlayerState;
  } catch { return null; }
}
export const slayerState = (fields: ModuleState) => parseSlayer(fields.snapshot) ?? empty();
export const validSlayerField = (key: string, value: unknown) => key === 'snapshot' && parseSlayer(value) !== null;

export type SlayerCommand =
  | { command: 'cross'; to: Dimension; companions: SlayerMarker[] }
  | { command: 'set-dimension'; who: 'girl' | 'slayer'; to: Dimension }
  | { command: 'track-marker'; id: SlayerMarker; label: string; dimension: Dimension | null }
  | { command: 'set-marker'; id: SlayerMarker; to: Dimension | null }
  | { command: 'pull'; id: SlayerMarker }
  | { command: 'untrack-marker'; id: SlayerMarker }
  | { command: 'collapse'; reveal: string; includeUnknown: SlayerMarker[] }
  | { command: 'minor'; id: string; health: number | null };
export type SlayerAction = SlayerCommand & { parent: string };
type Entry = { id?: string; moduleData?: { module: string }; kind: string; momentType?: string; killerCard?: string };
const isId = (id: unknown): id is string => typeof id === 'string' && /^[a-f0-9-]{36}$/i.test(id);
const markerList = (value: unknown) => Array.isArray(value) && value.length <= SLAYER_MARKERS.length &&
  value.every(isMarker) && new Set(value).size === value.length;

export function validSlayerAction(value: unknown): value is SlayerAction {
  if (!isMap(value) || !(value.parent === 'root' || isId(value.parent))) return false;
  const length = Object.keys(value).length;
  switch (value.command) {
    case 'cross': return length === 4 && isDimension(value.to) && markerList(value.companions);
    case 'set-dimension': return length === 4 && (value.who === 'girl' || value.who === 'slayer') && isDimension(value.to);
    case 'track-marker': return length === 5 && isMarker(value.id) && isLabel(value.label) && (value.dimension === null || isDimension(value.dimension));
    case 'set-marker': return length === 4 && isMarker(value.id) && (value.to === null || isDimension(value.to));
    case 'pull':
    case 'untrack-marker': return length === 3 && isMarker(value.id);
    case 'collapse': return length === 4 && isId(value.reveal) && markerList(value.includeUnknown);
    case 'minor': return length === 4 && isMinor(value.id) && (value.health === null || isHealth(value.health));
    default: return false;
  }
}

export function slayerParent(entries: readonly Entry[]) {
  return [...entries].reverse().find(entry => entry.moduleData?.module === SLAYER_MODULE)?.id ?? 'root';
}
export function slayerCollapseReveal(entries: readonly Entry[]) {
  return entries.find(entry => entry.kind === 'moment' && entry.momentType === 'finale' && entry.killerCard === SLAYER_COLLAPSE)?.id;
}
export function resolveSlayerAction(action: SlayerAction, fields: ModuleState, entries: readonly Entry[]) {
  if (slayerParent(entries) !== action.parent) return null;
  const state = slayerState(fields);
  switch (action.command) {
    case 'cross':
      if (state.girl === null || state.girl === action.to ||
          !action.companions.every(id => state.markers[id]?.dimension === state.girl)) return null;
      for (const id of action.companions) state.markers[id]!.dimension = action.to;
      state.girl = action.to;
      break;
    case 'set-dimension':
      if (state[action.who] === action.to) return null;
      state[action.who] = action.to;
      break;
    case 'track-marker':
      if (state.markers[action.id]) return null;
      state.markers[action.id] = { label: action.label, dimension: action.dimension };
      break;
    case 'set-marker': {
      const marker = state.markers[action.id];
      if (!marker || marker.dimension === action.to) return null;
      marker.dimension = action.to;
      break;
    }
    case 'pull': {
      const marker = state.markers[action.id];
      if (!marker || marker.dimension !== 'our') return null;
      marker.dimension = 'mirror';
      break;
    }
    case 'untrack-marker':
      if (!state.markers[action.id]) return null;
      delete state.markers[action.id];
      break;
    case 'collapse':
      if (state.collapsed || slayerCollapseReveal(entries) !== action.reveal ||
          !action.includeUnknown.every(id => state.markers[id]?.dimension === null)) return null;
      state.collapsed = true;
      state.girl = 'our';
      state.slayer = 'our';
      for (const id of SLAYER_MARKERS) {
        const marker = state.markers[id];
        if (marker && (marker.dimension === 'mirror' || action.includeUnknown.includes(id))) marker.dimension = 'our';
      }
      break;
    case 'minor':
      if (action.health === null) {
        if (state.minors[action.id] === undefined) return null;
        delete state.minors[action.id];
      } else {
        if (state.minors[action.id] === action.health) return null;
        state.minors[action.id] = action.health;
      }
      break;
  }
  return changesFor(state);
}

export function slayerFacts(fields: ModuleState, includeGirl = true) {
  const state = slayerState(fields);
  const facts = [];
  if (state.collapsed) facts.push('Rift Collapse was physically recorded.');
  if (includeGirl && state.girl) facts.push(`Final Girl last observed in ${dimensionLabel(state.girl)}.`);
  if (state.slayer) facts.push(`Slayer last observed in ${dimensionLabel(state.slayer)}.`);
  for (const marker of Object.values(state.markers)) {
    if (marker.label && marker.dimension) {
      facts.push(`Special Victim ${marker.label} last observed in ${dimensionLabel(marker.dimension)}.`);
    }
  }
  return facts.join(' ');
}
export function describeSlayerAction(action: SlayerAction, fields: ModuleState) {
  const state = slayerState(fields);
  switch (action.command) {
    case 'cross': return `Final Girl crossed into ${dimensionLabel(action.to)}${action.companions.length ? ' with tracked Special Victims' : ''}`;
    case 'collapse': return 'Rift Collapse recorded · Slayer moved into Our Dimension';
    case 'pull': return `${state.markers[action.id]?.label || 'Special Victim'} pulled into the Mirror Dimension`;
    case 'minor': return `${SLAYER_MINORS.find(card => card.id === action.id)?.name} · ${action.health === null ? 'record cleared' : action.health + ' Health'}`;
    default: return 'Dimension Tracker corrected';
  }
}
