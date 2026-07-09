import { RuleBlock, RuleSection, RuleChapter } from './types';

export interface EntityRuleModule {
  /** Entity name as it appears in FEATURE_FILMS (e.g. 'Grimlash', 'Storybook Woods') */
  entity: string;
  kind: 'killer' | 'location';
  /** Film ID that grants ownership of this module */
  filmId: string;
  /** Human-readable source attribution */
  source: string;
  /** Designer / artist credits printed on the official sheet */
  credits?: { design?: string; art?: string };
  /** Body of the SETUP sub-tab */
  setup: RuleBlock[];
  /** Body of the RULES sub-tab */
  rules: RuleBlock[];
  tags?: string[];
}

// ─── Grimlash (Killer) — A Rotten Harvest ──────────────────────────────────
const grimlash: EntityRuleModule = {
  entity: 'Grimlash',
  kind: 'killer',
  filmId: 's4-rotten-harvest',
  source: 'A Rotten Harvest — Killer Sheet',
  credits: { design: 'Ryan Jorjorian', art: 'Ondine Champetier de Ribes' },
  tags: ['grimlash', 'harvest madness', 'killer'],
  setup: [
    {
      type: 'list',
      items: [
        'Separate the Harvest Madness cards by level and shuffle each to create 3 separate decks.',
        'Place the Harvest Madness marker on the starting space on the Harvest Madness track (outlined in orange), located near the top of the Killer board.',
      ],
    },
  ],
  rules: [
    { type: 'heading', level: 3, text: 'Harvest Madness' },
    {
      type: 'paragraph',
      text: 'Increasing your Harvest Madness will give you additional abilities, but it may come at a price, possibly death!',
    },
    {
      type: 'paragraph',
      text: 'Whenever you see the Harvest Madness icon, move the Harvest Madness marker one space to the right on the track. When your Harvest Madness marker reaches a space corresponding to a new level, draw 2 cards from the Harvest Madness deck for that level and choose 1 to keep, discarding the other. The Harvest Madness card abilities remain in effect as long as your Harvest Madness remains at that level or above.',
    },
    {
      type: 'callout',
      variant: 'critical',
      title: 'Important!',
      text: 'If your Harvest Madness increases beyond Level 3 (indicated by the space with a skull), you immediately lose the game!',
    },
    {
      type: 'paragraph',
      text: 'When resolving a Heart, you may recover health as normal or reduce your Harvest Madness. If you choose to reduce your Harvest Madness, move the Harvest Madness marker 1 space to the left for each Heart. You must choose to either recover health or lower your Harvest Madness — you cannot do both.',
    },
    {
      type: 'paragraph',
      text: 'If your Harvest Madness drops to a lower level, you must discard the corresponding Harvest Madness card for the level you just left. If your Harvest Madness later returns to that level, you once again draw 2 cards from the appropriate Harvest Madness deck, choosing 1 to keep and discarding the other. When drawing Harvest Madness cards, if there are not enough in the deck, reshuffle the discard pile for that level and form a new deck.',
    },
    {
      type: 'paragraph',
      text: 'Some Harvest Madness once-per-turn effects require you to flip the Harvest Madness card facedown. During the Upkeep phase, flip them faceup. Their effects can be used again.',
    },
  ],
};

// ─── Storybook Woods (Location) — Once Upon a Full Moon ───────────────────
const storybookWoods: EntityRuleModule = {
  entity: 'Storybook Woods',
  kind: 'location',
  filmId: 's2-once-upon-full-moon',
  source: 'Once Upon a Full Moon — Location Sheet',
  credits: { design: 'Julie Ahern', art: 'Tyler Johnson' },
  tags: ['storybook woods', 'bridges', 'raft', 'location'],
  setup: [
    {
      type: 'paragraph',
      text: 'Setup the game as normal — there are no special setup rules for this Location.',
    },
  ],
  rules: [
    { type: 'heading', level: 3, text: 'Fewer Spaces' },
    {
      type: 'paragraph',
      text: 'Storybook Woods has fewer spaces than most locations! Be careful, as this can make it seem easy, but the woods can become very dangerous, very quickly.',
    },
    { type: 'heading', level: 3, text: 'Bridges' },
    {
      type: 'paragraph',
      text: 'There are three bridges on the board that cross the River (circled in red on the board). They are built very poorly and could collapse with too much weight! Therefore, only 1 Victim will follow you when crossing a bridge.',
    },
    {
      type: 'paragraph',
      text: 'Additionally, the Toll Bridge Event card may have you placing a Toll Bridge token on the board. Just like the other three bridges, only 1 Victim will follow you across the Toll Bridge.',
    },
    { type: 'heading', level: 3, text: 'The Raft' },
    {
      type: 'paragraph',
      text: 'One of the items you may find is a Raft. When you find the Raft, you will need to choose 4 spaces where the Raft can go ashore (these spaces are clearly marked on the board). You must place the Raft tokens such that they are touching both the river and one non-exit space. With the Raft you will be able to move to and from these spaces along the river as indicated on the Raft Item card.',
    },
  ],
};

// ─── Big Bad Wolf (Killer) — Once Upon a Full Moon ────────────────────────
const bigBadWolf: EntityRuleModule = {
  entity: 'Big Bad Wolf',
  kind: 'killer',
  filmId: 's2-once-upon-full-moon',
  source: 'Once Upon a Full Moon — Killer Sheet',
  credits: { design: 'Julie Ahern', art: 'Tyler Johnson' },
  tags: ['big bad wolf', 'wolf', 'track', 'slay', 'killer'],
  setup: [
    {
      type: 'paragraph',
      text: 'Setup the game as normal — there are no special setup rules for this Killer.',
    },
  ],
  rules: [
    { type: 'heading', level: 3, text: 'Hunt & Slay Modes' },
    {
      type: 'paragraph',
      text: 'Most of the Terror cards for the Big Bad Wolf have different effects based on what MODE the killer is in. There are two modes, TRACK and SLAY, each denoted by a different icon.',
    },
    {
      type: 'list',
      items: [
        'The Wolf begins the game in TRACK mode. If the Wolf is in this mode at the beginning of the Killer phase, you will apply these effects (and NOT the effects for SLAY mode).',
        'When the Dark Power is revealed, the Wolf goes into SLAY mode. If the Wolf is in this mode at the beginning of the Killer phase, you will apply these effects (and NOT the effects for TRACK mode).',
      ],
    },
    {
      type: 'paragraph',
      text: 'If the Wolf goes into SLAY mode during the Killer phase but started out in TRACK mode, you will not start applying the SLAY effects until the next Killer phase.',
    },
    {
      type: 'paragraph',
      text: 'The Wolf will always be in one mode or the other. The only exception is the Killing Machine Epic Dark Power card which has you apply both the TRACK and SLAY effects.',
    },
    {
      type: 'paragraph',
      text: "Many Terror card effects are not subject to the Wolf's mode and should be applied regardless of which mode the Wolf is in.",
    },
    {
      type: 'example',
      title: 'Example — The Claws That Scratch',
      text: "The Big Bad Wolf is in TRACK mode. When resolving the Terror card to the left, the Wolf will first target the closest Victim (or you, if closer) and move toward it. Then, resolve the TRACK effect which is to increase Bloodlust for you and every Victim in its space. Because the Wolf is not in SLAY mode, those effects are ignored.\n\nNote, if the Wolf was in SLAY mode, it would still go after the closest Target, but then it would attack, dealing its damage one at a time to as many Victims as it can. If you were in the space you'd take any leftover damage.",
    },
  ],
};

// ─── Shady Acres (Location) — A Rotten Harvest ────────────────────────────
const shadyAcres: EntityRuleModule = {
  entity: 'Shady Acres',
  kind: 'location',
  filmId: 's4-rotten-harvest',
  source: 'A Rotten Harvest — Location Sheet',
  credits: { design: 'Ryan Jorjorian', art: 'Ondine Champetier de Ribes' },
  tags: ['shady acres', 'children', 'ancient curse', 'field', 'location'],
  setup: [
    {
      type: 'list',
      items: [
        'Shuffle the Ancient Curse cards and make a facedown Ancient Curse deck.',
        'Place the Children card near the play area and place a Child meeple on the Altar of the Old Gods space. Place the other Children on the Children card.',
        'Place the Children Action token above any Minion or Killer Actions on the Finale card, indicating that the Children will act before any other Enemies.',
      ],
    },
  ],
  rules: [
    { type: 'heading', level: 3, text: 'Children' },
    {
      type: 'paragraph',
      text: "Children at Shady Acres have gone missing… it has been rumored that they've been doing some despicable things. The Children card has the Children's health, Attack Value, and Movement Value.",
    },
    {
      type: 'list',
      items: [
        'The Children are not Minions but are considered Enemies.',
        'Children have their own Action line on the Children Action token. The Children Action is performed at the beginning of the Killer phase, before the Minion Action (if applicable) and the Killer Action.',
        'Children DO NOT resolve Killer or Minion actions on Terror cards or anywhere else unless the card specifically states that the action is to be performed by the Children.',
        'Children are activated one at a time starting with the Child closest to the Altar of the Old Gods space and ending with the Child farthest from that space.',
        'During the Upkeep phase, spawn a Child by placing its meeple on the Altar of the Old Gods space. If all Children are already on the board OR if there are no Victims on the board, the spawn is ignored.',
        'Children may be attacked and killed. If a Child is killed, their meeple goes back onto the Children card, available to be spawned in the future.',
        'If you choose to attack the Children and there are more than one of them in the same space, you are attacking ALL of them and you may divide damage among the Children in the target space as you wish. Any leftover damage is lost.',
        'Victims will follow you into a space that contains Children unless that space also contains the Killer.',
        'During the Panic phase, Victims on a space with a Child will panic if at least one Victim was killed that turn.',
      ],
    },
    { type: 'heading', level: 3, text: 'Abducted Victims' },
    {
      type: 'paragraph',
      text: 'The Children appear to be under the control of ancient gods and abduct people to offer them as sacrifices. When the Children resolve the Abduction icon while on a space with a Victim, roll a die:',
    },
    {
      type: 'list',
      items: [
        'On a 1-2 the Victim has been abducted to the altar of the Old Gods and sacrificed (killed). Return the Child to the Altar of the Old Gods space. Then, increase Terror as normal and place the Victim on the back of the top card of the Ancient Curse deck.',
        'On a 3-6 the Child failed to abduct the Victim and nothing happens.',
      ],
    },
    {
      type: 'paragraph',
      text: "If there are no Victims in a Child's space when trying to resolve the Abduction icon, treat Abduction as an Attack instead.",
    },
    { type: 'heading', level: 3, text: 'Ancient Curses' },
    {
      type: 'paragraph',
      text: "As soon as there are 3 sacrificed Victims on the back of the top card of the Ancient Curse deck, the Old Gods have been fed and they unleash a curse upon the children's enemies. Remove the Victims from the card and reveal the Ancient Curse card, putting it into play. There may be multiple Ancient Curse cards in play at the same time.",
    },
    { type: 'heading', level: 3, text: 'Field Spaces' },
    {
      type: 'paragraph',
      text: 'Bad things always seem to happen in the fields. Spaces with the Field icon are considered Field spaces. Several cards have effects that involve Field spaces.',
    },
  ],
};

// ─── Mort the Teenage Dirtbag (Killer) — Shriek ───────────────────────────
const mortTheTeenageDirtbag: EntityRuleModule = {
  entity: 'Mort the Teenage Dirtbag',
  kind: 'killer',
  filmId: 's4-shriek',
  source: 'Shriek — Killer Sheet',
  credits: { design: 'Evan Derrick', art: 'Tyler Johnson' },
  tags: ['mort', 'shriek', 'suspects', 'clues', 'informants', 'identity', 'killer'],
  setup: [
    { type: 'callout', variant: 'critical', title: 'Do Not Open', text: 'There is a special Finale Secret Envelope included with Mort. DO NOT OPEN it until you are instructed to! Otherwise, it will spoil the surprise.' },
    {
      type: 'list',
      items: [
        'Place the Basic Finale card on the Killer board. It will be used for the Killer Action until the Finale is revealed.',
        'Add the Interrogate and Coerce Action cards to the Action Tableau.',
        'Place the 10 Suspect cards in a row above the board with their attributes side showing. Place the 10 Suspect tokens in the Suspect bag.',
        'Mort does not start on the board. Instead, he is wearing one of 10 possible disguises. After placing the Victims and Final Girl on the Location board, take the 10 Suspect miniatures and randomly place each Suspect on an empty space until there are either no empty spaces left or no Suspects left to place. If there are no empty spaces and Suspects still need to be placed, place them in the furthest spaces from you that contain Victims, but only 1 Suspect per space.',
        'Randomly choose a Clue card and place it next to the board on whichever side you wish. This card determines who Mort will be disguised as. Place the Clue Viewer and the Reminder tokens, facedown, next to the Clue card.',
        'Place the Horror Track token on the Killer board in its designated space.',
      ],
    },
  ],
  rules: [
    { type: 'heading', level: 3, text: 'Suspects' },
    { type: 'paragraph', text: 'You are attempting to figure out who Mort is actually masquerading as, but until you have eliminated all Suspects but one, it could be anyone! There are 10 Suspects, each dressed up as a different Victim, Final Girl, Enemy, or the Killer. For gameplay purposes, Suspects are not considered the Killer, an Enemy, or a Victim. They will never be targeted and cannot be damaged.' },
    { type: 'paragraph', text: 'Suspects have 7 attributes, listed on their respective Suspect card. These attributes are what will help you determine who Mort is actually disguised as.' },
    { type: 'heading', level: 3, text: 'Revealing Clues' },
    { type: 'paragraph', text: 'There are two new Action cards: Interrogate and Coerce. These cards can be used to reveal clues to identify which of the Suspects Mort is disguised as.' },
    { type: 'list', ordered: true, items: ['Reveal one of the facedown Reminder tokens (numbered 1-5).', 'Use the Clue Viewer to look at the corresponding Clue on the Clue card. It will indicate an attribute that Mort does NOT possess.', 'Determine which Suspects cannot be Mort by looking at their attributes and discarding their Suspect cards from the lineup.', 'For each Suspect card discarded, remove that Suspect miniature from the board and replace it with an Informant meeple.', 'Keep the Reminder token faceup near the Clue card so that you remember which Clues you’ve already seen.'] },
    { type: 'paragraph', text: 'Revealing a Clue will ALWAYS eliminate at least one Suspect, and may eliminate more than one.' },
    { type: 'heading', level: 3, text: 'Interrogate & Coerce' },
    { type: 'paragraph', text: 'Interrogate can only be resolved while in a space with a Suspect. After successfully interrogating a Suspect, they will panic.' },
    { type: 'paragraph', text: 'Coerce can only be resolved while in a space with an Informant. After successfully coercing an Informant, you will remove them from the board.' },
    { type: 'heading', level: 3, text: 'Informants' },
    { type: 'paragraph', text: 'Informants are considered Victims for ALL gameplay purposes with three exceptions: when you save an Informant, after receiving the reward from your Final Girl card, you may either reduce Horror or, after increasing Bloodlust, you must increase Horror once; if an Informant is killed, after increasing Bloodlust you follow normal rules but if there are less prominent Victims over normal Victims, they are less prominent.' },
    { type: 'heading', level: 3, text: 'Suspects Temporarily Acting as Killers' },
    { type: 'paragraph', text: 'Whenever you see the mask icon, draw a token out of the Suspect bag. The token will correspond to one of the ten Suspects, who will then temporarily become the Killer. Mort is a master of disguise and could be impersonating ANYONE, if only for a moment. Place the token back into the bag after resolving the Killer Action(s). That Suspect could become the Active Killer again on the same or future turn.' },
    { type: 'paragraph', text: 'When drawing a token, if the indicated Suspect has already been proven to NOT be Mort, nothing happens and the Killer Action effect is ignored. Instead, discard the token.' },
    { type: 'paragraph', text: 'For each Location card that requires you to resolve an action as the Killer, draw a token from the bag as if there was a mask icon present on the card. As long as that Suspect is still in the lineup, they will become the Active Killer for resolving ALL Killer Actions/effects on that card.' },
    { type: 'heading', level: 3, text: 'Horror Track Token' },
    { type: 'paragraph', text: 'When Bloodlust reaches the highest space on the track, place the Horror Track token from the Killer board on top of the skull symbol at the end of the Horror Track on your Player board. From this point forward, if Horror exceeds its maximum level, instead of increasing Horror, you lose health instead.' },
    { type: 'heading', level: 3, text: 'Running Out of Terror Cards Before Revealing All Clues' },
    { type: 'paragraph', text: 'If the Finale is revealed normally when the Terror deck is exhausted, flip the Clue card over to its opposite side and reveal who Mort is disguised as. Replace that Suspect’s miniature with Mort’s miniature and flip their Suspect card over, replacing the Basic Finale card with the Suspect card. Then remove any remaining Suspects and Informant meeples from the Location board and discard their associated Suspect cards.' },
    { type: 'paragraph', text: 'If the Dark Power hasn’t been revealed, reveal it immediately and discard any Minor Dark Powers in play.' },
    { type: 'heading', level: 3, text: 'Panic Phase' },
    { type: 'paragraph', text: 'Until Mort is revealed, Victims do not panic during the Panic phase.' },
    { type: 'heading', level: 3, text: 'Mind Dark Powers' },
    { type: 'paragraph', text: 'Some Locations may have Minor Dark Powers that have spaces for Health markers on them. If one of these is drawn, do not place Health markers on it, as Mort cannot be attacked while he is disguised. Minor Dark Power cards that are drawn in this way may be discarded when you successfully resolve an Interrogate or a Coerce Action card with two successes.' },
  ],
};

// ─── MegaBGCon (Location) — Shriek ─────────────────────────────────────────
const megaBgCon: EntityRuleModule = {
  entity: 'MegaBGCon',
  kind: 'location',
  filmId: 's4-shriek',
  source: 'Shriek — Location Sheet',
  credits: { design: 'A.J. Porfirio', art: 'Tyler Johnson' },
  tags: ['megabgcon', 'shriek', 'booths', 'exhibit areas', 'food court', 'halways', 'convention', 'location'],
  setup: [
    { type: 'list', items: ['Shuffle the 12 Booth cards and make a facedown Booth deck.', 'Shuffle the 10 Booth Event cards and make a facedown Booth Event deck.', 'Add the 2 Create a Panic Action cards to the Action Tableau.', 'Place the Finale Reminder card underneath the Finale card facedown side facing up. It will only be used after the Finale is revealed.'] },
  ],
  rules: [
    { type: 'heading', level: 3, text: 'Definitions' },
    { type: 'list', items: ['Exhibit Areas: The yellow spaces marked with the booth icon are considered Exhibit Area spaces. Thematically, this is where the vendor booths are and where everyone wants to be!', 'Food Court: The Food Court is located in the bottom left-hand corner of the board.', 'General Areas: All remaining spaces not captured in the 2 areas above are considered the General Areas.'] },
    { type: 'heading', level: 3, text: 'Restricted Victim Following' },
    { type: 'paragraph', text: 'The Victims are having such a great time at the convention that they will not willingly follow you out of Exhibit Areas and into General Areas. You may not have ANY Victims follow you when moving from an Exhibit Area space to a General Area space. Instead, you will need to use the Create a Panic Action card to attempt to scare them from an Exhibit Area space to a General Area space. Victims could also panic and move from an Exhibit Area space per the normal rules during the Panic phase, or panicking from other effects.' },
    { type: 'heading', level: 3, text: 'Main Hallway' },
    { type: 'paragraph', text: 'When panicking someone from the Main Hallway, roll 2 dice instead of 1 to determine the direction they panic.' },
    { type: 'heading', level: 3, text: 'Searching' },
    { type: 'paragraph', text: 'At Mega Boardgame Con you can search in ANY space by resolving a Search Action card. The Item deck you draw from depends on the kind of space you are searching in: an Exhibit Area space, the Food Court space, or a General Area space.' },
    { type: 'callout', variant: 'critical', title: 'Rules on Game Ambiguity', text: 'Because all spaces can be searched, there are no search icons on the spaces. However, each space is considered a search space for the purpose of effects that reference them. If unsure what to do in certain instances, apply the Rules on Game Ambiguity.' },
    { type: 'heading', level: 3, text: 'Moving Through Hallways and Docks' },
    { type: 'paragraph', text: 'Hallways and docks are sparsely populated and you can move to other connected hallways and docks quickly. If you intend to move to a space connected by this icon, you get +1 movement, but the first space you move to MUST be an adjacent space connected with the hallway icon.' },
    { type: 'heading', level: 3, text: 'Booth Cards and Booth Events' },
    { type: 'paragraph', text: 'During each Upkeep phase you will draw a Booth card. If you need to draw a Booth card but the deck is empty, shuffle the discard pile to create a new deck.' },
    { type: 'list', items: ['1-3: Spawn a normal Victim in the space with the Booth. This represents a new attendee showing up to the convention.', '4-6: Draw a Booth Event card and apply its effects in the space with the Booth. Discard the Booth card after resolving it. Booth Event cards will instruct you as to whether or not the card should be discarded.'] },
  ],
};

// ─── The Intruders (Killer) — A Knock at the Door ─────────────────────────
const theIntruders: EntityRuleModule = {
  entity: 'The Intruders',
  kind: 'killer',
  filmId: 's2-knock-at-door',
  source: 'A Knock at the Door — Killer Sheet',
  credits: { design: 'Mike Martins', art: 'Heather Vaughan' },
  tags: ['intruders', 'trish', 'baghead', 'zeke', 'active killer', 'killer'],
  setup: [
    {
      type: 'list',
      items: [
        'Place all three Killer meeples (red, black, and gray) on the Killer starting space.',
        'Give each Killer their starting health, including a Final Health token.',
        'Place the Active Killer token on Trish (the Red Killer) to start the game.',
      ],
    },
  ],
  rules: [
    {
      type: 'paragraph',
      text: 'The Intruders consist of three separate Killers, but only ONE is the Active Killer at any given time. The Active Killer is the one with the Active Killer token. Boot symbols, attacks, and any effect that targets or places "the Killer" applies only to the Active Killer unless the effect explicitly says otherwise.',
    },
    { type: 'heading', level: 3, text: 'Changing the Active Killer' },
    {
      type: 'list',
      ordered: true,
      items: [
        'Attacking / Item damage: If you attack (or otherwise damage) a Killer that is NOT the Active Killer, that Killer immediately becomes the Active Killer before damage is resolved.',
        'Up / Down arrow symbols: Terror and Killer cards may show an UP or DOWN arrow. Move the Active Killer token one slot in that direction on the Killer board, wrapping around top-to-bottom (or bottom-to-top) and skipping any Killer that is already dead.',
        'Death of the Active Killer: If the Active Killer dies, immediately move the Active Killer token to the top-most Killer that is still alive.',
      ],
    },
    { type: 'heading', level: 3, text: 'Resolving "All Killers" Effects' },
    {
      type: 'paragraph',
      text: 'Some effects target "All Killers." Ignore the Active Killer token for these — resolve the effect on every living Killer from top to bottom on the Killer board. The Active Killer token does NOT move as a result of resolving an "All Killers" effect.',
    },
    { type: 'heading', level: 3, text: 'Panic' },
    {
      type: 'paragraph',
      text: 'Victims panic in a space that contains ANY Killer if a Victim was killed that turn — not just the Active Killer. Any Intruder in the space is enough to trigger the panic.',
    },
    { type: 'heading', level: 3, text: 'Minor Dark Powers' },
    {
      type: 'paragraph',
      text: 'Minor Dark Powers apply to ALL Killers, not just the Active Killer. When damage would be dealt to a Killer that shares a space with a Minor Dark Power card that can take damage, the damage is applied to the Minor Dark Power card first.',
    },
    { type: 'heading', level: 3, text: 'Intruder Death & Final Health Tokens' },
    {
      type: 'callout',
      variant: 'critical',
      title: 'Do Not End the Phase Early',
      text: 'If an Intruder loses their final health while another Intruder is still alive, DO NOT end the phase. Lay the meeple on its side, change the Active Killer if needed, and finish resolving the current phase. Only then reveal that Intruder\'s black Final Health token: if the token is blank, the Intruder is dead — if it shows health, replenish that Intruder to that amount, replace the black token with a white one, and stand the meeple back up. The "+1 ♥" bonus from reaching final health only triggers ONCE per game, no matter how many Intruders reach final health.',
    },
    { type: 'heading', level: 3, text: 'Active Killer Example' },
    {
      type: 'example',
      title: 'Ginny vs. the Intruders',
      text: 'Trish is the Active Killer. Ginny attacks Baghead — Baghead immediately becomes the Active Killer before damage lands, then takes the hit. Later a Terror card shows a DOWN arrow: the token moves from Baghead down to Zeke, skipping any dead Killer along the way. When a "They\'re Everywhere!" All-Killers effect resolves, every living Intruder acts from top to bottom and the Active Killer token stays exactly where it was.',
    },
  ],
};

// ─── Wingard Cottage (Location) — A Knock at the Door ─────────────────────
const wingardCottage: EntityRuleModule = {
  entity: 'Wingard Cottage',
  kind: 'location',
  filmId: 's2-knock-at-door',
  source: 'A Knock at the Door — Location Sheet',
  credits: { design: 'Mike Martins', art: 'Heather Vaughan' },
  tags: ['wingard cottage', 'supply items', 'crafted items', 'house', 'indoors', 'outdoors', 'location'],
  setup: [
    {
      type: 'paragraph',
      text: 'Setup the game as normal, with the following changes when playing with Wingard Cottage:',
    },
    {
      type: 'list',
      items: [
        'Place the four Supply Item cards faceup in the play area.',
        'Shuffle the Crafted Item cards together and deal out four faceup cards in the play area.',
      ],
    },
  ],
  rules: [
    { type: 'heading', level: 3, text: 'Definitions' },
    {
      type: 'list',
      items: [
        'HOUSE: Refers to all of the following spaces — Kitchen, Bedroom x2, Bathroom, Family Room, Foyer, Laundry Room, and Garage.',
        'INDOORS: Refers to all spaces inside the House as well as the Shed and the Boathouse.',
        'OUTDOOR SPACE: Refers to all spaces that are not considered Indoors.',
      ],
    },
    { type: 'heading', level: 3, text: 'Supply Items' },
    {
      type: 'paragraph',
      text: 'Some spaces on the board have Supply Item symbols corresponding to a specific type of Supply Item (Discarded Tools, Nails, Rope, Wood). While on one of these spaces, you may gain the corresponding Supply Item card at the cost of 1 Time (you cannot do this while moving through the space). Place it into a Backpack slot. When discarding a Supply Item card, it goes back in the play area faceup, available to be gained again.',
    },
    { type: 'heading', level: 3, text: 'Crafted Items' },
    {
      type: 'paragraph',
      text: 'Crafting allows you to gain an available Crafted Item card by discarding the Item cards and/or Supply Item cards listed on the Crafted Item card, as well as losing the required amount of Time. When you gain a Crafted Item card, either place it into a Hand or Backpack slot. When discarding a Crafted Item card, it goes back in the play area faceup, available to be Crafted again.',
    },
    {
      type: 'paragraph',
      text: 'When Items with limited uses are discarded to gain a Crafted Item card, those uses carry over to the Crafted Item. For example, if the Shotgun has one use left when it is discarded to craft the Sawed-off Shotgun, then the Sawed-off Shotgun will also have one use left. The same would apply if the Trashcan Lid is discarded to craft the Porcupine.',
    },
    {
      type: 'example',
      title: 'Crafting Example',
      text: 'Ava has a Wooden Bat and Nails. She spends 2 Time to craft the Nail Bat, taking it into her hand. Finally, she discards the Wooden Bat and returns the Nails faceup next to the other Supply Item cards.',
    },
  ],
};

export const ENTITY_RULE_MODULES: EntityRuleModule[] = [grimlash, storybookWoods, bigBadWolf, shadyAcres, mortTheTeenageDirtbag, megaBgCon, theIntruders, wingardCottage];

export interface ModulePromptContext {
  narrativeGuidance: string;
  visualGuidance: string;
  rulesSummary: string;
}

const MODULE_PROMPT_CONTEXT: Record<string, ModulePromptContext> = {
  'Mort the Teenage Dirtbag': {
    narrativeGuidance: 'Mort is not openly present at first: he is hidden among ten costumed Suspects at MegaBGCon, and the story should emphasize paranoia, mistaken identity, clue-gathering, and convention attendees who might only be pretending to be victims, heroes, or killers. Do not reveal Mort’s true disguise in the opening unless the game state explicitly says he has been revealed.',
    visualGuidance: 'Use a convention-floor slasher look: a hooded Ghostface-like mask with one oversized eye, charcoal hoodie, red-and-black pants, crowds of costumed boardgame fans, suspect miniatures, clue cards, and fluorescent convention lighting. If final killer identity is known, show that specific disguised suspect or reveal moment rather than generic Mort.',
    rulesSummary: 'Mort begins disguised as one of ten Suspects. Players reveal clues through Interrogate and Coerce actions, eliminating Suspects and turning them into Informants. Suspects can temporarily act as the Killer when mask effects resolve. Mort is only truly revealed once enough clues are found or the Terror deck runs out.',
  },
  MegaBGCon: {
    narrativeGuidance: 'MegaBGCon is a busy boardgame convention where crowds resist leaving the fun. Exhibit Areas, the Food Court, booths, booth events, the Main Hallway, and sparse hallway/dock routes should shape the scene.',
    visualGuidance: 'Depict a crowded boardgame convention: vendor booths, demo tables, banners, dice, boardgame boxes, miniatures, food court signage, hallways/docks, fluorescent overhead lighting, cosplay costumes, and crowded exhibit aisles.',
    rulesSummary: 'Victims will not willingly follow from Exhibit Areas into General Areas and often need to be panicked out. Every space can be searched, with the item deck determined by area type. Booth cards and Booth Events trigger during Upkeep, and hallway/dock movement can be faster.',
  },
  'The Intruders': {
    narrativeGuidance: 'The Intruders are THREE coordinated home invaders — Trish (the Red Killer, often in a red hood), Baghead (the Gray Killer, wearing a burlap sack over his head), and Zeke (the Black Killer). Only one is "active" at any given moment, but all three are stalking Wingard Cottage in parallel: they hand off pursuit, flank, and cut off escape routes. If one is downed, another steps in — and downed Intruders sometimes get back up (Final Health). Never describe them as a single figure or a lone killer.',
    visualGuidance: 'Depict a trio of masked suburban home-invaders inside a warmly lit cottage: Trish in a red hood, Baghead with a burlap sack mask, Zeke in dark clothing and a mask. Show them stalking as a group, one lunging while the others block doorways or windows. If the ending specifies a single Active Intruder (Trish, Baghead, or Zeke), feature that one in the foreground while the others loom in the background.',
    rulesSummary: 'Horde-style killer: three separate Intruders on the board with a single Active Killer token that shifts between them via attacks, up/down arrow symbols, and deaths. "All Killers" effects hit every living Intruder top-to-bottom. Final Health tokens can revive an Intruder that appeared dead. Minor Dark Powers apply to all three and soak damage first.',
  },
};

export function getModulePromptContext(killer: string, location: string): ModulePromptContext | null {
  const contexts = [MODULE_PROMPT_CONTEXT[killer], MODULE_PROMPT_CONTEXT[location]].filter(Boolean) as ModulePromptContext[];
  if (contexts.length === 0) return null;
  return {
    narrativeGuidance: contexts.map((c) => c.narrativeGuidance).join('\n'),
    visualGuidance: contexts.map((c) => c.visualGuidance).join('\n'),
    rulesSummary: contexts.map((c) => c.rulesSummary).join('\n'),
  };
}

/**
 * Build synthetic RuleSections + a RuleChapter from an EntityRuleModule so it
 * can be rendered through the same RuleChapter / RuleSubTabs pipeline as core
 * rules. Returns the chapter plus the two sections it references.
 */
export function buildEntityChapter(
  mod: EntityRuleModule,
  number: string
): { chapter: RuleChapter; sections: RuleSection[] } {
  const baseId = `${mod.kind}-${mod.entity.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  const setupId = `${baseId}-setup`;
  const rulesId = `${baseId}-rules`;

  const sections: RuleSection[] = [
    {
      id: setupId,
      title: 'Special Setup',
      order: 10,
      tags: mod.tags,
      source: mod.source,
      body: mod.setup,
    },
    {
      id: rulesId,
      title: 'Special Rules',
      order: 20,
      tags: mod.tags,
      source: mod.source,
      body: mod.rules,
    },
  ];

  const chapter: RuleChapter = {
    id: `ch-${baseId}`,
    number,
    title: mod.entity,
    subtitle: mod.kind === 'killer' ? 'Killer · Special Rules' : 'Location · Special Rules',
    sectionIds: [setupId, rulesId],
    tags: mod.tags,
  };

  return { chapter, sections };
}
