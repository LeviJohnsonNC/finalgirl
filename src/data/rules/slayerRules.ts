import {
  OPEN_A_RIFT, SLAYER, SLAYER_BLOODLUST, SLAYER_FINALES, SLAYER_MINORS, SLAYER_POWERS,
  SLAYER_RULE_GUIDANCE, SLAYER_SETUP, SLAYER_SOURCE, SLAYER_STARTING_ACTION, SLAYER_TERRORS, SLAYER_VISUAL,
} from '@/lib/play/slayer';
import type { EntityRuleModule, ModulePromptContext } from './moduleRules';

export const slayerRules: EntityRuleModule = {
  entity: SLAYER,
  kind: 'killer',
  filmId: 's3-falconwood-files',
  source: SLAYER_SOURCE,
  credits: { design: 'Mike Martins', art: 'Vincent Dutrait' },
  tags: ['slayer','mirror dimension','our dimension','rift','dimension tracker','special victim','bloodlust',
    ...[...SLAYER_POWERS,...SLAYER_FINALES,...SLAYER_MINORS,...SLAYER_TERRORS].map(card => card.name)],
  seeAlso: ['saving-victims','bloodlust','killer-phase','panic-phase'],
  setup: [{type:'list',items:[
    `Set Slayer to ${SLAYER_SETUP.killerHealth} Health, Horror ${SLAYER_SETUP.finalHorrorLevel}, and Bloodlust ${SLAYER_SETUP.bloodlust}.`,
    'Use the same Location board for both dimensions. Put the Final Girl and Special Victim markers on Our Dimension on the tracker. Slayer starts in Mirror.',
    'Place one gray Victim in your starting space and one in the Exit space closest to Slayer. Add both Open a Rift Action cards to the Action Tableau.',
  ]}],
  rules: [
    {type:'heading',level:3,text:'The Mirror Dimension'},
    {type:'list',items:[
      'Yellow ordinary Victims are in Our Dimension. Gray ordinary Victims are in Mirror. Special Victims use their markers on the Dimension Tracker.',
      'Only Victims in your dimension can follow you. To save a Victim, both of you must be at an Exit in Our Dimension. Search spaces can be used in both dimensions.',
      'Board tokens and location effects apply to both dimensions unless specified. If a token or location effect targets a Victim in a space with Victims in both dimensions, target Our Dimension first unless Mirror Victims are specified.',
    ]},
    {type:'heading',level:3,text:'Killer Action, pulls and targeting'},
    {type:'paragraph',text:SLAYER_STARTING_ACTION},
    {type:'list',items:[
      'The pull symbol normally selects the closest Victim in Our Dimension. If tied, prefer the space with more Victims. Panic the pulled Victim immediately.',
      'For an ordinary Victim, exchange yellow for gray. If all six gray meeples are in use, immediately kill the Mirror Victim farthest from Slayer and reuse that gray meeple. For a Special Victim, move its tracker marker instead.',
      'If nobody is pulled into Mirror, increase Bloodlust by 1.',
      'Slayer normally moves and targets Victims in Mirror. It can target and attack the Final Girl across dimensions. When targeting the closer person, consider only the Final Girl and eligible Mirror Victims.',
      'If a victim-only Killer Action finds no eligible Mirror Victim, resolve a pull in place of the rest of that Killer Action. Continue any remaining effects on the Terror card.',
    ]},
    {type:'heading',level:3,text:'Open a Rift and return'},
    {type:'paragraph',text:OPEN_A_RIFT},
    {type:'list',items:[
      'Ordinary Victims cannot enter Mirror with the Final Girl. During the Action phase, between Action cards, she can return without playing another card. Any Mirror Victims in her space may return with her. Exchange gray for yellow or move the Special Victim marker. Returning a Victim does not yet save them.',
      'Lose 1 Health during Upkeep if you are in Mirror. Interdimensional Interference adds Health loss under its printed conditions.',
      'Attacks or damaging Items need both Slayer and the Final Girl in the same dimension. A damage-dealing Reaction when Slayer attacks her in Our Dimension is an exception.',
      'During the Panic phase, Victims in Our Dimension normally do not panic. Interdimensional Rift Collapse allows Slayer to target and attack there, and removes that Panic restriction.',
    ]},
    {type:'heading',level:3,text:'Bloodlust'},
    {type:'table',modalLayout:'comparison',headers:['Level','Attack / Move','Entry effect'],
      rows:SLAYER_BLOODLUST.map(([attack,move,effect],level)=>[String(level),`${attack} / ${move}`,effect])},
    {type:'paragraph',text:'Each Bloodlust increase beyond the last space discards the next Terror card.'},
    {type:'heading',level:3,text:'Minor Dark Powers'},
    {type:'list',items:SLAYER_MINORS.map(card=>`${card.name} (${card.health} Health) — ${card.effect}`)},
    {type:'heading',level:3,text:'Dark Powers'},
    {type:'list',items:SLAYER_POWERS.map(card=>`${card.name}${card.epic?' (Epic)':''} — ${card.effect}`)},
    {type:'heading',level:3,text:'Finales'},
    {type:'list',items:SLAYER_FINALES.map(card=>`${card.name} — ${card.effect}`)},
    {type:'heading',level:3,text:'Terror cards'},
    {type:'list',items:SLAYER_TERRORS.map(card=>`${card.name}${card.quantity>1?` (×${card.quantity})`:''} — ${card.effect}`)},
  ],
};

export const SLAYER_PROMPT_CONTEXT: ModulePromptContext = {
  narrativeGuidance: 'Slayer and the Final Girl sense one another across two overlapping versions of the selected location. An opening begins on the ordinary side, with Slayer normally in Mirror. Use an unsettling reflection or a small disturbance as a possible visual, while respecting the confirmed cast, state and recorded events.',
  visualGuidance: SLAYER_VISUAL,
  rulesSummary: SLAYER_RULE_GUIDANCE,
};
