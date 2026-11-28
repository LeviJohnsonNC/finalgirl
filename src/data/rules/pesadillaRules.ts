import {
  PESADILLA, PESADILLA_SOURCE, PESADILLA_BOOKLET, PESADILLA_SETUPS,
  PESADILLA_EVENTS, PESADILLA_TERRORS, PESADILLA_ITEM_RULES,
} from '../../../supabase/functions/_shared/play/pesadillaCatalog';
import type { EntityRuleModule, ModulePromptContext } from './moduleRules';

export const pesadillaRules: EntityRuleModule = {
  entity: PESADILLA,
  kind: 'location',
  filmId: 's4-green-terror',
  source: PESADILLA_SOURCE,
  credits: { design: 'Evan Derrick', art: 'Agnieszka Dabrowiecka' },
  tags: ['soldiers', 'huey', 'upriver', 'friendly fire', 'archeologist', 'archaeologist', 'train',
    ...PESADILLA_SETUPS, ...PESADILLA_EVENTS.map(c => c.name), ...PESADILLA_TERRORS.map(c => c.name)],
  setup: [
    { type: 'link', text: 'Official Pesadilla Verde rulebook', url: PESADILLA_BOOKLET },
    { type: 'list', items: [
      'Place figures from your physical Setup card. The Volk’ar uses the printed Killer start for her Origin.',
      'Put the Huey at the Clearing. Add both Train cards to the Action Tableau.',
      'Set out the Soldiers card, four cubes and eight upgrade tokens. Start with the two starred action tokens unlocked and the other six locked.',
    ] },
    { type: 'heading', level: 3, text: 'Setup cards' },
    { type: 'list', items: [...PESADILLA_SETUPS] },
  ],
  rules: [
    { type: 'heading', level: 3, text: 'Soldiers and Train' },
    { type: 'paragraph', text: 'Ordinary Victims are Soldiers here. They can follow into the Killer’s space. The Archeologist and Rebel Leader cannot take Soldier orders. Sgt. Weathers can. During the Action phase choose a space with Soldiers and an unlocked row without a cube. Place its cube at the left, then resolve the order for all Soldiers in that space. In Upkeep advance each cube right and remove it after its final slot.' },
    { type: 'table', headers: ['Upgrade', 'Starting face', 'Effect'], rows: [
      ['Starting Move', 'Unlocked', 'Move one space. Two cube slots.'],
      ['Extra Move', 'Locked', 'Move one space. Two cube slots.'],
      ['Starting Attack', 'Unlocked', 'Attack eligible Enemies. Three cube slots.'],
      ['Extra Attack', 'Locked', 'Attack eligible Enemies. Two cube slots.'],
      ['Saving Soldiers', 'Locked', 'Rescuing each Soldier costs 2 Time before unlocking and 0 afterward.'],
      ['Attack Range', 'Locked', 'Start at range 0. Once unlocked, range is 0–1.'],
      ['Damage', 'Locked', 'Half the Soldiers ordered, rounded down while locked and up while unlocked.'],
      ['No Friendly Fire', 'Locked', 'After attacking, roll once per Soldier involved. Each 1–2 kills one involved Soldier. When unlocked, skip this check. See Twitchy Soldiers for the 1–3 exception.'],
    ] },
    { type: 'paragraph', text: 'Train costs 2 Time to purchase. Two successes unlock one upgrade and cost 1 Time. One success unlocks one and costs 3 Time. On failure choose to lock one upgrade, or raise Horror, lose 3 Time and end the Action phase.' },
    { type: 'heading', level: 3, text: 'Huey and Exits' },
    { type: 'paragraph', text: 'The Huey makes the Clearing an Exit while it is present. If you share its space, choose how many Victims to save and then take it off the board. It can return through a card effect. The Cave and the unnamed northwest Exit are separate. Cave Collapse changes the Cave’s Exit status.' },
    { type: 'heading', level: 3, text: 'River movement' },
    { type: 'paragraph', text: 'Downriver runs from Waterfall to Upper, Central and Lower River. The Final Girl and Soldiers may traverse multiple downstream river spaces for one movement, resolving every space passed. Enemies normally move only to the next downstream space. Upriver spaces are adjacent even though ordinary movement cannot go that way. Wet Suit and Rivermaster grant different exceptions.' },
    { type: 'heading', level: 3, text: 'Events' },
    { type: 'table', headers: ['Card', 'Reference'], rows: PESADILLA_EVENTS.map(c => [c.name, c.effect]) },
    { type: 'heading', level: 3, text: 'Location Terrors and Rivermaster' },
    { type: 'table', headers: ['Card', 'Reference'], rows: PESADILLA_TERRORS.map(c => [c.name, c.effect]) },
    { type: 'heading', level: 3, text: 'Items' },
    { type: 'table', headers: ['Card', 'Reference'], rows: PESADILLA_ITEM_RULES.map(([name,effect]) => [name,effect]) },
  ],
};

export const PESADILLA_PROMPT_CONTEXT: ModulePromptContext = {
  rulesSummary: 'Humid rainforest around the Clearing, Cave, Ancient Ruins, Rebel Camp, Supply Depot, Cursed Temple and a four-space river. Normal Victims are Soldiers. Use only observed rescues, casualties and hazards.',
  narrativeGuidance: 'A trained patrol, river hazards, changing Exits and the helicopter can shape the scene when recorded. A departure does not identify passengers or establish the Final Girl escaped. Card art and a reveal alone establish no injuries, positions or deaths.',
  visualGuidance: 'Use humid undergrowth, wet stone, humid diffuse light and period-appropriate practical objects. Respect the actual cast and avoid visible board components, labels or unexplained trophies.',
};
