/** Factual paraphrases from the owner's FF16 photos, supplied 2026-10-18.
 * Originals stay outside the repository. See docs/BUDDYLAND_PLAY.md. */
export const BUDDIES = [
  {
    id: "toby",
    name: "Toby",
    health: 3,
    attack: 1,
    movement: 1,
    initiative: 1,
    reward: "Gain 2 Time.",
    ability: "A Victim killed by Toby adds one extra Bloodlust.",
  },
  {
    id: "ramey",
    name: "Ramey",
    health: 2,
    attack: 1,
    movement: 2,
    initiative: 2,
    reward: "Move 1 space.",
    ability: "",
  },
  {
    id: "allie",
    name: "Allie",
    health: 2,
    attack: 2,
    movement: 1,
    initiative: 3,
    reward: "Reduce Horror by 1.",
    ability: "",
  },
  {
    id: "cam",
    name: "Cam",
    health: 2,
    attack: 1,
    movement: 1,
    initiative: 4,
    reward: "Take a Guard card.",
    ability: "Victims do not panic when Cam is the only Enemy in their space.",
  },
  {
    id: "roxy",
    name: "Roxy",
    health: 1,
    attack: 1,
    movement: 3,
    initiative: 5,
    reward: "Take any top Item card.",
    ability: "",
  },
  {
    id: "billy-jr",
    name: "Billy Jr.",
    health: 2,
    attack: 1,
    movement: 0,
    initiative: 6,
    reward: "Deal 1 damage to Billy.",
    ability: "Always shares Billy’s space.",
    special: true,
  },
  {
    id: "boris",
    name: "Boris",
    health: 4,
    attack: 3,
    movement: 2,
    initiative: 7,
    reward: "Take any Action card.",
    ability: "",
    special: true,
  },
] as const;
export const BILLY_POWERS = [
  {
    id: "endless-power",
    name: "Endless Power",
    effect:
      "When Billy’s Final Health token is revealed, reveal one additional Final Health token for each Active Power Source. Apply the token that recovers the most Health.",
  },
  {
    id: "deathlust",
    name: "Deathlust",
    effect: "Billy gains 1 Movement and 1 Attack.",
  },
  {
    id: "introducing-billy-jr",
    name: "Introducing... Billy Jr.!",
    effect: "Spawn Billy Jr. in Billy’s space.",
  },
  {
    id: "merciless-minions",
    name: "Merciless Minions",
    effect:
      "Epic Dark Power: add a Move before the Attack in the Finale’s Minion Action.",
  },
  {
    id: "renewable-energy",
    name: "Renewable Energy",
    health: 2,
    effect:
      "Minor Dark Power: Active Power Sources cannot be deactivated while this power remains in play.",
  },
  {
    id: "backup-generator",
    name: "Backup Generator",
    health: 2,
    effect:
      "Minor Dark Power: during Upkeep, activate an Inactive Power Source of your choice if possible. When one is activated this way, remove 1 Health from this card.",
  },
] as const;
const minionAction =
  "Minions target the closest Final Girl or Victim, move and attack.";
export const BILLY_FINALES = [
  {
    id: "showtime",
    name: "It’s Showtime!",
    effect:
      "Minions target the Final Girl, move and attack. Billy resolves his battery-heart effect, targets the closest Final Girl or Victim, moves twice and attacks. Reaction cards cannot be played while more than one Enemy shares your space.",
  },
  {
    id: "sizzling-power",
    name: "Sizzling Power",
    effect: `${minionAction} Billy resolves his battery-heart effect, targets the closest Final Girl or Victim, moves and attacks. If a Power Source is Active, repeat Billy’s Killer Action once.`,
  },
  {
    id: "encore",
    name: "Encore",
    effect: `${minionAction} Billy resolves his battery-heart effect, targets the Final Girl, moves twice and attacks twice.`,
  },
  {
    id: "power-surge",
    name: "Power Surge",
    effect: `Epic Finale: spawn Boris when revealed. Both Billy and Boris must be defeated to win. ${minionAction} Billy resolves his battery-heart effect, targets the closest Final Girl or Victim, moves and attacks twice.`,
  },
] as const;
export const BUDDYLAND_ITEMS = [
  {
    id: "energy-drink",
    name: "Energy Drink",
    effect:
      "Discard during the Action phase to gain 5 Time or move up to 2 spaces.",
  },
  {
    id: "claw-machine-token",
    name: "Claw Machine Token",
    effect:
      "Discard in an Arcade space to choose an unused Item card and take it.",
  },
  {
    id: "janitors-mop",
    name: "Janitor’s Mop",
    effect:
      "Two hands, range 0, +1 damage. Once per Action phase while alone in a space, spend 2 Time to reduce Horror by 1.",
  },
  {
    id: "bag-of-marbles",
    name: "Bag of Marbles",
    uses: 3,
    effect:
      "Spend 1 Time to place a Marbles token in an adjacent space without one. The next entrant loses 1 Health and the token is discarded.",
  },
  {
    id: "leftover-pizza",
    name: "Leftover Pizza",
    uses: 2,
    effect:
      "During the Action phase, use to reduce Horror by 1 or recover 2 Health.",
  },
  {
    id: "skee-ball-token",
    name: "Skee-Ball Token",
    uses: 4,
    loadInArcade: true,
    effect:
      "One hand, range 1, +1 damage. Load the four Skee-Balls only when in an Arcade space. Roll 1 additional die when attacking with a Skee-Ball.",
  },
  {
    id: "fire-axe",
    name: "Fire Axe",
    effect:
      "Two hands, range 0, +1 damage. Against Minions the damage modifier is +2 instead.",
  },
  {
    id: "pinball-machine-token",
    name: "Pinball Machine Token",
    effect:
      "Discard in an Arcade space to roll 1 additional die when resolving Action cards for the rest of the Action phase.",
  },
  {
    id: "flash-camera",
    name: "Flash Camera",
    uses: 2,
    effect:
      "When an Enemy would enter your space, use this to stop it in an adjacent space instead.",
  },
  {
    id: "birthday-cake",
    name: "Birthday Cake",
    uses: 2,
    effect: "Use to ignore a Terror card during the Killer phase.",
  },
  {
    id: "security-bot",
    name: "Security Bot",
    effect:
      "Place the Bot in your space. You may spend your movement effects on the Bot instead. Up to two Victims can follow it, and Victims sharing an Exit with it can be saved.",
  },
  {
    id: "security-badge",
    name: "Security Badge",
    effect:
      "Take Planning when acquired. Victims sharing your space never panic.",
  },
  {
    id: "food-tray",
    name: "Food Tray",
    uses: 4,
    effect: "One hand. Ignore 1 damage per use.",
  },
  {
    id: "chain",
    name: "Chain",
    effect:
      "One hand, range 0–1, +1 damage. After damaging an Enemy, discard this in its space to prevent its movement and attacks until the end of the Killer phase.",
  },
  {
    id: "extension-cord",
    name: "Extension Cord",
    effect:
      "One hand, range 0–1, +1 damage. From an Arcade space or an adjacent space, you may attack any Arcade space regardless of range.",
  },
  {
    id: "arcade-token",
    name: "Arcade Token",
    effect:
      "Discard in an Arcade space and spend 3 Time to reduce Horror by 3.",
  },
] as const;
export const BUDDYLAND_EVENTS = [
  {
    id: "hidden-prizes",
    name: "Hidden Prizes",
    effect:
      "Discard all faceup Item cards from the Item decks, then discard this Event.",
  },
  {
    id: "party-time",
    name: "Party Time",
    effect:
      "Move all Victims one space closer to the Party Room, then discard this Event.",
  },
  {
    id: "broken-machine",
    name: "Broken Machine",
    effect:
      "If any Victims occupy Arcade spaces, Enemies targeting a Victim or the Final Girl/Victims move toward the nearest Victim in an Arcade space. Discard when a Victim in an Arcade space is killed.",
  },
  {
    id: "tragic-collapse",
    name: "Tragic Collapse",
    effect:
      "Roll a die and place the Broken token: 1–2 Jungle Gym, 3–4 Kitchen, 5–6 Bathroom. Everyone there or later entering that space takes 1 damage. Discard the Event after placing the token; the token remains relevant.",
  },
  {
    id: "playtime-shenanigans",
    name: "Playtime Shenanigans",
    effect:
      "Add two Victims to the Ball Pit and two to the Jungle Gym, then discard the Event.",
  },
  {
    id: "buddy-up",
    name: "Buddy Up",
    effect:
      "Save at least two Victims at a time. Discard Improvise or Distraction to ignore this restriction for the entire Action phase.",
  },
  {
    id: "sing-a-long",
    name: "Sing-A-Long",
    effect:
      "During each Upkeep, draw a Terror card. Discard this Event when Horror reaches the red area.",
  },
  {
    id: "nick-the-janitor",
    name: "Nick the Janitor",
    effect:
      "Place white Special Victim Nick in the Janitor’s Closet. He follows you into the Killer’s space. When he enters an Enemy’s space, deal 2 damage to that Enemy, then remove Nick until next Upkeep, when he returns to the Closet. His death adds 2 Bloodlust. Discard when he leaves play.",
  },
  {
    id: "birthday-girl",
    name: "Birthday Girl",
    effect:
      "Place the blue Special Victim in the Party Room. She panics if alone in the Panic phase. Saving her gains 4 Time; her death adds 2 Bloodlust. Discard when she leaves play.",
  },
  {
    id: "pizza-delivery",
    name: "Pizza Delivery",
    effect:
      "The Victim closest to an Entrance becomes the orange Pizza Guy. While he shares your space, roll 2 extra dice for Search. His death immediately panics Victims in his space and adjacent spaces. Discard when he leaves play.",
  },
] as const;
export const BUDDYLAND_TERRORS = [
  {
    name: "How’d they sneak in?",
    location: "Buddyland",
    effect:
      "Roll three dice, adding one Victim per die: 1–2 Jungle Gym, 3–4 Dining Area, 5–6 Party Room. Draw an Event.",
  },
  {
    name: "No Time for Games",
    location: "Buddyland",
    effect:
      "Target the closest Final Girl or Victim and move. Roll a die: 1, increase Horror or lose 1 Health and roll again; 2, increase Horror or lose 1 Health; 3–4, increase Horror twice; 5, all Enemies target the closest Final Girl or Victim and attack; 6, no effect.",
  },
  {
    name: "Panic at the Disco",
    location: "Buddyland",
    effect:
      "With no Victims in Arcade spaces, replace this card. Otherwise panic Victims in every Arcade space. A Victim panicking into an Enemy’s space dies. If none died, add 1 Bloodlust.",
  },
  {
    name: "Earthquake!",
    location: "Buddyland",
    effect:
      "Panic everyone, including the Final Girl and Enemies. Draw an Event. Target the closest Final Girl or Victim, move twice and attack.",
  },
  {
    name: "Hungry for Blood",
    location: "Buddyland",
    effect:
      "With no Victims in the Kitchen, Party Room or Dining Area, replace this card. Otherwise place the Killer in whichever of those rooms has the most Victims, target the closest Final Girl or Victim and attack twice.",
  },
  {
    name: "They want her!",
    location: "Buddyland",
    effect:
      "Panic Victims in your space. Move every Enemy one space toward you. Increase Horror once per Enemy sharing your space. Draw an Event.",
  },
  {
    name: "It’s play time!",
    location: "Buddyland",
    effect:
      "Roll a die: 1–3, place the Killer with its closest target; 4–6, target the closest Final Girl or Victim and attack. Repeat five more times, reducing repeats by one per Action card discarded beforehand.",
  },
  {
    name: "Solitary Danger",
    location: "Buddyland",
    effect:
      "Target the Final Girl, move twice and attack. If the Killer is not then in your space, it recovers 2 Health.",
  },
  {
    name: "Do the splits",
    killer: "Billy the Bear",
    copies: 2,
    effect:
      "Buddies target the closest Final Girl or Victim and move. Billy targets a Victim, moves and attacks, then targets the Final Girl, moves and attacks.",
  },
  {
    name: "It’s a short circuit!",
    killer: "Billy the Bear",
    effect:
      "With no Victims sharing an Active Power Source, replace this card. At each Active source with Victims, kill one Victim, panic the remaining Victims there and deactivate that source.",
  },
  {
    name: "Eyes in the dark",
    killer: "Billy the Bear",
    effect:
      "Target the Final Girl and move twice. Increase Horror by the number of Enemies in your space and adjacent spaces, capped by the number of Active Power Sources.",
  },
  {
    name: "He’s turning them back on!",
    killer: "Billy the Bear",
    effect:
      "With no Inactive Power Sources, replace this card. Otherwise place Billy at the closest Inactive source, activate it, then draw a Terror card.",
  },
  {
    name: "Power Surge",
    killer: "Billy the Bear",
    effect:
      "Place a new Active Power Source in Billy’s space, then draw a Terror card.",
  },
  {
    name: "They’re here for blood!",
    killer: "Billy the Bear",
    effect:
      "With no Buddies or no Victims, replace this card. Otherwise Buddies target a Victim, move and attack. Add 2 Bloodlust if at least one Victim died.",
  },
  {
    name: "Regroup",
    killer: "Billy the Bear",
    effect:
      "Place all Buddies in Billy’s space. If none are there, add 1 Bloodlust. Draw two Terror cards.",
  },
  {
    name: "Tra la la!",
    killer: "Billy the Bear",
    copies: 2,
    effect:
      "Buddies target the closest Final Girl or Victim, move and attack. Billy then targets the Final Girl, moves and attacks.",
  },
  {
    name: "Surprise!",
    killer: "Billy the Bear",
    copies: 2,
    effect:
      "Enemies target the closest Final Girl or Victim, move twice and attack. Billy then targets the Final Girl and moves once.",
  },
  {
    name: "They’re alive!",
    killer: "Billy the Bear",
    effect:
      "With no Buddies, replace this card. Otherwise Buddies target the closest Final Girl or Victim, move and attack. Add 2 Bloodlust if at least one Victim died.",
  },
  {
    name: "Animatronical",
    killer: "Billy the Bear",
    effect: "Spawn a Buddy, then draw the next Terror card.",
  },
] as const;

export const BUDDYLAND_ROOMS = [
  "Arcade",
  "Dining Area",
  "Party Room",
  "Kitchen",
  "Prize Counter",
  "Janitor’s Closet",
  "Bathroom",
  "Jungle Gym",
  "Ball Pit",
] as const;
export const SPECIAL_VICTIMS = [
  { id: "nick", name: "Nick the Janitor" },
  { id: "birthday-girl", name: "Birthday Girl" },
  { id: "pizza-guy", name: "Pizza Guy" },
] as const;
export const FINAL_GIRL_REWARDS = {
  Rena: [
    "Take a Guard card",
    "Take any top Item card",
    "Recover 1 Health",
    "Reduce Horror by 1",
    "Move 1 space",
  ],
  Gwynn: [
    "Reduce Horror by 1",
    "Reduce Horror by 1",
    "Reduce Horror by 1",
    "Reduce Horror by 1",
  ],
} as const;
