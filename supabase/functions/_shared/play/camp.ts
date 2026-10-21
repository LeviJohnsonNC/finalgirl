/** Owner photographs IMG_9319–IMG_9325, October 20, 2026.
 * Factual paraphrases for a narrative companion, not automatic rules resolution.
 * Repeated cards share one catalog entry; copy counts do not simulate a deck.
 */
export const HANS_VISUAL =
  "Hans is an exceptionally tall, heavily built human butcher wearing a rigid iron pig mask with pointed ears, a broad metal snout, uneven tusks and glowing red eye openings. The mask is scuffed metal, never fleshy latex. He wears a stained red butcher’s apron over a pale rolled-sleeve shirt and brown trousers. His signature weapon is a heavy two-handed sledgehammer, never a cleaver. His movement is deliberate and brutally economical. Preserve this identity in lifelike photographic scenes.";
export const HANS_POWERS = [
  {
    id: "blood-frenzy",
    name: "Blood Frenzy",
    epic: true,
    effect: "Epic Dark Power. Each Victim Hans kills adds one extra Bloodlust.",
  },
  {
    id: "dark-obsession",
    name: "Dark Obsession",
    effect:
      "Whenever Hans attacks the Final Girl at least once, he attacks her one additional time.",
  },
  {
    id: "feed",
    name: "Feed",
    effect: "Whenever Hans kills a Victim, he recovers one Health.",
  },
  {
    id: "sledgehammer-massacre",
    name: "Sledgehammer Massacre",
    effect:
      "For each attack effect, Hans attacks the Final Girl and every Victim in his space once.",
  },
] as const;
export const HANS_FINALES = [
  {
    id: "bloodbath",
    name: "Bloodbath",
    effect:
      "Killer Action: target the closest Final Girl or Victim, move, then attack twice.",
  },
  {
    id: "butcher-bloodlust",
    name: "Butcher Bloodlust",
    effect:
      "Killer Action: increase Bloodlust, then target the closest Final Girl or Victim, move and attack.",
  },
  {
    id: "dark-darker-darkest",
    name: "Dark, Darker, Darkest",
    effect:
      "When revealed, draw a second Dark Power. Killer Action: target the closest Final Girl or Victim, move and attack.",
  },
] as const;
export const HANS_MINOR_POWERS = [
  {
    id: "unholy-rage",
    name: "Unholy Rage",
    health: 2,
    effect:
      "Minor Dark Power with two Health markers. Hans deals one additional damage for each Health marker remaining on this card.",
  },
  {
    id: "unholy-speed",
    name: "Unholy Speed",
    health: 2,
    effect:
      "Minor Dark Power with two Health markers. Hans moves one additional space for each Health marker remaining on this card.",
  },
] as const;
export const HANS_TERRORS = [
  {
    name: "Dark Feast",
    effect:
      "Increase Horror by one. Hans recovers one Health for each dead Victim.",
  },
  {
    name: "Hans wants me. He's always wanted me.",
    effect: "Target the Final Girl, move and attack.",
  },
  {
    name: "He just came out of nowhere!",
    effect:
      "Place Hans with the farthest possible target, then increase Horror by one and draw another Terror card.",
  },
  {
    name: "He just keeps coming!",
    effect:
      "Increase Horror by one, then target the closest Final Girl or Victim, move and attack.",
  },
  {
    name: "He kept swinging his hammer and killing and killing...",
    effect:
      "If there are no Victims, replace this card. Otherwise target a Victim, move and attack, then target a Victim, move and attack again.",
  },
  {
    name: "He wants fresh blood!",
    effect:
      "If there are no Victims, replace this card. Otherwise target a Victim, move and attack.",
  },
  {
    name: "He's just...standing there!",
    effect:
      "Increase Horror by two, then target the closest Final Girl or Victim and move twice.",
  },
  {
    name: "Horrific Hammer Rush",
    effect:
      "If there are no Victims, replace this card. Otherwise target a Victim, move twice and attack twice. Increase Horror by one for each Victim killed during this attack.",
  },
  {
    name: "Taking Souvenirs",
    effect:
      "If there are no Victims, replace this card. Otherwise target a Victim, move twice and attack twice. Each Victim killed during this Killer phase adds one extra Bloodlust.",
  },
  ...HANS_MINOR_POWERS.map((power) => ({
    name: power.name,
    effect: power.effect,
  })),
].map((card) => ({
  ...card,
  killer: "Hans",
  source: "Owner photo IMG_9321.jpg",
}));
export const CAMP_ROOMS = [
  "Cabins",
  "Cliff",
  "Dock",
  "Firepit",
  "Lake",
  "Makeout Point",
  "Utility Shed",
] as const;
export const CAMP_TUNNEL_ROOMS = ["Cabins", "Dock", "Utility Shed"] as const;
export const CAMP_VICTIMS = [
  { id: "boyfriend", name: "Boyfriend", event: "Boyfriend" },
  { id: "girlfriend", name: "Girlfriend", event: "Girlfriend" },
  { id: "the-damned", name: "The Damned", event: "Vengeance" },
] as const;
export const CAMP_EVENTS = [
  {
    id: "boyfriend",
    name: "Boyfriend",
    effect:
      "The Victim closest to the Final Girl becomes her Boyfriend. If he dies in her space, she starts the next Action phase with 12 Time. Discard when he leaves play.",
  },
  {
    id: "clingy-campers",
    name: "Clingy Campers",
    effect:
      "The first Victim saved during an Action phase has no penalty. The Final Girl loses one Health for each additional Victim saved during that phase.",
  },
  {
    id: "dark-waters",
    name: "Dark Waters",
    effect:
      "Place the Dark Waters token at the Lake. Kill all Victims there; a Victim entering the Lake is killed immediately.",
  },
  {
    id: "deathwish",
    name: "Deathwish",
    effect:
      "During Upkeep, move the Victim closest to the Killer one space towards the Killer. Do not move a Victim already sharing the Killer’s space.",
  },
  {
    id: "fresh-meat",
    name: "Fresh Meat",
    effect:
      "Add two Victims to each of the Cabins, Dock and Firepit, then discard this Event.",
  },
  {
    id: "girlfriend",
    name: "Girlfriend",
    effect:
      "The closest Victim becomes the Girlfriend and will follow the Final Girl into the Killer’s space. While they share a space, roll one extra die for each Horror Roll. If she dies in the Final Girl’s space, increase Horror by five. Discard when she leaves play.",
  },
  {
    id: "secret-tunnel",
    name: "Secret Tunnel",
    effect:
      "Choose two of Cabins, Dock and Utility Shed. The Final Girl may move between the chosen spaces as though adjacent. Enemies cannot use the tunnel.",
  },
  {
    id: "star-crossed-lovers",
    name: "Star Crossed Lovers",
    effect:
      "When exactly two Victims share a space and one is killed, the other immediately dies too.",
  },
  {
    id: "stubborn-kids",
    name: "Stubborn Kids",
    effect: "One fewer Victim follows the Final Girl.",
  },
  {
    id: "vengeance",
    name: "Vengeance",
    effect:
      "The Victim farthest from the Killer becomes The Damned. Whenever the Killer chooses a target, choose The Damned instead. The Damned can only be saved as the last Victim alive. If The Damned dies, increase Bloodlust by two. Discard when The Damned leaves play.",
  },
] as const;
export const CAMP_TERRORS = [
  {
    name: "Fire!",
    effect:
      "Roll a die: 1–2 Cabins, 3–4 Utility Shed, 5–6 Dock. Kill every Victim there and discard all Item cards from that space. The Final Girl or each Enemy there loses one Health. This card does not establish a persistent burning space.",
  },
  {
    name: "I fell asleep. What did I miss?",
    effect: "Add one Victim at the Cabins, then increase Horror by two.",
  },
  {
    name: "Let's go see if the rumors are true!",
    effect:
      "Add two Victims where the Killer started the game, increase Horror by one, then draw an Event.",
  },
  {
    name: "Maybe things are starting to go our way!",
    effect: "Draw the top card of any Item deck.",
  },
  {
    name: "Run for your life!",
    effect:
      "If there are no Victims, replace this card. Otherwise panic all Victims outside the Final Girl’s space, target the closest Final Girl or Victim and attack, then target a Victim and move.",
  },
  {
    name: "That girl, What's-Her-Name... She can help us!",
    effect:
      "Add two Victims where the Final Girl started the game, increase Horror by one, then draw an Event.",
  },
  {
    name: "What's that noise? Let's go and see!",
    effect:
      "If there are no Victims, replace this card. Otherwise move all Victims one space towards the closest Enemy, then target the closest Final Girl or Victim and attack, then target a Victim and move.",
  },
  {
    name: "You can't save us... No one can!",
    effect:
      "If there are no Victims, replace this card. Otherwise panic every Victim sharing the Final Girl’s space twice, then target the closest Final Girl or Victim and attack, then target a Victim and move.",
  },
].map((card) => ({
  ...card,
  location: "Camp Happy Trails",
  source: "Owner photo IMG_9323.jpg",
}));
export const CAMP_ITEMS = [
  {
    name: "Aluminum Bat",
    effect:
      "Two-handed melee weapon, one damage. When it wounds the Killer, immediately discard one Minor Dark Power and all its remaining Health markers.",
  },
  {
    name: "Archery Bow",
    effect:
      "Two-handed ranged weapon, range one to two, one damage, three arrows. Used alone, without modifying an Action card. Cannot attack an Enemy in the same space; spend two Time to fire an arrow.",
  },
  { name: "Axe", effect: "Two-handed melee weapon dealing two damage." },
  {
    name: "Bear Trap",
    effect:
      "Spend two Time to place it in the current space, never the Lake, then discard the card. When the Killer enters that space, discard the token, immediately end the Killer phase and deal two damage to the Killer.",
  },
  {
    name: "Energy Drink",
    effect:
      "Discard during the Action phase to gain three Time or move one space.",
  },
  {
    name: "Fireworks",
    effect:
      "Spend two Time to place the Fireworks token in the current space or an adjacent space, never the Lake, then discard the card. Whenever the Killer chooses a target, choose the Fireworks instead. Discard the token when the Killer enters its space.",
  },
  {
    name: "First Aid Kit",
    effect:
      "While equipped, each Action card used to recover Health recovers one additional Health.",
  },
  {
    name: "Flashlight",
    effect:
      "Once per Action phase, spend one Time to look at the top Terror card, then leave it on top or place it on the bottom.",
  },
  { name: "Knife", effect: "One-handed melee weapon dealing one damage." },
  { name: "Lucky Dice", effect: "Discard to reroll any or all of the dice." },
  {
    name: "Lucky Rabbit’s Foot",
    effect:
      "Discard during the Action phase to make a Horror Roll. For each success, choose: gain two Time, recover one Health, reduce Horror by one, or move one space.",
  },
  {
    name: "Map",
    effect:
      "Discard during the Action phase. For each Item deck, reveal its top card if facedown; if already faceup, you may remove it from the game and reveal the next card.",
  },
  {
    name: "Motor Boat Keys",
    effect:
      "Place the Motor Boat token at the closest space bordering the water. Spend two Time to use the boat to travel to any other space bordering the water. Victims may accompany the Final Girl.",
  },
  {
    name: "Mysterious Pills",
    effect:
      "Discard during the Action phase to reduce Horror by one or recover two Health.",
  },
  {
    name: "Old Revolver",
    effect:
      "One-handed ranged weapon, range one, one damage. Can only modify a Weak Attack Action card.",
  },
  {
    name: "Pepper Spray",
    effect:
      "If the Killer shares the Final Girl’s space, discard immediately to end the Killer phase, ignoring remaining movement, attacks and other effects.",
  },
  {
    name: "Trashcan Lid",
    effect: "One-handed shield with three uses. Ignore one damage per use.",
  },
  {
    name: "Whistle",
    effect:
      "Spend one Time, once per Action phase, to move every Victim in an adjacent space into the Final Girl’s space. Then all Enemies target the Final Girl and move. While the Whistle is equipped, one additional Victim follows her.",
  },
] as const;
export const CAMP_SETUPS = [
  {
    name: "Capture the Flag",
    description:
      "Several pairs of Victims are spread around camp. The Final Girl starts at Makeout Point and the Killer on the path between the Dock and Firepit. Follow the printed Setup card for exact spaces.",
  },
  {
    name: "Meditation Hour",
    description:
      "Victims are spread around the lake, with a pair near Makeout Point. The Killer begins in the Lake and the Final Girl on the path near the western Exit. Follow the printed Setup card for exact spaces.",
  },
  {
    name: "Skinny Dipping",
    description:
      "Two Victims begin in the Lake; the others are distributed around camp. The Final Girl begins at the Dock and the Killer on the path east of the Lake. Follow the printed Setup card for exact spaces.",
  },
  {
    name: "The Bonfire",
    description:
      "Six Victims gather at the Firepit, with the remaining Victims scattered around camp. The Final Girl starts on the path southeast of the Lake and the Killer on the path northwest of the Cabins. Follow the printed Setup card for exact spaces.",
  },
  {
    name: "Treasure Hunt!",
    description:
      "Several pairs of Victims are scattered around camp. The Final Girl begins on the path near the western Exit and the Killer on the path northeast of the Lake. Follow the printed Setup card for exact spaces.",
  },
] as const;
