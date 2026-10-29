/** Owner photographs K1–K7; faithful paraphrases. See docs/imports/uss-konrad.md. */
export const KONRAD_SOURCE = 'Owner photographs konrad1.jpeg–konrad7.jpeg (K1–K7)';
export const KONRAD_SPACES = ['Hangar','Trash Compactor','Mess Hall','Bridge','Storage','Furnace','Armory','Junction','Upper-right Escape Pod','Lower-left Escape Pod','Lower-right Escape Pod','Upper-left corridor','Corridor left of Junction','Corridor right of Junction','Corridor below Junction','Bottom-center corridor'] as const;
export const KONRAD_EXITS: readonly string[] = KONRAD_SPACES.slice(8,11);
export const KONRAD_SHAFTS = ['upper-left','upper-right','lower-left','lower-right'] as const;
export const KONRAD_FUNCTIONS = [
 {id:'crusher',name:'Crusher',cost:1,station:'Trash Compactor',effect:'An Enemy or Victim ending movement here receives 1 damage. Final Girl and her following Victims are unaffected.'},
 {id:'incinerator',name:'Incinerator',cost:2,station:'Furnace',effect:'When an Enemy or Victim enters, roll: 1 deals 3 damage; 2–3 deals 2; 4–5 deals 1; 6 none. Final Girl and her following Victims are unaffected.'},
 {id:'airlock',name:'Airlock',cost:3,station:'Hangar',effect:'Place Airlock marker when activated. During Action, Final Girl in or adjacent to Hangar may discard marker: kill everyone in Hangar; Loader there is lost. Killed Killer reveals Final Health and revives at Junction if applicable. Final Girl in Hangar survives on 5–6, otherwise loses without Final Health reveal.'},
 {id:'self-destruct',name:'Self Destruct',cost:4,station:'Bridge',effect:'Start countdown. Advance once per physically resolved Upkeep: start → middle → explosion. Explosion kills everyone. Final Girl outside an Exit loses even if Killer is killed.'},
] as const;
const event = (id:string,name:string,effect:string,kind:'ongoing'|'person'|'instant'='ongoing')=>({id,name,effect,kind});
export const KONRAD_EVENTS = [
 event('captain','The Captain','Add special Victim at Bridge. Self Destruct costs one fewer Keycard while he is at Bridge. If killed, +2 Bloodlust, subject to selected Killer rules. Discard when he leaves play.','person'),
 event('jonas','Jonas the Cat','Add at farthest Victim. Never follows. Upkeep: Panic three times. End Action with Jonas: decrease Horror by 1 OR gain 3 Time. Discard on departure.','person'),
 event('orphan','Orphan Girl','Closest existing Victim becomes her; do not add another Victim. With Final Girl, one extra Victim may follow and inactive shafts are free. Death increases Horror by 3. Discard on departure.','person'),
 event('master-access','Master Access','Expose facedown top Items; take showing Keycards. Discard.','instant'),
 event('weapons-locker','Weapons Locker','Put unused weapons into Armory Item deck, faceup on top or facedown beneath. Discard.','instant'),
 event('faulty-wiring','Faulty Wiring','During Upkeep roll separately for Furnace and Trash Compactor: 1–2 everyone there loses 1 Health; 3–6 none.'),
 event('good-cookin',"Good Cookin'",'End Action in Mess Hall: recover 1 Health.'),
 event('cramped-pods','Cramped Escape Pods','If more than one Victim occupies an Exit, Victims cannot be saved from that space.'),
 event('cluttered-shafts','Cluttered Shafts','While moving Final Girl may pass through an inactive shaft for 1 Health; no Victims follow. Does not activate shaft.'),
 event('emergency-override','Emergency Override','Incinerator, Airlock and Self Destruct each cost one fewer Keycard. Crusher is unchanged.'),
];
export const KONRAD_PEOPLE = KONRAD_EVENTS.filter(e=>e.kind==='person');
export const KONRAD_TERRORS = [
 ['Incinerator Malfunction','Panic Victims adjacent to Furnace. Roll per entity at Furnace: 1 loses 2 Health; 2–4 loses 1; 5 none; 6 move one chosen space. Then target closest Final Girl/Victim, move and attack.'],
 ['System Reboot','Return all board and Maintenance Keycard tokens to their Keycard Item cards. If any returned, increase Horror by 2. Draw an Event. Cancel active functions and remove associated markers. Returned cards are not all necessarily held by Final Girl.'],
 ['Solar Interference','Remove all board and Maintenance Keycards, cancelling prior active functions. Roll each: 1 upper-left shaft; 2 Crusher; 3 upper-right shaft; 4 lower-right shaft; 5 Incinerator; 6 lower-left shaft. Then target closest Final Girl/Victim, move and attack. Preserve repeated destinations.'],
 ["Let's Test the Maintenance Shafts!",'This turn all Enemies may use all shafts. Target closest Final Girl/Victim, move and attack. Increase Horror by 1 per Enemy that used a shaft.'],
 ['Gas Leak','Roll: 1 upper-left and upper-right; 2 lower-left and lower-right; 3 upper-left; 4 upper-right; 5 lower-left; 6 lower-right shafts. Everyone adjacent to affected shafts loses 1 Health. Draw an Event.'],
 ['Garbage Day','Panic Victims adjacent to Trash Compactor; everyone in Trash Compactor loses 1 Health. Then target closest Final Girl/Victim, move and attack.'],
 ['Catastrophic Hull Breach','First target closest Final Girl/Victim, move and attack. Put Skull at farthest Exit. Anyone there or entering is instantly killed. Killed Killer reveals Final Health and revives at Junction if applicable. Draw an Event.'],
 ['Slippery','Minor Dark Power, 2 Health. The Killer freely uses all Maintenance Shafts. Location-owned, independent of Killer Minor Powers.'],
].map(([name,effect])=>({name,effect,location:'USS Konrad',source:KONRAD_SOURCE}));
export const KONRAD_ITEMS = [
 ['keycard','Keycard','Six copies (five faces photographed). Acquired card receives a token. During Action spend at function station or adjacent inactive shaft, no Time. Empty cards remain in inventory, cannot be discarded and are ignored for Item discard.'],
 ['personal-beacon','Personal Beacon','Once per Action phase make Killer target Final Girl and move. No attack is printed.'],
 ['loader-key','Super Loader Key','In same space as Super Loader, may take and equip it. Finding Key does not automatically equip Loader.'],
 ['loader','Super Loader','Two hands, range 0, damage 2. No following Victims; all movement reduced by 1, minimum 1; received damage reduced by 1, minimum 1. No Short Rest, Long Rest or Search. Unequip or lose Key: leave Loader at current space, card beside board, never Backpack.'],
 ['remote-beacon','Remote Beacon','Spend 2 Time to place up to three spaces away. Killer chooses Beacon instead when selecting target. Discard when Killer enters.'],
 ['energy-drink','Energy Drink','Discard during Action to gain 3 Time OR move one space.'],
 ['emergency-access','Emergency Access','Two uses. Move one adjacent space through an inactive shaft.'],
 ['flamethrower','Flamethrower','Two hands, range 0–1, damage 3, two uses. Distribute damage evenly in target space among Victims, then Enemies, then Final Girl.'],
 ['manifest',"Ship's Manifest",'Discard at Search space; inspect and reorder Item deck, leaving top faceup.'],
 ['thermal-visor','Thermal Visor','Discard to replace an Ambush. When Enemy enters Final Girl space, may discard two Action cards to take Guard into hand.'],
 ['vibroclaw','Vibroclaw','One hand, range 0, damage 1. Successful Reaction damage reduction also deals 1 damage to attacker.'],
 ['remote-access','Remote Access','Two uses, during Action. Move a token on the board to another Maintenance Shaft or a Maintenance card. Source is not a Maintenance card.'],
 ['remote-monitor','Remote Monitor','Once per Action phase inspect top Terror or Ambush, leaving it or putting it beneath its deck.'],
 ['motion-tracker','Motion Tracker','One hand; +1 die on Scan. When Enemy enters, may discard to move immediately to adjacent space; Enemy remaining movement is lost.'],
 ['pills','Mysterious Pills','Discard during Action to decrease Horror by 1 OR recover 2 Health.'],
].map(([id,name,effect])=>({id,name,effect,quantity:id==='keycard'?6:1}));
export const KONRAD_SETUPS = [
 {name:'Bloody Feast',girl:14,killer:11,keycards:[0,8],victims:{0:1,12:1,7:1,13:1,3:1,2:4,4:1,9:1,10:1}},
 {name:'Born in Flames',girl:11,killer:5,keycards:[7,4],victims:{0:3,3:3,6:2,1:1,12:1,13:1,14:1}},
 {name:'Showdown',girl:3,killer:0,keycards:[9,15],victims:{11:2,2:1,8:1,7:3,14:1,6:1,5:1,10:2}},
 {name:'Space Rave',girl:2,killer:13,keycards:[6,3],victims:{11:2,0:4,3:1,4:1,5:1,6:1,8:1,10:1}},
 {name:'Junction Danger',girl:6,killer:7,keycards:[1,3],victims:{11:1,0:2,2:2,3:2,4:1,15:1,9:1,10:1,8:1}},
];
