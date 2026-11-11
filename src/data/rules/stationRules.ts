import {
  STATION, STATION_EVENTS, STATION_FLY_FASTER, STATION_HALLWAYS, STATION_ITEMS, STATION_OUTDOORS,
  STATION_SETUPS, STATION_SOURCE, STATION_SPACES, STATION_TERRORS, stationSetupDescription,
} from '../../../supabase/functions/_shared/play/stationCatalog';
import type { EntityRuleModule, ModulePromptContext } from './moduleRules';

const heading = (text: string) => ({type:'heading' as const,level:3 as const,text});
const paragraph = (text: string) => ({type:'paragraph' as const,text});
const cardList = (cards: readonly {name:string;effect:string}[]) => ({type:'list' as const,items:cards.map(card=>`${card.name}: ${card.effect}`)});

export const stationRules: EntityRuleModule = {
  entity:STATION, kind:'location', filmId:'s2-panic-station-2891', source:STATION_SOURCE,
  credits:{design:'A.J. Porfirio',art:'Roland MacDonald, Item art by Tyler Johnson'},
  tags:['helicopter','helipad','Arctic Airport','Frostbite','Fly Faster','Skidozer','Armory','Lab','Comms Specialist','Doctor','Chef','A New Stew'],
  seeAlso:['The Organism','saving-victims','horror-rolls'],
  setup:[
    paragraph('Use any Killer. Place the Helicopter Card nearby and the helicopter on the helipad. Place the Skidozer in an outdoor space adjacent to a Search space. Find one Two-Way Radio for your starting inventory before preparing the Item decks. Add Fly Faster! to the Action tableau. Use the Core holding boards for the triangle and moon hallways.'),
    ...STATION_SETUPS.flatMap(setup=>[heading(setup.name),paragraph(stationSetupDescription(setup))]),
    paragraph('Against The Organism, follow its own setup. The printed Station Lab remains the testing space and the Killer marker is not placed in the setup’s Killer space.'),
  ],
  rules:[
    heading('Helicopter and saving Victims'),
    paragraph('When the helicopter and Victims are on the helipad, freely transfer the helicopter and up to three passengers to the Station space on the Helicopter Card. The card route goes from Station to Air to Arctic Airport. Each helicopter icon permits one step on the card. Passengers on the card cannot be targeted or killed. The loaded helicopter cannot return to Station before dropping its passengers at the airport.'),
    paragraph('Arrive at the Arctic Airport to save the passengers. If arriving outside the Action phase, apply the effects at the start of the next Action phase. Once resolved, the helicopter may return to Station and land on the helipad freely. Exposed Victims remain ineligible for rescue.'),
    heading(STATION_FLY_FASTER.name),paragraph(STATION_FLY_FASTER.effect),
    heading('Frostbite and shelters'),
    paragraph('For a Frostbite icon, give each outdoor Final Girl, Victim and Enemy a Frostbite token. Anyone who already has one loses one Health instead. During Upkeep, remove Frostbite tokens from those indoors. The Generator prevents token removal at the next Upkeep only.'),
    paragraph('This edition has five outdoor spaces, including the helipad. The Tool Shed and Commander’s Hut are indoors and outside the main building. The Fire Alarm affects the main building. A Lab breach opens one connection and leaves the Lab’s printed indoor classification in place. Unnamed spaces below have descriptive labels.'),
    {type:'table',headers:['Board space','Classification'],rows:Object.entries(STATION_SPACES).map(([id,name])=>
      [name,STATION_OUTDOORS.some(s=>s===id)?'Outdoors':STATION_HALLWAYS.some(s=>s===id)?'Main building hallway':id==='shed'||id==='hut'?'Indoor outbuilding':'Main building'])},
    heading('Terror cards · 8'),cardList(STATION_TERRORS),
    heading('Events · 10'),cardList(STATION_EVENTS),
    heading('Items · 18'),cardList(STATION_ITEMS.map(item=>({...item,name:`${item.name} (${item.quantity})`}))),
  ],
};

export const STATION_PROMPT_CONTEXT: ModulePromptContext = {
  rulesSummary:'Station 2891 is an independent polar research outpost. A helicopter carries up to three eligible Victims to Arctic Airport. Effects of rescue outside Action wait until the next Action phase. Frostbite marks outdoor figures before repeated exposure costs Health. The Tool Shed and Commander’s Hut are shelters outside the main building. A hole in the Lab wall adds a connection. The Organism supplies its own testing rules when selected.',
  visualGuidance:'Practical corrugated polar research buildings, snow guide ropes, amber doors, two narrow corridors, the Lab, Radio Room and a distant helipad. Keep surroundings grounded in 1980s analog equipment. Arctic Airport is a separate airfield.',
  narrativeGuidance:'Distinguish awaiting rescue effects from confirmed rescues. Do not infer an injury, mutation, casualty, item use, role, active storm or discovered Armory merely from a rule, setup or drawn card. Use the selected Killer and explicit observations. A Lab explosion is a location hazard and damage alone is not a death.',
};
