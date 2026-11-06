/** Owner photographs M1–M8, IMG_9491–9498. Printed standard location. */
export const MALL='Sunnydaze Mall';
export const MALL_MODULE='sunnydaze-mall';
export const MALL_SOURCE='Sunnydaze Mall — owner photographs IMG_9491.jpeg–IMG_9498.jpeg';
export const MALL_VISUAL='A real two-level 1980s indoor shopping mall: tiled concourses with railings overlooking a divided Food Court, escalators, an Atrium, Security and six distinct stores. The Savior is a young teenage boy with short tousled blond hair, a dark sleeveless zip hoodie over a grey long-sleeved shirt. He is a separate Ally, not the selected Final Girl or a Victim. Use recorded people and states only; decorative photographs do not establish events.';
export const MALL_TRUST=['Go to Hell!','Eat Me',"I Guess You’re OK",'I Believe You!'] as const;
export const MALL_STORES=[{id:'surplus',name:'Military Surplus ’R Us'},{id:'boards',name:'Boards ’N Bones'},{id:'zap',name:'Zap Shack'},{id:'joystick',name:'Joystick Heroes'},{id:'sporting',name:'Stan’s Sporting Goods'},{id:'smokin',name:'Smokin’ Subject'}] as const;
export const MALL_SPACES=['Atrium','Security','Service Entrance','Food Court · West','Food Court · East',...MALL_STORES.map(s=>s.name),'Northwest concourse','North Railing · West','North Railing · East','Northeast concourse','West Railing · North','West Railing · South','East Railing','Southwest concourse','South concourse · West','South concourse · East','Southeast Exit'] as const;
export const MALL_ACTIONS=[{id:'ignore-terror',name:'Ignore Terror',minimum:3,cooldown:2},{id:'move-a',name:'Move 1 space',minimum:2,cooldown:2},{id:'move-b',name:'Move 1 space · second action',minimum:2,cooldown:2},{id:'recover',name:'Recover 1 Health',minimum:1,cooldown:2},{id:'react',name:'Reduce incoming attack damage by 1',minimum:1,cooldown:2}] as const;
export const MALL_SETUPS=[
 {id:'foodcourt-faceoff',name:'Foodcourt Faceoff',girl:'Food Court · East',killer:'Food Court · West',savior:'North Railing · West',victims:{surplus:1,boards:3,'West Railing · North':1,'West Railing · South':1,'North Railing · East':1,Security:1,'East Railing':1,smokin:2,'South concourse · West':1}},
 {id:'high-score',name:'High Score!',girl:'West Railing · South',killer:'Southeast Exit',savior:'Joystick Heroes',victims:{'Service Entrance':1,joystick:1,sporting:1,'Northwest concourse':2,'North Railing · East':1,'West Railing · North':1,surplus:1,'Food Court · West':1,'Food Court · East':1,'East Railing':1,'South concourse · West':1}},
 {id:'special-delivery',name:'Special Delivery',girl:'West Railing · South',killer:'Service Entrance',savior:'Stan’s Sporting Goods',victims:{surplus:2,'West Railing · North':1,'North Railing · West':1,'North Railing · East':2,'Food Court · West':3,'Food Court · East':1,'South concourse · East':1,sporting:1}},
 {id:'black-friday',name:'Black Friday',girl:'South concourse · West',killer:'Northwest concourse',savior:'Smokin’ Subject',victims:{surplus:2,boards:2,'West Railing · South':1,zap:1,joystick:2,'Food Court · West':1,'Food Court · East':1,Atrium:1,sporting:1}},
 {id:'family-dinner',name:'Family Dinner',girl:'Northeast concourse',killer:'Northwest concourse',savior:'Food Court · West',victims:{surplus:1,boards:1,'West Railing · South':1,'North Railing · East':1,zap:1,joystick:1,'Food Court · East':2,'South concourse · East':2,smokin:2}}
] as const;
export const MALL_EVENTS=[
 {id:'flash-mob',name:'Flash Mob!',effect:'Place six new Victims at the Food Court, three on each side, then panic all Food Court Victims. Discard.'},
 {id:'bart',name:'Bart the Mall Cop',effect:'Place Bart in Security. He will not follow you. At Upkeep roll a die and move him that many spaces clockwise around the Food Court. Sharing his space costs you two Time. Entering an Enemy’s space deals two damage to that Enemy, then Bart is killed. Discard if Bart leaves play.'},
 {id:'lockdown',name:'Lockdown!',effect:'Both Exit spaces are sealed; no one can be saved or exit through them. Place the Lockdown token in Security. End the Action phase in Security to remove it and discard the Event.'},
 {id:'wet-floors',name:'Wet Floors',effect:'Whenever a Victim in a Railing space panics, roll twice and apply the lower result.'},
 {id:'food-fight',name:'Food Fight!',effect:'If you, an Ally or an Enemy enters the Food Court while at least one Victim is in either Food Court space, the entering figure receives one damage.'},
 {id:'renovations',name:'Renovations',effect:'Roll a die twice, each time placing a Destroyed Wall on an eligible wall of that store if possible: 1 Military Surplus ’R Us; 2 Boards ’N Bones; 3 Zap Shack; 4 Joystick Heroes; 5 Stan’s Sporting Goods; 6 Smokin’ Subject. Discard.'},
 {id:'girl',name:'The Savior’s Girl',effect:'The Victim closest to the Savior becomes his Girl. While she shares your space, gain one additional die when resolving Build Trust. If she dies, decrease Trust twice and increase Horror once. Discard if she leaves play.'},
 {id:'escalators',name:'Busted Escalators',effect:'Lose two Time when moving through an escalator.'},
 {id:'fire-sale',name:'Fire Sale!',effect:'Move all Victims adjacent to a store into a store. You, Allies and Enemies in a store with at least one Victim lose one Health. Discard.'},
 {id:'nerds',name:'Rise of the Nerds!',effect:'Place a new Victim in both Boards ’N Bones and Joystick Heroes. When you end the Action phase in either store with a Victim in your space, choose three Time, ignore Terror, or recover one Health.'}
] as const;
const chase='Target the Final Girl (redirected to the Savior while he remains on board), move, then attack.';
export const MALL_TERRORS=[
 {id:'twisted-bond',name:'Twisted Bond',health:2,effect:'Minor Dark Power, two Health. At Upkeep move the Savior one space closer to the Killer. Ignore this if the Savior has left play.'},
 {id:'fire-alarm',name:'Fire Alarm',effect:'Draw a Terror card. Panic all Victims twice. '+chase},
 {id:'paranoia',name:'Paranoia',effect:'If the Savior is absent, discard and draw the next Terror. Otherwise make a Horror roll: two or more successes increase Trust once; one success has no effect; no successes decrease Trust once and resolve this card again.'},
 {id:'mall-rats',name:'Mall Rats',effect:'If the Savior is absent, discard and draw the next Terror. Otherwise place two new Victims with him, immediately resolve a Savior card, then draw an Event.'},
 {id:'freight-train',name:'“It Hits Like a Freight Train!”',effect:chase+' If you or the Savior were attacked in a store or Railing space, the attacked figure loses one additional Health.'},
 {id:'collateral-damage',name:'Collateral Damage',effect:'Target the Final Girl (redirected to the Savior while on board) and move twice. For each Railing space containing a Victim that the Killer moves through, including the starting and ending spaces, push one Victim over the railing.'},
 {id:'relentless-pursuit',name:'Relentless Pursuit',effect:'Draw an Event. '+chase},
 {id:'gotta-hide',name:'“It’s Coming for Me! I Gotta Hide!”',effect:'If the Savior is absent, discard and draw the next Terror. Otherwise panic him three times, draw a Terror card, then draw an Event.'}
] as const;
export const MALL_SAVIOR_CARDS=[
 {id:'boss',name:'“You’re Not the Boss of Me!”',quantity:2,effects:['Move the Savior three spaces away from you.','Move him two spaces away from you.','Move him up to one space in any direction.','Move him up to two spaces in any direction.']},
 {id:'hang-out',name:'“I’ll Hang Out with Whomever I Want To!”',quantity:2,effects:['Move the Savior two spaces toward the Killer.','Move him one space toward the Killer.','Move him up to one space away from the Killer.','Move him up to two spaces away from the Killer.']},
 {id:'not-danger',name:'“You’re Full of Shit! I’m Not in Danger!”',quantity:1,effects:['Draw two Terror cards.','Draw one Terror card.','No effect.','Ignore Terror.']},
 {id:'needing',name:'“You Won’t Be Needing This...”',quantity:1,nearby:true,effects:['Discard two random Items; lose two Time for each you cannot discard.','Discard one random Item; lose two Time if unable.','No effect.','Gain two Time.']},
 {id:'borrowing',name:'“I’m Not Stealing... I’m Just Borrowing!”',quantity:1,effects:['Move the Savior to the nearest Search space and discard its top two Item cards.','Move him to the nearest Search space and discard its top Item card.','No effect.','Take the top card from any Item deck.']},
 {id:'hurting',name:'“Let Go, You’re Hurting Me!”',quantity:1,nearby:true,effects:['You lose two Health.','You lose one Health.','No effect.','You recover one Health.']},
 {id:'anywhere',name:'“I’m Not Going Anywhere with You!”',quantity:1,nearby:true,effects:['Lose three Time.','Lose one Time.','Gain one Time.','Gain two Time.']},
 {id:'watch',name:'“Watch This!”',quantity:1,effects:['Move him up to two spaces toward the nearest Railing; if already there he jumps over it.','Move him up to one space toward the nearest Railing; if already there he jumps over it.','No effect.','Move him up to one space in any direction.']}
] as const;
export const MALL_ITEMS=[
 {id:'rabbit',name:'Lucky Rabbit’s Foot',quantity:1,effect:'Discard in the Action phase for a Horror roll. Per success choose two Time, recover one Health, ignore Terror, or move one space.'},
 {id:'keys',name:'Chopper Keys',quantity:1,effect:'While riding the Chopper, after moving at least one space you may move up to two additional spaces. It carries you and one Victim or Ally, never enters stores. On entering an Enemy’s space you may discard it to deal four damage to the Enemy; each rider loses one Health.'},
 {id:'hackmaster',name:'Hackmaster3000',quantity:1,effect:'At Security, spend two Time to place an Alarm token in any store, at most one on the board. The Killer chooses it instead of a target; discard when the Killer enters. Two uses.'},
 {id:'knife',name:'Knife',quantity:1,effect:'One hand, range zero, one additional damage.'},
 {id:'giftcard',name:'Giftcard',quantity:2,effect:'Discard in the Action phase: take four Time worth of Action cards, or at a Search space look at the top two Item cards and take one.'},
 {id:'bat',name:'Titanium Bat',quantity:1,effect:'Two hands, range zero, one additional damage. When it damages the Killer you may immediately discard one Minor Dark Power including its remaining Health.'},
 {id:'boomstick',name:'Boomstick',quantity:2,effect:'One hand, range zero, one additional damage. Add one damage when the Enemy is blown off a Railing or through a store wall. Discard if a one is in the final Horror-roll result. One in each hand may be used together.'},
 {id:'banana',name:'Banana Peel',quantity:1,effect:'In a Railing space, spend one Time to place a Peel in your space, at most one per space. An entering Enemy falls over the railing and ends movement; discard the Peel. Two uses.'},
 {id:'beverage',name:'Caffeinated Beverage',quantity:1,effect:'Discard in the Action phase to gain four Time or move up to two spaces.'},
 {id:'cigarettes',name:'Cigarettes',quantity:1,effect:'Discard while the Savior is in your space to increase Trust once.'},
 {id:'grenade',name:'Grenade',quantity:1,effect:'Discard in the Action phase and spend two Time: deal two damage to an Enemy in an adjacent space, or destroy a wall of your current store.'},
 {id:'flower',name:'Flower Box',quantity:1,effect:'While a Boomstick is in your other hand, discard to deal two damage to an Enemy in or just entering your space. From the Backpack, discard to ignore Terror.'},
 {id:'sneakers',name:'Sneakers',quantity:1,effect:'Do not roll when voluntarily jumping from a Railing.'},
 {id:'book',name:'Self-Help Book',quantity:1,effect:'Build Trust Action cards now cost one Time.'},
 {id:'walkie',name:'Walkie-Talkie',quantity:1,effect:'Two uses: play Build Trust while not in the same space as the Savior.'},
 {id:'jacket',name:'Leather Jacket',quantity:1,effect:'Reroll any dice once when resolving Build Trust. Discard to ignore up to two damage.'}
] as const;

/** Board adjacency, excluding exterior walls and existing movement openings. */
export const MALL_WALLS=[
 {id:'boards-concourse',a:'boards',b:null,destination:'Northwest Concourse'},
 {id:'boards-surplus',a:'boards',b:'surplus',destination:null},
 {id:'zap-service',a:'zap',b:null,destination:'Service Entrance'},
 {id:'zap-joystick',a:'zap',b:'joystick',destination:null},
 {id:'joystick-security',a:'joystick',b:null,destination:'Security'},
 {id:'sporting-security',a:'sporting',b:null,destination:'Security'},
 {id:'sporting-smokin',a:'sporting',b:'smokin',destination:null},
] as const;
export const MALL_OBSERVED_ACTIONS=[{id:'ignore-terror',title:'Ignore Terror'},{id:'move-a',title:'Move'},{id:'recover',title:'Recover'},{id:'react',title:'Block'}] as const;
export const mallStoreWalls=(id:string)=>MALL_WALLS.filter(w=>w.a===id||w.b===id);
export const mallWallDestination=(wall:typeof MALL_WALLS[number],store:string)=>wall.destination??MALL_STORES.find(s=>s.id===(wall.a===store?wall.b:wall.a))!.name;
export const mallStoreMask=(fields:Record<string,unknown>,id:string)=>mallStoreWalls(id).reduce((mask,w,i)=>mask+(fields[`wall.${w.id}`]===true?2**i:0),0);

export const mallWallLabel=(id:string)=>{const w=MALL_WALLS.find(w=>w.id===id)!;return `${MALL_STORES.find(s=>s.id===w.a)!.name} ↔ ${mallWallDestination(w,w.a)}`;};
