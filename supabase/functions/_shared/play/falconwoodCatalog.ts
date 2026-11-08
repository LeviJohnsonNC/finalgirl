import { FALCONWOOD_LEADS, FALCONWOOD_MISSIONS, FALCONWOOD_PEOPLE } from './falconwood.ts';

export const FALCONWOOD_SOURCE = 'The Falconwood Files — location board, cards and mission sheets (IMG_9508–9516)';
export const FALCONWOOD_SPACES = [...FALCONWOOD_LEADS, 'Government Lab', 'Police Station', 'Shopping Mall',
  'North Exit', 'Southwest Exit', 'Southeast Exit', 'Road between Best Friend’s House and School',
  'Path south of Best Friend’s House', 'Road west of School', 'Road north of Police Station',
  'Road between Shopping Mall and Library', 'Junction west of Police Station', 'Road between Police Station and Library',
  'Path between Fanghorn Forest and Government Lab', 'Junction north of Government Lab', 'Junction south of Police Station',
  'Road between Library and Southeast Exit', 'Road east of Government Lab'];
export const FALCONWOOD_ROLES = [...FALCONWOOD_MISSIONS.map(mission => mission.friend), ...FALCONWOOD_PEOPLE].map(name => ({name}));

export const FALCONWOOD_EVENTS = [
  {id:'closed', name:'Bridge Repair', effect:'Choose a bridge and place Under Construction on it. It is unusable for the rest of the game and its endpoints are no longer adjacent.'},
  {id:'conspiracy-theorist', name:'Conspiracy Theorist', effect:'Place at the Shopping Mall. The Theorist follows into the Killer’s space and can be attacked only if no other Victims are in the space. While with you, an Enemy there that attacks you or a Victim takes 1 damage. If the Theorist is killed in your space, increase Horror by 1. Discard when the Theorist leaves play.'},
  {id:'dry', name:'Dry Spell', effect:'You can use River Crossings until it rains. Roll a d20 at the start of every Action phase. On 1–4, it rains and this Event is discarded.'},
  {id:'freaks', name:'Freaks and Geeks', effect:'One fewer Victim follows you, to a minimum of one, unless you are with a Special Victim.'},
  {id:'game-of-chance', name:'Game of Chance', effect:'Choose up to six Horror dice and roll them with a d20. If their face total is at most the d20 result, increase Horror by 2. Otherwise apply the card’s reward for dice used: 6 loses 2 Time, 5 loses 1 Time, 4 gains 1 Time, 3 gains 3 Time, 2 reduces Horror by 3, 1 reduces Horror by 6. Discard after resolving.'},
  {id:'opened', name:'Grand Opening', effect:'Cover a chosen River Crossing with the Bridge token. Its two spaces are now adjacent.'},
  {id:'head-researcher', name:'Head Researcher', effect:'Place at Government Lab. In Upkeep, kill one ordinary Victim there, then move the nearest ordinary Victim one space toward the Lab. If the Head Researcher is killed, increase Bloodlust by 2. Discard when they leave play.'},
  {id:'helping-hands', name:'Helping Hands', effect:'Apply your mission sheet’s Gain Progress effect, then discard.'},
  {id:'packed', name:'Packed Bridge', effect:'Lose 2 Time when crossing a bridge.'},
  {id:'van', name:'Pizza Delivery', effect:'Put the Van in your space. It can move with you except across River Crossings. If it stays with you for the entire move, one extra Victim may follow and movement Actions give +2 movement. The first move must be panicked.'},
] as const;

export const FALCONWOOD_TERRORS = [
  {id:'code-blue', name:'Code Blue', effect:'Target the closest eligible Victim or Final Girl, move and attack twice, then increase Horror by 1.'},
  {id:'neverending-attacks', name:'Neverending Attacks', effect:'If no Victims remain, discard and draw the next Terror. Otherwise resolve two successive Victim-targeted move-and-attack actions.'},
  {id:'retreat', name:'Retreat! Retreat!', effect:'Place the Killer in your space and roll the d20 three times. Each 1–6 causes an attack on you. Each 7–20 has no effect. If no attack happened, increase Bloodlust by 1.'},
  {id:'run-up-that-hill', name:'Run! Up That Hill!', effect:'Target the Final Girl, move and attack, then increase Horror by 1.'},
  {id:'scared', name:'You Scared the Crap Out of Me!', effect:'Place two new Victims at Fanghorn Forest, increase Horror by 1 and reveal an Event.'},
  {id:'changing-room', name:'Were You Two in the Changing Room This Whole Time?', effect:'Place two new Victims at the Community Pool and reveal an Event.'},
  {id:'indecision', name:'This Indecision’s Bugging Me!', effect:'Choose one: apply the mission’s Lose Progress effect, discard a random Item, or increase Horror by 2. Then reveal an Event.'},
  {id:'make-out-closet', name:'I Saw Them Leaving the Make-Out Closet.', effect:'Place two new Victims at the School and reveal an Event.'},
  {id:'hunt', name:'Survive the Hunt', effect:'Only used with this mission. Start the Hunt when this card is resolved, including before another effect discards it. The reveal itself records no casualties.'},
] as const;

export const FALCONWOOD_MISSION_ITEMS = [
  {name:'Spell Book', effect:'One hand. Discard in the Action phase. Choose an adjacent space and roll a d20. Everyone there takes 2 damage on 1–10, 4 damage on 11–19 or 8 damage on 20.'},
  {name:'Telekinesis', effect:'Two uses. When attacked, lose 1 Health to ignore all damage, move the attacker to an adjacent space and deal 1 damage. Does not count against Backpack capacity.'},
] as const;

export const FALCONWOOD_ITEMS = [
  {name:'AK-47', effect:'Two uses, range 0–1, two hands. Once per Action phase, pay 3 Time without an Action card to deal 3 damage to one Enemy or 1 damage to each Enemy in range.'},
  {name:'Army Knife', effect:'One hand, range 0, +1 damage.'},
  {name:'Axe', effect:'Two hands, range 0, +2 damage.'},
  {name:'Binoculars', effect:'Once per turn at or adjacent to a Search space, spend 1 Time to look at its top two Item cards and return each to the top or bottom in any order.'},
  {name:'Dragon’s Breath', effect:'One hand. Discard in the Action phase to deal 3 damage to one Enemy in your space or an adjacent one.'},
  {name:'First Aid Kit', effect:'One hand. Recover 1 extra Health when using an Action card to recover Health.'},
  {name:'Flamethrower', effect:'Two uses, range 0–1, two hands. Must stay in your hands and Backpack must be empty. Once in the Action phase, deal half the Killer’s current Health as damage, rounded down, or kill all Minions in your space.'},
  {name:'Lucky Dragon’s Foot', effect:'Discard during Action and roll a d20. On 1–5 choose one effect, 6–10 two, 11–15 three or 16–20 four. Repeat choices allowed. Each choice gains 2 Time, recovers 1 Health, reduces Horror by 1, or moves 1 space.'},
  {name:'Old Revolver', effect:'One hand, range 1, +1 damage. Only modifies Weak Attack.'},
  {name:'Pool Noodle', effect:'You may use River Crossings, but only one Victim may follow.'},
  {name:'Shock Stick', effect:'One hand, range 0, +1 damage. When you damage an Enemy, you may move it to an adjacent space.'},
  {name:'Shotgun', effect:'Two uses, range 1, two hands. Spend 1 Time for a Horror Roll without using an Action card. On a success, deal 3 damage to one Enemy in range.'},
  {name:'Slingshot', effect:'Three uses, range 1, two hands, +1 damage. Only modifies Weak Attack or Furious Strike. Keep it when empty. Remove a Search card in your hand from the game to replenish its uses.'},
  {name:'Trashcan Lid', effect:'One hand, three uses. Ignore 1 damage per use.'},
  {name:'Waffles', effect:'Discard in the Action phase to reduce Horror by 1 or recover 2 Health.'},
  {name:'Wooden Bat', effect:'Two hands, range 0, +1 damage.'},
] as const;

export const FALCONWOOD_MISSION_RULES = [
  {id:'father', setup:'Put the three blank tokens face down in the pool. Place two key tokens face down at each of Government Lab, Shopping Mall and Best Friend’s House. Set aside Adopted Father.',
    progress:'End a move on a token space and discard Search to add both tokens to the pool. Once per Action phase at Police Station, spend 1 Time per draw. Stop at the second blank or when out of Time, or stop voluntarily sooner. On the second blank, end Action and return all tokens drawn that attempt. Otherwise remove drawn blanks and bank the keys.',
    complete:'Bank three keys by default. Put Adopted Father at Police Station and choose one Item from its deck, then shuffle the remaining Items.',
    gain:'Require one fewer key.', loss:'Require one additional key.',
    friend:'In your space, convert one partial success to a success when resolving a damage Action and deal 1 extra damage. If killed in your space, increase Horror by 2.'},
  {id:'friend', setup:'Shuffle the six nonblank tokens and place one face down at each named non-Search space. Set aside Best Friend, Spell Book and the reference card.',
    progress:'End a move on a token and spend 1 Time to reveal it. Keep one of each letter, discarding duplicates. A1 is east, A2 west, B1 north, B2 south, C1 first and C2 last alphabetically. Place Best Friend prone at the resulting named space. Enemies and effects ignore them while prone.',
    complete:'Go to the space and discard a health-recovery Action to revive Best Friend. Take Spell Book and set Horror to 0.',
    gain:'Reveal a chosen token and keep it unless its letter is a duplicate.', loss:'Return one held clue to the space farthest from you.',
    friend:'Horror cannot increase while Best Friend is in your space. If Best Friend is killed, increase Horror by 4.'},
  {id:'hunt', setup:'Set aside Kind Scientist, Telekinesis and four Agents. Build the Terror deck with one fewer ordinary card and shuffle Survive the Hunt into the first seven, placing it among the top eight.',
    progress:'Resolving the Hunt Terror, including before it is discarded, places one Agent at Town Fair, Shopping Mall, Government Lab and Best Friend’s House. Each Agent has 1 Health, Movement 2 and Attack 2. At the end of each Killer phase, each targets the Final Girl, moves and attacks. Victims on Agent spaces panic. Use Minion attack rules against Agents, though they are separate from Minions.',
    complete:'Defeat every Agent. Put Kind Scientist in your space, take Telekinesis, recover 3 Health and reduce Horror by 2.',
    gain:'Before the trigger, start with three Agents and choose the omitted space. After the trigger, kill one chosen Agent.', loss:'Agents have Attack 3.',
    friend:'In your space, convert one partial success to a success when resolving a Health recovery Action and recover 1 extra Health.'},
  {id:'lab', setup:'Put three random numbered tokens face down at Government Lab. Set aside three other numbered tokens, Reporter and the reference card.',
    progress:'Enter Government Lab to reveal the first token. Place it at its numbered reference space. Only one revealed token can be out. End a move there and discard Search to recover it, then reveal and place the next available Lab token.',
    complete:'End movement at Police Station and discard the required recovered tokens, normally three. Place Reporter there and choose two Items from its deck, then shuffle the rest.',
    gain:'Require one fewer token.', loss:'Add a fourth token to Government Lab and require one more for delivery.',
    friend:'In your space, convert one partial success to a success when resolving Search and draw and keep one extra Item. While Reporter is in play, reveal each Item deck’s top card.'},
  {id:'code', setup:'Shuffle the six numbered tokens and place one face down at each named non-Search space. Set aside Jockette and the d20.',
    progress:'End a move on a token and spend 1 Time to reveal and collect its value. At Shopping Mall during Action, spend 3 Time to roll the d20 and add the collected values. An unsuccessful attempt can be retried when you can pay again.',
    complete:'Reach at least 20 with the die and token total. Place Jockette at Shopping Mall, choose one Item from its deck and shuffle the rest.',
    gain:'Reveal and collect a chosen token.', loss:'Return your highest collected value to the space farthest from you.',
    friend:'In your space, convert one partial success to a success on movement Actions and take one extra follower. You can use River Crossings while with Jockette.'},
] as const;

export const FALCONWOOD_SETUPS = [
  {name:'New Year’s Eve', finalGirl:'Southwest Exit', killer:'Shopping Mall', victims:{
    'Best Friend’s House':3, 'Fanghorn Forest':2, 'Junction north of Government Lab':2, 'Police Station':3, 'Road between Library and Southeast Exit':2}},
  {name:'Election Day', finalGirl:'Southeast Exit', killer:'Fanghorn Forest', victims:{
    'Road west of School':2, 'Government Lab':2, 'Road east of Government Lab':2, 'Police Station':2, Library:2, 'Shopping Mall':2}},
  {name:'Halloween', finalGirl:'Junction west of Police Station', killer:'Junction south of Police Station', victims:{
    'Best Friend’s House':2, 'Road between Best Friend’s House and School':2, 'Fanghorn Forest':2, 'Road north of Police Station':2,
    'Shopping Mall':2, 'Road between Library and Southeast Exit':2}},
  {name:'4th of July Weekend', finalGirl:'Junction north of Government Lab', killer:'Road between Police Station and Library', victims:{
    'Best Friend’s House':1, 'Road west of School':1, 'Junction west of Police Station':1, 'Path between Fanghorn Forest and Government Lab':1,
    'Shopping Mall':2, 'Community Pool':3, 'Town Fair':3}},
  {name:'Back to School', finalGirl:'Road between Library and Southeast Exit', killer:'Junction north of Government Lab', victims:{
    School:3, 'Fanghorn Forest':2, 'Government Lab':1, 'Police Station':2, Library:3, 'Shopping Mall':1}},
] as const;

export const falconwoodSetupDescription = (setup: typeof FALCONWOOD_SETUPS[number]) =>
  `Final Girl starts at ${setup.finalGirl}. Killer starts at ${setup.killer}. Victims: ${Object.entries(setup.victims).map(([space, count]) => `${space} ×${count}`).join(', ')}.`;
