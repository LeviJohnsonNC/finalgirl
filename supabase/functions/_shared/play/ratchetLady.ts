import type { PlayEvent } from './events.ts';
import type { ModuleState } from './modules.ts';

export const RATCHET_LADY = 'Ratchet Lady';
export const RATCHET_MODULE = 'ratchet-lady';
export const RATCHET_SETUP = { killerHealth: 6, finalHorrorLevel: 5, bloodlust: 0 };
export const RATCHET_INITIAL = { maniacs: 2 };
export const MAX_MANIACS = 6;
export const RATCHET_MAX_BLOODLUST = 8;
// The existing saved result uses a PostgreSQL INTEGER. Health has no game limit.
export const RATCHET_HEALTH_STORAGE_MAX = 2_147_483_647;
export const RATCHET_SOURCE = 'Owner photos IMG_9581–IMG_9585.jpeg and Series 2 Feature Film Rulebook, pp. 36–37.';
export const HOLD_HER_DOWN = 'Hold Her Down';
export const SHIELD_OF_MADNESS = 'Shield of Madness';

export const RATCHET_POWERS = [
  { id: 'manic-burst', name: 'Manic Burst', effect: 'After placing a Maniac on the board, resolve its current Minion Action immediately.' },
  { id: 'dark-injection', name: 'Dark Injection', effect: 'The first time she recovers Health in each Killer Phase, she recovers 1 additional Health.' },
  { id: 'bloodfear', name: 'Bloodfear', effect: 'During each Killer Phase, the first increase to either Horror or Bloodlust heals the Ratchet Lady by 1.' },
  { id: 'shield-of-madness', name: SHIELD_OF_MADNESS, epic: true, effect: 'The Ratchet Lady is protected from losing Health while any Maniac is on the board.' },
] as const;

export const RATCHET_FINALES = [
  { id: 'raining-maniacs', name: 'It’s Raining Maniacs', effect: 'On reveal, place two Maniacs in the Ratchet Lady’s space if none are in play. Minions target the Final Girl, move and attack twice. Ratchet Lady places two Maniacs in her space, then targets the closest Final Girl or Victim and attacks.' },
  { id: 'feed-the-madness', name: 'Feed the Madness', effect: 'At the start of the Killer Phase, place a Maniac in the Ratchet Lady’s space if none are in play. Minions target the Final Girl, move and attack. Ratchet Lady recovers 1 Health, targets the closest Final Girl or Victim, moves and attacks.' },
  { id: 'hold-her-down', name: HOLD_HER_DOWN, effect: 'On reveal, convert remaining eligible Victims to Maniacs and remove both Calm cards from the game. Minions target the Final Girl and move. Ratchet Lady targets the Final Girl, moves and attacks twice.' },
] as const;

export const RATCHET_MINORS = [
  { id: 'blood-drive', name: 'Blood Drive', health: 1, effect: 'Ratchet Lady recovers 1 Health for each Victim converted to a Maniac.' },
  { id: 'insanity-lust', name: 'Insanity-Lust', health: 1, effect: 'Increase Bloodlust once whenever an effect converts at least one Victim into a Maniac.' },
] as const;

const noVictims = 'If there are no Victims, discard and draw the next Terror card.';
const huntVictim = 'Ratchet Lady targets the closest Victim, moves and attacks.';
const huntGirl = 'Maniacs target the Final Girl, move and attack.';
export const RATCHET_TERRORS: readonly { id: string; name: string; quantity: number; effect: string; death?: true }[] = [
  { id: 'blood-jolt', name: 'Blood Jolt', quantity: 2, effect: 'Increase Horror twice, then Ratchet Lady recovers 2 Health.' },
  { id: 'keep-her-busy', name: 'Keep Her Busy…', quantity: 1, effect: 'Maniacs target the Final Girl and move twice. ' + huntVictim, death: true },
  { id: 'screams-in-the-dark', name: 'Screams in the Dark', quantity: 1, effect: noVictims + ' Convert the two closest Victims to the Ratchet Lady. Maniacs target the Final Girl and move twice.' },
  { id: 'march-of-the-maniacs', name: 'March of the Maniacs', quantity: 1, effect: 'Spawn one Maniac at each empty exit, then convert the closest Victim to you and the closest Victim to the Ratchet Lady in sequence. Increase Bloodlust for each Maniac you could not place due to the meeple limit, then panic all Maniacs.' },
  { id: 'join-us-or-die', name: 'Join Us or Die!', quantity: 1, effect: noVictims + ' Target the closest Victim, move and attack. Roll for each Victim who would die. On 1–4 they convert and Bloodlust increases as if they died. On 5–6 they die without the usual Bloodlust increase.', death: true },
  { id: 'leave-her-to-me', name: 'Leave Her to Me!', quantity: 1, effect: noVictims + ' Maniacs target the closest Victim, move and attack. Ratchet Lady targets the Final Girl, moves and attacks.', death: true },
  { id: 'we-are-helping', name: 'We Are Helping!', quantity: 1, effect: noVictims + ' Convert the two Victims nearest you. Maniacs target the Final Girl and move. Gain 1 Time per Maniac in your space.' },
  { id: 'blood-transfusion', name: 'Blood Transfusion', quantity: 1, effect: 'Roll and set the die on the card. On 1–3 repeat, treating exhaustion of the dice as a 4. On 4–5 lose 1 Health, then Ratchet Lady recovers Health equal to the dice on the card. On 6 Ratchet Lady takes 1 damage, then you recover Health equal to the dice on the card.' },
  { id: 'tend-to-your-wounds', name: 'Let Me Tend to Your Wounds…', quantity: 1, effect: noVictims + ' ' + huntVictim + ' Repeat that action once. She recovers 1 Health per Victim killed.', death: true },
  { id: 'bloodletting', name: 'Bloodletting', quantity: 1, effect: noVictims + ' ' + huntVictim + ' Repeat that action once. Increase Bloodlust an additional time per Victim killed.', death: true },
  { id: 'whispers-in-the-dark', name: 'Whispers in the Dark', quantity: 1, effect: noVictims + ' Convert the Victim closest to the Ratchet Lady. ' + huntGirl + ' Increase Bloodlust once.' },
  { id: 'this-wont-hurt', name: 'Don’t Worry, This Won’t Hurt…', quantity: 1, effect: 'Ratchet Lady targets the Final Girl, moves twice and attacks twice. If she damaged you, convert the closest Victim.' },
  { id: 'dark-places', name: 'Join Me in the Dark Places', quantity: 1, effect: 'Ratchet Lady targets the Final Girl and moves. Convert Victims in every space on her route, including both endpoints. If any were converted, increase Bloodlust once.' },
  ...RATCHET_MINORS.map(card => ({ ...card, quantity: 1 })),
];

const attack = [1, 1, 1, 1, 2, 2, 2, 2, 3];
const move = [2, 3, 4, 4, 4, 4, 4, 5, 5];
export const RATCHET_BLOODLUST = ['', '', '+1 Horror', '', 'Reveal Dark Power', 'Recover 1 Health', '+1 Horror', 'Recover 2 Health', '']
  .map((effect, level) => ({ level, attack: attack[level], move: move[level], effect }));
export const RATCHET_VISUAL = 'Keep the selected location and Final Girl. The Ratchet Lady wears tangible, worn pale cloth over her eyes, a torn off-white gown, and a worn metal frame on the right forearm. Only depict Maniacs when called for by the scene.';

export const ratchetMinorHealth = (id: string) => `minor.${id}.health`;
export const ratchetCount = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= MAX_MANIACS;

export function validRatchetField(key: string, value: unknown) {
  if (key === 'maniacs') return value === null || ratchetCount(value);
  if (key === 'calmRemoved') return value === true || value === null;
  return RATCHET_MINORS.some(card => key === ratchetMinorHealth(card.id)) && (value === null || value === 0 || value === 1);
}

export type RatchetCommand =
  | { command: 'count'; count: number }
  | { command: 'calm'; amount: 1 | 2 }
  | { command: 'hold'; reveal: string; count: number | null }
  | { command: 'correct-hold'; count: number | null };

export type RatchetAction = RatchetCommand & { parent: string };

export function validRatchetAction(value: unknown): value is RatchetAction {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const action = value as RatchetAction;
  if (typeof action.parent !== 'string' || !action.parent || action.parent.length > 48) return false;
  switch (action.command) {
    case 'count': return ratchetCount(action.count);
    case 'calm': return action.amount === 1 || action.amount === 2;
    case 'hold': return typeof action.reveal === 'string' && action.reveal.length === 36 &&
      (action.count === null || ratchetCount(action.count));
    case 'correct-hold': return action.count === null || ratchetCount(action.count);
    default: return false;
  }
}

export function ratchetParent(entries: readonly PlayEvent[]) {
  return [...entries].reverse().find(event => event.moduleData?.module === RATCHET_MODULE &&
    (event.ratchetAction || Object.prototype.hasOwnProperty.call(event.moduleData.changes, 'maniacs')))?.id ?? 'root';
}

export function ratchetFinale(entries: readonly PlayEvent[]) {
  return entries.find(event => event.kind === 'moment' && event.momentType === 'finale');
}

export function resolveRatchetAction(action: RatchetAction, state: ModuleState, entries: readonly PlayEvent[]): ModuleState | null {
  if (!validRatchetAction(action) || action.parent !== ratchetParent(entries)) return null;
  const known = ratchetCount(state.maniacs) ? state.maniacs : undefined;
  switch (action.command) {
    case 'count': return known === action.count ? null : { maniacs: action.count };
    case 'calm':
      return state.calmRemoved || ratchetFinale(entries)?.killerCard === HOLD_HER_DOWN || known === undefined || known < action.amount
        ? null : { maniacs: known - action.amount };
    case 'hold': {
      const finale = ratchetFinale(entries);
      return state.calmRemoved || finale?.id !== action.reveal || finale.killerCard !== HOLD_HER_DOWN
        ? null : { maniacs: action.count, calmRemoved: true };
    }
    case 'correct-hold':
      return state.calmRemoved ? { maniacs: action.count, calmRemoved: null } : null;
  }
}

export function ratchetFacts(state: ModuleState, reviewed?: number | null, entries: readonly PlayEvent[] = []) {
  const count = reviewed === undefined ? state.maniacs : reviewed;
  return [
    ratchetCount(count) ? `Maniacs on board: ${count}.` : 'Current Maniac count unrecorded.',
    state.calmRemoved === true && 'Calm was recorded removed.',
    ...entries.filter(event => event.kind === 'moment' && event.killerCard &&
      [RATCHET_FINALES, RATCHET_POWERS].some(cards => cards.some(card => card.name === event.killerCard)))
      .map(event => `Recorded reveal: ${event.killerCard}.`),
    'A count or reveal alone establishes no attack or casualty.',
  ].filter(Boolean).join(' ');
}

export function ratchetLogBelongsTo(killer: string, events: readonly PlayEvent[]) {
  return events.every(event => killer === RATCHET_LADY ||
    (!!event && !event.ratchetHealth && !event.ratchetReference && event.moduleData?.module !== RATCHET_MODULE));
}
