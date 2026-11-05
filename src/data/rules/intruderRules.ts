import {
  INTRUDERS, INTRUDER_SOURCE, INTRUDER_HEALTH, INTRUDER_HORROR,
  INTRUDER_BLOODLUST, INTRUDER_OVERFLOW, INTRUDER_STARTING_ACTION,
  INTRUDER_POWERS, INTRUDER_MINORS, INTRUDER_FINALES, INTRUDER_TERRORS, INTRUDER_VISUAL,
} from '@/lib/play/intruders';
import type {EntityRuleModule,ModulePromptContext} from './moduleRules';

function cards(list:readonly {name:string;effect:string;quantity?:number;health?:number;epic?:boolean}[]) {
  return list.map(card=>`${card.name}${card.epic?' (Epic)':card.health?` (${card.health} Health)`:card.quantity&&card.quantity>1?` (×${card.quantity})`:''} — ${card.effect}`);
}
export const intruderRules:EntityRuleModule={
  entity:INTRUDERS,kind:'killer',filmId:'s2-knock-at-door',source:INTRUDER_SOURCE,
  credits:{design:'Mike Martins',art:'Heather Vaughan'},
  tags:['intruders','trish','baghead','zeke','active killer','final health','killer'],
  setup:[{type:'list',items:[
    'Put all three Killers at the starting space on the selected location’s Setup card. In top-to-bottom board order they are Trish (red), Baghead (gray), and Zeke (black).',
    `Start each at ${INTRUDER_HEALTH} total Health, including a hidden black Final Health token. Start at Horror ${INTRUDER_HORROR} and Bloodlust 0 with Trish active.`,
  ]}],
  rules:[
    {type:'heading',level:3,text:'Active Killer'},
    {type:'paragraph',text:'Use the Active Killer for ordinary move, attack, and Killer placement instructions. An attack on any Intruder makes that Intruder active even if it misses. Damage from an Item also makes its target active. Shift up or down in printed board order, wrapping and skipping downed or dead Intruders. If the Active Killer goes down, hand off to the topmost eligible Intruder.'},
    {type:'paragraph',text:'An All Killers instruction resolves from top to bottom and does not move the marker by itself. Before the Finale: '+INTRUDER_STARTING_ACTION+' If a Victim was killed this turn, any Intruder in a Victim’s space can cause that Victim to Panic in the Panic phase.'},
    {type:'heading',level:3,text:'Final Health'},
    {type:'paragraph',text:'If an Intruder with a black Final Health token goes down while another Intruder is still on the board, lay the figure down, hand off the marker if needed, and complete the current phase. Then reveal the black token. Blank means confirmed death. A token with Health brings that Intruder back at the printed amount, including the replacement white token. The last Intruder follows core timing. A depleted white token has no hidden result. Any number of Intruders on their last token gives only one additional Horror die from the killer side.'},
    {type:'example',title:'Trish, Baghead, then Zeke',text:'Trish goes down during the Killer phase. Baghead takes the marker and resolves the first action of They’re Everywhere! The next UP instruction skips downed Trish and wraps to Zeke. The next UP moves back to Baghead. Check Trish’s black token after finishing the phase.'},
    {type:'heading',level:3,text:'Bloodlust'},
    {type:'list',items:INTRUDER_BLOODLUST.map(([attack,move,effect],level)=>`${level} — Attack ${attack}, Move ${move}${effect?' · '+effect:''}`)},
    {type:'paragraph',text:INTRUDER_OVERFLOW},
    {type:'heading',level:3,text:'Minor Dark Powers'},
    {type:'paragraph',text:'These effects are shared by all Intruders. Remove Health from any applicable Minor Dark Powers before applying damage to any Intruder, regardless of which is active or where they stand.'},
    {type:'list',items:cards(INTRUDER_MINORS)},
    {type:'heading',level:3,text:'Dark Powers'},
    {type:'list',items:cards(INTRUDER_POWERS)},
    {type:'heading',level:3,text:'Finales'},
    {type:'list',items:cards(INTRUDER_FINALES)},
    {type:'heading',level:3,text:'Terror cards'},
    {type:'list',items:cards(INTRUDER_TERRORS)},
  ],
};
export const INTRUDER_PROMPT_CONTEXT:ModulePromptContext={
  narrativeGuidance:'Three coordinated masked killers who believe they are freeing their victims from worldly corruption. Follow the selected location, recorded attacker and observed fates. The Active marker identifies board control, not the killer who caused a particular death. A downed figure has unresolved Final Health. A reveal alone does not establish its effects or any attack, injury or death.',
  visualGuidance:INTRUDER_VISUAL,
  rulesSummary:'Trish, Baghead and Zeke have independent Health and Final Health tokens. The single marker hands off; Release the Beast makes all living Intruders active. Shared Minor Powers protect all three. Retain explicit results and leave unobserved fates open.',
};
