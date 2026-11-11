export const STATION = 'Station 2891';
export const STATION_MODULE = 'station-2891';
export const STATION_SOURCE = 'Owner photos IMG_9557–IMG_9562, Station 2891 Series 2 rules and components';

export const STATION_ROLES = [
  { id: 'doctor', name: 'Doctor', event: "What's Up Doc?" },
  { id: 'chef', name: 'Chef', event: 'Chow Time!' },
  { id: 'comms', name: 'Comms Specialist', event: 'Comms Specialist' },
] as const;
export const STATION_ALLIES = [
  { id: 'char', name: 'Char the Alaskan Malamute' },
  { id: 'thule', name: 'Thule the Alaskan Malamute' },
] as const;

export const STATION_SPACES = {
  supply: 'Supply Closet', storage: 'Room beside Supply Closet', bunks: 'Bunk Room', wash: 'Washroom',
  rec: 'Rec Room', longHall: 'Triangle Hallway', shortHall: 'Moon Hallway', service: 'Room by west door',
  utility: 'Room west of Lab', lab: 'Lab', radio: 'Radio Room', workroom: 'Room below Radio Room',
  kitchen: 'Kitchen', west: 'Outdoor path by Tool Shed', labApproach: 'Outdoor space below Lab',
  eastCenter: 'Outdoor space east of Helipad', east: 'Outdoor path by Commander’s Hut', helipad: 'Helipad',
  shed: 'Tool Shed', hut: "Commander's Hut",
} as const;
export const STATION_OUTDOORS = ['west', 'labApproach', 'eastCenter', 'east', 'helipad'] as const;
export const STATION_HALLWAYS = ['longHall', 'shortHall'] as const;
export const STATION_SEARCH = ['supply', 'shed', 'hut'] as const;
type Space = keyof typeof STATION_SPACES;
type Setup = { name: string; girl: Space; killer: Space; victims: Partial<Record<Space, number>> };
export const STATION_SETUPS: readonly Setup[] = [
  {name:"Quittin' Time", girl:'west', killer:'kitchen', victims:{supply:1,wash:2,rec:2,longHall:1,utility:1,shortHall:2,labApproach:1,east:1,hut:1}},
  {name:'Good Morning', girl:'wash', killer:'storage', victims:{west:1,eastCenter:1,kitchen:1,rec:2,longHall:2,shortHall:1,lab:1,workroom:2,bunks:1}},
  {name:'A Nice Stew', girl:'kitchen', killer:'shed', victims:{service:2,longHall:2,bunks:1,lab:1,shortHall:2,rec:2,eastCenter:1,hut:1}},
  {name:'Clear the Grounds', girl:'radio', killer:'wash', victims:{west:1,labApproach:2,eastCenter:1,east:2,workroom:1,kitchen:1,rec:2,storage:1,bunks:1}},
  {name:'R & R', girl:'rec', killer:'utility', victims:{service:2,storage:1,bunks:1,wash:1,longHall:1,shortHall:1,lab:1,radio:1,labApproach:2,east:1}},
];

export function stationSetupDescription(setup: Setup) {
  const placement = Object.entries(setup.victims).map(([id, n]) => `${STATION_SPACES[id as Space]} ${n}`);
  return `Final Girl: ${STATION_SPACES[setup.girl]}. Killer setup space: ${STATION_SPACES[setup.killer]}. Victims: ${placement.join(', ')}.`;
}

export const stationNameKey = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, '');
export const stationSetup = (name?: string | null) => {
  const key = stationNameKey(name ?? '');
  return STATION_SETUPS.find(s => stationNameKey(s.name) === (key === 'anewstew' ? 'anicestew' : key));
};

const coldAndFlight = ' Then resolve Frostbite and you may move the helicopter one space.';
const noVictims = 'If there are no Victims in play, discard and draw another Terror. Otherwise, ';
const victimAttack = ' Target a Victim, move and attack.';
const eitherAttack = ' Target the Final Girl or a Victim, move and attack.';
export const STATION_TERRORS = [
  {id:'happy-hour', name:"It's Happy Hour!", effect:noVictims + 'panic indoor Victims, then move all Victims from the hallways to the Rec Room.' + victimAttack + coldAndFlight},
  {id:'not-safe', name:"It's Not Safe in Here!", effect:'Each Victim adjacent to a hallway moves into it. Panic one Victim from each Search space, then increase Horror twice.' + coldAndFlight},
  {id:'tell-me', name:'Tell Me Where It Is!', effect:noVictims + 'for each Victim in your space, you may look through an Item deck, put an Item faceup on top and shuffle the remaining cards facedown below it. Increase Horror once.' + coldAndFlight},
  {id:'generator', name:'The Generator Is Out!', effect:'Frostbite remains through the next Upkeep. Draw two Events.' + eitherAttack + coldAndFlight},
  {id:'they-left', name:'They… Just Left.', effect:noVictims + 'remove one normal Victim, choosing one outdoors if able, then increase Bloodlust once. Target a Victim and move.' + coldAndFlight},
  {id:'cant-stay', name:"We Can't Stay Here", effect:noVictims + 'panic indoor Victims, then panic all Victims in hallways.' + victimAttack + coldAndFlight},
  {id:'by-morning', name:"We'll Be Dead by Morning.", effect:'Choose two Horror or one Bloodlust, then panic all Victims or yourself. Target the Final Girl or a Victim and move.' + coldAndFlight},
  {id:'chopper-supplies', name:'What Supplies Are in the Chopper?', effect:'If the helicopter is at Station 2891 and you are outdoors, you may take two random unused Items. Draw one Event. Target the Final Girl, move, then target the Final Girl or a Victim and attack.' + coldAndFlight},
] as const;

export const STATION_EVENTS = [
  {id:'doctor',name:"What's Up Doc?",effect:'Choose an eligible Victim as the Doctor. Recover two Health during Upkeep if you share a room. If the Doctor is killed, add one extra Bloodlust. Discard when the Doctor leaves play.'},
  {id:'new-victims',name:'Who Goes There?',effect:'Place one new Victim in each outdoor space other than the helipad. Discard.'},
  {id:'lab-accident',name:"There's Been an Accident in the Lab!",effect:'Everyone in the Lab immediately takes one damage. Place the Hole token on the Lab’s bottom wall to connect it to the outdoor space beside it. Discard.'},
  {id:'pair-up',name:'Pair Up!',effect:'Redistribute lone Victims in pairs through Kitchen, Radio Room, Rec Room and Lab. Add a Victim if needed to complete the last pair, then discard the Event.'},
  {id:'fire-alarm',name:'Someone Pulled the Fire Alarm!',effect:'You and all Victims in the main building panic. You may spend two Time to prevent your own panic. Discard.'},
  {id:'help',name:"Don't Worry! We're Here to Help!",effect:'If the helicopter has passengers, discard and draw a replacement Event. Otherwise put it on the helipad with three new Victims. Panic them first together and then individually. Move any adjacent to an indoor space into it. Discard.'},
  {id:'chef',name:'Chow Time!',effect:'The eligible Victim nearest the Kitchen becomes the Chef. During Upkeep if you are both in the Kitchen, recover one Health or reduce Horror by one. If the Chef is killed, increase Horror twice. Discard when the Chef leaves play.'},
  {id:'comms',name:'Comms Specialist',effect:'The closest eligible Victim to but outside the Radio Room becomes the Comms Specialist. While they are in that room, roll once per Action phase. On 5–6 you may move the helicopter one space. If killed, discard two Action cards of your choice. Discard when they leave play.'},
  {id:'heavy-storm',name:'Heavy Storm',effect:'Your outdoor moves are panicked. Spend one Time per reroll, as often as you can afford.'},
  {id:'cache',name:'Hidden Weapons Cache',effect:'Shuffle the Armory tokens and place one facedown in each of the four non-Exit outdoor spaces. Reveal on entry. Discard an X. The gun marks a searchable Armory. Shuffle unused Weapon Items to make its deck and leave the top facedown. Discard this Event if the Item deck has no Items left or unused Items contain no Weapons.'},
] as const;

export const STATION_ITEMS = [
  {name:'Axe',quantity:1,effect:'Same space, two damage, two hands.'},
  {name:'Char the Alaskan Malamute',quantity:1,effect:'Deal one damage when an Enemy enters your space. Discard Char to prevent the next damage you take. Char does not take Backpack space.'},
  {name:'Crucifix',quantity:1,effect:'Discard to prevent a Horror increase or stop Enemy movement in an adjacent space.'},
  {name:'First Aid Kit',quantity:1,effect:'Recover one extra Health each time an Action card recovers Health.'},
  {name:'Flamethrower',quantity:2,effect:'Same space, two hands, two uses. Keep it in your hands and keep your Backpack empty. Once per Action phase, deal half the Killer’s current Health rounded down or kill all Minions in your space.'},
  {name:'Flare Gun',quantity:2,effect:'Range zero to one, one hand, two uses. Use with Weak Attack. If it damages the Killer, reduce Horror by one. Alternatively, outdoors, move all outdoor Victims one space toward you.'},
  {name:'Knife',quantity:2,effect:'Same space, one damage, one hand.'},
  {name:'List of Things',quantity:1,effect:'Roll immediately: 1–2 Supply Closet, 3–4 Tool Shed, 5–6 Commander’s Hut. Reveal that deck without changing its order, then discard this Item.'},
  {name:'Lucky Dice',quantity:1,effect:'Discard to roll five dice regardless of Horror.'},
  {name:'Old Revolver',quantity:1,effect:'Range one, one damage, one hand. Only modifies Weak Attack.'},
  {name:'Roller Skates',quantity:1,effect:'Do not count hallways as spaces while resolving movement. If you start outdoors, move one fewer space, minimum one. The Skates do not take Backpack space.'},
  {name:'Skidozer Keys',quantity:1,effect:'Two uses. Move the outdoor Skidozer to any outdoor space, or from the outdoor space beside the Lab place the Hole token to connect it to the Lab.'},
  {name:'Thule the Alaskan Malamute',quantity:1,effect:'Deal one damage when an Enemy enters your space. Discard Thule to prevent the next damage you take. Thule does not take Backpack space.'},
  {name:'Two-Way Radio',quantity:2,effect:'Four uses. Spend one Time to move a Victim one space. Do not use on the same Victim twice in a turn.'},
] as const;

export const STATION_FLY_FASTER = {name:'Fly Faster!',effect:'Costs one Time to buy. Two successes: up to two helicopter moves, then lose one Time. One success: up to one helicopter move, then lose one Time. Failure: lose one Time, or lose two Time to resolve the card again.'};
