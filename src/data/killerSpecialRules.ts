/**
 * Special gameplay rules for each killer in Final Girl.
 * These are passed to the AI so generated stories respect actual game mechanics.
 */

export interface KillerSpecialRules {
  /** Short narrative note for the AI (1–3 sentences). */
  narrativeNote: string;
  /** True for vignette killers — no physical body to fight or kill. */
  isVignette?: boolean;
  /** True if this killer cannot be killed (e.g. Poltergeist). */
  unkillable?: boolean;
  /** Unique win condition text if different from "defeat the killer". */
  winCondition?: string;
  /** Unique loss condition text if different from "final girl is caught". */
  lossCondition?: string;
}

export const KILLER_SPECIAL_RULES: Record<string, KillerSpecialRules> = {
  // ── Season 1 ─────────────────────────────────────────────────────────────

  'Hans': {
    narrativeNote: 'A methodical, powerful butcher who overwhelms with brute force. No supernatural abilities — just size, strength, and terrible patience.',
  },

  'Poltergeist': {
    narrativeNote:
      'A malevolent spirit that cannot be wounded, driven off, or killed by the Final Girl. The only path to safety is locating the ghost\'s anchor: finding Carolyn (and optionally recovering Mr. Floppy, her teddy bear) to put the haunting to rest. Do NOT write scenes where the Final Girl defeats or destroys the Poltergeist through combat.',
    unkillable: true,
    winCondition: 'Find Carolyn (and optionally Mr. Floppy the teddy bear) to end the haunting. Defeating the Poltergeist in combat is not possible.',
  },

  'Inkanyamba': {
    narrativeNote:
      'A powerful serpentine creature tied to storms and water. Its movements and aggression are influenced by weather conditions — a rising storm means a more dangerous Inkanyamba.',
  },

  'Geppetto': {
    narrativeNote:
      'A theatrical, sadistic puppeteer who uses marionettes as proxies and can appear to teleport around his carnival domain. He is playful and enjoys taunting; violence is performance to him.',
  },

  'Dr. Fright': {
    narrativeNote: 'A rage-fueled rural killer with no supernatural abilities. Personal and territorial — this is his domain.',
  },

  // ── Season 1 Vignettes ────────────────────────────────────────────────────

  'Birds': {
    narrativeNote:
      'A vignette killer — not a single entity but a swarming flock of birds. There is no physical body to fight or kill; survival is about avoiding the swarm and outlasting it. No location to explore — the threat is everywhere and nowhere.',
    isVignette: true,
    winCondition: 'Survive long enough for the flock to disperse. There is no killing the threat.',
  },

  // ── Season 2 ─────────────────────────────────────────────────────────────

  'Evomorph': {
    narrativeNote:
      'An alien predator that evolves and grows stronger each time it kills a victim. Every fallen NPC makes the Evomorph faster and more dangerous. It is an escalating threat — at the start of the game it is manageable; by the end it may be almost unstoppable.',
  },

  'The Organism': {
    narrativeNote:
      'A biological horror that assimilates rather than kills. If the Horror Track exceeds 6, the Final Girl is not killed — she is absorbed into the organism (a fate arguably worse than death). The Organism can only be defeated by destroying its core, not through conventional combat.',
    lossCondition: 'Caught by the Organism (consumed) OR Horror Track exceeds 6 (assimilation — the Final Girl becomes part of the creature).',
    winCondition: 'Destroy the Organism\'s core. Standard combat is ineffective against the bulk of its body.',
  },

  'Ratchet Lady': {
    narrativeNote:
      'A frantic, relentless killer who uses the asylum\'s dark corridors and the patients\' confusion to her advantage. The environment (Wolfe Asylum) is as much a trap as the killer herself.',
  },

  'Big Bad Wolf': {
    narrativeNote:
      'A massive supernatural wolf with glowing red eyes, already wounded (arrows in its flank) but driven by primal rage. Fairy-tale logic applies — the dark forest of Storybook Woods has its own rules.',
  },

  'The Intruders': {
    narrativeNote:
      'Three coordinated home invaders — Trish (Red, often in a red hood), Baghead (Gray, burlap-sack mask), and Zeke (Black) — stalking Wingard Cottage together. Only one is the "Active" killer at any moment, but all three are present on the board: they hand off pursuit, flank, and cut off escape routes. Downed Intruders can be revived by their Final Health tokens, so a "kill" is not always final. Minor Dark Powers apply to all three. Never portray them as a single lone slasher.',
  },

  // ── Season 2 Vignette ────────────────────────────────────────────────────

  'Zombies': {
    narrativeNote:
      'A vignette killer — an undead horde, not a single attacker. The threat is overwhelming numbers and the horror of the familiar-turned-monstrous. No single zombie can be "the killer" — survival is about outlasting or escaping the horde.',
    isVignette: true,
    winCondition: 'Survive long enough to escape or hold off the horde. No single kill ends the threat.',
  },

  // ── Season 3 ─────────────────────────────────────────────────────────────

  'Slayer': {
    narrativeNote:
      'A reptilian creature crackling with electrical energy — lightning erupts from its body, it is fast, and it hunts through the Falconwood swamp. Electricity is both its weapon and its vulnerability.',
  },

  'The Hunter': {
    narrativeNote:
      'A cold, futuristic assassin from another time who uses advanced tech and a targeting visor. Methodical and relentless — it does not feel fear or pain in the conventional sense.',
  },

  'Razorface': {
    narrativeNote:
      'A ritualistic, pain-worshipping killer who moves through his hellish domain with calm purpose. Violence is ceremony to him.',
  },

  'The Tormentor': {
    narrativeNote:
      'A calculated, silent killer who uses the industrial warehouse maze to isolate and corner victims. She plans her kills.',
  },

  'The Eyeless': {
    narrativeNote:
      'Completely blind — hunts entirely by sound. Any noise (from items, running, failed actions) immediately draws the Eyeless to the Final Girl\'s position. Silence is the primary survival mechanic. Do NOT describe scenes where the Final Girl is seen by the Eyeless.',
    winCondition: 'Defeat the Eyeless while staying silent. Noise = death.',
    lossCondition: 'Caught by the Eyeless, typically drawn in by unavoidable noise at a critical moment.',
  },

  // ── Season 3 Vignette ────────────────────────────────────────────────────

  'Destiny': {
    narrativeNote:
      'A vignette killer — not a physical being but the force of fate itself. Deaths happen through accidents, coincidences, and an uncanny chain of bad luck. There is no killer to fight, only a pattern of doom to unravel or escape.',
    isVignette: true,
    winCondition: 'Break the chain of fate. No entity can be confronted or killed.',
    lossCondition: 'The Final Girl is caught in an unavoidable accident or chain of fateful events.',
  },

  // ── Season 4 ─────────────────────────────────────────────────────────────

  'Grimlash': {
    narrativeNote:
      'A pumpkin-headed, fire-wielding entity that emerges from the harvest fields of Shady Acres. Fire is both its weapon and its essence — the autumnal setting amplifies its menace.',
  },
  'Mort the Teenage Dirtbag': {
    narrativeNote:
      'Inspired by the Scream franchise. Mort uses multiple disguises and accomplices to confuse investigators—anyone at the convention could be the killer. The horror is paranoia and misdirection, not brute force. Ghost mask with one large eye, charcoal hoodie, red-and-black pants.',
  },
};

/**
 * Get the special rules for a killer by name.
 * Returns undefined if the killer has no specific rules on record.
 */
export function getKillerSpecialRules(name: string): KillerSpecialRules | undefined {
  return KILLER_SPECIAL_RULES[name];
}
