export const WOLFE = 'Wolfe Asylum';
export const WOLFE_MODULE = 'wolfe';
export const WOLFE_SOURCE = 'Owner photos IMG_9586–IMG_9592 2.jpeg, IMG_9585.jpeg, and Series 2 Feature Film Rulebook, pp. 33–35.';
export const WOLFE_SPACES = ["Doctor’s Office", 'Operating Theater', 'Common Room', 'Utility Closet', 'Solitary Confinement', 'Medical Storage'];
export const WOLFE_SETUPS = ['A Solitary Life', 'Padded Rooms', 'Madhouse Faceoff', 'The Dr. Is In', 'Bingo Night'];
export const WOLFE_VISUAL = 'A late-1970s New England hospital in a worn Victorian building. The rounded Common Room has a round activity table, old radiators, faded institutional green paint and worn linoleum. The Operating Theater has cold tiled walls, the Doctor’s Office is wood-paneled, and Medical Storage has steel cabinets. Preserve selected cast and the physical setting. Event status and props alone establish no injury or outcome.';

type Card = {id:string; name:string; effect:string; quantity:number; death?:true};
function card(id:string,name:string,effect:string,quantity=1,death?:true):Card {
  return {id,name,effect,quantity,...(death&&{death})};
}

export const WOLFE_EVENTS = [
  card('dangerous-addiction','Dangerous Addiction','Choose up to two Victims in separate spaces, neither in your space. Place a face-down Pill token with each chosen Victim and increase Bloodlust by 1 per token. Discard this Event.'),
  card('powerful-meds','Powerful Meds','Draw one additional Side Effects card whenever you consume a Pill or a batch of Pills.'),
  card('scratching-and-biting','Scratching and Biting','After saving a Victim, make a Horror roll. On failure, lose 1 Health.'),
  card('new-patients','The New Patients Are Here!','Place four new Victims in the Common Room. Discard this Event.'),
  card('hannibal','Hannibal the Cannibal','Place Hannibal and two new Victims in Solitary Confinement. During Upkeep he kills a Victim in his space, or Panics if there is no Victim in his space. If saved, increase Horror by 1. If killed, decrease Horror by 1. Discard when he leaves play.',1,true),
  card('medical-stockpile','Medical Stockpile','The first time in a phase that you or an Enemy recover at least 1 Health, the figure recovering Health recovers 1 additional Health.'),
  card('madhouse','Welcome to the Madhouse','Put a Skull token in the Common Room. You or an Enemy take 1 Damage when entering that space.'),
  card('dr-death','Dr. Death','Place him in the Operating Theater. During Upkeep he kills a Victim in his space, or moves one space toward the nearest Victim. If killed, gain 2 Time and do not increase Bloodlust. Discard when he leaves play.',1,true),
  card('dr-sunshine','Dr. Sunshine','Place her in the Doctor’s Office. While she shares your space, you may choose the color whenever you take a Pill. If killed in your space, increase Horror by 4. Discard when she leaves play.',1,true),
  card('gurney','Hospital Gurney','Place the Gurney in your space. It can move with you and carry up to two Victims. Discard it to ram an Enemy in your space or an adjacent space for 1 Damage plus 1 per rider. The riders die. Discard this Event when the Gurney leaves play.',1,true),
];
export const WOLFE_PEOPLE = ['hannibal','dr-death','dr-sunshine'] as const;
export const WOLFE_ONGOING = ['powerful-meds','medical-stockpile','scratching-and-biting','madhouse'] as const;
export const WOLFE_TERRORS = [
  card('where','Where Did Everyone Go?','Panic Victims in your space until none remain there. Increase Horror by 2 and draw an Event.'),
  card('paranoia','Extreme Paranoia','Panic all Victims adjacent to the Killer. Take 1 Damage per Victim that panicked into your space, with defense allowed. If none did, increase Horror by 2.'),
  card('bingo','4:00… Time for Bingo!','If no Victims remain, discard and draw the next Terror. Otherwise all Victims move one space closer to the Common Room. With zero, one or two Victims there, increase Horror by 3, 2 or 1 respectively.'),
  card('fueled','Fueled by Madness','Increase Horror by 1. The Killer recovers Health equal to the number of Victims in its space and adjacent spaces. Target the closest Victim or Final Girl, move and attack.',1,true),
  card('meds','Give Us Our Meds!','For each Victim in your space, discard a Pill or take 1 Damage, with defense allowed. Increase Horror by 1. Target the closest Victim or Final Girl, move and attack.',1,true),
  card('hail','All Hail the New Master!','If no Victims remain, discard and draw the next Terror. Otherwise move each Victim one space closer to the Killer, then target the closest Victim or Final Girl and attack twice without moving.',1,true),
  card('candy','I Found Some Candy!','If no Pill tokens or no Victims remain on the board, discard and draw the next Terror. Other Victims move one space toward the nearest Pill token. For each token sharing a space with a Victim roll a die. On 1–2 discard it and kill one Victim. On 3–4 discard it and panic one Victim. On 5–6 nothing happens. Draw an Event.',1,true),
  card('doing','What Is This Place Doing to Me?','Draw two Side Effects cards. Target the closest Victim or Final Girl, move and attack. Draw an Event.',1,true),
];
export const WOLFE_ITEMS = [
  card('gown','Patient Gown','Ignore movement penalties from special rules. If you take damage from an attack you may discard this Item to kill a Victim in your space instead.',1,true),
  card('pills','Mysterious Pills','Discard immediately and take two Pill tokens.',3),
  card('tranquilizer','Tranquilizer Gun','Range 1, +1 Damage, one hand, two uses. Use without an Action card. Spend 2 Time to fire at an Enemy in an adjacent space. If it survives, Stun it.'),
  card('bag','Doctor’s Bag','Two uses. Spend 1 Time to recover 1 Health or 3 Time to recover 2 Health.'),
  card('manual','Physician’s Manual','When taking Pill tokens or drawing Amped cards, draw an extra one, choose what to keep and discard the additional draw.'),
  card('defibrillator','Defibrillator','Range 0, +1 Damage, two hands. After resolving damage with this Item, Stun the Enemy if it is still alive.'),
  card('laughing-gas','Laughing Gas Canister','Discard to Stun all Enemies in your space and adjacent spaces. Victims in those spaces immediately panic.'),
  card('scalpel','Scalpel','Range 0, +1 Damage, one hand. When using this weapon, add 1 damage for every two successes on the Horror roll. On a failure, lose 1 Health.'),
  card('adrenaline','Adrenaline Shot','Before revealing your black Final Health token, you may discard this Item to reveal three Final Health tokens from the pool and use one of them instead.'),
  card('bone-saw','Bone Saw','Range 0, +2 Damage, one hand. When this weapon inflicts damage, increase Horror by 1.'),
  card('energy-drink','Energy Drink','Discard in the Action phase to gain 3 Time, move one space, or ignore a Side Effects card.'),
  card('anaesthesia','Anaesthesia','Has two Tracking markers. Stun an Enemy in your space. You may discard this Item to move remaining markers to your Tranquilizer Gun.'),
  card('first-aid','First Aid Kit','Recover 1 additional Health whenever you use an Action card to recover Health.'),
  card('lid','Trashcan Lid','Three uses. Ignore 1 Damage.'),
  card('knife','Knife','Range 1, +1 Damage, one hand.'),
  card('bone-hammer','Hook-Handled Bone Hammer','Range 0, +2 Damage, one hand. When this weapon inflicts damage, roll a die. On 1–4, lose 1 Health.'),
];
export const WOLFE_AMPED = [
  card('rapid-healing','Rapid Healing','Make a Horror roll during Upkeep. Recover 1 Health per success.'),
  card('resistance','Resistance','Ignore Dark Power and Minor Dark Power effects.'),
  card('extreme-agility','Extreme Agility','Roll one additional die for all Horror rolls.'),
  card('final-girl-2','Final Girl 2.0','Reveal your own Ultimate Ability if needed, then apply the Ultimate Ability of another Final Girl of your choice as well.'),
  card('rabid-fury','Rabid Fury','Furious Strike costs 0 Time.'),
];
export const WOLFE_SIDE_EFFECTS = [
  card('normal','Normal','No effect.',6),
  card('brain-fog','Brain Fog','Discard a random Item if able, then stop drawing Side Effects.'),
  card('paralyzation','Paralyzation','Discard every Action card that allows movement, then stop drawing Side Effects.'),
  card('panic-attack','Panic Attack','Discard two Terror cards, then stop drawing Side Effects.'),
  card('reset','Reset','Shuffle this card and all other Side Effects back into their deck.'),
];

export const PILL_COLORS = ['yellow','blue','pink','wild'] as const;
export type PillColor = typeof PILL_COLORS[number];
export type Pills = Record<PillColor, number>;
type Recipe = {id:string; colors:readonly Exclude<PillColor,'wild'>[]; benefit:string; draws:number};
export const WOLFE_RECIPES:readonly Recipe[] = [
  {id:'yellow',colors:['yellow'],benefit:'Recover 1 Health',draws:0},
  {id:'blue',colors:['blue'],benefit:'Move 1 space',draws:0},
  {id:'pink',colors:['pink'],benefit:'Lower Horror by 1',draws:0},
  {id:'yellow-blue',colors:['yellow','blue'],benefit:'Recover all Health',draws:2},
  {id:'yellow-pink',colors:['yellow','pink'],benefit:'Gain 5 Time',draws:2},
  {id:'blue-pink',colors:['blue','pink'],benefit:'Lower Horror by 3',draws:2},
  {id:'amped',colors:['yellow','blue','pink'],benefit:'Draw an Amped card',draws:3},
];
