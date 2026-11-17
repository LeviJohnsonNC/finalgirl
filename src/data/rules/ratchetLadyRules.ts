import {
  RATCHET_LADY, RATCHET_SOURCE, RATCHET_BLOODLUST, RATCHET_POWERS,
  RATCHET_FINALES, RATCHET_MINORS, RATCHET_TERRORS, RATCHET_VISUAL,
} from '../../../supabase/functions/_shared/play/ratchetLady';
import type { EntityRuleModule, ModulePromptContext } from './moduleRules';

export const ratchetLadyRules: EntityRuleModule = {
  entity: RATCHET_LADY,
  kind: 'killer',
  filmId: 's2-madness-in-dark',
  source: RATCHET_SOURCE,
  credits: { design: 'A.J. Porfirio & Evan Derrick', art: 'Vladyslava Ladkova' },
  seeAlso: ['Wolfe Asylum'],
  tags: ['Maniacs', 'Calm', 'Bloodlust', ...RATCHET_TERRORS.map(card => card.name),
    ...RATCHET_POWERS.map(card => card.name), ...RATCHET_FINALES.map(card => card.name)],
  setup: [{ type: 'list', items: [
    'Start at 6 Health including the black Final Health token, Horror 5 and Bloodlust 0. Ratchet Lady can recover above her starting Health.',
    'Set aside six Maniac meeples. Place two of them in Ratchet Lady’s starting space.',
    'Add both Calm cards to the available Action cards.',
  ] }],
  rules: [
    { type: 'heading', level: 3, text: 'Maniacs' },
    { type: 'list', items: [
      'A Maniac is a Minion with 1 Health, 1 Attack and 1 Movement. Maniacs do not follow the Final Girl and cannot be saved.',
      'Replace an ordinary Victim with a Maniac meeple when converted. Special Victims are exempt. A converted Victim is not a casualty by default.',
      'When a Maniac is defeated, return its meeple to the pool. Do not record a Victim death or increase Bloodlust for the defeat.',
      'When leaving your space, lose 1 Health for each Maniac there beyond the first. Three Maniacs cost 2 Health to leave.',
      'Six Maniacs can be on the board. If a spawn would exceed the supply, ignore it unless the card specifies another consequence.',
    ] },
    { type: 'heading', level: 3, text: 'Calm' },
    { type: 'paragraph', text: 'Calm targets Maniacs in your space or an adjacent space. A returned Maniac becomes an ordinary Victim who can follow, be saved or be killed. Return the Maniac meeple to its pool.' },
    { type: 'table', headers: ['Roll', 'Calm outcome'], rows: [
      ['2+ successes', 'Return up to two Maniacs to ordinary Victims.'],
      ['1 success', 'Return one Maniac to an ordinary Victim and increase Bloodlust.'],
      ['0 successes', 'Return one Maniac to an ordinary Victim, increase Bloodlust and end the Action Phase, or increase Horror by 1 and lose 2 Time.'],
    ] },
    { type: 'heading', level: 3, text: 'Killer actions and Bloodlust' },
    { type: 'paragraph', text: 'Before the Finale, Maniacs target the Final Girl and move. Ratchet Lady targets the closest Final Girl or Victim and attacks. The revealed Finale supplies their replacement actions.' },
    { type: 'table', headers: ['Bloodlust', 'Attack', 'Movement', 'Entry effect'],
      rows: RATCHET_BLOODLUST.map(row => [String(row.level), String(row.attack), String(row.move), row.effect || '—']) },
    { type: 'paragraph', text: 'At the top of the track, each further Bloodlust increase heals the Ratchet Lady by 1 and discards the next Terror card. Apply the printed order on the physical board.' },
    { type: 'table', headers: ['Dark Power', 'Effect'],
      rows: RATCHET_POWERS.map(card => ['epic' in card ? card.name + ' (Epic)' : card.name, card.effect]) },
    { type: 'table', headers: ['Finale', 'Effect'], rows: RATCHET_FINALES.map(card => [card.name, card.effect]) },
    { type: 'table', headers: ['Minor Dark Power', 'Health', 'Effect'],
      rows: RATCHET_MINORS.map(card => [card.name, String(card.health), card.effect]) },
    { type: 'table', headers: ['Terror deck', 'Copies', 'Effect'], rows: RATCHET_TERRORS.map(card => [card.name, String(card.quantity), card.effect]) },
  ],
};

export const RATCHET_PROMPT_CONTEXT: ModulePromptContext = {
  visualGuidance: RATCHET_VISUAL,
  rulesSummary: 'Ratchet Lady can heal above 6 Health. Maniacs are Minions; a conversion or a Maniac’s defeat does not by itself establish a Victim casualty.',
  narrativeGuidance: 'Preserve the actual location and explicitly observed events. A count, named reveal or card image does not establish an individual attack, conversion, rescue or casualty.',
};
