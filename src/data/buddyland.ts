import type { FeatureFilmDetail } from '@/types/featureFilmDetails';

/** Paraphrased from the owner's FF16 cards and biographies; see docs/BUDDYLAND.md. */
export const BUDDYLAND_DETAILS: FeatureFilmDetail = {
  filmId: 's4-buddyland',
  killer: {
    name: 'Billy the Bear',
    description: 'A ruined animatronic mascot with a welcome that never ends. Beneath Billy’s torn bear suit, exposed machinery keeps moving long after the party should be over. His Buddies are separate animatronic threats, each with its own initiative, and they protect him when they share his space. Active Power Sources can restore his health when his battery-heart effect resolves. Cutting the power helps, but it does not automatically end the nightmare.',
  },
  finalGirls: [
    {
      name: 'Rena',
      backstory: 'Rena grew up near Buddyland, but the place had already closed by the time she was old enough to go. Her memories came from somewhere worse: a television special about the grisly murders that happened there. The images followed her into recurring nightmares, and years of therapy brought little relief.\n\nEventually, her therapist suggested confronting the fear itself. The abandoned animatronics were supposed to be harmless. Rena persuaded some classmates to take a dare and explore the building with her, hoping that seeing the truth would finally loosen the hold it had on her. Tonight, she has come to face a childhood nightmare. She has no idea that it can face her back.',
      ultimateAbility: 'Once per Action phase, take one Action card that costs 0 Time from your discard pile.',
      additionalSaveReward: 'Gain 1 Time for each additional Victim saved after unlocking your ultimate ability.',
    },
    {
      name: 'Gwynn',
      backstory: 'Gwynn was raised by her father, a mechanic in a small town with too little work. Money was tight, so the gadgets and toys she wanted were usually out of reach. Instead, she learned to make things work with what she could find. Broken objects became puzzles; discarded parts became possibilities.\n\nBy her teenage years, that childhood tinkering had become a hunger to understand bigger, stranger machines. When her friends proposed breaking into Buddyland for a night of dares, she saw a different opportunity: an entire building of forgotten mechanisms to explore. Gwynn is confident she can fix just about anything. What she finds inside may be something that should stay broken.',
      ultimateAbility: 'Once per turn, when you make a Horror Roll using only 1 die, reduce Horror by 1. You may choose to use only 1 die for a Horror Roll regardless of the Horror Level.',
      additionalSaveReward: 'Reduce Horror by 1 for each additional Victim saved after unlocking your ultimate ability.',
    },
  ],
  location: {
    name: 'Buddyland',
    description: 'The party stopped years ago. The building never quite got the message. Beyond the entrance, four central Arcade spaces sit between abandoned dining tables, the Prize Counter, and a maze of children’s attractions. The Party Room, Kitchen, Janitor’s Closet, Bathroom, Jungle Gym, and Ball Pit offer plenty of places to disappear. Faded birthday decorations and lifeless cabinets make every stray light feel like a promise that somebody is still here.\n\nThis is a pizza-and-arcade venue, not an outdoor theme park. Its cheerful promises of games, prizes, and another birthday collide with the memory of the murders that closed its doors.',
    setupCards: [
      { name: 'Hide and Seek', description: 'Victims are scattered through the building, including several pairs. The Final Girl and Killer begin separated, with the Final Girl closer to the upper rooms. Use the printed Setup card for exact placements.' },
      { name: "Playin’ Hooky", description: 'Victims are spread between the rooms and circulation spaces, with pairs at opposite ends of the building. The Final Girl begins in the Arcade, separated from the Killer. Use the printed Setup card for exact placements.' },
      { name: 'Buddy Day', description: 'Several pairs of Victims occupy the central Arcade and nearby rooms. The Final Girl and Killer begin on opposite sides of the central area. Use the printed Setup card for exact placements.' },
      { name: 'Pizza Party', description: 'Two Victims begin in the Party Room; the others are spread through the venue. The Final Girl starts in the Arcade, separated from the Killer. Use the printed Setup card for exact placements.' },
      { name: 'Birthday Bash', description: 'Six Victims are packed into the Party Room. The Killer starts in the Arcade, while the Final Girl begins near the edge of the building. Use the printed Setup card for exact placements.' },
    ],
    events: [
      { name: 'Hidden Prizes', description: 'Discard every faceup Item card from the Item decks, then discard this Event.' },
      { name: 'Party Time', description: 'Move all Victims 1 space closer to the Party Room, then discard this Event.' },
      { name: 'Broken Machine', description: 'While Victims occupy Arcade spaces, Enemies targeting Victims (or the Final Girl / Victims) move toward the closest Victim in an Arcade space. Discard this Event when a Victim in an Arcade space is killed.' },
      { name: 'Tragic Collapse', description: 'Roll a die and place the Collapse token: 1–2 Jungle Gym, 3–4 Kitchen, 5–6 Bathroom. Anyone in or entering the marked space takes 1 damage. Discard the Event when resolved.' },
      { name: 'Playtime Shenanigans', description: 'Add 2 Victims to the Ball Pit and 2 to the Jungle Gym, then discard this Event.' },
      { name: 'Buddy Up', description: 'Victims must be saved in groups of at least 2. Discard an Improvise or Distraction Action card to ignore this restriction for the entire Action phase.' },
      { name: 'Sing-A-Long', description: 'Increase Horror by 1 during each Upkeep phase. Discard this Event when the Horror Level reaches the red area.' },
      { name: 'Nick the Janitor', description: 'Place the white Special Victim in the Janitor’s Closet. Nick follows you into the Killer’s space. In an Enemy’s space, he deals 2 damage to that Enemy, then leaves until the next Upkeep, when he returns to the Closet. If killed, increase Bloodlust by 2. Discard the Event when Nick leaves play.' },
      { name: 'Birthday Girl', description: 'Place the blue Special Victim in the Party Room. If she is alone during the Panic phase, she panics. Saving her grants 4 Time; her death increases Bloodlust by 2. Discard the Event when she leaves play.' },
      { name: 'Pizza Delivery', description: 'The Victim closest to an Entrance becomes the orange Special Victim, the Pizza Guy. While he shares your space, you may roll 2 extra dice when Searching. If he is killed, all Victims in his space and adjacent spaces immediately panic. Discard the Event when he leaves play.' },
    ],
  },
};

export const BUDDYLAND_VISUALS = {
  billy: 'A short, stocky orange-brown animatronic bear with a ruined plush suit, round ears, pink glowing mechanical eye sockets, a blue collar, and a torn muzzle with visible teeth. Torn fabric exposes blue-black metal joints and a skeletal mechanical arm. He is a physical machine, not a human wearing a costume. Keep his cartoon welcome unsettling rather than friendly.',
  rena: 'A young woman with warm medium-brown skin, long voluminous burgundy-purple curls, berry lipstick, a pink shirt, a purple outer layer, and a turquoise pendant. Her frightened but determined expression conveys someone choosing to confront an old fear. Keep these features and clothing consistent across images.',
  gwynn: 'A young woman with fair freckled skin and auburn hair with a swept fringe and tied sections. Purple earrings, a green choker, a gray-lavender sleeveless shirt and a blue overall strap with a small pin distinguish her. Alert, curious and mechanically resourceful; tools suit her established background.',
  location: 'An abandoned indoor pizza restaurant and children’s arcade. Checkerboard flooring, dusty cabinets around four central Arcade spaces, pizza tables, a Prize Counter, faded party decorations, a Jungle Gym and a Ball Pit. Amber practical lights clash with cyan and magenta arcade glow. No outdoor roller coasters or carnival tents. Populate only with the selected Killer and the explicitly established game state.',
};
