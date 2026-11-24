import {
  AFFLICTIONS, RAZORFACE, RAZORFACE_SOURCE, RAZORFACE_GUIDANCE, RAZORFACE_FINALES, RAZORFACE_POWERS, RAZORFACE_TERRORS,
} from '../../../supabase/functions/_shared/play/razorface';
import type { EntityRuleModule, ModulePromptContext } from './moduleRules';

const cards = (list: readonly {name:string; effect:string; quantity?:number}[]) => list.map(
  card => `${card.name}${(card.quantity ?? 1) > 1 ? ` (×${card.quantity})` : ''} — ${card.effect}`,
);
export const razorfaceRules: EntityRuleModule = {
  entity:RAZORFACE, kind:'killer', filmId:'s3-hell-to-pay', source:RAZORFACE_SOURCE,
  credits:{design:'Ryan Jorjorian',art:'Roland Macdonald'},
  tags:['hell to pay','razorface','affliction','purge','final health','kenzie','christie'],
  seeAlso:['bloodlust','final-health','terror-cards'],
  setup:[
    {type:'paragraph',text:'Start with Horror 5, Razorface at 9 Health, and Bloodlust on the bottom space. Shuffle all eight Afflictions and turn three face up.'},
  ],
  rules:[
    {type:'heading',level:3,text:'Afflictions and Final Health'},
    {type:'list',items:[
      'In your Action phase, meeting a card’s requirement lets you resolve its purge effect and remove it from the game. You can purge only once per turn. If you pass on the opportunity, meet the requirement again before purging.',
      'If a requirement becomes impossible, remove that Affliction and draw a replacement. This is a replacement, and purge effects do not apply. You immediately lose if a required draw comes up empty.',
      'Ordinary damage still removes Health. While any Affliction is in play, ignore the damage that would reveal Razorface’s Final Health token. With zero Afflictions, resolve the token normally when damage calls for it.',
      'A drawn Minor Dark Power is skipped and replaced with the next Terror card if you have zero Afflictions. A purge discards both active Minor Dark Powers.',
    ]},
    {type:'table',headers:['Affliction','Purge requirement','Purge effect'],rows:AFFLICTIONS.map(card=>[card.name,card.requirement,card.effect])},
    {type:'heading',level:3,text:'Killer action and Bloodlust'},
    {type:'paragraph',text:'Before the Finale, target whoever is closest (Victim or Final Girl), move, then attack once. Resolve the printed board effects at the table.'},
    {type:'table',headers:['Position','Attack','Movement','Effect'],rows:[
      ['0','1','1','Start'], ['1','1','1',''], ['2','1','1','Raise Horror by 1'], ['3','1','2',''],
      ['4','2','2','Reveal Dark Power'], ['5','2','2',''], ['6','2','3','Raise Horror by 1'],
      ['7','3','3','Draw an Event'], ['8','4','4','Raise Horror by 1'],
    ]},
    {type:'paragraph',text:'Above the final Bloodlust space, Razorface recovers 1 Health before you resolve the printed Terror discard.'},
    {type:'heading',level:3,text:'Dark Powers'},{type:'list',items:cards(RAZORFACE_POWERS)},
    {type:'heading',level:3,text:'Finales'},{type:'list',items:cards(RAZORFACE_FINALES)},
    {type:'heading',level:3,text:'Terror deck and Minor Dark Powers · 16 cards'},{type:'list',items:cards(RAZORFACE_TERRORS)},
  ],
};
export const RAZORFACE_PROMPT_CONTEXT: ModulePromptContext = {
  rulesSummary:RAZORFACE_GUIDANCE,
  visualGuidance:'Use the actual selected location and the approved cast. The Affliction illustrations are atmospheric props. They do not establish what was present or what happened in a scene.',
  narrativeGuidance:'The selected location remains the setting. Treat a deck loss as the failed objective and leave the Final Girl’s fate unconfirmed unless a separate observation establishes it.',
};
