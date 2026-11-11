import {
  ORGANISM, ORGANISM_FINALES, ORGANISM_FORMS, ORGANISM_ITEM, ORGANISM_MINORS, ORGANISM_OPENING, ORGANISM_SOURCE, ORGANISM_TERRORS,
} from '@/lib/play/organism';
import type {EntityRuleModule,ModulePromptContext} from './moduleRules';

export const organismRules:EntityRuleModule = {
  entity:ORGANISM,
  kind:'killer',
  filmId:'s2-panic-station-2891',
  source:ORGANISM_SOURCE,
  credits:{design:'A.J. Porfirio',art:'Roland MacDonald'},
  seeAlso:['Station 2891'],
  tags:['exposed victim','mutated organism','test kit','lab','assimilation',...ORGANISM_TERRORS.map(card=>card.name),
    ...ORGANISM_MINORS.map(card=>card.name),...ORGANISM_FINALES.map(card=>card.name)],
  setup:[
    {type:'list',items:[
      'Start at Horror 5 and Bloodlust 0. There is no revealed Killer or shared Killer Health pool.',
      'Replace three random normal Victims with the red, black and grey Exposed Victims. Place the three shuffled Exposed Victim cards face down on the Killer board.',
      'Use the printed Lab at Station 2891. At another location, put the Lab token on the setup card’s Killer space.',
      'Put a face-up Test Kit above each Item deck. Shuffle the two Safe cards and the one Assimilated card into the Test Results deck.',
    ]},
  ],
  rules:[
    {type:'heading',level:3,text:'Exposed Victims and tests'},
    {type:'paragraph',text:'Exposed Victims always panic in Panic, cannot be saved or replaced with Special Victims, and cannot be targeted or killed by a Mutated Organism. If another effect would kill one, test immediately.'},
    {type:'paragraph',text:'When Search gives you an Item, you may also take the available Test Kit there. '+ORGANISM_ITEM.effect+' A test costs no Time and requires no Action card.'},
    {type:'list',items:[
      'Safe: remove that Test Results card. Replace the exposed meeple with a normal Victim. If an effect killed them, remove them and increase Bloodlust instead.',
      'Assimilated: reveal the next face from the right. Match its form to the victim’s color, set up its Health and Final Health, and resolve its Bloodlust entries from the bottom through the current level. Shuffle the Assimilated result back.',
      'Are We Alone? has its own Safe rule. The person stays exposed, the result goes back into the deck, and an Assimilated result ends the card’s testing.',
    ]},
    {type:'heading',level:3,text:'Mutations, Final Health and victory'},
    {type:'paragraph',text:'The mutations are Killers. Resolve their actions one at a time from left to right on the physical board. Before the Finale they use K and then the Terror card is resolved. After the Finale they use F immediately after K. Resolve the overflow Terror discard once across all mutations.'},
    {type:'paragraph',text:'When a form actually loses Final Health while another mutation remains on the board, finish the phase before checking its token. Blank or spent white means defeat. A surviving black token is replaced by a white one and the form recovers the printed Health. The +1 Horror die applies once across qualifying mutations. To win, resolve the Exposed Victims and defeat all mutations.'},
    {type:'table',headers:['Form','Starting Health','Killer action (K)','Additional Finale action (F)'],
      rows:ORGANISM_FORMS.map(form=>[form.name,String(form.hp),form.killerAction,form.finaleAction])},
    ...ORGANISM_FORMS.map(form=>({type:'table' as const,headers:[form.name+' Bloodlust','Attack','Move','Entry effect'],
      rows:form.effects.map((effect,index)=>[String(index),String(form.attack[index]),String(form.move[index]),effect||'Starting space'])})),
    {type:'heading',level:3,text:'Finales and Minor Dark Powers'},
    {type:'table',headers:['Finale','Effect'],rows:ORGANISM_FINALES.map(card=>[card.name,card.effect])},
    {type:'paragraph',text:'Each Minor Dark Power belongs to the mutation closest to the Final Girl. If none is in play, set the card aside for the next mutation revealed. Multiple powers can belong to the same mutation.'},
    {type:'table',headers:['Minor Dark Power','Health','Effect'],rows:ORGANISM_MINORS.map(card=>[card.name,String(card.health),card.effect])},
    {type:'table',headers:['Terror','Copies','Effect'],rows:ORGANISM_TERRORS.map(card=>[card.name,String(card.quantity),card.effect])},
  ],
};
export const ORGANISM_PROMPT_CONTEXT:ModulePromptContext = {
  narrativeGuidance:'The threat starts concealed among Exposed Victims. Safe is neither a rescue nor a casualty without an observed outcome. A recorded mutation is a separate killer. Preserve observed forms, location and Finale, and distinguish the confirmed loss cause.',
  visualGuidance:ORGANISM_OPENING,
  rulesSummary:'There are three Exposed Victims. Tests may clear one or reveal a mutation with its own Health. All Finales assimilate remaining Exposed Victims. The above-6 Horror loss belongs to Regenerative Assimilation.',
};
