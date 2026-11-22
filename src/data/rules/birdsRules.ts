import {
  BIRDS, BIRDS_SOURCE, BIRDS_SETUP, BIRDS_GUIDANCE, BIRDS_SPAWN_SPACES,
  BIRDS_POWERS, BIRDS_FINALES, BIRDS_TERRORS, BIRD_WALL,
} from '../../../supabase/functions/_shared/play/birds';
import type { EntityRuleModule, ModulePromptContext } from './moduleRules';

const cards = (list: readonly {name:string;effect:string;quantity?:number}[]) => list.map(
  card=>`${card.name}${card.quantity && card.quantity > 1 ? ` (×${card.quantity})` : ''} — ${card.effect}`,
);
export const birdsRules: EntityRuleModule = {
  entity:BIRDS, kind:'killer', filmId:'s1-terror-from-above', source:BIRDS_SOURCE,
  credits:{design:'A.J. Porfirio',art:'Vladyslava Ladkova'},
  tags:['terror from above','flock','birds','melanie','special victims','bird wall','spawn','fowl aggression'],
  seeAlso:['special-victims','minions','bloodlust'],
  setup:[
    {type:'paragraph',text:BIRDS_SETUP},
    {type:'paragraph',text:'Use the Core Box and your chosen Feature Film Location. Keep the Spawn Birds and Bloodlust cards beside the Location. Choose Easy, Normal or Hard before play for one, two or three Special Victims, respectively.'},
  ],
  rules:[
    {type:'heading',level:3,text:'Rescue and game end'},
    {type:'list',items:[
      'The Special Victims emerge when the Final Girl unlocks her Ultimate or the board has no normal Victims left. Place them in the farthest Search spaces from the Final Girl, one per space.',
      'Vignette Special Victims can never be attacked or killed. For other purposes they follow the normal Victim rules. Save every required Special Victim to win.',
      'The game ends in an immediate loss if each board space contains three Birds, or if the Final Girl dies.',
    ]},
    {type:'heading',level:3,text:'Spawn Birds'},
    {type:'paragraph',text:'Resolve the Minion Action first in the Killer phase. At least one spawn occurs each round. For either the move or spawn icon, roll two dice and assign one to quantity and the other to placement. Card-specific instructions can change this. Each space holds up to three Birds. Overflow goes into adjacent spaces of your choice, spreading farther as necessary.'},
    {type:'table',headers:['Placement die','Destination'],rows:BIRDS_SPAWN_SPACES.map((space,index)=>[String(index+1),space])},
    {type:'heading',level:3,text:'Bird attacks and damage'},
    {type:'list',items:[
      'When resolving the normal attack icon, attack in the Final Girl’s space if any Birds are present and in each space with three Birds. Some cards specify different conditions.',
      'Each eligible space attacks one target for damage equal to its Bird count. Normal Victims take priority over the Final Girl in the same space. Reactions can prevent damage to a target in her space. To save a Victim from that attack, prevent all damage.',
      'Birds are stationary Minions with one Health each. Move them only when an effect explicitly moves them. When attacking Birds in a space, remove one per damage and lose any excess damage.',
    ]},
    {type:'heading',level:3,text:'Using another Location'},
    {type:'list',items:[
      'Substitute a Bird spawn for an effect that moves the Killer. For an effect that places the Killer in a specific space, place three Birds there.',
      'Redraw Events that require Special Victim meeples. Ignore or redraw an incompatible Event, and follow the printed discretion for Items that cannot affect the flock.',
      'Falconwood keeps its Mission requirement. Track its Friends independently of this vignette’s rescue objective. In Creech Manor the Helicopter can save carried Victims by its own card text and is not a green Exit.',
    ]},
    {type:'heading',level:3,text:'Bloodlust'},
    {type:'table',headers:['Position','Effect'],rows:[['0','Start'],['1','Draw an Event'],['2','Increase Horror by 1'],['3','Reveal Dark Power'],['4','Increase Horror by 1']]},
    {type:'paragraph',text:'Additional Bloodlust beyond the top discards a Terror card before the Finale. After the Finale is revealed, each further increase instead costs the Final Girl 1 Health.'},
    {type:'heading',level:3,text:'Dark Powers'},{type:'list',items:cards(BIRDS_POWERS)},
    {type:'heading',level:3,text:'Finales'},{type:'list',items:cards(BIRDS_FINALES)},
    {type:'heading',level:3,text:'Terror deck · 17 physical cards'},{type:'list',items:cards(BIRDS_TERRORS)},
    {type:'paragraph',text:`${BIRD_WALL.name} is drawn from the Terror deck and tracked as a Minor Dark Power. Its marks are Bird tokens.`},
  ],
};
export const BIRDS_PROMPT_CONTEXT: ModulePromptContext = {
  rulesSummary:BIRDS_GUIDANCE,
  narrativeGuidance:'Treat vignette Special Victims as rescue objectives distinct from ordinary casualties or location-specific people. A win confirms the required rescue, without implying the flock dispersed. An overrun can leave the Final Girl alive. Use the explicit review to decide her fate and keep unspecified details open.',
  visualGuidance:'Photograph a believable flock of crows, ravens or nearby birds in the chosen Location, with realistic feather detail and available light. Preserve the selected Final Girl. No unrecorded attacks, injuries, rescue or board state in the image.',
};
