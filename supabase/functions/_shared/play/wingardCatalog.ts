export const WINGARD = 'Wingard Cottage';
export const WINGARD_MODULE = 'wingard-cottage';
export const WINGARD_SOURCE = 'Wingard Cottage location sheet, board and cards';
export const WINGARD_VISUAL = 'A weathered lakeside family cottage with warm tungsten windows, a porch, nearby shed and boathouse, and dense woods. Use familiar household materials and a plausible 1980s snapshot. Crafted weapons, gathered supplies and event props require explicit story evidence.';

export const WINGARD_SPACES = [
  'Kitchen', 'Bedroom by Kitchen', 'Bathroom', 'Bedroom by Laundry Room',
  'Family Room', 'Foyer', 'Laundry Room', 'Garage', 'Shed', 'Boathouse',
  'Porch', 'Lakefront', 'Driveway', 'Yard by Boathouse', 'Yard behind Cottage',
  'Yard by Shed Exit', 'Yard by Garage', 'Path west of Porch', 'Path to Driveway',
  'West Exit', 'Shed Exit',
] as const;

export const WINGARD_SUPPLIES = [
  { id: 'tools', name: 'Discarded Tools', spaces: ['Garage'] },
  { id: 'nails', name: 'Nails', spaces: ['Shed'] },
  { id: 'rope', name: 'Rope', spaces: ['Boathouse'] },
  { id: 'wood', name: 'Wood', spaces: ['Yard by Boathouse', 'Yard by Garage'] },
] as const;

type Supply = typeof WINGARD_SUPPLIES[number]['id'];
type Craft = {
  id: string; name: string; supplies: readonly Supply[]; items?: readonly string[];
  time: number; uses?: number; inherits?: boolean; effect: string;
};
export const WINGARD_CRAFTS: readonly Craft[] = [
  {id:'snare',name:'Snare',supplies:['rope','wood'],time:1,uses:3,effect:'During the Action phase, spend 1 Time to place a Snare in your space, one per space. When an Enemy enters, discard the token and stop that Enemy’s movement for the rest of the turn.'},
  {id:'slingshot',name:'Spiked Slingshot',supplies:['nails','rope'],time:2,uses:3,effect:'Range 1, +1 damage, two hands. Modifies only Weak Attack and Furious Strike. Keep the card after its third use. During the Action phase, discard Nails to replenish its uses.'},
  {id:'nail-bat',name:'Nail Bat',supplies:['nails'],items:['Wooden Bat'],time:2,effect:'Range 0, +2 damage, two hands.'},
  {id:'spear',name:'Spear',supplies:['wood'],items:['Knife'],time:2,effect:'Range 0, +1 damage, two hands. After damaging an Enemy, you may move them to an adjacent space.'},
  {id:'disemboweler',name:'Disemboweler',supplies:['rope'],items:['Wooden Bat','Knife'],time:2,effect:'Range 0, +2 damage, two hands. After damaging the target, reduce Horror for each other Enemy in the same or an adjacent space.'},
  {id:'nail-trap',name:'Nail Trap',supplies:['wood','nails','tools'],time:2,uses:3,effect:'During the Action phase, spend 1 Time to place a Nail Trap in your space, one per space. When an Enemy enters, discard the token and deal 1 damage to that Enemy.'},
  {id:'nailgun',name:'Nailgun',supplies:['nails','tools'],time:2,uses:3,effect:'One hand. At range 1, spend 1 Time to deal 1 damage without an Action card. At range 0, modify the Action card with +1 damage.'},
  {id:'sawed-off',name:'Sawed-off Shotgun',supplies:['tools'],items:['Shotgun'],time:2,uses:2,inherits:true,effect:'One hand, range 0. Spend 1 Time to deal 3 damage to the primary target and 2 to the other Enemies in that space, without an Action card. Inherits the Shotgun’s remaining uses.'},
  {id:'porcupine',name:'Porcupine',supplies:['nails'],items:['Trashcan Lid'],time:2,uses:3,inherits:true,effect:'One hand. Ignore 1 damage and deal 1 damage to the Enemy that attacked. Inherits the Trashcan Lid’s remaining uses.'},
  {id:'obliterator',name:'The Obliterator',supplies:['wood','rope','tools','nails'],time:4,effect:'Range 0, +3 damage, two hands. Cannot modify Reaction cards. Reduces all movement by 1 to a minimum of 1. When used, lose 1 Health for each 1 in the final Horror roll result.'},
];
export const wingardCraft = (id: string) => WINGARD_CRAFTS.find(card => card.id === id);
export const wingardIngredients = (card: Craft) => [...(card.items ?? []), ...card.supplies.map(id => WINGARD_SUPPLIES.find(s => s.id === id)!.name)];

export const WINGARD_SETUPS = [
  {name:'Grad Party', finalGirl:'Yard behind Cottage', killer:'Path west of Porch', victims:{Lakefront:2,'Yard by Boathouse':1,Kitchen:1,'Bedroom by Kitchen':2,'Family Room':3,Foyer:1,'Yard by Garage':1,'Path to Driveway':1}},
  {name:'Special Occasion', finalGirl:'Lakefront', killer:'Path to Driveway', victims:{'Yard behind Cottage':2,Kitchen:3,'Family Room':3,Foyer:1,Bathroom:1,'Laundry Room':1,Garage:1}},
  {name:'Fishing Trip', finalGirl:'Bathroom', killer:'West Exit', victims:{Boathouse:2,Lakefront:3,'Yard behind Cottage':2,Kitchen:2,Shed:1,'Laundry Room':2}},
  {name:'Dysfunctional Family', finalGirl:'Path to Driveway', killer:'Yard behind Cottage', victims:{Boathouse:1,Lakefront:1,'Yard by Boathouse':1,Shed:1,Kitchen:1,'Bedroom by Kitchen':1,'Family Room':1,'Bedroom by Laundry Room':1,'Laundry Room':1,Garage:1,'Yard by Garage':1,'Path west of Porch':1}},
  {name:'Couples Weekend', finalGirl:'Path west of Porch', killer:'Yard by Shed Exit', victims:{Lakefront:2,Shed:2,'Bedroom by Kitchen':2,'Family Room':2,'Bedroom by Laundry Room':2,Garage:1}},
] as const;
export const wingardSetupDescription = (setup:typeof WINGARD_SETUPS[number]) =>
  `Final Girl starts at ${setup.finalGirl}. Killer starts at ${setup.killer}. Victims: ${Object.entries(setup.victims).map(([space,count])=>`${space} ×${count}`).join(', ')}.`;
export const WINGARD_EVENTS = [
  {id:'brainstorming',name:'Brainstorming',effect:'Randomly reveal two unused Crafted Item cards and make them available to craft. Discard this Event.'},
  {id:'outsider',name:'Marked for Death',effect:'Place the Outsider in the Bathroom. The Killer chooses the Outsider whenever it chooses a target, killing one Victim in each space on its path including the starting and ending spaces. Discard when the Outsider leaves play.'},
  {id:'battle-ready',name:'Battle Ready',effect:'Reveal the set-aside Item cards one at a time until you find a weapon to take, or run out of cards. Discard this Event.'},
  {id:'resourceful',name:'Getting Resourceful',effect:'Crafting costs 1 less Time.'},
  {id:'escape',name:'Escape Attempt',effect:'For the Victim nearest the Driveway, roll a die. On 5–6 move one space toward the Driveway even if the Killer is there. On 1–4 the Victim dies. Repeat until they reach the Driveway and are saved or are killed. Discard this Event.'},
  {id:'alarm',name:'Home Security',effect:'Keep until activated during an Action phase with no Enemies in the House. An Enemy attempting entry stays in place and adds one token. Disable and discard after three attempts or when the Final Girl or a Victim enters or leaves the House.'},
  {id:'booby-traps',name:'Booby Traps',effect:'Victims in the House panic. Any Victim who leaves the House during this resolution is killed. Discard this Event.'},
  {id:'boyfriend',name:'Loser Boyfriend',effect:'The furthest Victim is the Boyfriend. Enemies cannot target or kill him. If the Final Girl kills him, reduce Horror by 3 and do not increase Bloodlust. Discard when he leaves play.'},
  {id:'scooter',name:'Kick-Scooter',effect:'Place the Scooter in the closest outdoor space. It moves with you when you are with it, but stays in the last outdoor space when you enter Indoors. Once per Action phase, ride up to two spaces without Victim followers.'},
  {id:'neighbor',name:'Another Way Out',effect:'Place the Boat in the Lake and the Neighbor in the Family Room. At Lakefront the Neighbor and up to three other Victims there may leave and be saved. Discard this Event and the Boat when the Neighbor leaves play.'},
] as const;
export const WINGARD_PEOPLE = [{name:'Outsider'},{name:'Boyfriend'},{name:'Neighbor'}] as const;
export const WINGARD_TERRORS = [
  {id:'my-house',name:'Now Get the Hell Out of My House!',fatal:true,effect:'If outside the House, discard and draw the next Terror. Otherwise reveal an Event and place the Killer in your space. You may play Weak Attack if it is in your hand. Otherwise the Killer targets and attacks you.'},
  {id:'passing',name:'We Were Passing By and Thought We Heard a Scream.',fatal:false,effect:'Place two new Victims at the Porch, increase Horror, then reveal an Event.'},
  {id:'tammy',name:'Is Tammy Home?',fatal:false,effect:'Place the Killer at the Porch and increase Horror.'},
  {id:'happening',name:'Oh My God, What Is Happening to Us?',fatal:true,effect:'If no Victims are on the board, discard and draw the next Terror. Otherwise twice target a Victim, move and attack.'},
  {id:'out-there',name:'There’s Someone Out There',fatal:false,effect:'If no Victims are on the board, discard and draw the next Terror. Otherwise target a Victim, move with the double movement icon, and increase Horror.'},
  {id:'bedrooms',name:'They Can’t Get In Here, Right?',fatal:false,effect:'Place two new Victims in each Bedroom and increase Horror.'},
  {id:'gone',name:'What Happened While We Were Gone?',fatal:false,effect:'Place three new Victims at the Boathouse and reveal an Event.'},
  {id:'random-attack',name:'That Wasn’t a Random Attack',fatal:true,effect:'If no Victims are on the board, discard and draw the next Terror. Otherwise target a Victim, move, attack, then increase Horror.'},
] as const;

export const WINGARD_STANDARD_ITEMS = [
  {name:'First Aid Kit',count:1,effect:'Add 1 Health each time an Action card recovers Health.'},
  {name:'Shotgun',count:1,effect:'Range 1, two hands, two uses. Spend 1 Time for a Horror roll. On at least one success, deal 3 damage to one Enemy within range. Use without an Action card.'},
  {name:'Wooden Bat',count:2,effect:'Range 0, +1 damage, two hands.'},
  {name:'Blender',count:1,effect:'Range 0, +3 damage, two hands. Use only in the House, then discard.'},
  {name:'Map',count:1,effect:'Discard during the Action phase. For each Item deck either reveal its facedown top card or optionally remove its already faceup top card and reveal the next.'},
  {name:'1/8″ Chisel',count:1,effect:'Range 0, +1 damage, one hand. After each use roll a die. On 1–4 discard it.'},
  {name:'Knife',count:2,effect:'Range 0, +1 damage, one hand.'},
  {name:'Lucky Rabbit’s Foot',count:1,effect:'Discard during the Action phase and make a Horror roll. For each success choose 2 Time, 1 Health, reduced Horror or a one-space move.'},
  {name:'Blueprint',count:2,effect:'Discard to choose one unused Crafted Item and make it available to craft.'},
  {name:'Fireplace Poker',count:1,effect:'Range 0, +1 damage, one hand.'},
  {name:'Trashcan Lid',count:1,effect:'One hand, three uses. Ignore 1 damage.'},
  {name:'Energy Drink',count:1,effect:'Discard in the Action phase to gain 3 Time or move one space.'},
  {name:'Mysterious Pills',count:1,effect:'Discard in the Action phase to reduce Horror or recover 2 Health.'},
] as const;
export const WINGARD_ITEMS = [...WINGARD_STANDARD_ITEMS, ...WINGARD_CRAFTS, ...WINGARD_SUPPLIES.map(supply=>({name:supply.name,effect:`Spend 1 Time to take from ${supply.spaces.join(' or ')} while stopped there. Return to the supply pool when discarded.`}))];
