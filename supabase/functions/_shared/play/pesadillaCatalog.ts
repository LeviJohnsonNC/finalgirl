export const PESADILLA = 'Pesadilla Verde';
export const PESADILLA_MODULE = 'pesadilla-verde';
export const PESADILLA_BOOKLET = 'https://cdn.shopify.com/s/files/1/0593/6984/8897/files/FG_FF19_PesadillaVerde_Rules.pdf?v=1773091153';
export const PESADILLA_SOURCE = 'Pesadilla Verde location booklet and supplied Series 4 cards';
export const PESADILLA_SETUPS = ['High Ground', 'Jungle Madness', 'Cave Dwellers', 'Rebel Yell', 'River Rats'] as const;
export const PESADILLA_REACHES = ['Lower River', 'Central River', 'Upper River'] as const;
export const PESADILLA_SPACES = [
  'Ancient Ruins', 'Rebel Camp', 'Supply Depot', 'Clearing', 'Cave', 'Cursed Temple',
  'Waterfall', ...PESADILLA_REACHES, 'Northwest Exit',
] as const;

export const PESADILLA_PEOPLE = {
  weathers: 'Sgt. Weathers',
  archeologist: 'Archeologist',
  rebel: 'Rebel Leader',
} as const;

export const PESADILLA_EVENTS = [
  { id: 'piranhas', name: 'Piranhas!', effect: 'Place the hazard according to a die: 1–2 Lower, 3–4 Central, 5–6 Upper River. Occupants immediately lose 1 Health. Later entrants also lose 1 Health.' },
  { id: 'supply', name: 'Supply Drop', effect: 'Put three random unused Items faceup beside the Supply Depot pile. A successful search there can take one of those instead of taking from the pile. Discard the Event after all three leave.' },
  { id: 'rain', name: 'Heavy Rains', effect: 'Entering a River space from outside the river costs the Final Girl 2 Time unless protected by the Wet Suit.' },
  { id: 'choppa', name: 'Get to the Choppa!', effect: 'Return the Huey to the Clearing if it is away. Each Huey rescue may grant 2 Health, 3 Time, one decrease in Horror or an Action card costing up to 2 Time. Discard when the Huey leaves.' },
  { id: 'raid', name: 'Rebel Raiding Party', effect: 'Roll a die. Move the Ancient Ruins Items (1–3) or Supply Depot Items (4–6) to the bottom of the Rebel Camp pile after shuffling them facedown. Discard afterward.' },
  { id: 'temple', name: 'Cursed Temple', effect: 'Place its curse token. Upon the Final Girl entering, she loses 3 Health, then the token and Event are discarded.' },
  { id: 'twitchy', name: 'Twitchy Soldiers', effect: 'Lock No Friendly Fire. Until it is unlocked again, friendly fire kills a Soldier on 1–3 per participating Soldier’s die.' },
  { id: 'weathers', name: PESADILLA_PEOPLE.weathers, effect: 'Place him in a space with the most Victims. He counts as a Soldier. When ordered, he and the Victims with him get one extra space of movement and one extra attack range. His death raises Horror twice. Discard the Event when he leaves play.' },
  { id: 'archeologist', name: PESADILLA_PEOPLE.archeologist, effect: 'Roll to place him at Ancient Ruins (1–2), Rebel Camp (3–4) or Supply Depot (5–6), including each Upkeep. Searching in his space costs one die unless you pay 3 Time. Discard the Event when he leaves play.' },
  { id: 'rebel', name: PESADILLA_PEOPLE.rebel, effect: 'Start at Rebel Camp. In Upkeep move him one space toward the nearest Victim outside camp, then transfer a Victim sharing his space to camp. While active, Soldiers there cannot take orders. He will not follow the Final Girl. Discard the Event when he leaves play.' },
] as const;

export const PESADILLA_TERRORS = [
  { name: 'Cursed Sacrifice', effect: 'Redraw if the board has no Victims. Move Victims one space toward the Temple, kill those at the Temple and, if nobody died, kill the two closest Victims.' },
  { name: 'Low Morale', effect: 'Redraw with no Victims. Otherwise lock a chosen upgrade. The Killer targets a Victim and resolves movement and one attack.' },
  { name: 'The Green Nightmare', effect: 'Discard without effect if last in the deck. Otherwise choose between three Horror increases or one increase followed by shuffling this card back in.' },
  { name: 'Jungle Heat', effect: 'The Killer targets the closest Final Girl or Victim and moves. Panic all Victims adjacent to the Killer. Target the closest Final Girl or Victim and attack twice, then draw an Event.' },
  { name: 'Flash Flood', effect: 'Draw an Event first. Move occupants of Waterfall, Upper and Central River one space downstream. Everyone now at Lower River loses 2 Health, subject to printed immunities.' },
  { name: 'Cave Collapse', effect: 'Everyone in the Cave loses 1 Health. Panic the survivors, then mark the Cave as no longer an Exit. Draw an Event and raise Horror once.' },
  { name: 'I Saw the Jungle Move! Open Fire!', effect: 'Redraw if there are no Victims. Otherwise roll for each space with at least two Victims. Each 1–3 kills one Victim in that space. Draw an Event afterward.' },
  { name: 'Rivermaster', effect: 'Location Minor Dark Power. Normally 2 Health. Its beneficiary may move upstream and ignores Flash Flood and Piranhas! Use the selected Killer’s rules for health, assignment and removal.' },
] as const;

export const PESADILLA_ITEM_RULES = [
  ['First Aid Kit', 'Recover 1 additional Health when an Action card heals you.'],
  ['Mini-Gun', 'Two-handed. Range 0–1, two uses. Add damage per final Horror Roll success. Move one less space with a minimum of one. It cannot go in the backpack.'],
  ['Bowie Knife', 'One-handed with range 0 and 1 damage. One face permits using both knives together when holding one in each hand. The other gives one extra damage under that condition.'],
  ['M16', 'Two-handed. Adds 2 damage at range 1 or 1 at range 2.'],
  ['Wet Suit', 'You may move upriver without followers. Ignore Flash Flood, Heavy Rains and Piranhas!'],
  ['Cigar', 'Three uses. Add one die to a Train roll.'],
  ['Mysterious Pills', 'Discard in the Action phase to decrease Horror or heal 2 Health.'],
  ['MRE’s', 'Two uses. Advance all Soldier Action cubes one slot.'],
  ['Walkie-Talkies', 'Soldier movement gains one space.'],
  ['Grenade', 'Two identical cards. From hand, discard in the Action phase and pay 2 Time for 2 damage to an adjacent Enemy. From the backpack, discard to add 2 damage when using the Compound Bow.'],
  ['Backpack Radio', 'Discard and pay 3 Time. Move all Soldiers up to two spaces or resolve the card’s airstrike. A roll of 1–2 causes 1 Health loss in the chosen and adjacent spaces. A 3–6 causes 4 Health loss in the chosen space only.'],
  ['River Mud', 'A roll of 5–6 prevents you from being selected by the pictured targeting actions. Mark each River entry and discard after the third mark.'],
  ['Booby Trap', 'Pay 3 Time to place the token in your space. When an Enemy enters, it takes 3 damage and the card and token are discarded.'],
  ['Cursed Idol', 'A faceup Idol anywhere prevents Search Action cards from resolving. Take it when entering its Search space or when revealed by searching. Discard only at the Temple.'],
  ['Compound Bow', 'Range 1–2, two-handed, three shots. Pay 2 Time to fire for 1 damage independently of an Action card.'],
  ['Axe', 'Two-handed. Range 0, 2 damage.'],
] as const;
export const PESADILLA_ITEMS = PESADILLA_ITEM_RULES.map(([name,effect]) => ({name,effect}));
