import type { PlayEvent } from './events.ts';
import type { ModuleState } from './modules.ts';

export const BIRDS = 'Birds';
export const BIRDS_MODULE = 'birds';
export const BIRDS_MAX_BLOODLUST = 4;
export const BIRDS_SOURCE = 'Terror From Above • supplied Series 1 cards';
export const BIRDS_DIFFICULTIES = [{value:1,label:'Easy'}, {value:2,label:'Normal'}, {value:3,label:'Hard'}] as const;
export type BirdsTarget = typeof BIRDS_DIFFICULTIES[number]['value'];
export const isBirdsTarget = (value: unknown): value is BirdsTarget => BIRDS_DIFFICULTIES.some(d => d.value === value);
export const BIRDS_SETUP = 'Start with Horror 4 and Bloodlust at the bottom. Place three Birds on the Killer start shown on the Location Setup card. Set up the Final Girl and normal Victims as printed, then add one Bird to every remaining empty space.';
export const BIRDS_SPAWN_SPACES = ['Distribute among any spaces', 'Any single space', 'Nearest Search space', 'Nearest Exit', 'Nearest Victim’s space', 'Your space'] as const;

export const BIRDS_POWERS = [
  {id:'run-for-your-life', name:'Run for Your Life!', effect:'During Upkeep, panic the Victim farthest from you. If they panic into a space with two or more Birds, they are killed. Vignette Special Victims cannot be killed.'},
  {id:'birdnado', name:'Birdnado', effect:'During Upkeep, lose 3 Health if your space and the adjacent spaces contain at least ten Birds in total.'},
  {id:'waiting-to-strike', name:'They’re Just Waiting to Strike', effect:'During Upkeep, increase Horror by 2 if there are three Birds in your space.'},
];
export const BIRDS_FINALES = [
  {id:'insurmountable-odds', name:'Insurmountable Odds', effect:'Minion Action: spawn, attack, then spawn again. When spawning, use the higher die for the number of Birds.'},
  {id:'endless-swarm', name:'Endless Swarm', effect:'Minion Action: spawn. Lose 1 Health whenever you move into a space with three Birds.'},
  {id:'fowl-agression', name:'Fowl Agression', effect:'Minion Action: spawn, attack, then spawn again. When spawning for the rest of the game, roll one die and place that many Birds in your space.'},
];
export const BIRD_WALL = {id:'bird-wall', name:'Bird Wall', effect:'Victims cannot be saved at an Exit that contains Birds. Mark one token per Bird killed. Remove this card from the game when it has five or more tokens.'};
export const BIRDS_TERRORS = [
  {name:'It Feels Hopeless', quantity:4, effect:'Increase Horror by 2. If at least one Special Victim is in play, spawn Birds.'},
  {name:'The Birds Are Attacking!', quantity:6, effect:'Attack in your space and in each space where Birds outnumber Victims. If no attacks occurred, spawn Birds and increase Bloodlust by 1.'},
  {name:'They’re Trying to Get In!', quantity:3, effect:'Increase Horror by 1. For this spawn, roll one die and place that many Birds in the nearest Search space.'},
  {name:'Where Are They Coming From?', quantity:3, effect:'Spawn Birds. If three or fewer were spawned, spawn again.'},
  {...BIRD_WALL, quantity:1},
].map(card => ({...card, killer:BIRDS, source:BIRDS_SOURCE}));

export const BIRDS_GUIDANCE = 'The Birds are a flock of usually stationary Minions at the selected Location. The objective is to save every required vignette Special Victim. The flock need not disperse. A board fully overrun by Birds can end the game while the Final Girl is alive. Use reported outcomes only and preserve the selected Final Girl. Reveals and artwork establish no attacks or casualties.';

export function birdsEventIncompatible(killer: string | null, location: string | null, event?: string | null) {
  if (killer !== BIRDS || !event) return false;
  const name = event.trim().toLowerCase();
  return location === 'Creech Manor' && name === 'ghost hunters';
}

export const BIRDS_ARRIVALS = ['hidden', 'ultimate', 'normal-victims-gone', 'observed'] as const;
type BirdsArrival = typeof BIRDS_ARRIVALS[number];
export const BIRDS_LOSS_CHOICES = [
  {value:'overrun-alive',label:'Board overrun · Final Girl alive'},
  {value:'overrun',label:'Board overrun · fate unrecorded'},
  {value:'died',label:'Final Girl died'},
  {value:'unrecorded',label:'Cause unrecorded'},
] as const;
type BirdsLoss = typeof BIRDS_LOSS_CHOICES[number]['value'];
export type BirdsReason = 'rescued' | BirdsLoss;
export type BirdsReview = {reason: BirdsReason; required: BirdsTarget | null; rescued: number | null};
const validArrival = (value: unknown): value is BirdsArrival => BIRDS_ARRIVALS.some(choice => choice === value);
export function isBirdsReason(value: unknown): value is BirdsReason {
  return value === 'rescued' || BIRDS_LOSS_CHOICES.some(choice => choice.value === value);
}
export function birdsReasonMatches(outcome:'won'|'lost', reason:unknown) {
  return isBirdsReason(reason) && (outcome === 'won') === (reason === 'rescued');
}
const isCount = (value: unknown): value is number => typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 3;
const validWall = (value: unknown): value is number | 'inactive' =>
  value === 'inactive' || typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 5;

export function isBirdsReview(value: unknown): value is BirdsReview {
  if (!value || typeof value !== 'object') return false;
  const {reason, required, rescued} = value as BirdsReview;
  return isBirdsReason(reason) && (required === null || isBirdsTarget(required)) &&
    (rescued === null || isCount(rescued) && (required === null || rescued <= required)) &&
    (reason !== 'rescued' || required === null || rescued === required);
}

type BirdsCommand =
  | {command:'arrive'; trigger:'ultimate'|'normal-victims-gone'}
  | {command:'save'}
  | {command:'correct'; required:BirdsTarget|null; rescued:number|null; arrival:BirdsArrival|null}
  | {command:'add-wall'|'count-wall'}
  | {command:'correct-wall'; value:number|'inactive'|null}
  | {command:'review'; review:BirdsReview};
export type BirdsAction = BirdsCommand & {parent:string};
type BirdsEntry = Pick<PlayEvent,'id'|'kind'|'moduleData'|'birdsAction'>;

export function validBirdsAction(value: unknown): value is BirdsAction {
  if (!value || typeof value !== 'object') return false;
  const action = value as BirdsAction;
  if (typeof action.parent !== 'string' || action.parent.length > 36) return false;
  switch (action.command) {
    case 'arrive': return action.trigger === 'ultimate' || action.trigger === 'normal-victims-gone';
    case 'correct': return (action.required === null || isBirdsTarget(action.required)) &&
      (action.arrival === null || validArrival(action.arrival)) &&
      (action.rescued === null || isCount(action.rescued) &&
        (action.required === null || action.rescued <= action.required) &&
        (!action.rescued || action.arrival !== null && action.arrival !== 'hidden'));
    case 'save': case 'add-wall': case 'count-wall': return true;
    case 'correct-wall': return action.value === null || validWall(action.value);
    case 'review': return isBirdsReview(action.review);
    default: return false;
  }
}

function group(command: BirdsCommand['command']) {
  if (command === 'review') return 'review';
  if (command.endsWith('wall')) return 'wall';
  return 'objective';
}

export function birdsLatest(entries: readonly BirdsEntry[], command: BirdsCommand['command']) {
  for (let i = entries.length - 1; i >= 0; i--) {
    const entry = entries[i];
    if (entry.birdsAction && group(entry.birdsAction.command) === group(command)) return entry;
  }
}
export function birdsParent(entries: readonly BirdsEntry[], command: BirdsCommand['command']) {
  return birdsLatest(entries, command)?.id ?? 'root';
}
export const initialBirds = (required: BirdsTarget): ModuleState => ({required, rescued:0, arrival:'hidden', wall:'inactive'});
export function validBirdsField(key: string, value: unknown) {
  switch (key) {
    case 'required': return value === null || isBirdsTarget(value);
    case 'rescued': case 'reviewRescued': return value === null || isCount(value);
    case 'arrival': return value === null || validArrival(value);
    case 'wall': return value === null || validWall(value);
    case 'reviewReason': return isBirdsReason(value);
    case 'reviewRequired': return value === null || isBirdsTarget(value);
    default: return false;
  }
}
export function birdsState(entries: readonly Pick<BirdsEntry,'moduleData'>[]) {
  const state: ModuleState = {};
  for (const entry of entries) {
    if (entry.moduleData?.module === BIRDS_MODULE) Object.assign(state, entry.moduleData.changes);
  }
  return state;
}
export function sameBirdsChanges(a: ModuleState, b: ModuleState) {
  return Object.keys(a).length === Object.keys(b).length && Object.entries(a).every(([key,value]) => value === b[key]);
}
export function resolveBirdsAction(action: BirdsAction, entries: readonly BirdsEntry[]): ModuleState | null {
  if (!validBirdsAction(action) || action.parent !== birdsParent(entries, action.command)) return null;
  const state = birdsState(entries);
  switch (action.command) {
    case 'arrive':
      return !state.arrival || state.arrival === 'hidden'
        ? {arrival:action.trigger, ...(state.rescued == null && {rescued:0})} : null;
    case 'save':
      return isBirdsTarget(state.required) && isCount(state.rescued) && state.rescued < state.required &&
        !!state.arrival && state.arrival !== 'hidden' ? {rescued:state.rescued+1} : null;
    case 'correct':
      return {required:action.required, rescued:action.rescued, arrival:action.arrival};
    case 'add-wall':
      return state.wall == null || state.wall === 'inactive' ? {wall:0} : null;
    case 'count-wall':
      return typeof state.wall === 'number' && state.wall < 5 ? {wall:state.wall+1} : null;
    case 'correct-wall':
      return {wall:action.value};
    case 'review':
      return {reviewReason:action.review.reason, reviewRequired:action.review.required, reviewRescued:action.review.rescued};
  }
}
export function birdsReview(state: ModuleState): BirdsReview | undefined {
  const review = {reason:state.reviewReason, required:state.reviewRequired, rescued:state.reviewRescued};
  return isBirdsReview(review) ? review : undefined;
}
export function birdsResult(entries: readonly BirdsEntry[], reason: BirdsReason, target?: BirdsTarget): BirdsReview {
  const state = birdsState(entries);
  const required = state.required === null ? null : isBirdsTarget(state.required) ? state.required : target ?? null;
  return {reason, required, rescued:reason === 'rescued' && required !== null ? required : isCount(state.rescued) ? state.rescued : null};
}
export function birdsSummary(state: ModuleState, target?: BirdsTarget) {
  const required = state.required === undefined ? target : state.required;
  if (state.arrival === 'hidden' || state.arrival === undefined && required) return 'Special Victims hidden';
  if (isBirdsTarget(required) && isCount(state.rescued)) return `${state.rescued} of ${required} rescued`;
  return state.arrival ? 'Special Victims in play · progress unrecorded' : 'Rescue progress unrecorded';
}
export function birdsReviewText(review: BirdsReview) {
  const progress = review.rescued !== null && review.required !== null ? `${review.rescued} of ${review.required} Special Victims rescued. ` : '';
  switch (review.reason) {
    case 'rescued': return progress || 'All required Special Victims were rescued. The count was unrecorded.';
    case 'overrun-alive': return progress + 'The board was overrun by Birds. The Final Girl was alive at the loss.';
    case 'overrun': return progress + 'The board was overrun by Birds. The Final Girl’s fate was unrecorded.';
    case 'died': return progress + 'The Final Girl died.';
    case 'unrecorded': return progress + 'The cause of the loss was unrecorded.';
  }
}
export const birdsLogBelongsTo = (killer: string | undefined, events: readonly BirdsEntry[]) =>
  killer === BIRDS || !events.some(e => e?.moduleData?.module === BIRDS_MODULE);
