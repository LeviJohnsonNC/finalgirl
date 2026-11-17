import {
  WOLFE, WOLFE_SOURCE, WOLFE_SETUPS, WOLFE_VISUAL, WOLFE_RECIPES, WOLFE_EVENTS, WOLFE_ITEMS,
  WOLFE_TERRORS, WOLFE_AMPED, WOLFE_SIDE_EFFECTS,
} from '../../../supabase/functions/_shared/play/wolfeCatalog';
import type { EntityRuleModule, ModulePromptContext } from './moduleRules';
import type {RuleBlock} from './types';

const table=(heading:string,cards:readonly {name:string;quantity:number;effect:string}[]):RuleBlock=>({
  type:'table',headers:[heading,'Copies','Effect'],rows:cards.map(card=>[card.name,String(card.quantity),card.effect]),
});

export const wolfeRules:EntityRuleModule={
  entity:WOLFE, kind:'location', filmId:'s2-madness-in-dark', source:WOLFE_SOURCE,
  credits:{design:'A.J. Porfirio & Evan Derrick',art:'Vladyslava Ladkova, Tyler Johnson & Roland MacDonald'},
  seeAlso:['Ratchet Lady'],
  tags:['Pills','Amped','Stunned','Common Room','Doctor’s Office','Operating Theater','Side Effects',
    ...WOLFE_SETUPS,...WOLFE_EVENTS.map(card=>card.name),...WOLFE_ITEMS.map(card=>card.name),...WOLFE_TERRORS.map(card=>card.name),
    ...WOLFE_AMPED.map(card=>card.name),...WOLFE_SIDE_EFFECTS.map(card=>card.name)],
  setup:[
    {type:'heading',level:3,text:'Setups'},
    {type:'wolfe-setups'},
    {type:'list',items:[
      'Put Stun tokens next to the play area. Shuffle ten Pill tokens face down: three yellow, three blue, three pink and one Wild.',
      'Follow the chosen diagram for the Final Girl, Killer, Victims and four face-down Pill positions.',
      'Draw one Pill face up under the Pill Effects card. Leave the five remaining Pills in the pool.',
      'Shuffle the Amped and Side Effects decks separately.',
      'The three orange search spaces are the Doctor’s Office, Utility Closet and Medical Storage. Green spaces mark the three exits. Each side of a connection shows the Panic result from that space.',
    ]},
  ],
  rules:[
    {type:'heading',level:3,text:'Pills'},
    {type:'list',items:[
      'Spend 1 Time to pick up a Pill at the end of movement in its space. Place it face up with your held Pills.',
      'During the Action phase, discard the tokens in each chosen batch. Wild can stand in for any color. Apply the benefit before drawing any Side Effects one at a time. You may resolve separate batches in the same Action phase.',
      'If the face-down pool runs out, shuffle discarded Pill tokens to make a new pool.',
      'Powerful Meds adds one Side Effects card per batch, including a single Pill. The Physical Side Effects and Amped decks determine what was drawn.',
    ]},
    {type:'table',headers:['Pills','Benefit','Side Effects'],rows:WOLFE_RECIPES.map(card=>[
      card.colors.map(color=>color[0].toUpperCase()+color.slice(1)).join(' + '),card.benefit,String(card.draws),
    ])},
    {type:'heading',level:3,text:'Stunned'},
    {type:'paragraph',text:'Place a Stun marker under the affected Enemy. During the next Killer phase they ignore movement icons but still resolve attacks. Remove remaining Stun markers during Upkeep.'},
    {type:'paragraph',text:'Hannibal, Dr. Death and Dr. Sunshine are Special Victims. Follow their cards for exceptions. The standard follow, save and casualty rules otherwise apply.'},
    table('Amped card',WOLFE_AMPED),table('Side Effects card',WOLFE_SIDE_EFFECTS),
    table('Event',WOLFE_EVENTS),table('Terror',WOLFE_TERRORS),table('Item',WOLFE_ITEMS),
  ],
};
export const WOLFE_PROMPT_CONTEXT:ModulePromptContext={
  visualGuidance:WOLFE_VISUAL,
  rulesSummary:'Four face-down Pill tokens start on the board and one random token is held. Consuming a batch can produce a benefit and a possible side effect. The location is independent of the chosen killer.',
  narrativeGuidance:'Use confirmed observations for any Pills, Amped results, Stun, or Gurney action. Never infer a pill color, another Final Girl’s presence, a casualty, or a specific action from a card, a prop, or event availability.',
};
