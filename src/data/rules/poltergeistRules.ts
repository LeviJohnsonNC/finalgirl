import { POLTERGEIST_SOURCE, POLTERGEIST_VISUAL, POLTERGEIST_POWERS, POLTERGEIST_FINALES, POLTERGEIST_MINORS, POLTERGEIST_ITEMS, POLTERGEIST_TERRORS, POLTERGEIST_BLOODLUST, POLTERGEIST_OVERFLOW } from '../../../supabase/functions/_shared/play/poltergeist';
import type { EntityRuleModule, ModulePromptContext } from './moduleRules';
const cards = (list: readonly {
    name: string;
    effect: string;
    quantity?: number;
}[]) => [...list].sort((a, b) => a.name.localeCompare(b.name)).map(c => `${c.name}${c.quantity && c.quantity > 1 ? ` (×${c.quantity})` : ''}: ${c.effect}`);
export const poltergeistRules: EntityRuleModule = {
    entity: 'Poltergeist', kind: 'killer', filmId: 's1-creech-manor', source: POLTERGEIST_SOURCE,
    credits: { design: 'A.J. Porfirio', art: 'Tyler Johnson' }, tags: ['poltergeist', 'carolyn', 'mr floppy', 'rescue', 'healthless', 'psychic confusion', 'unseen forces'], seeAlso: ['bloodlust', 'horror-rolls'],
    setup: [
        { type: 'paragraph', text: 'Standard mode: starting Horror 3, Bloodlust 0. The Poltergeist has no Health. Follow the normal Dark Power and Finale setup; Forgetting Something? is the supplied optional Epic Dark Power.' },
        { type: 'heading', level: 3, text: 'Killer-owned Item setup' },
        { type: 'list', items: ["Shuffle 10 of the selected Location’s Item cards instead of 12; return the unused cards to its box.", 'Set aside one ordinary Item for each Item deck needed.', 'Shuffle the remaining ordinary Items together with Carolyn and Mr. Floppy.', 'Deal them facedown in equal piles into the Item slots.', 'Put one set-aside ordinary Item faceup on each pile. Carolyn and Mr. Floppy must both be included and neither may begin faceup.'] },
        { type: 'paragraph', text: 'This setup belongs to the Poltergeist and also applies when she is paired with a different Location. Creech Manor location rules are separate.' },
    ],
    rules: [
        { type: 'heading', level: 3, text: 'A rescue, not a fight' },
        { type: 'paragraph', text: 'The Poltergeist cannot be attacked, damaged or killed; ignore effects that would damage her. Damage-inflicting Action cards can still be useful in certain Terror encounters. To win, find Carolyn and save her by reaching an Exit while she is with you. With Forgetting Something? revealed, you must reach the Exit with both Carolyn and Mr. Floppy. With Invisible Barrier active, you cannot enter an Exit with Carolyn unless you have full Health. Finding her alone does not win.' },
        { type: 'heading', level: 3, text: 'Carolyn and Mr. Floppy' },
        { type: 'list', items: cards(POLTERGEIST_ITEMS) },
        { type: 'paragraph', text: 'Carolyn can never be discarded or removed from the game by an effect; ignore such an instruction. She may be shuffled back into an Item deck. Mr. Floppy’s removal to protect Carolyn cancels the named Terror, not a Dark Power. His game-effect discard restriction applies before the Dark Power is revealed and while the Epic Power is in play.' },
        { type: 'heading', level: 3, text: 'Minor Dark Powers' },
        { type: 'list', items: cards(POLTERGEIST_MINORS) },
        { type: 'paragraph', text: 'These two Minor Powers have no Health markers. Their text governs their removal. When Carolyn joins you, remove all Minor Dark Power cards from the game. Losing Carolyn later does not bring the removed cards back.' },
        { type: 'heading', level: 3, text: 'Dark Powers' }, { type: 'list', items: cards(POLTERGEIST_POWERS) },
        { type: 'heading', level: 3, text: 'Finales' }, { type: 'list', items: cards(POLTERGEIST_FINALES) },
        { type: 'heading', level: 3, text: 'Terror cards · 16 physical cards' }, { type: 'list', items: cards(POLTERGEIST_TERRORS) },
        { type: 'heading', level: 3, text: 'Bloodlust board' },
        { type: 'list', items: POLTERGEIST_BLOODLUST.map((r, i) => `Position ${i}: Attack ${r.attack}, Movement ${r.move}${'horror' in r ? `; increase Horror by ${r.horror}` : ''}${'darkPower' in r ? '; reveal Dark Power' : ''}.`) },
        { type: 'paragraph', text: POLTERGEIST_OVERFLOW },
        { type: 'heading', level: 3, text: 'What the companion records' },
        { type: 'paragraph', text: 'Actions record the physical state you report. Carolyn joining and the required Minor removal save together; a correction does not repeat that outcome. Protect Carolyn records Mr. Floppy’s removal and does not shuffle Carolyn back. Resolve Time, movement, damage, Item decks, card draws and escape conditions using the physical game. A reveal does not prove an immediate effect occurred. Unknown state is not proof of absence. Carolyn’s rescue is separate from ordinary Victim counts.' },
    ],
};
export const POLTERGEIST_PROMPT_CONTEXT: ModulePromptContext = {
    rulesSummary: 'Poltergeist is healthless and cannot be attacked, damaged or killed. Starting Horror 3. Win by escaping with Carolyn, plus her pink stuffed rabbit Mr. Floppy if Forgetting Something? is revealed. Finding is not rescue. Invisible Barrier requires full Final Girl Health to enter an Exit with Carolyn. Finding Carolyn removes the healthless Minor Powers. Mr. Floppy can cancel the Carolyn Terror under his printed conditions, not a Dark Power. Respect only recorded outcomes and the selected Location.',
    narrativeGuidance: 'The Final Girl is trying to rescue Carolyn from a malevolent spirit. Combat cannot destroy or drive off the Poltergeist. Carolyn cannot be killed or treated as an ordinary Victim. Mr. Floppy is a pink stuffed rabbit. Do not presume either is found, carried or rescued, or turn an unknown Power into a known normal one. Apparitions, moving objects and private dread can express the threat; an illustration or revealed card alone establishes no casualty. Preserve the selected Final Girl’s identity and the independently selected Location.',
    visualGuidance: POLTERGEIST_VISUAL,
};
