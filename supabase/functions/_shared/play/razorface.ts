import type { PlayEvent } from './events.ts';

export const RAZORFACE = 'Razorface';
export const RAZORFACE_MODULE = 'razorface';
export const RAZORFACE_SOURCE = 'Hell to Pay · supplied Series 3 Razorface components';
export const RAZORFACE_MAX_BLOODLUST = 8;

export const AFFLICTIONS = [
  {id:'experience-unbound', name:'Experience Unbound', requirement:'Unlock or use your Ultimate.', effect:'Razorface recovers 3 Health.'},
  {id:'the-gift-of-pain', name:'The Gift of Pain', requirement:'Deal at least 3 damage to Razorface in one Action phase.', effect:'Lose 1 Health.'},
  {id:'explorers-of-the-flesh', name:'Explorers of the Flesh', requirement:'When you attack Razorface, send the damage to a Victim in your space or an adjacent space instead.', effect:'Increase Horror by 1.'},
  {id:'a-waste-of-good-suffering', name:'A Waste of Good Suffering', requirement:'Save at least three Victims together.', effect:'End the Action phase.'},
  {id:'a-delicious-sacrifice', name:'A Delicious Sacrifice', requirement:'Remove a zero-cost Action card from the game.', effect:'If the Dark Power is revealed, remove another zero-cost Action card from the game.'},
  {id:'you-call-i-come', name:'You Call, I Come', requirement:'Discard a random Item card.', effect:'Place Razorface in your space.'},
  {id:'a-lamb-to-the-slaughter', name:'A Lamb to the Slaughter', requirement:'Kill a Victim you would otherwise save.', effect:'Increase Horror by 1.'},
  {id:'torturous-embrace', name:'Torturous Embrace', requirement:'You or Razorface have exactly one Health left.', effect:'Discard an Item of your choice. If you have none, end the Action phase.'},
] as const;
export type AfflictionId = typeof AFFLICTIONS[number]['id'];
export const raisesHorrorOnPurge = (id: AfflictionId) => id === 'explorers-of-the-flesh' || id === 'a-lamb-to-the-slaughter';
export const affliction = (id: unknown) => AFFLICTIONS.find(card => card.id === id);
const isAffliction = (id: unknown): id is AfflictionId => affliction(id) !== undefined;

export const RAZORFACE_POWERS = [
  {id:'helleport', name:'Helleport', effect:'At the start of the Killer phase, place Razorface with the Victim farthest from you. Skip this if none are on the board.'},
  {id:'soulbound', name:'Soulbound', effect:'Draw a new Affliction when this power is revealed.'},
  {id:'life-drain', name:'Life Drain', effect:'After you purge an Affliction, lose 1 Health and Razorface recovers 1 Health.'},
  {id:'infinite-despair', name:'Infinite Despair', epic:true, effect:'During Panic, increase Horror by 2 if any Victim panics, or by 1 otherwise.'},
];
export const RAZORFACE_FINALES = [
  {id:'chains-of-torment', name:'Chains of Torment', effect:'Move toward the nearest Victim or Final Girl and attack twice. Increase Horror by 1 whenever Razorface enters a space containing a Victim.'},
  {id:'taste-our-pleasures', name:'Taste Our Pleasures', effect:'Move toward the nearest Victim or Final Girl. Roll a die for attacks: 1 gives three, 2–4 gives two, and 5–6 gives one.'},
  {id:'i-feast-on-your-pain', name:'I Feast on Your Pain', effect:'When revealed with an Affliction in play, set Bloodlust to its maximum. Move toward the nearest Victim or Final Girl and attack twice.'},
];
export const RAZORFACE_MINORS = [
  {id:'the-pain-of-judgment', name:'The Pain of Judgment', effect:'Increase Horror by 1 whenever a Victim is killed.'},
  {id:'the-pain-of-salvation', name:'The Pain of Salvation', effect:'During your Action phase, each gain of at least 1 Time costs either a Health or an increase of 1 Horror.'},
] as const;
type MinorId = typeof RAZORFACE_MINORS[number]['id'];
const isMinor = (id: unknown): id is MinorId => RAZORFACE_MINORS.some(card => card.id === id);

export const RAZORFACE_TERRORS = [
  {name:'Scarlet Hymn', quantity:1, effect:'Target the nearest Victim or Final Girl, move, and attack three times.', death:true},
  {name:'See the Purpose in Your Pain', quantity:1, effect:'Increase Horror by 2. If you have purged an Affliction, exchange an Affliction of your choice for a new draw. With no past purge, increase Bloodlust by 1.'},
  {name:'Brutal Reward', quantity:2, effect:'Target the nearest Victim or Final Girl, move and attack. Gain 1 Time if that kills a Victim or damages you.', death:true},
  {name:'Ecstatic Torture', quantity:2, effect:'Target the nearest Victim or Final Girl, move and attack, then lose 2 Time.', death:true},
  {name:'Enticed by Ecstasy', quantity:1, effect:'Discard your Focus and Distraction cards from hand and increase Horror by 1.'},
  {name:'Sadistic Manifestation', quantity:1, effect:'Redraw if the board has no Victims. Otherwise place Razorface at the farthest Victim and attack Victims twice there.', death:true},
  {name:'Pleasure in Pain', quantity:1, effect:'Resolve two separate actions targeting the nearest Victim or Final Girl, moving and attacking each time. Then Razorface recovers 2 Health.', death:true},
  {name:'Violent Tastes', quantity:2, effect:'Redraw if there are no Victims on the board. Otherwise target a Victim, move and attack. Increase Bloodlust by 1 if a Victim was not killed.', death:true},
  {name:'Pain and Pleasure Indivisible', quantity:1, effect:'Target the nearest Victim or Final Girl, move and attack. Increase Horror by 1 and gain 2 Time.', death:true},
  {name:'New and Darker Experiences', quantity:1, effect:'Choose between raising Horror by 3 and drawing a new Affliction.'},
  {name:'What Is Your Pleasure?', quantity:1, effect:'Roll a die: on 1–2 target the nearest Victim or Final Girl, move and attack. On 3–4 increase Horror by 2. On 5–6 increase Bloodlust by 1.', death:true},
  ...RAZORFACE_MINORS.map(card => ({...card, quantity:1, effect:`${card.effect} Redraw if you have no Affliction when this enters play. Discard on a purge.`})),
];
export const RAZORFACE_GUIDANCE = 'Afflictions are tabletop conditions. Razorface is protected from damage that would reveal his Final Health token while any remain. Purging, an impossible-card replacement, and an Affliction deck loss are distinct outcomes. Use the selected Location. Only narrate confirmed events; never infer a wound, casualty, purge, attack or token result from art, rules or card presence.';

type RazorfaceCommand =
  | {kind:'setup'|'correct'; cards: AfflictionId[]}
  | {kind:'draw'; card: AfflictionId}
  | {kind:'replace'; card: AfflictionId; replacement: AfflictionId; reason:'impossible'|'exchange'}
  | {kind:'purge'; card: AfflictionId; newTurn: boolean; girlHealth?: number; killerHealth?: number; horror?: number}
  | {kind:'minor'; card: MinorId; present: boolean}
  | {kind:'exhausted'; discarded?: AfflictionId; reason?: 'impossible'|'exchange'}
  | {kind:'token'; result:'revived'; health:number}
  | {kind:'token'; result:'defeated'; tabletop?: true};
export type RazorfaceAction = RazorfaceCommand & {parent: string};
export type { RazorfaceCommand };
type Entry = Pick<PlayEvent, 'id'|'moduleData'>;
type Resolution = 'revived'|'defeated'|'exhausted';
export type RazorfaceState = {
  active?: AfflictionId[];
  purged: AfflictionId[];
  removed: AfflictionId[];
  minors: MinorId[];
  result?: Resolution;
};
const isHealth = (value: unknown) => typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 99;
const validCards = (cards: unknown): cards is AfflictionId[] =>
  Array.isArray(cards) && cards.length <= AFFLICTIONS.length && cards.every(isAffliction) && new Set(cards).size === cards.length;

export function parseRazorfaceAction(value: unknown): RazorfaceAction | null {
  if (typeof value !== 'string' || value.length > 400) return null;
  let action: RazorfaceAction;
  try { action = JSON.parse(value); } catch { return null; }
  if (!action || typeof action.parent !== 'string' || action.parent.length > 36) return null;
  // Whitelist fields so untrusted data cannot become linked tracker updates.
  switch (action.kind) {
    case 'setup': return validCards(action.cards) && action.cards.length === 3 ? {kind:action.kind, parent:action.parent, cards:action.cards} : null;
    case 'correct': return validCards(action.cards) ? {kind:action.kind, parent:action.parent, cards:action.cards} : null;
    case 'draw': return isAffliction(action.card) ? {kind:action.kind, parent:action.parent, card:action.card} : null;
    case 'replace': return isAffliction(action.card) && isAffliction(action.replacement) &&
      (action.reason === 'impossible' || action.reason === 'exchange')
      ? {kind:action.kind, parent:action.parent, card:action.card, replacement:action.replacement, reason:action.reason} : null;
    case 'purge': return isAffliction(action.card) && typeof action.newTurn === 'boolean' &&
      (action.girlHealth === undefined || isHealth(action.girlHealth)) &&
      (action.killerHealth === undefined || isHealth(action.killerHealth)) &&
      (action.horror === undefined || isHealth(action.horror) && action.horror <= 7)
      ? {kind:action.kind, parent:action.parent, card:action.card, newTurn:action.newTurn,
        girlHealth:action.girlHealth, killerHealth:action.killerHealth, horror:action.horror} : null;
    case 'minor': return isMinor(action.card) && typeof action.present === 'boolean' ? {kind:action.kind, parent:action.parent, card:action.card, present:action.present} : null;
    case 'exhausted': {
      if (action.discarded === undefined) return {kind:action.kind, parent:action.parent};
      return isAffliction(action.discarded) && (action.reason === 'impossible' || action.reason === 'exchange')
        ? {kind:action.kind, parent:action.parent, discarded:action.discarded, reason:action.reason} : null;
    }
    case 'token': return action.result === 'defeated' ? {kind:action.kind, parent:action.parent, result:action.result, ...(action.tabletop === true && {tabletop:true as const})}
      : action.result === 'revived' && isHealth(action.health) && action.health >= 1 && action.health <= 3
      ? {kind:action.kind, parent:action.parent, result:action.result, health:action.health} : null;
    default: return null;
  }
}

export function razorfaceEntry(entry: Entry) {
  return entry.moduleData?.module === RAZORFACE_MODULE ? parseRazorfaceAction(entry.moduleData.changes.action) : null;
}

export function razorfaceLatest(entries: readonly Entry[]) {
  return [...entries].reverse().find(entry => entry.moduleData?.module === RAZORFACE_MODULE);
}

function applyAction(state: RazorfaceState, action: RazorfaceAction): RazorfaceState {
  const active = state.active ?? [];
  switch (action.kind) {
    case 'setup': case 'correct': return {...state, active:action.cards};
    case 'draw': return {...state, active:[...active, action.card]};
    case 'replace': return {...state, active:active.map(card => card === action.card ? action.replacement : card),
      removed:action.reason === 'impossible' ? [...state.removed, action.card] : state.removed};
    case 'purge': return {...state, active:active.filter(card => card !== action.card), purged:[...state.purged, action.card], minors:[]};
    case 'minor': return {...state, minors:action.present ? [...state.minors, action.card] : state.minors.filter(id => id !== action.card)};
    case 'exhausted': return {...state, active:action.discarded ? active.filter(card => card !== action.discarded) : state.active,
      removed:action.discarded && action.reason === 'impossible' ? [...state.removed, action.discarded] : state.removed, result:'exhausted'};
    case 'token': return {...state, result:action.result,
      ...(action.result === 'defeated' && action.tabletop === true && {active:[],minors:[]})};
  }
}

export function razorfaceState(entries: readonly Entry[]): RazorfaceState {
  let state: RazorfaceState = {purged:[], removed:[], minors:[]};
  for (const entry of entries) {
    const action = razorfaceEntry(entry);
    if (action) state = applyAction(state, action);
  }
  return state;
}

export function razorfaceAvailable(state: RazorfaceState, id: AfflictionId) {
  return !state.active?.includes(id) && !state.purged.includes(id) && !state.removed.includes(id);
}

export function razorfaceLegal(action: RazorfaceAction, entries: readonly PlayEvent[], killerHealth?: number) {
  if (action.parent !== (razorfaceLatest(entries)?.id ?? 'root')) return false;
  const state = razorfaceState(entries);
  if (state.result === 'exhausted' || state.result === 'defeated') return false;
  switch (action.kind) {
    case 'setup': return state.active === undefined;
    case 'correct': return action.cards.every(card => !state.purged.includes(card) && !state.removed.includes(card));
    case 'draw': return state.active !== undefined && razorfaceAvailable(state, action.card);
    case 'replace': return state.active?.includes(action.card) && razorfaceAvailable(state, action.replacement);
    case 'purge': {
      const drain = entries.some(entry => entry.momentType === 'dark-power' && entry.killerCard === 'Life Drain');
      return state.active?.includes(action.card) && (state.purged.length === 0 || action.newTurn) &&
        (action.girlHealth === undefined || drain || action.card === 'the-gift-of-pain') &&
        (action.killerHealth === undefined || drain || action.card === 'experience-unbound') &&
        (action.horror === undefined || raisesHorrorOnPurge(action.card));
    }
    case 'minor': return action.present ? Boolean(state.active?.length) && !state.minors.includes(action.card) : state.minors.includes(action.card);
    case 'exhausted': return action.discarded === undefined || state.active?.includes(action.discarded);
    case 'token': return action.result === 'defeated' && action.tabletop === true ||
      (state.active?.length === 0 || state.result === 'revived' && action.result === 'defeated') && (killerHealth === undefined || killerHealth <= 1) &&
      (action.result === 'defeated' || state.result !== 'revived');
  }
}

export function describeRazorface(action: RazorfaceAction) {
  switch (action.kind) {
    case 'setup': return `Opening Afflictions: ${action.cards.map(card => affliction(card)?.name).join(', ')}`;
    case 'correct': return 'Razorface Affliction record corrected';
    case 'draw': return `Affliction drawn: ${affliction(action.card)?.name}`;
    case 'replace': return `${affliction(action.card)?.name} ${action.reason === 'impossible' ? 'removed as impossible' : 'exchanged'} for ${affliction(action.replacement)?.name}`;
    case 'purge': return `Purged ${affliction(action.card)?.name}`;
    case 'minor': return `${RAZORFACE_MINORS.find(card => card.id === action.card)?.name} ${action.present ? 'recorded' : 'discarded'}`;
    case 'token': return action.result === 'revived' ? 'Razorface revived after the Final Health reveal' : 'Razorface was defeated at the table';
    case 'exhausted': return 'The required Affliction draw failed because the deck was empty. The game was lost.';
  }
}

export function razorfaceFacts(entries: readonly Entry[]) {
  const state = razorfaceState(entries);
  if (!razorfaceLatest(entries)) return '';
  return [
    state.result === 'exhausted' ? 'The game was lost when a required Affliction draw failed. The Final Girl’s fate is unconfirmed.' :
      state.result === 'defeated' ? 'Razorface was confirmed defeated.' : state.result === 'revived' ? 'Razorface came back after his Final Health token was revealed.' : '',
    state.active === undefined ? '' : state.active.length ? `Active Afflictions: ${state.active.map(id => affliction(id)?.name).join(', ')}.` : 'No active Afflictions remained.',
    state.purged.length ? `Purged: ${state.purged.map(id => affliction(id)?.name).join(', ')}.` : '',
    state.minors.length ? `Active Minor Powers: ${state.minors.map(id => RAZORFACE_MINORS.find(card => card.id === id)?.name).join(', ')}.` : '',
  ].filter(Boolean).join(' ');
}
