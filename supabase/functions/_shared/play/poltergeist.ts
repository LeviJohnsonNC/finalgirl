/** Standard-mode owner photos polter1–polter5.jpeg, 2026-10-27. */
import type { ModuleState, ModuleValue } from './modules.ts';
export const POLTERGEIST_SOURCE = 'Owner photos polter1–polter5.jpeg (2026-10-27), standard mode';
export const POLTERGEIST_VISUAL = 'A female apparition with long dark hair, pale spectral features, luminous eyes and a long pale flowing dress. Preserve the approved portrait and selected Location; the spirit is not a physical murderer or a different monster. Carolyn is a blonde child with straight hair and bangs in a pale dress. Mr. Floppy is her pink stuffed rabbit with long floppy ears and dark button eyes, not a teddy bear. These character references do not establish possession, injuries or an encounter.';
export const POLTERGEIST_POWERS = [
    { id: 'stiff-wind', name: 'Stiff Wind', effect: 'All your moves of 2 or more spaces are reduced by 1 space.' },
    { id: 'eternal-despair', name: 'Eternal Despair', effect: 'Whenever you resolve a Horror roll, lose 1 Time for every 1 showing on a die after rerolls.' },
    { id: 'invisible-barrier', name: 'Invisible Barrier', effect: 'You may not enter an Exit with Carolyn unless you have full Health.' },
    { id: 'forgetting-something', name: 'Forgetting Something?', epic: true, effect: 'Epic Dark Power. You may not win unless you reach an Exit with both Carolyn and the Mr. Floppy Item card.' },
] as const;
export const POLTERGEIST_FINALES = [
    { id: 'relentless-assault', name: 'Relentless Assault', effect: 'Killer Action: place the Poltergeist in your space, target the Final Girl, then attack twice.' },
    { id: 'nothing-is-easy', name: 'Nothing Is Easy', effect: 'Killer Action: place the Poltergeist in your space, target the Final Girl, then attack. All 0-Time Action cards now cost 1 Time.' },
    { id: 'she-will-soon-be-lost', name: 'She Will Soon Be Lost', effect: 'When revealed, add 3 Terror cards to the Terror deck. Killer Action: draw a Terror card; if unable, you immediately lose the game.' },
] as const;
export const POLTERGEIST_MINORS = [
    { id: 'psychic-confusion', name: 'Psychic Confusion', effect: 'If Carolyn is with you, discard and draw the next Terror card. Otherwise roll 1 fewer die when resolving a Search card. Before playing a Search card, you may spend 3 Time to ignore this penalty. Discard this card when you find Carolyn.' },
    { id: 'unseen-forces', name: 'Unseen Forces', effect: 'If Carolyn is with you, discard and draw the next Terror card. Otherwise your first space moved each Action phase is panicked. Discard this card when you find Carolyn.' },
] as const;
export const POLTERGEIST_ITEMS = [
    { name: 'Carolyn', effect: 'When Carolyn joins you, remove all Minor Dark Power cards from the game. Escape with her to win. Carolyn cannot be killed, discarded or put in your backpack; she can be shuffled back into an Item deck.' },
    { name: 'Mr. Floppy', effect: 'After the Dark Power is revealed, you may remove this Item from the game to ignore the effects of "Carolyn? Where are you?!?!?". If discarded for any reason, shuffle it into the nearest Item deck. It cannot be discarded due to a game effect before the Dark Power is revealed or while the Forgetting Something? Epic Dark Power is in play.' },
] as const;
const targetAttack = 'Target the closest Final Girl or Victim and attack.';
export const POLTERGEIST_TERRORS = [
    ...POLTERGEIST_MINORS.map(p => ({ name: p.name, quantity: 1, effect: `Healthless Minor Dark Power. ${p.effect}` })),
    { name: 'Carolyn? Where are you?!?!?', quantity: 2, effect: 'If Carolyn is not with you, discard and draw the next Terror card. Otherwise shuffle Carolyn into the nearest Search-space Item deck. Do not reveal its top card. Mr. Floppy can cancel this card only under its printed conditions.' },
    { name: 'Corporeal Form', quantity: 1, effect: 'A Behemoth with 2 Health appears. You may play damage-inflicting Action cards. If it survives, take damage equal to the Killer Attack Value plus 1; you may defend. If you take damage, discard an Item of your choice, respecting Carolyn and Mr. Floppy restrictions. The Behemoth disappears.' },
    { name: 'Did that clown... just move?', quantity: 1, effect: 'A Clown Doll with 1 Health appears. You may play damage-inflicting Action cards. If it survives, take damage equal to the Killer Attack Value; you may defend. If you take damage, increase Bloodlust by 1. The Clown Doll disappears.' },
    { name: 'Everything was flying around!', quantity: 2, effect: `Increase Horror by 1. Place the Poltergeist with the closest Victim, or in your space if no Victims remain. ${targetAttack}` },
    { name: 'I have to kill you! It told me to kill you!', quantity: 1, effect: 'If no Victims remain on the board, replace this Terror. Otherwise all Victims in adjacent spaces move to your space. If any Victims are in your space, you may play one damage-inflicting Action card: kill 1 Victim for each damage without increasing Bloodlust. Then take 1 damage for each Victim in your space; those Victims then panic.' },
    { name: 'Nothing Is As It Seems', quantity: 1, effect: 'If Carolyn is with you, replace this Terror. Otherwise shuffle each Item deck and reveal each top card. If Carolyn or Mr. Floppy is revealed, increase Bloodlust by 2.' },
    { name: 'The ground is shaking!', quantity: 2, effect: `Place the Poltergeist in your space. ${targetAttack} If you take any damage, all your moves during the next Action phase are panicked.` },
    { name: 'The shadows are closing in', quantity: 2, effect: 'If no Victims remain on the board, replace this Terror. Otherwise increase Horror by 2, target a Victim, move and attack.' },
    { name: 'Unstoppable Evil', quantity: 1, effect: 'Roll a die. Choose to take that much damage (you may defend) or kill that many Victims of your choice. If insufficient Victims remain, take the damage.' },
    { name: 'Where the hell did this storm come from?', quantity: 1, effect: 'Lightning strikes your space and every adjacent space. Kill one Victim in each of those spaces. You lose Health equal to the Poltergeist Attack Value.' },
].map(c => ({ ...c, killer: 'Poltergeist', source: POLTERGEIST_SOURCE }));
/** Nine printed positions; top repeat instruction is not another position. */
export const POLTERGEIST_BLOODLUST = [
    { attack: 1, move: 2 }, { attack: 1, move: 2, horror: 1 }, { attack: 1, move: 2, darkPower: true },
    { attack: 1, move: 2 }, { attack: 2, move: 2, horror: 2 }, { attack: 2, move: 3 },
    { attack: 2, move: 3 }, { attack: 2, move: 4, horror: 1 }, { attack: 3, move: 4 },
] as const;
export const POLTERGEIST_OVERFLOW = 'For Bloodlust increases beyond the top position, resolve the printed repeat instruction: take 1 damage, then discard the next Terror card.';
export const CAROLYN_STATES = ['hidden', 'with-you', 'in-deck', 'rescued'] as const;
export const FLOPPY_STATES = ['hidden', 'carried', 'in-deck', 'removed'] as const;
export const MINOR_STATES = ['inactive', 'active', 'removed'] as const;
const commands = ['join', 'return', 'rescue', 'find-floppy', 'return-floppy', 'protect', 'activate-minor', 'end-minor', 'correct'] as const;
export interface PoltergeistAction {
    parent: string;
    command: typeof commands[number];
    key?: string;
    value?: ModuleValue;
}
type Entry = {
    id?: string;
    kind: string;
    momentType?: string;
    killerCard?: string;
    moduleData?: {
        module: string;
        changes: Record<string, ModuleValue>;
    };
};
export function poltergeistPower(entries: readonly Entry[]) {
    const reveal = entries.find(e => e.kind === 'moment' && e.momentType === 'dark-power');
    return { revealed: Boolean(reveal), name: reveal?.killerCard, known: POLTERGEIST_POWERS.some(p => p.name === reveal?.killerCard), epic: reveal?.killerCard === 'Forgetting Something?' };
}
export function validPoltergeistField(key: string, value: unknown) {
    if (value === null)
        return ['carolyn', 'floppy', ...POLTERGEIST_MINORS.map(p => `minor.${p.id}`)].includes(key);
    if (key === 'initialized' || key === 'minorsRemoved')
        return typeof value === 'boolean';
    if (key === 'carolyn')
        return CAROLYN_STATES.includes(value as typeof CAROLYN_STATES[number]);
    if (key === 'floppy')
        return FLOPPY_STATES.includes(value as typeof FLOPPY_STATES[number]);
    if (POLTERGEIST_MINORS.some(p => key === `minor.${p.id}`))
        return MINOR_STATES.includes(value as typeof MINOR_STATES[number]);
    return false;
}
export function validPoltergeistAction(value: unknown): value is PoltergeistAction {
    if (!value || typeof value !== 'object' || Array.isArray(value))
        return false;
    const a = value as PoltergeistAction;
    return typeof a.parent === 'string' && /^(root|[0-9a-f-]{36})$/.test(a.parent) && commands.includes(a.command) && Object.keys(a).every(k => ['parent', 'command', 'key', 'value'].includes(k)) &&
        (a.command === 'correct' ? typeof a.key === 'string' && validPoltergeistField(a.key, a.value) && !['initialized', 'minorsRemoved'].includes(a.key) :
            ['activate-minor', 'end-minor'].includes(a.command) ? POLTERGEIST_MINORS.some(p => p.id === a.key) && a.value === undefined : a.key === undefined && a.value === undefined);
}
export function poltergeistParent(entries: readonly Entry[]) { return [...entries].reverse().find(e => e.kind === 'module' && e.moduleData?.module === 'poltergeist')?.id ?? 'root'; }
/** Resolve only explicit commands against the latest durable state. No movement/damage engine. */
export function resolvePoltergeistAction(action: PoltergeistAction, state: ModuleState, entries: readonly Entry[]): Record<string, ModuleValue> | null {
    if (!validPoltergeistAction(action) || action.parent !== poltergeistParent(entries))
        return null;
    const power = poltergeistPower(entries);
    let changes: Record<string, ModuleValue>;
    switch (action.command) {
        case 'join':
            if (state.carolyn === 'with-you' || state.carolyn === 'rescued')
                return null;
            changes = { carolyn: 'with-you', minorsRemoved: true, ...Object.fromEntries(POLTERGEIST_MINORS.map(p => [`minor.${p.id}`, 'removed'])) };
            break;
        case 'return':
            if (state.carolyn !== 'with-you')
                return null;
            changes = { carolyn: 'in-deck' };
            break;
        case 'rescue':
            if (state.carolyn !== 'with-you' || (power.epic && state.floppy !== 'carried'))
                return null;
            changes = { carolyn: 'rescued' };
            break;
        case 'find-floppy':
            if (['carried', 'removed'].includes(String(state.floppy)))
                return null;
            changes = { floppy: 'carried' };
            break;
        case 'return-floppy':
            if (state.floppy !== 'carried' || !power.known || power.epic)
                return null;
            changes = { floppy: 'in-deck' };
            break;
        case 'protect':
            if (state.carolyn !== 'with-you' || state.floppy !== 'carried' || !power.known || power.epic)
                return null;
            changes = { floppy: 'removed' };
            break;
        case 'activate-minor':
            if (state.minorsRemoved === true || state.carolyn === 'with-you' || state.carolyn === 'rescued' || state[`minor.${action.key}`] === 'active')
                return null;
            changes = { [`minor.${action.key}`]: 'active' };
            break;
        case 'end-minor':
            if (state[`minor.${action.key}`] !== 'active')
                return null;
            changes = { [`minor.${action.key}`]: 'inactive' };
            break;
        case 'correct':
            changes = { [action.key!]: action.value! };
            break;
    }
    return Object.entries(changes).every(([k, v]) => v === null ? state[k] === undefined : state[k] === v) ? null : changes;
}
export function poltergeistFacts(state: ModuleState, power?: ReturnType<typeof poltergeistPower>) {
    const carolyn = state.carolyn === undefined ? 'unrecorded' : state.carolyn;
    const floppy = state.floppy === undefined ? 'unrecorded' : state.floppy;
    return [`Carolyn: ${carolyn}; Mr. Floppy (pink rabbit): ${floppy}.`,
        (power?.epic ?? state.epicRequired === true) ? 'Epic requires both at escape.' : (power?.known ?? state.powerKnown === true) ? 'Carolyn must escape; Floppy is not required.' : 'Power name/extra escape requirement unknown.',
        ...POLTERGEIST_MINORS.flatMap(p => state[`minor.${p.id}`] === undefined ? [] : [`${p.name}: ${state[`minor.${p.id}`]}.`])].join(' ');
}
/** Server-side structural contract: outcomes cannot omit their linked writes. */
export function validPoltergeistObservation(action: PoltergeistAction | undefined, changes: Record<string, ModuleValue>): boolean {
    if (!action)
        return changes.initialized === true && changes.carolyn === 'hidden' && changes.floppy === 'hidden' && changes.minorsRemoved === false && POLTERGEIST_MINORS.every(p => changes[`minor.${p.id}`] === 'inactive') && Object.keys(changes).length === 6;
    if (!validPoltergeistAction(action))
        return false;
    const expected = action.command === 'join' ? { carolyn: 'with-you', minorsRemoved: true, ...Object.fromEntries(POLTERGEIST_MINORS.map(p => [`minor.${p.id}`, 'removed'])) } :
        action.command === 'return' ? { carolyn: 'in-deck' } : action.command === 'rescue' ? { carolyn: 'rescued' } :
            action.command === 'find-floppy' ? { floppy: 'carried' } : action.command === 'return-floppy' ? { floppy: 'in-deck' } : action.command === 'protect' ? { floppy: 'removed' } :
                action.command === 'activate-minor' ? { [`minor.${action.key}`]: 'active' } : action.command === 'end-minor' ? { [`minor.${action.key}`]: 'inactive' } : { [action.key!]: action.value };
    return Object.keys(changes).length === Object.keys(expected).length && Object.entries(expected).every(([k, v]) => changes[k] === v);
}
