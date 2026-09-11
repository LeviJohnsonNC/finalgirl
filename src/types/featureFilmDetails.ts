// Detailed feature film data for story generation

export interface FinalGirlDetail {
  name: string;
  backstory: string;
}

export interface LocationDetail {
  name: string;
  description: string;
  setupCards: { name: string; description: string }[];
  events: { name: string; description: string }[];
}

export interface KillerDetail {
  name: string;
  description: string;
}

export interface FeatureFilmDetail {
  filmId: string;
  finalGirls: FinalGirlDetail[];
  location?: LocationDetail; // Optional for vignettes
  killer: KillerDetail;
  isVignette?: boolean;
  vignetteDescription?: string; // Overall setting/scenario for vignettes without a location
}

export const FEATURE_FILM_DETAILS: Record<string, FeatureFilmDetail> = {
  's1-camp-happy-trails': {
    filmId: 's1-camp-happy-trails',
    finalGirls: [
      {
        name: 'Laurie',
        backstory: `Laurie Carpenter was born with a chip on her shoulder. Even from a young age, the fastest way to get her to do something was to tell her that she couldn't do it.

"No, you can't try out for football." "No, you can't learn how to play guitar." "No, you can't take martial arts." Whenever she heard the word 'no,' a switch flipped somewhere deep inside her and she would do everything within her power to accomplish the very thing she'd been told she couldn't do.

While this quality turned Laurie into an ambitious, focused, and tough-as-nails woman, it didn't exactly win her many friends. Most people were turned off by her intensity, and a lot of people who came into her orbit were a bit scared of her. Even at 5 foot 10, Laurie gave off the vibe that she could break you in two if she felt like it, no matter how much bigger or stronger you might be.

But those who stuck around discovered a fiercely loyal friend who would go to hell and back for them. One thing was for certain: you definitely wanted Laurie on your side, and you'd better run for your life if you were her enemy.`
      },
      {
        name: 'Reiko',
        backstory: `Reiko Rivers was quiet and shy. She was the kid who hated being called on in class, who sat alone at lunch, and who was always the last one picked for kickball. Her goal in life was to attract as little attention as possible to herself. At least, that was her goal until she discovered track.

Reiko didn't want to try out for track, but her parents, in a fit of frustration over her unwillingness to do anything outside of her comfort zone, forced her to. And she discovered she was not only fast, she was really damn fast. She handily left every other girl on the team in a cloud of dust, and went on to break every school record as well as win State.

Reiko was still quiet, but she was no longer as timid as she'd once been. Why would she need to be, when she was the fastest thing on two legs?`
      }
    ],
    location: {
      name: 'Camp Happy Trails',
      description: `Welcome to Camp Happy Trails, home to teenage love, unforgettable friendships and idyllic summer memories! Go fishing on the lake, get in some archery practice at the range, listen to ghost stories around firepit, or sneak off to makeout point! Life is always an adventure at Camp Happy Trails! Wait a second, is that screaming I hear in the distance? Oh fiddlesticks, those spooky stories must be getting to me, I'm sure it's just screams of joy from the other campers. Hot dawg, summers at Camp Happy Trails really are to die for!`,
      setupCards: [
        {
          name: 'Capture the Flag',
          description: 'This is a symmetrical setup that puts Hans and the Final Girl on opposite sides of the lake, with victims grouped at the "North" and "South" poles of the map.'
        },
        {
          name: 'Meditation Hour',
          description: 'This setup spreads victims thin across the perimeter, placing the Final Girl and Hans in a tense, close-proximity start at the bottom of the map.'
        },
        {
          name: 'Skinny Dipping',
          description: 'This setup places most victims near the water or the lower half of the map, with Hans starting right at the Campfire.'
        },
        {
          name: 'The Bonfire',
          description: 'As the name suggests, the majority of the victims are grouped together at the campfire, making them easy targets if Hans moves quickly toward the center.'
        },
        {
          name: 'Treasure Hunt!',
          description: 'Victims are scattered mostly in pairs, requiring the Final Girl to move around the map extensively to clear out the spaces.'
        }
      ],
      events: [
        { name: 'Boyfriend', description: 'The Victim closest to you is now your Boyfriend.' },
        { name: 'Clingy Campers', description: 'There is no penalty for the first Victim you save during the Action phase. For each additional Victim saved, lose 1 Health.' },
        { name: 'Dark Waters', description: 'All Victims at the Lake are killed. Whenever a Victim enters the Lake, they are killed immediately.' },
        { name: 'Deathwish', description: 'During the Upkeep phase, move the Victim closest to the Killer 1 Space towards it.' },
        { name: 'Fresh Meat', description: 'Place 2 new Victims at the Cabins, 2 new Victims at the Dock, and 2 new Victims at the Firepit.' },
        { name: 'Girlfriend', description: 'The Victim closest to you is now your Girlfriend. She will follow you into the Killer\'s space. While she is in your space, roll 1 extra die for each Horror roll. If the Girlfriend dies while in your space, increase Horror by 5.' },
        { name: 'Secret Tunnel', description: 'Choose two of the following spaces (Utility Shed, Cabins, or Docks) and place a Secret Tunnel token at each. You may move between these spaces as if they were adjacent.' },
        { name: 'Star Crossed Lovers', description: 'When exactly 2 Victims are in a space and one of them is killed, the other immediately dies as well.' },
        { name: 'Stubborn Kids', description: '1 less Victim will follow you.' },
        { name: 'Vengeance', description: 'The Victim farthest from the Killer is now The Damned. Whenever the Killer must choose a Target, The Damned is chosen instead. The Damned can only be saved if it is the last Victim alive. If The Damned dies, increase Bloodlust by 2.' }
      ]
    },
    killer: {
      name: 'Hans',
      description: `They say he wears a worn butcher's smock, stained dark with blood. His sledgehammer, which he drags behind him, supposedly weighs over 50 pounds and could crush an elephant's skull. He's over 7 feet tall and his eyes glow a bright scarlet. But the worst part is the iron mask he wears, fashioned to look like a pig, and the wet crunching sounds that can be heard from beneath it.

Hans is a very tall, muscular Caucasian man. He wears a red apron over a white shirt and brown pants. On his head is a metal pig mask, with glowing eyes and uneven 'tusks'. He is regularly shown wielding a sledgehammer.`
    }
  },
  's1-carnival-of-blood': {
    filmId: 's1-carnival-of-blood',
    finalGirls: [
      {
        name: 'Asami',
        backstory: `Asami is an Asian woman with long, tied-up, dark brown hair. She is wearing a red sweater, black skirt, and black boots. Asami has always been an artist through and through. She lives for her art. Eats, sleeps, and breathes creation.

Her all time favorite is junk art. She's always been one to find treasure in trash. People are all too quick to throw away something that can be the perfect piece for her expressions. Despite being Japanese, she couldn't have less in common with a popular lifestyle organization aficionado from her homeland.

She's had a dire hatred of clowns and a love of Nashville Hot Chicken, but has never been one for horror movies and scary stories. Ironic that she finds herself in exactly the kind of story she's avoided for so long.`
      },
      {
        name: 'Charlie',
        backstory: `Charlie is a Caucasian woman with short, fair hair. She wears a brown leather jacket over a tan crop top, dark jeans, and brown boots. Charlie Aja has lived by her own rules. The perpetual outsider, she had a certain magnetism that attracted plenty of others.

The French national loved traveling and enjoying the outdoors. She displayed a rugged durability that comes from enduring the hardship of the elements in all manner of circumstances, but she was truly at peace away from the din of civilization. Her survivalist skills and strict fitness regimen have been her salvation in more than one sticky situation.

Slow to let people in, but loyal to a fault, Charlie would fight tooth and nail for anyone she cared about. Literally. Her parents raised her to never give up and helped foster her fighting spirit. She lost them both at an early age, never really discussing how, but she never gave up on the lessons they imparted.`
      }
    ],
    location: {
      name: 'Carnival of Blood',
      description: `Of course the public doesn't know we call it the Carnival of Blood. We ARE still trying to sell tickets you know! There is a reason we roam the country finding new towns to set up in, and it ain't because we like to travel. The 'management' pays good and they leave the help like me alone, so that's good enough for me. Someone comes in and never makes it home? That's not my problem.`,
      setupCards: [
        {
          name: 'Ring Around the Rosie',
          description: 'This setup spreads victims in a loose ring around the board, with no strong central focus. The Killer and key threat markers are offset rather than centralized.'
        },
        {
          name: 'Center Stage',
          description: 'This setup clusters important elements toward the center of the map — including the Killer start and victim density.'
        },
        {
          name: 'Boxed In',
          description: 'Victims and key locations are pushed toward edges and corners, with the Killer positioned to limit escape routes.'
        },
        {
          name: 'No Laughing Matter',
          description: 'This setup places high-value victims closer to immediate danger, with fewer low-risk saves available early.'
        },
        {
          name: 'Late for the Show',
          description: 'The Killer begins well-positioned relative to victims, while the Final Girl starts farther from meaningful intervention points.'
        }
      ],
      events: [
        { name: 'Animal Panic!', description: 'Each time the Horror level increases, roll a number of dice equal to the new Horror level and do the following: For each Success you may move a Victim of your choice 1 space. For every two dice that are not a Success kill one Victim.' },
        { name: 'Clowns Everywhere', description: 'During the Upkeep phase, Victims in The Big Top and any adjacent spaces panic. If they panic into the space with an Enemy, they are killed immediately.' },
        { name: '"Did you follow me here?"', description: 'Place 4 new Victims at The Big Top. One of them is a Special Victim who is your plucky younger Sibling. While the Sibling is in your space, you may spend 2 Time to reroll one die. If the Sibling dies, increase Bloodlust by 1.' },
        { name: 'Employee Transport', description: 'Place the Golf Cart token in any of the 4 corner spaces. During Upkeep: You and/or up to 2 Victims in the space with the Golf Cart may drive it up to 2 spaces, but the Golf Cart must stay on the outer path. If the Golf Cart is driven into a space with an Enemy, you may discard it to do 3 Damage to that Enemy.' },
        { name: 'Full Moon', description: 'The Victim farthest from you is the world\'s hairiest man and is actually a Werewolf! The Werewolf will not follow you and cannot be targeted, saved, or killed. During Upkeep: panic the Werewolf. Then he does 2 Damage to one target in his space.' },
        { name: '"How dangerous can it be?"', description: 'During the Upkeep phase, each Victim moves 1 space towards the closest Trap token.' },
        { name: 'It\'s Not Real', description: 'Place 4 new Victims at the House of Mirrors. Place the Skull token at the Forest of Horrors. Any Victims at or moving into the Forest of Horrors are killed immediately.' },
        { name: 'Mirrors Everywhere', description: 'If you attack and there are one or more Victims in your space, a Victim dies for every 1 you roll.' },
        { name: '"Run! I\'ll hold them off!"', description: 'The Victim closest to you is your Fiancé. If an Enemy would move into your space while the Fiancé is there, instead kill the Fiancé and the Enemy stays where they are. If your Fiancé is killed by a trap, increase Horror by 5.' },
        { name: 'So Much Junk', description: 'When this card is revealed, find the Zappo Item card and put it in your backpack. Reset the Item deck(s) if necessary. If you lose Zappo, roll one fewer dice (minimum 1) when resolving Search Action cards for the remainder of the game. Zappo the Carnival Monkey is an Item that can be found in the Carnival of Blood.' }
      ]
    },
    killer: {
      name: 'Geppetto',
      description: `He travels from state to state and runs his operation for a few days just like any other freakshow would. When it grows in popularity… that's when he makes his move, adding as many of them to his family as he can. He keeps us around to keep up appearances, but I fear one day soon he will welcome me into the family too.`
    }
  },
  's1-maple-lane': {
    filmId: 's1-maple-lane',
    finalGirls: [
      {
        name: 'Sheila',
        backstory: `Sheila is a medium brown-skinned Asian girl with long, dark brown hair. She wears a purple collared shirt under a pink sweater. Over that is a blue-purple fur-trimmed jacket.

Sheila Smalley was adopted by Mike and Rhonda Smalley the year after the tragic death of their first daughter from (at least in their minds) the influence of Dr. Franklin Wright. Sheila was saved from the streets of India at a young age, though she was ripped away from her older brother who was taking care of her. She doesn't remember much from her years as a child in India. The Smalleys made every effort to shield Sheila from the events of the past and, namely, their murder of Dr. Wright. His transition into the dream world before death was unknown to them, but it would soon become known to Sheila.

Sheila was well-liked in school and had a lot of friends. She'd even recently gotten a boyfriend when a really smart kid, ok a nerd, named Tommy asked her to 'go steady.' Tommy really won her heart when he stood up to a group of jocks that were making racially insensitive comments to Sheila. He paid for it with a black eye and some bruises, but Sheila knew in that moment that she could trust Tommy to protect her no matter what.

When Sheila set her mind on something she could be very effective. She just had to overcome her fears first. She was a meticulous planner and strategist and as long as she didn't get paralyzed by fear and uncertainty, she was a force to be reckoned with.`
      },
      {
        name: 'Nancy',
        backstory: `Nancy is a Caucasian woman with short, wavy brown hair. She wears a teal top and tan pants, with brown shoes.

Nancy Lang was basically the All-American girl. An only child, she was constantly being doted on by her parents. In the rare instance where she did get into trouble, her father's position and influence as a ranking officer in law enforcement was usually enough to get her out of it.

Nancy suffered from night terrors, often thrashing violently in her sleep. Her parents were considering something for Nancy they'd recently heard about called "dream therapy" and apparently, there was a local doctor that does that sort of thing.

Nancy was a bright young woman. A senior in high school who was well liked. Her boyfriend lived just around the corner and, while he was a good guy, he wasn't someone Nancy saw herself with long term.

Nancy was always extremely resilient and persistent. She'd beat the odds even when they were heavily stacked against her.`
      }
    ],
    location: {
      name: 'Maple Lane',
      description: `Maple Lane runs through a typical American suburban neighborhood in the quaint town of Spring Hill. Maple Lane was a street like any other... at least until someone got murdered. Now the residents are fearful of outsiders and weary of each other, but that doesn't stop them from gathering for holidays and letting their children play in the streets. They may soon regret having such a false sense of security.`,
      setupCards: [
        {
          name: 'A Quiet Place',
          description: 'Victims are spread apart, with relatively low clustering, and the Killer starts offset rather than embedded in a dense group.'
        },
        {
          name: 'Block Party',
          description: 'A large cluster of victims in the central space (including a high-value victim), with the Killer starting nearby.'
        },
        {
          name: 'Maple Lane',
          description: 'A balanced distribution: moderate clustering, reasonable spacing, and neutral Killer positioning.'
        },
        {
          name: 'Revenge',
          description: 'The Final Girl begins closer to danger, while victims are positioned such that intervention often requires stepping into the Killer\'s path.'
        },
        {
          name: 'Playtime',
          description: 'Victims are clustered near the center, but not as tightly as Block Party, and the Killer starts close enough to threaten quickly without immediate overlap.'
        }
      ],
      events: [
        { name: 'Boyfriend', description: 'Place this Special Victim in the Boyfriend\'s House. This is your Boyfriend! If the Killer would target you, the Killer instead targets the Boyfriend.' },
        { name: 'Fire!', description: 'Roll a die and place the Fire token in: 1-3: The Boyfriend\'s House 4-6: The Smalley\'s House Any Victims in the House Space or that panic into the House Space are killed. You or Enemies in the House Space take 1 damage. The House Space may no longer be entered or searched.' },
        { name: 'Friendly Neighbors', description: 'Roll +1 Dice when resolving Convince Action cards.' },
        { name: 'It\'s Raining', description: 'Panic Victims in the Intersection. Then, move every Victim that is on a Street space to its adjacent House Space.' },
        { name: '"It\'s the 4th of July!"', description: 'Move all Victims inside a House Space to the adjacent Street space.' },
        { name: 'Officer Kopp', description: 'Place the Cop Car token on the Exit Space of your choice. Each Upkeep, move it one space towards the opposite exit. Victims in the space with the Cop Car will move with it and are considered saved when they reach the Exit Space.' },
        { name: 'Party in the Burbs!', description: 'Place 4 new Victims in any House Space that contains at least one Victim. If none do, place them in the Intersection.' },
        { name: 'The Smalleys', description: 'Place 2 Special Victims in the Smalley\'s House. Each time one of the Smalleys is killed, +1 Bloodlust.' },
        { name: 'Under Construction', description: 'Roll a die and place a Roadblock token on the following Exit Space: 1: West 2: East 3: North 4: South 5: East or West 6: North or South Victims may not be saved from that space.' },
        { name: '"What is going on over there?"', description: 'Place 1 new Victim on each Exit Space.' }
      ]
    },
    killer: {
      name: 'Dr. Fright',
      description: `I was in some sort of boiler room and a grotesque man with a pitchfork was chasing me! I was sure he was going to kill me… it felt so real! He had pock mark scars all over his skin and his eyes were milky white. A strange black… something, maybe a cloud but with eyes, swirled behind him. I was terrified, so I turned and ran. I rounded a corner and lost my footing. I staggered into some pipes and they burnt my skin so badly. That's when I woke up. I thought it was all in a dream, but I had a severe burn on my arm from the pipes!`
    }
  },
  's1-creech-manor': {
    filmId: 's1-creech-manor',
    finalGirls: [
      {
        name: 'Alice',
        backstory: `Alice is a Caucasian woman with wavy ginger hair and green eyes. She wears a green t-shirt, white skirt, brown bag, dark green leggings and shoes.

Alice Cranston was the definition of a fiery redhead. Her friends loved her boisterous personality and her take-no-shit demeanor. When she decided she wanted something, she never let anything get in her way.

She got bored of things quickly though, including her relationships. As such, she never really had any deep or meaningful relationships. To put it bluntly, there wasn't anyone who could handle her. At least no-one she'd found yet.

Alice had some growing up to do, but she loved the clubbing lifestyle and was out almost every night. She was in great shape and between her dancing and her workouts during the day, her cardio was top notch.

Don't bet against Alice, but dealing with a bloodthirsty murderer is a lot different than dealing with some mouthy club rat or handsy gentleman caller.`
      },
      {
        name: 'Selena',
        backstory: `Selena is a medium brown-skinned woman with textured, dark brown hair in a bob. She wears a yellow tank top and black athletic pants.

Selena Villanueva came from a big family. Having so many brothers and sisters was a blessing and a curse. On the one hand, they all got along and had each other's backs, but on the other hand, it made her thirst for the attention of her parents.

Selena's thirst for attention caused her to look elsewhere. She always ended up going for the bad boy type and as hard as she tried, the relationships never worked out. Eventually, she learned to observe little things and use a discerning eye to stay out of bad relationships.

By the time she went off to college, she knew she wanted to major in criminal justice. She could tell things about people and her surroundings using her keen observation skills, and she wanted to use it to solve crimes and mysteries.

Little did she know that she would have to survive Creech Manor first!`
      }
    ],
    location: {
      name: 'Creech Manor',
      description: `Creech Manor is over 100 years old with the kind of character and historic charm that people love. It is the kind of home where every step, every new room, can call to one's imagination a story from the past. But the stories of Creech Manor are filled with horrifying events, macabre happenings, and supernatural powers beyond human understanding. Go away, for evil reigns within...`,
      setupCards: [
        { name: 'Creepshow', description: 'A setup for The Haunting of Creech Manor featuring initial victim and token placement.' },
        { name: 'Dancing Queen', description: 'A setup for The Haunting of Creech Manor featuring initial victim and token placement.' },
        { name: 'Strange Trophies', description: 'A setup for The Haunting of Creech Manor featuring initial victim and token placement.' },
        { name: 'The Dead Zone', description: 'A setup for The Haunting of Creech Manor featuring initial victim and token placement.' },
        { name: 'The Ladder', description: 'A setup for The Haunting of Creech Manor featuring initial victim and token placement.' }
      ],
      events: [
        { name: 'Clingy Victims', description: 'You must have at least 1 Victim follow you if able.' },
        { name: 'Curiosity Killed the People', description: 'Place 3 new Victims in the Foyer and panic them immediately.' },
        { name: 'Frozen in Fear', description: 'Victims will no longer panic during the Panic phase.' },
        { name: 'Ghost Hunters', description: 'Replace the 3 Victims closest to you (or as many as able) with the Special Victim meeples. These Victims will not follow you until one of them has been killed. Each time one of these Victims is killed, increase Bloodlust by 1 more.' },
        { name: 'Helicopter Rescue', description: 'Place the Helicopter token on the roof of the house. Once during the game, you may move from the Attic to the Helicopter as though they are adjacent. Any Victims (or Carolyn) with you may be saved. Unless you have saved Carolyn, you must return to the Attic and the token must be removed. The Helicopter is not considered an exit space.' },
        { name: "I Ain't Afraid of No Ghost", description: 'Move each Victim 1 space towards the Attic.' },
        { name: "Light's Out", description: 'Roll 1 fewer dice (minimum of 1) when resolving an Action card that allows movement. Ignore this effect if you have a Flashlight or Candle.' },
        { name: 'Liquid Courage', description: "Victims will follow you into the Killer's space." },
        { name: 'No One Comes Back', description: 'Place the Skull token in the Attic. All Victims in the Attic are killed. Whenever a Victim enters the Attic, they are killed immediately.' },
        { name: 'Pushed to the Edge', description: 'Roll a die for each Victim in a Window Space. If the roll is a 1-4, that Victim jumps and is killed.' }
      ]
    },
    killer: {
      name: 'Poltergeist',
      description: `"How do you fight a poltergeist? Let me ask you something... how does one fight something one cannot see? It's simple, you don't. You get the hell out of there and you don't look back, you don't turn back, you don't do anything but run. If you do, it will ruin you. Mentally. Physically. And Emotionally. Then, it will kill you."`
    }
  },
  's1-sacred-groves': {
    filmId: 's1-sacred-groves',
    finalGirls: [
      {
        name: 'Adelaide',
        backstory: `Adelaide is a dark-skinned black woman with tied-back black hair. She wears a white tank top, tan trousers, and shoes.

Adelaide Jordan was good at everything she did, but never great. She was a straight B student, a green belt in taekwondo, and had more second and third place trophies than anyone she knew. This wasn't because she lacked intelligence or drive or even talent. If she'd wanted to, she'd have become the best at anything she put her mind to. And there was the catch. She quickly got bored and would move onto the next hobby or sport or interest before she'd had a chance to become proficient at the previous one. There was always something shinier around the corner.

As an adult, Adelaide quickly became the quintessential jack-of-all-trades, knowing a little about a lot but not a lot about anything in particular. And in all honesty, that suited her just fine. Life was always an adventure because she was always trying out something new, and there were plenty of situations where her grab-bag of skills would come in handy... perhaps even save her life.`
      },
      {
        name: 'Barbara',
        backstory: `Barbara is a Caucasian woman with curly ginger hair. She wears a grey striped top, grey 3/4th jeans, and black shoes.

When Barbara Romero was 9, the thing she wanted most in the whole wide world was a Miss Baby Face doll. It was the 'hot' gift that Christmas season and, try as hard as they could, her parents couldn't find one. They were all sold out. They got her a Little Susie Puffins instead, but that was not even close to being the same thing. She didn't even take it out of the box.

In fourth grade, if you had a Miss Baby Face you were the shit, but the only girl who managed to get one was Dolores Johnson. At recess everyone would crowd around Dolores and oooh and ahhh at the doll. Barbara was intensely jealous. She wanted to be the center of attention. She wanted Miss Baby Face.

So, she pulled Dolores aside one day and somehow, inexplicably, magically even, convinced her to hand over the precious doll. That was the day that Barbara learned she could convince anyone to do whatever she wanted them to. It was her super power, and she used it every chance she got. Why risk your own neck when you could just get someone else to risk theirs instead?`
      }
    ],
    location: {
      name: 'Sacred Groves',
      description: `The gods are furious over the desecration of their sacred places by idiotic obnoxious tourists! They've forged an unholy pact with the Killer, unleashing that wrath upon you and the oblivious victims in an attempt to cleanse the Groves with blood and fire. As you fight to survive against the Killer's onslaught, you'll need to simultaneously contend with the fury of the gods, represented by Divine Wrath.`,
      setupCards: [
        { name: 'Dueling Tour Guides', description: 'A setup for Slaughter in the Groves featuring initial victim and token placement.' },
        { name: 'Family Day', description: 'A setup for Slaughter in the Groves featuring initial victim and token placement.' },
        { name: 'Mob O\' Tourists', description: 'A setup for Slaughter in the Groves featuring initial victim and token placement.' },
        { name: 'Swamp Thing', description: 'A setup for Slaughter in the Groves featuring initial victim and token placement.' },
        { name: 'Worship Service', description: 'A setup for Slaughter in the Groves featuring initial victim and token placement.' }
      ],
      events: [
        { name: 'Closed for Maintenance', description: 'When this card is revealed, you may discard ALL Action cards except Atonement to close a Sacred space. If you do, place the CLOSED token on the Sacred space of your choice. Move any Victims there to adjacent spaces of your choice (evenly distributed) Victims may no longer move into the space for any reason, but you and all Enemies may continue to move to and from the space as normal.' },
        { name: 'Fire and Brimstone', description: 'Roll a die and place the Fire and Brimstone token on the: 1-2: Burial Grounds 3-4: Sacred Shrine 5-6: Holy Groves' },
        { name: 'Flash Photography', description: 'Whenever at least 1 Victim in your space panics, discard 1 random Action card.' },
        { name: 'Hallowed Ground', description: 'Roll a die and place the Hallowed Ground token on the: 1-2: Burial Grounds 3-4: Sacred Shrine 5-6: Holy Groves Anytime you end the Action phase on that space, gain 2 Time.' },
        { name: 'Loud and Obnoxious', description: 'Whenever Divine Wrath Increases, Increase it by an additional 1.' },
        { name: 'The Gods Hate Failure', description: 'Whenever you completely fail a Horror roll (after conversions and rerolls), Increase Divine Wrath by 1.' },
        { name: 'The Holy Man', description: 'The Victim farthest from the Killer is now the Holy Man. The Holy Man will not follow you. Every Upkeep phase, move the Holy Man one space towards the Killer. When the Holy Man is in the same space as the Killer, immediately remove him from the board. If you were in his space, Decrease Killer Wrath and Divine Wrath to 1. If you were not in his space, Increase Killer Wrath and Divine Wrath by a total of 10 (your choice).' },
        { name: 'The Tour Guide', description: 'The Victim closest to you is the Tour Guide. Once per turn, whenever you move at least 1 space, you may move an additional space as long as the Tour Guide remains with you for your entire movement. If the Tour Guide is killed, Increase Divine Wrath by 6.' },
        { name: 'The Uber Tourist', description: 'The Victim farthest from the Killer is now the Uber Tourist. Whenever the Killer must choose a Target, the Uber Tourist is chosen instead. If the Uber Tourist is saved, Decrease Divine Wrath or Killer Wrath by 4. If the Uber Tourist is killed, Increase Divine Wrath by 4.' },
        { name: 'Unholy Bloodshed', description: 'Anytime at least 1 Victim is killed at a Sacred space, Unleash Divine Wrath.' }
      ]
    },
    killer: {
      name: 'Inkanyamba',
      description: `Whoever Inkanyamba used to be (or where he came from) no longer matters. He has taken for himself the name of the legendary monster and has become a creature of pure wrath. His sole purpose is to exact vengeance on those around him, even if he long ago forgot the reasons for that vengeance. In order to overcome him, you will need to manage his ever rising anger, represented by Killer Wrath. If it boils over, you will never survive the ensuing onslaught!`
    }
  },
  's2-madness-in-dark': {
    filmId: 's2-madness-in-dark',
    finalGirls: [
      {
        name: 'Heather',
        backstory: `Heather worked as a nurse at Wolfe Asylum. She had a loving and giving heart and helped restore many of her patients to a state where they could leave the asylum and go back to their lives. That was the goal after all.

Of late though, Heather had seen and heard things she was not supposed to. While her unit and staff were on the up and up, others in the facility were participating in nefarious and even illegal activities. Because of what she'd learned it was with a heavy heart that she'd decided to turn in her resignation.`
      },
      {
        name: 'Veronica',
        backstory: `Veronica is a quiet person. She's very organized and extremely efficient with her time. She is rarely late and plans her days down to the minute.

Many would call her eccentric because of how obsessive she is over time, but her friends and coworkers know it to be a talent and something that gives her a real advantage in her work and life, despite sometimes coming across as rude or selfish for putting her time and commitments above everything else.`
      }
    ],
    location: {
      name: 'Wolfe Asylum',
      description: `Constructed in 1899 by the eccentric oil baron and philanthropist Jebediah Wolfe, Wolfe Asylum was built to hold 300 patients, but by the 1950's was home to over 2,500 souls. Overcrowding was the least of its problems, however, as 'difficult' patients were routinely locked in cages, while others went unattended for weeks or were left to wander the dank halls completely naked.

Before the reforms of the late '70s, Wolfe orderlies frequently performed lobotomies with ice picks, and electroshock treatment often resulted in death. Today, Wolfe Asylum claims to be a haven for the mentally ill, but some say it will never truly be free of its dark past.`,
      setupCards: [
        { name: 'A Solitary Life', description: 'A setup for Madness in the Dark featuring initial victim and token placement.' },
        { name: 'Bingo Night', description: 'A setup for Madness in the Dark featuring initial victim and token placement.' },
        { name: 'Madhouse Faceoff', description: 'A setup for Madness in the Dark featuring initial victim and token placement.' },
        { name: 'Padded Rooms', description: 'A setup for Madness in the Dark featuring initial victim and token placement.' },
        { name: 'The Dr. Is In', description: 'A setup for Madness in the Dark featuring initial victim and token placement.' }
      ],
      events: [
        { name: 'Dangerous Addiction', description: 'Choose up to 2 Victims that do not share a space with you or each other. Place a facedown Pill token with both, one, or neither of them. For each Pill token you place, 1 Bloodlust.' },
        { name: 'Dr. Death', description: 'Place Dr. Death in the Operating Theater. During the Upkeep phase, Dr. Death kills a Victim in his space. If there are none, move Dr. Death one space closer to the nearest Victim.' },
        { name: 'Dr. Sunshine', description: 'Place Dr. Sunshine in the Doctor\'s Office. While Dr. Sunshine is in your space, whenever you take a Pill you may choose what color it is. If Dr. Sunshine is killed in your space, 4 Horror.' },
        { name: 'Hannibal the Cannibal', description: 'Place Hannibal in Solitary Confinement along with 2 new Victims. During the Upkeep phase, Hannibal kills a Victim in his space. If there are none, panic Hannibal instead. If Hannibal is saved, 1 Horror. If Hannibal is killed, minus 1 Horror.' },
        { name: 'Hospital Gurney', description: 'Place the Hospital Gurney token in your space. It can move with you and you can place up to 2 Victims on it. You can discard the Gurney to ram it into an Enemy in your space or an adjacent space to inflict 1 Damage plus one additional Damage for each Victim currently on the Gurney. The Victims are then killed.' },
        { name: 'Medical Stockpile', description: 'The first time in a phase that you or an Enemy recover at least 1 Health, you or the Enemy recover an additional Health.' },
        { name: 'Powerful Meds', description: 'Whenever you consume a Pill or Pills, draw an additional Side Effects card.' },
        { name: 'Scratching And Biting', description: 'Whenever you save a Victim, make a Horror roll. If no stars, lose 1 Health.' },
        { name: '"The New Patients Are Here!"', description: 'New patients arrive at the asylum, adding more victims to save.' },
        { name: 'Welcome To The Madhouse', description: 'Place a Skull token in the Common Room. When you or an Enemy enters that space, you or it is dealt 1 Damage.' }
      ]
    },
    killer: {
      name: 'Ratchet Lady',
      description: `There once was a woman who loved helping people. Her greatest joy was to bandage a wound, offer a kind word, or hold a sickly hand. Then, one day, she witnessed something so horrible, so soul-shattering, that it changed her completely. Utterly. Irrevocably.

And now, kindness and joy have been replaced with cruelty and despair. There is still a smile, but it is a hateful smile, and may the God of Abraham have mercy on you if you see it.

The Ratchet Lady wears a torn white gown and has bandages wrapped around her head, covering her eyes. Her right hand is missing, with a metal frame around the forearm. She carries a knife.`
    }
  },
  's3-killer-from-tomorrow': {
    filmId: 's3-killer-from-tomorrow',
    finalGirls: [
      {
        name: 'Kat',
        backstory: `Kat grew up with an ex-military father who was convinced the world was out to get them both. His paranoia drove him to do everything in his power to prepare his little girl for the horrors that awaited beyond their front door. They lived off the grid and he taught her everything he knew: hand-to-hand combat; weapons handling; surviving off the land; battlefield tactics; hunting and tracking.

By the age of 13 she could hit a tin can at 50 yards with a pistol. By 16 she could survive for a month in the dead of winter with nothing but a bowie knife. By 18 she had had enough of her father's paranoia, and left him and his crazy rants behind.

It was only years later that she would fully appreciate what he had passed on to her when she came face to face with an unstoppable killing machine. The only thing standing between it and its helpless prey was Kat and her small arsenal of weaponry. Truth be told she kind of liked those odds.`
      },
      {
        name: 'Tali',
        backstory: `Tali grew up in an orphanage south of the border, one of the worst places a child could possibly be raised in. By the time she was 8 she had escaped and was living on the streets, a significant improvement over the conditions she'd endured at the orphanage.

Tali was smart and so it wasn't long before she'd carved out her niche among the roving gangs of street kids, quickly rising to the top of her own fiefdom. She understood that choosing when to fight and how to fight was often more important than winning a fight. She was cautious and chose defense rather than offense, and that wisdom kept her alive in an environment that chewed up lost children and spat them out like day-old bread.

Tali's nose for caution, combined with her street smarts, means that she's a formidable foe for any creature out for blood.`
      }
    ],
    location: {
      name: 'Sunnydaze Mall',
      description: `Welcome to the ultimate shopping experience! Step into the heart of fashion, excitement, and endless possibilities! Introducing Sunnydaze Mall, your premiere shopping destination!

Sunnydaze has the latest trends in fashion, state-of-the-art electronics, and a wide variety of culinary delights… all under one roof! Sunnydaze… where every day is filled with sunshine and joy!`,
      setupCards: [
        { name: 'Foodcourt Faceoff', description: 'A setup for The Killer from Tomorrow featuring initial victim and token placement in the food court area.' },
        { name: 'Special Delivery', description: 'A setup for The Killer from Tomorrow featuring initial victim and token placement.' },
        { name: 'High Score!', description: 'A setup for The Killer from Tomorrow featuring initial victim and token placement in the arcade area.' },
        { name: 'Family Dinner', description: 'A setup for The Killer from Tomorrow featuring initial victim and token placement.' },
        { name: 'Black Friday', description: 'A setup for The Killer from Tomorrow featuring chaotic initial victim and token placement throughout the mall.' }
      ],
      events: [
        { name: 'Food Fight!', description: 'If you are an ally, or an enemy enters the food court, they receive damage if there is at least 1 victim in either Food Court space.' },
        { name: 'Bart the Mall Cop', description: 'Place Bart the Mall Cop in Security. He will move around the spaces surrounding the food court.' },
        { name: 'Wet Floors', description: 'Whenever a victim in a railing space panics, roll twice and apply the lower result.' },
        { name: 'Lockdown!', description: 'Both door spaces are sealed off. You can remove this by going to Security.' },
        { name: 'Flash Mob!', description: 'Place 6 new victims in the food court, then panic all victims in the food court.' },
        { name: 'Rise of the Nerds!', description: 'Place a new Victim at both Boards \'n Bones and Joystick Heroes.' },
        { name: 'Fire Sale!', description: 'Move all victims that are adjacent to a store into the store.' },
        { name: 'Busted Escalators', description: 'Lose 2 time when moving through an escalator.' },
        { name: 'The Savior\'s Girl', description: 'The victim closest to the savior is now the savior\'s girl.' },
        { name: 'Renovations', description: 'Destroy a wall on one of the stores.' }
      ]
    },
    killer: {
      name: 'The Hunter',
      description: `"I knew the guy was bad news the moment I saw him. Over 6 feet tall, face hidden by that hoodie, big bulge underneath his jacket. I tried to stop him but he just shoved me aside like I was made of cotton. I took the hint and I was outta there! I'm just a mall cop for crying out loud. They don't pay me enough for this kind of shit!" - Bart, Mall Cop`
    }
  },
  's4-rotten-harvest': {
    filmId: 's4-rotten-harvest',
    finalGirls: [
      {
        name: 'Joy',
        backstory: `Joy's family has lived in Shady Acres for many generations. She knows its country hills better than anyone, and that made her the first to raise the alarm that something was amiss in town. Joy's convinced that something dark has come to her hometown, and knows that only she can stop it.`
      },
      {
        name: 'Vicky',
        backstory: `A hardened corporate lawyer, Vicky has come to Shady Acres investigating a family prophecy. Determined to find answers, she brings her relentless drive and unmatched guile to whatever awaits her in Grimlash's dark and twisted fields.`
      }
    ],
    location: {
      name: 'Shady Acres',
      description: `"Rural town, Shady Acres. in hardship as missing persons cases top thirteen this fall. Locals have given reports of lost children wandering the town. Officials claim no evidence of foul play as the latest investigation concludes. If you have information on a missing person or a child in distress, please contact the Shady Acres Sheriff's Department."`,
      setupCards: [
        { name: 'Demands of the Earth', description: 'A setup for A Rotten Harvest featuring initial victim and token placement around the rural farmland.' },
        { name: 'Dusk Sacrifice', description: 'A setup for A Rotten Harvest with victims positioned for a twilight ritual scenario.' },
        { name: 'Final Crop', description: 'A setup for A Rotten Harvest featuring endgame positioning with the harvest at its peak.' },
        { name: 'Harvest Season', description: 'A setup for A Rotten Harvest with victims spread across the fields during the busy harvest.' },
        { name: 'Reap What You Sow', description: 'A setup for A Rotten Harvest with karmic positioning based on past actions in the town.' }
      ],
      events: [
        { name: 'Acres of Hatred', description: 'For each Field space with at least 1 Victim, lose 1 Health (max 2).' },
        { name: 'Festering Rot', description: 'Whenever a Victim is killed in a Field space, plus 1 Horror.' },
        { name: 'Harvest Cultist', description: 'The closest Victim to you is now the Harvest Cultist. During the Upkeep phase, move the Harvest Cultist 1 space towards you and if they are in your space, you both move 1 space toward the Killer. If you save the Harvest Cultist, minus 2 Horror.' },
        { name: 'It Hungers for Us', description: 'All Victims panic. For each Victim in the Killer\'s space or an adjacent space, add 1 Horror (max 3).' },
        { name: 'It Lurks Between the Rows', description: 'Panic every Victim in a Field space. All Victims that panic into the Killer\'s space are killed.' },
        { name: 'Ralph the Mechanic', description: 'Place Ralph in Ralph\'s Garage. While with Ralph, if you take any Items with limited uses, add an extra Tracking marker even though it will exceed the number of circular spaces.' },
        { name: 'Sally McCoy', description: 'Place Sally in the McCoy Farmhouse. When Sally is saved, find the Combine Keys Item card. Reshuffle the Item deck(s) if necessary. If you already have the Combine Keys, gain 1 Time.' },
        { name: '"The fields are moving..."', description: 'Place a Field token in both the Hayfield and Cow Pasture spaces. They are now considered Field spaces.' },
        { name: 'The Ravens Are Circling', description: 'Each Child moves 2 spaces towards the Killer. Place Health markers on this card equal to the amount of Children in its space. When the Killer takes damage, remove the Health markers from this card.' },
        { name: 'Umbral Evocation', description: 'Place the Harvest Shadow token in the Killer\'s space. Each time you or a Victim enters that space, plus 1 Bloodlust.' }
      ]
    },
    killer: {
      name: 'Grimlash',
      description: `He has slumbered in the bowels of the earth for many centuries. The last of his worshippers now lost to ancient times. But something has reawakened this strange god and his cohort. Is it the season? The bad harvest? Or the moon rising just right over the old oak tree? No mortal can possibly understand his power, or stop it. He has returned and his hunger demands a grim and bountiful harvest.`
    }
  },
  's2-into-the-void': {
    filmId: 's2-into-the-void',
    finalGirls: [
      {
        name: 'Ellen',
        backstory: `Ellen ended up on the crew of the Konrad almost by accident. She was only traveling between worlds by toll when the Captain happened to take a liking to her and offered her a job. As an apprentice to the Captain, she learned the ship inside and out and it became her home. She became the Captain's most trusted crew member, saving both his, and the ship's bacon on more than one occasion.

Ellen's can-do, never-give-up attitude is what has made her indispensable and what makes her a survivor.`
      },
      {
        name: 'Jenette',
        backstory: `Jenette has always been a mercenary. Her signature mohawk and her tight muscles are a good outward indicator of that. And if that doesn't give it away, her shrewd negotiating skills do. She'll take all kinds of jobs if the pay is right, but she prefers the ones that require shooting things.

A true badass, Jenette has never backed down from a fight.`
      }
    ],
    location: {
      name: 'USS Konrad',
      description: `United Star Ship Konrad, M-Class freight vessel, model 9791-Bision, commissioned in 2122 by the Weygar-Yustarry Mining Corporation, built by the Lockheed Martin Corporation at a cost of $4.2 billion, with a mass of 63,000 metric tons. Current whereabouts: unknown.`,
      setupCards: [
        {
          name: 'Bloody Feast',
          description: 'A tense scenario involving the crew during a meal when the Evomorph strikes.'
        },
        {
          name: 'Born in Flames',
          description: 'A high-intensity scenario where fire plays a key role in the encounter.'
        },
        {
          name: 'Junction Danger',
          description: 'A scenario centered around the ship\'s junction points where movement becomes critical.'
        },
        {
          name: 'Showdown',
          description: 'A climactic face-to-face confrontation with the Evomorph.'
        },
        {
          name: 'Space Rave',
          description: 'A scenario set during a recreational event aboard the ship when chaos erupts.'
        }
      ],
      events: [
        { name: 'Cluttered Shafts', description: 'While moving, you may move through an inactive Maintenance Shaft at the cost of 1 Health. Victims cannot follow you if you move in this manner.' },
        { name: 'Cramped Escape Pods', description: 'If there is more than 1 Victim in an Exit space, you cannot save Victims in that space.' },
        { name: 'Emergency Override', description: 'The Incinerator, Airlock, and Self Destruct all require one less Keycard to activate.' },
        { name: 'Faulty Wiring', description: 'During the Upkeep phase, roll one die for the Furnace and one for the Trash Compactor. 1-2: Everyone at that space loses 1 Health. 3-6: No effect.' },
        { name: 'Good Cookin\'', description: 'Whenever you end the Action phase in the Mess Hall, recover 1 Health.' },
        { name: 'Jonas the Cat', description: 'Place the Special Victim meeple with the Victim that is farthest from you. This is Jonas. Jonas will not follow you. During the Upkeep phase, panic Jonas three times. If you end the Action phase in the same space as Jonas, you may choose one of the following: Lose 1 Horror or Gain 3 Time.' },
        { name: 'Master Access', description: 'If any of the top cards of each Item deck are facedown, flip them faceup. Take any Keycard Item cards that are showing.' },
        { name: 'Orphan Girl', description: 'The Victim closest to you is now the Orphan Girl. While the Orphan Girl is in your space, +1 Victims will follow you and you may freely move through inactive Maintenance Shafts. If the Orphan Girl dies, gain 3 Horror.' },
        { name: 'The Captain', description: 'Place the Special Victim meeple on the Bridge. This is the Captain. While he is at the Bridge, it costs one less Keycard to activate the Self Destruct. If the Captain dies, +2 Bloodlust.' },
        { name: 'Weapons Locker', description: 'Look through the unused Item cards and place any weapons in the Armory\'s Item deck, either faceup on top of facedown underneath.' }
      ]
    },
    killer: {
      name: 'Evomorph',
      description: `"The cargo retrieval from Titan-6 was routine. Ore, mining equipment, medical resupply for the outer rim, your basic boring-as-shit manifest. But something was hiding in the cargo, and we brought it on board. A thing, a creature, an animal... no, it was a goddamn monster, and I let it loose on my ship!"

The Adult Evomorph is a large insectoid-like alien, with a white and red exoskeleton, and a scorpion-like tail. It has no visible eyes but does have a set of sharp teeth in its exposed mouth. When the Konrad first became infested after raiding an abandoned and decrepit space freighter, the crew had no idea that a hatchling Evomorph had returned with them.

The hatchling invaded the body of one of the crew by crawling into one of their orifices. Hatchlings incubate inside the host's body until they reach a size where the host is no longer sufficient in size or provided nutrients. At that point, it bursts forth from the host creating its own orifice and killing the host.

Younglings hunt and feed on whatever living beings they can find. They are incredibly quick and deadly. While their exoskeleton is tough, they can be damaged and even killed with human-designed weapons. They are also very susceptible to fire. Once a Youngling has fed on enough victims, it will evolve into its full-grown Adult form.

Adult Evomorphs can survive for several years on no food. They hunt purely for sport as they instinctually learn while being a Youngling, even though they are often only in that stage for a matter of hours. An Adult Evomorph is essentially a killing machine and will even attack other Evomorphs for sole superiority.

When there is nothing to kill, because the Evomorph is alone on a planet or ship, it will then begin to nest out of boredom. It does not produce eggs in large numbers making only one Hatchling each year. A Hatchling can only survive without a host for about a year itself, so it is extremely rare to have more than one or at most two hatchlings in an area at a time.

If an Evomorph is unable to find a new source of food, it will perform a process called morpholosion where it can use its dying body to preserve the Hatchling almost indefinitely. This process is the reason why Evomorphs have continued to exist despite the fact that they kill any and every living thing around them.

Eventually, the cycle continues when the hatchling is introduced to an area with a living organism. The hatchling has acute biological sensors and when it senses such a being, will "hatch" from the morpholosion cocoon to seek out the being as its host.

Evomorphs have eradicated full ship crews and even full planets, though they are often killed before such extreme destruction in cases where they find themselves among a highly populated, well-armed place or in a place with beings more dangerous than the Evomorph, which is rare but possible.

One thing is for sure, the crew of the Konrad is hardly a group that is likely to survive an encounter with an Evomorph.`
    }
  },
  's2-panic-station-2891': {
    filmId: 's2-panic-station-2891',
    finalGirls: [
      {
        name: 'Kate',
        backstory: `Kate Carpenter absolutely loved science. From a very young age she had dreamed of walking alongside dinosaurs, traveling on a spaceship to planets unknown, or joining a deep sea exploration to find creatures never seen by human eyes. Her dreams never faltered, and after she graduated with honors from a major university, she began her career as a biologist.

Kate loved field work and was always jumping at the chance to get out there and see, or rather research, the world. She had no idea how much that love would put her life at risk, and in ways she could never imagine.`
      },
      {
        name: 'Uki',
        backstory: `Uki Fox has been a survivor from birth. Her mother had her own experience as a final girl while in labor (a story for another time). But because they were both tenacious enough to survive the ordeal, her mother named her Uki, an Inuit name meaning "Survivor."

Uki is incredibly tough and along with her dog, an Alaskan Malamute named Gus, is often hired as a companion by adventurers and danger seekers. She is exactly the person the Station 2891 research crew needed to help them survive the frigid wasteland.`
      }
    ],
    location: {
      name: 'Station 2891',
      description: `"Cold doesn't begin to describe it. There ain't really no word for it to put it plainly, ma'am. You bundle up and if you go outside at night you never, ever let go of the guide line. Other than that we'll mostly be working all the time." - Stu Carpenter, Station 2891 Facilities Manager.

Station 2891 is an isolated research facility in Antarctica, heavily inspired by John Carpenter's The Thing. The gameplay here is defined by uncertainty. In other Final Girl scenarios, you know exactly where the killer is. At Station 2891, the killer starts hidden among the group. You have to balance the urge to save people with the terrifying possibility that the person you're leading toward the helicopter is actually the monster waiting to mutate.`,
      setupCards: [
        { name: 'Clear the Grounds', description: 'Many victims are outside of the station.' },
        { name: 'A New Stew', description: 'Victims are in the mess hall (or on the way) eating a delicious stew.' },
        { name: 'Good Morning', description: 'Victims are all just waking up, most of them are in the station, with a couple early risers already outside.' },
        { name: 'Quittin\' Time', description: 'End of the day for the victims, sun is starting to set.' },
        { name: 'R&R', description: 'Break time for the victims, they are scattered around the station.' }
      ],
      events: [
        { name: 'Don\'t Worry! We\'re Here to Help!', description: 'The helicopter is here, ready to rescue victims, however the victims around it have panicked and have spread out.' },
        { name: 'Someone Pulled the Fire Alarm!', description: 'The fire alarm has been pulled, and all the victims in the station have panicked.' },
        { name: 'Pair Up!', description: 'Victims are pairing up for safety.' },
        { name: 'There\'s Been an Accident in the Lab!', description: 'An explosion has occurred in the Lab! Any victim in the lab has died in the explosion, and one wall has been blown out, exposing it to the outside.' },
        { name: 'Heavy Storm', description: 'Heavy winter storm makes it much harder to move around outside.' },
        { name: 'Who Goes There?', description: 'Several scientists have arrived from another station.' },
        { name: 'Chow Time!', description: 'The closest victim to the Kitchen is a Chef.' },
        { name: 'What\'s Up Doc', description: 'One of the victims is a doctor, who can help heal the final girl.' },
        { name: 'Comms Specialist', description: 'One of the victims is a comms specialist, who can help radio in the helicopter.' },
        { name: 'Hidden Weapons Cache', description: 'There are now extra weapons hidden throughout the station.' }
      ]
    },
    killer: {
      name: 'The Organism',
      description: `When Chief Scientist Samuel Lissard enticed Kate Carpenter to join him to do some very important biological research in the Arctic, she had no idea she would be fighting for her life at Station 2891 in Antarctica.

Unbeknownst to the other scientists, researchers, and staff at the station, Lissard had developed a mutagenic virus that could, in theory, transform humans into super-human versions of themselves with incredible strength, speed, and toughness. It was time to test the virus on human subjects, but knowing the risks, his client insisted on a remote location and secrecy. Not even his fellow residents of the station could know about the experiment... at least not until the subject's performance could be observed.

To cover as many bases as possible, Lissard recruited scientists from a variety of backgrounds, blood types, builds, genders, and ethnicities. To avoid any suspicion, he brought some parasitic worms with him and injected them with the virus. They were the perfect introduction vehicle and would do all the work by finding a human host all on their own. He only had to preserve them until they reached the warmth of the station, then release them, and wait. If the virus worked, the mutations would quickly follow and it would be quite evident if successful.`
    }
  },
  's2-once-upon-full-moon': {
    filmId: 's2-once-upon-full-moon',
    finalGirls: [
      {
        name: 'Red',
        backstory: `Her friends started calling her 'Red' because she was always wearing the same red hoodie wherever she went. The nickname stuck to the point where some of her friends didn't even know her real name was Chantelle. Chantelle Gilliam to be exact.

Red liked to pull the strings of her hoodie tight so the hood would fit snugly around her head and face. She didn't like it blocking her peripheral vision. Red was always quick. Quick to engage. Quick to escape. Quick to be at her Grandma's at a moment's notice. Anything for Grandma.`
      },
      {
        name: 'Gretel',
        backstory: `Gretel grew up in Storybook Village. Fairy tales are all she's ever known. She is no stranger to danger like witches, wolves, trolls, evil fairies... you name it, she's survived it.

Her brother would often take credit for their survival when telling townsfolk of their exploits, so Gretel's tenacity wasn't well known amongst the residents of the village. Hansel's boasting was annoying, but he was her brother after all. And to be honest, she was happy to let him have the attention. She much preferred the attention of the birds and other animals of the forest anyway.`
      }
    ],
    location: {
      name: 'Storybook Woods',
      description: `What if the stories you were told as a child were true? What if there did exist a place where tales and fables were a reality? Where magic and mischief were real?

They are in fact real, but it isn't what you might think. It would be impossible to get you to understand this fully, but know that the following statement is true. Every world imagined by the inhabitants of Earth does in fact exist. The imagination, daydreams, nightmares, and all of the fantastic creations of the mind are actual visions of real places and times in the known and unknown universe. You don't have to believe it (and most humans don't), but that does not make it any less true.

The location represents a dense, enchanted forest filled with landmarks pulled straight from folklore. You aren't just running through trees; you're navigating past The Three Pigs' Houses, The Grandma's House, and The Beanstalk.

The atmosphere is "dark fantasy horror"—think The Brothers Grimm rather than Disney. The paths are winding, and the location is designed to make you feel like the forest itself is closing in on you.`,
      setupCards: [
        { name: 'Picnic', description: 'Victims are spread around the map, picnics are going on' },
        { name: 'Forest Dwellers', description: 'Victims are mainly in the forest' },
        { name: 'Scatter!', description: 'Victims have panicked, and are spread throughout the map' },
        { name: 'Breadcrumb Trail', description: 'Victims have concentrated in the Glen, on the way to Grandmother\'s house' },
        { name: 'Family Visit', description: 'Many victims are currently visiting Grandmother\'s house' }
      ],
      events: [
        { name: 'Primrose Flowers', description: 'Something is sinister about the flowers in the meadow and glen, victims panic when they enter' },
        { name: 'Harmless Old Woman', description: 'The killer is disguised as Grandmother, and the victims do not realize it!' },
        { name: 'Hansel', description: 'One victim is Hansel, she wants to take her to the Gingerbread house' },
        { name: 'Breadcrumb Path', description: 'Victims took bits of bread and scattered crumbs to lead them home' },
        { name: 'Toll Bridge', description: 'You must pay to cross this bridge' },
        { name: 'Furry Friends', description: 'The woodland creatures realize that you are keeping them safe, but make noise wherever you go' },
        { name: 'Fairy Ring', description: 'All the victims at the Glen disappear. They aren\'t killed, they are just… somewhere else' },
        { name: 'Travelers', description: 'New victims show up at the glen, meadow, and clearing' },
        { name: 'The Woodsman', description: 'The woodsman will help attack the killer, and is eager to help' },
        { name: 'Pied Piper', description: 'Any victims by the pied piper are killed' }
      ]
    },
    killer: {
      name: 'Big Bad Wolf',
      description: `In the world of Final Girl, the Big Bad Wolf isn't just a large animal; he is an apex predator that embodies the terror of being hunted. He is often associated with Storybook Woods, a location that feels ripped from a dark Grimm Brothers tale.

The Nature of the Beast: The Wolf is depicted as a massive, bipedal lycanthrope-style creature, but his behavior is more akin to a calculated serial killer than a mindless beast. He doesn't just kill; he stalks.

The "Big Bad" Persona: He represents the classic "stranger danger" archetype. His mechanics—specifically his ability to move quickly and his "Ambush" style attacks—reflect the folklore of a wolf in sheep's clothing (or at least, a wolf that knows exactly how to corner its prey).

The Connection to "Red": While the game allows any Final Girl to face him, his primary thematic rival is Gretel, a nod to the classic fairy tale protagonist. The lore suggests a cycle of hunter and hunted that has played out across the Storybook Woods for generations.`
    }
  },
  's2-knock-at-door': {
    filmId: 's2-knock-at-door',
    finalGirls: [
      {
        name: 'Ginny',
        backstory: `Ginny Sandin was forced to be independent from a young age. Her family had plenty of money but it came at a cost. Both parents traveled a lot and they moved frequently. With her parents barely present, Ginny spent most of her time with nannies when she was young, and later alone as she got older. She was shy, an introvert, and would spend hours at a time hiking in nearby forests. It didn't matter if it was pouring rain or during a blizzard, she'd still go. These long walks were her favorite way to pass time, alone in her thoughts and at one with nature.

In her late teens, she saw an ad for a survival camp and knew she had to go. They were supposed to visit Egypt that summer and cruise the Nile, but for Ginny, that paled in comparison to spending a summer learning to survive outdoors. She excelled at the camp. At the end of the summer, students had to test their skills by surviving for a week in the bush. Most didn't stray too far from where they were dropped off, and some didn't even last the week. For Ginny, it took 3 days for them to find her after the test was done and even then, she had wanted to stay longer. It was after that summer that Ginny decided to move out and experience life on her own.`
      },
      {
        name: 'Ava',
        backstory: `Ava Tyler grew up in a rough part of town. When she wasn't helping her dad fix small appliances, she was typically mixed up in some trouble and usually a fight or two. She was opinionated, stubborn, and strong-willed, and 'compromise' was not in her vocabulary. She eventually learned to pick her battles, but it took a lot of battles to get there. If nothing else, she picked up some good fighting skills from her various scraps, and also some first aid skills from having to patch herself up.

When she was with her dad, she would spend hours watching him take things apart, carefully label them, and then put them all back when it was fixed. She loved spending her time tinkering with things and as a result, she learned to make do with very little, frequently repairing things multiple times instead of throwing them away. These skills helped her land decent jobs and employers were frequently impressed by her resourcefulness. When she finally made enough to move her family out of the neighborhood, many said she was just one of the lucky ones, but she knew better... her good fortune was the direct result of having to fight for everything she had and taking nothing for granted.`
      }
    ],
    location: {
      name: 'Wingard Cottage',
      description: `Wingard Cottage is a perfect getaway, nestled in the woods on the edge of a pristine lake. The cottage has been in the family for generations, and although it has changed over the years, it still has the same charming quality as when it was first built.

Many special events and relaxing getaways have been hosted here. Unfortunately, it has also seen its share of tragedies—horrible events that have plagued the family throughout the home's history. Best not to dwell on the past though, for surely your stay will be peaceful and carefree…`,
      setupCards: [
        { name: 'Special Occasion', description: 'Party in the cottage!' },
        { name: 'Couples Weekend', description: 'Lots of couples in the cottage, paired up' },
        { name: 'Grad Party', description: 'Grad party in the cottage!' },
        { name: 'Fishing Trip', description: 'Buddies on a fishing trip are the victims' },
        { name: 'Dysfunctional Family', description: 'Family trip, but the victims all hate each other' }
      ],
      events: [
        { name: 'Booby Traps', description: 'The cottage is trapped! All victims in the house panic, anyone leaving the house is killed' },
        { name: 'Battle Ready', description: 'You start with a weapon' },
        { name: 'Home Security', description: 'The cottage is armed with alarms, which can keep the killer out for a bit' },
        { name: 'Marked for Death', description: 'One victim is an outsider and will always be the first to be killed' },
        { name: 'Escape Attempt', description: 'The victim closest to the driveway makes an attempt to get away' },
        { name: 'Getting Resourceful', description: 'The cottage is well set up to make it easier to craft weapons and items' },
        { name: 'Another Way Out', description: 'There is a boat in the lake, and the neighbor has keys to the boat' },
        { name: 'Loser Boyfriend', description: 'One of the victims is your boyfriend, who has secretly been helping the killer' },
        { name: 'Kick-scooter', description: 'A scooter is outside that can help you move around faster' },
        { name: 'Brainstorming', description: '"They called me MacGuyver" — the final girl is much more adept than normal for crafting items' }
      ]
    },
    killer: {
      name: 'The Intruders',
      description: `The news channels are all reporting the same thing: another couple has been found dead in their homes, bodies ravaged and mutilated. The channels are tying them back to the other cult killings that have occurred in the past few months. Rumors say it might even be the same killers from the last set of murders that occurred years ago. If that's true, these killers have been at large for a long-ass time.

The Intruders are a "horde" type Killer consisting of three distinct slashers: Baghead, Redhood, and Zeke. Unlike other killers, their power is split between three individuals, each bringing their own brand of terror to Wingard Cottage.`
    }
  },
  's3-falconwood-files': {
    filmId: 's3-falconwood-files',
    finalGirls: [
      {
        name: 'Octavia',
        backstory: `Raised by a single mom who worked hard to make ends meet, Octavia was used to making do with little. When the government lab was setting up a "sleep lab" to study kids' sleeping patterns, her mom saw it as a free summer camp and sent Octavia to spend a month there.

They weren't studying sleep patterns—that was bullshit—they were trying to stimulate untapped parts of the brain. There were several kids there, and some advanced quicker than others. Octavia struggled to make anything move with her mind, and sucked at being able to read people's minds.

One day, when she was describing a situation, people around her were able to see exactly what she was picturing in her mind. That's when she learned that she could plant images in people's minds… images so real that people thought it was actually happening in front of them. No one else was able to do this, so that made Octavia unique.

Just before her month there was going to end, her mother had a mysterious accident and died. The lab "adopted" her and she became their prisoner. Using her abilities she was able to break out a few years later. She was only 11 but she met a kind man who brought her in and kept her hidden. He died when she was in her early teens, and she's been on her own since.

Octavia's power is projection—the ability to implant vivid, realistic images directly into people's minds. Her targets experience these projections as if they're actually happening, making her a master of misdirection and psychological warfare.`
      },
      {
        name: 'Janelle',
        backstory: `Janelle's classmates considered her a nerd. She loved science and read lots of books. She tried to fit in with the cool kids, but that usually turned out badly.

When she saw posters for the "sleep lab" at the nearby government facility, she begged her parents to let her go… she was hoping to spend the months with other science geeks. She didn't excel at any of the mind tests like some of the other kids. She was sometimes able to nudge something with her mind but it was rare.

When the month was up, she was sent home. Some kids stayed longer and Janelle was so jealous of them. When she went back to school in September, the bullying just got worse.

One day, when Janelle was at an all time low from the bullying, she erupted in anger and threw a boy across the cafeteria with her mind. Most of the kids didn't notice what had happened and no one believed those that did. But her parents believed her and kept her ability hidden.

With the help of a friendly scientist that they knew, she was able to develop her telekinetic powers and more discreetly use her abilities. From that point onwards, anyone who bullied her suffered mysterious injuries from what appeared to be freak accidents.

Janelle's power is telekinesis—the ability to move objects with her mind. While she struggled to develop this ability at first, intense emotional triggers unlocked its full potential, making her a formidable force when pushed to her limits.`
      }
    ],
    location: {
      name: 'Falconwood',
      description: `At first glance, Falconwood is the American dream in 35mm. Manicured lawns, a bustling mall, and quiet cul-de-sacs. But look closer, and the tracking starts to bleed. There's a hum coming from the woods that isn't insects, and the power lines flicker in a rhythm that feels like a warning.

The town isn't just a place; it's a thin spot in reality. People here don't just leave—they're erased, leaving behind nothing but an entry in a journal that no one wants to believe is real.

Falconwood is a quiet, unassuming small town where the veneer of suburban normalcy has begun to crack. For years, the town has been the site of "peculiar things"—unexplained phenomena, shadowy government experiments, and a string of disappearances that the local authorities have been unable (or unwilling) to solve.

The town's history is being documented by a group of local youths in a collective journal known as The Falconwood Files. What started as a hobby to track local urban legends and "government spooks" turned into a grim reality when people began vanishing into thin air, pulled into a dark, parallel world.`,
      setupCards: [
        {
          name: '4th of July Weekend',
          description: 'The town is out celebrating Independence Day weekend.'
        },
        {
          name: 'Back to School',
          description: 'Summer is over and the kids of Falconwood are heading back to school.'
        },
        {
          name: 'Halloween',
          description: 'It\'s Halloween night in Falconwood — costumes, candy, and something far worse stalking the streets.'
        },
        {
          name: 'Election Day',
          description: 'The town turns out to vote on Election Day.'
        },
        {
          name: 'New Year\'s Eve',
          description: 'Falconwood rings in the New Year — but not everyone will see midnight.'
        }
      ],
      events: [
        {
          name: 'Packed Bridge',
          description: 'It is harder to cross bridges now.'
        },
        {
          name: 'Bridge Repair',
          description: 'One of the bridges is under construction and can no longer be used.'
        },
        {
          name: 'Grand Opening',
          description: 'A new bridge has been built!'
        },
        {
          name: 'Conspiracy Theorist',
          description: 'There is a conspiracy theorist at the shopping mall.'
        },
        {
          name: 'Head Researcher',
          description: 'There is a head researcher now at the government lab.'
        },
        {
          name: 'Pizza Delivery',
          description: 'You have access to a van.'
        },
        {
          name: 'Helping Hands',
          description: 'Gain early progress in your mission.'
        },
        {
          name: 'Dry Spell',
          description: 'You can use all river crossings until it rains.'
        },
        {
          name: 'Freaks and Geeks',
          description: 'One less victim will follow you now.'
        },
        {
          name: 'Game of Chance',
          description: 'Luck is in the air — you feel like you\'ve got some especially good or bad luck coming up soon.'
        }
      ]
    },
    killer: {
      name: 'Slayer',
      description: `Something is rotten in the heart of Falconwood. It doesn't just stalk; it tears through the fabric of reality itself. The Slayer is a nightmare from the Mirror Dimension—a silent, predatory force that turns our familiar world into a cold, dark reflection. Once you hear the static and the air turns thin, it's already too late. You aren't just being hunted; you're being erased.

The Slayer has a tall, unnaturally gaunt humanoid frame. Its limbs are slightly too long, giving it a spider-like, predatory gait. It doesn't wear clothes; instead, its "skin" has a texture like wet, charred obsidian or dark, bruised muscle.

It lacks a traditional face. Where eyes and a nose should be, there is only smooth, stretched skin that ripples as if something is moving underneath. Its only feature is a jagged, lipless maw that opens wider than a human jaw should, filled with rows of needle-like teeth.

The Slayer exists between dimensions, emerging from the Mirror Dimension to hunt its prey. When it appears, reality distorts—lights flicker, static fills the air, and shadows move independently of their sources.`
    }
  },
  's3-marrek-murders': {
    filmId: 's3-marrek-murders',
    finalGirls: [
      {
        name: 'Mandy',
        backstory: `Mandy Williams was supposed to be a doctor. At least that's what her parents wanted for her. Mandy never wanted to save people… she found much greater enjoyment in kicking their asses.

Fighting for a living is her goal, but for now she's a line worker at Marrek Warehouse so she can pay the bills. She trains in MMA at night and is paying her dues waiting for her opportunity… her shot.

She never expected that the fight of her life would happen at her place of work.`
      },
      {
        name: 'Cassie',
        backstory: `Cassie Smith is an escape room enthusiast with a penchant for roleplaying and chaos. She is well known by her friends for overdressing for the occasion and a love of axes. It was perhaps too easy to lure her to the Marrek Warehouse with a mysterious flyer that appeared in her mailbox promising "a horror escape experience you won't soon forget!"

What her captor didn't expect, however, was that under the fancy dress and quirky personality lay a survivor that was almost too willing to inject a horrific level of chaos into their plans. All Cassie needed to do was find the perfect weapon to defend herself… or… chop them up into little pieces… depending on how you look at it.`
      }
    ],
    location: {
      name: 'Marrek Warehouse',
      description: `"The locking system in Marrek Warehouse is state of the art and the first of its kind. Devised by our ingenious mechanical engineers, the system ensures precise shift changes and security." - Loctrocel Inc. spokesperson during the ribbon cutting ceremony for Marrek Warehouse.

The Marrek Warehouse presents itself as a squat, anonymous industrial structure of concrete and corrugated steel, fenced off with patched chain-link and secured by heavy locks that feel more symbolic than reassuring. Inside, the air is cool and stale, carrying dust, oil, and old chemical residue soaked into the floor. Fluorescent lights buzz overhead in uneven rows, leaving pockets of dimness between them. The walls are lined with narrow service corridors and sealed doors, many chained or padlocked, their purpose long forgotten. Sound behaves strangely here—footsteps echo sharply and then vanish, swallowed by the sheer volume of the space.

At the heart of the warehouse lies the central depression known as The Pit—a sunken concrete area that disrupts the otherwise flat floor plan and draws the eye no matter where you stand. A lone industrial forklift sits abandoned at its edge, forks lowered as if left mid-task, its chipped paint and dead controls suggesting it hasn't moved in years. The Pit creates a natural focal point and a constant sense of exposure; anyone crossing its edges feels visible, while anyone below feels watched. The space around it amplifies every movement, turning even cautious steps into declarations.

Surrounding all of this are the stacked boxes—towering metal shelves and palletized crates rising high enough to block light and sightlines alike. Many are unmarked or mislabeled, wrapped in yellowed plastic or rotting cardboard, forming narrow aisles that twist the warehouse into a maze. These stacks provide momentary cover but also trap sound and shadow, making it impossible to tell whether the creak you heard came from shifting weight, settling steel, or something moving where it shouldn't.`,
      setupCards: [
        {
          name: 'Units Per Hour',
          description: 'The killer and the final girl are on the main floor, with the victims well spread out - the victims are all working.'
        },
        {
          name: 'Unloading',
          description: 'Victims are unloading in the loading bays.'
        },
        {
          name: 'Shift Change',
          description: 'Victims are changing shifts, most in and around the main entrance.'
        },
        {
          name: 'Daily Huddle',
          description: 'Victims are having a standup meeting in the center of the warehouse.'
        },
        {
          name: "You're Fired",
          description: 'One victim is in the midst of getting fired in the manager\'s office.'
        }
      ],
      events: [
        { name: 'The Supervisor', description: 'There\'s a supervisor on the floor now, trying to direct the workers.' },
        { name: 'Trucks Are Here!', description: 'Lots of new victims have just arrived on the loading docks.' },
        { name: 'Help on the Racks', description: 'Victims have been asked to help out in the rack areas of the warehouse.' },
        { name: '"You Aren\'t Going Anywhere"', description: 'All exits in the warehouse are now locked.' },
        { name: '"It Has Been 0 Days Since…"', description: 'Victims in the racks that panic die by horrific workplace accidents.' },
        { name: 'Good Ole Zipp', description: 'One victim is called Zipp and he can help unlock locked doors.' },
        { name: 'Heroic Best Friend', description: 'You have a best friend in the Warehouse, who protects you.' },
        { name: 'Scatter!', description: 'All victims panic and scatter throughout the warehouse.' },
        { name: 'Tumbling Boxes', description: 'There are severed heads in the warehouse boxes!' },
        { name: 'Smarter Than They Look', description: 'Victims can now leave the warehouse on their own.' }
      ]
    },
    killer: {
      name: 'The Tormentor',
      description: `The Tormentor is a masked figure with a feminine silhouette, though the mask remains a blank, terrifying void. She doesn't carry a machete or a chainsaw; she carries tools—wrenches, pliers, and remote triggers. Her presence is often heralded not by a scream, but by the mechanical whirring of a timer or the clicking of a lock.

The Tormentor was never interested in the act of killing for its own sake. What fascinated her was process—how fear unfolds when people believe there is still time. Long before the Marrek Warehouse became a crime scene, she studied systems: locks, pressure mechanisms, failsafes, and the psychology of choice under stress. Victims weren't hunted so much as placed, arranged into scenarios that appeared solvable at a glance. A chained door that almost gives. A mechanism that should release. A countdown that suggests mercy if you act quickly enough. Survivors—if there were any—would later say the worst part wasn't the pain, but the moment they realized the rules had been written to betray them.

The Tormentor exists more as an absence than a presence. She normally isn't seen at all—only felt through sprung traps, locked corridors, and victims suspended in cruel limbo. When she finally reveals herself, she is almost anticlimactic: not a towering monster, not an unstoppable force, but the calm author of everything that has already gone wrong. By the time she is confronted face to face, the Tormentor has usually done what she came to do. The question is no longer whether the killer can be stopped—but whether stopping her still means anything.`
    }
  },
  // Vignette: Terror From Above (Season 1)
  's1-terror-from-above': {
    filmId: 's1-terror-from-above',
    isVignette: true,
    vignetteDescription: `A cloud hangs over you and the rest of the unsuspecting victims in the area. You soon realize it is no cloud at all and that rain would be a more preferable occurrence than what is about to take place. You watch in horror as the first bird dives and is quickly followed by what seems like a hundred more. The screams begin and you snap yourself alert trying to determine the best course of action. How will you survive this Terror From Above?`,
    finalGirls: [
      {
        name: 'Melanie',
        backstory: `Melanie Brown was an uptown girl and possessed a strong sense of style and sophistication. A business woman that relished in "winning", particularly when dealing with men. Melanie was as competitive as they come.

She had a softer side at home, and did not discriminate when it came to her relationships. She found equal enjoyment in the company of both men and women, though she'd never let her business partners in on that. In fact, it would be detrimental if they knew. As such, she would travel outside of the city in her leisure time to avoid the risk of someone she knew seeing something that was none of their business. There is one town by the bay she was known to frequent, but she also greatly enjoyed wine country.

Melanie experienced some abuse when she was a child. Though it is something that should never happen to anyone, it did happen and she learned from it. Specifically, she learned to fight through pain and channel it and turn it into strength. In adulthood, those that crossed the line with her ended up wishing they hadn't.`
      }
    ],
    killer: {
      name: 'Birds',
      description: `No one knows what caused a 'storm' of birds to descend on a small bay town a few years back, but since it happened officials and scientists have been trying to determine why. Witness accounts from the few survivors indicated thousands and thousands of birds descended on the area, their activity ranged from gathering and being a general nuisance, to outright attacking and killing people.

The birds attack in coordinated swarms, diving from the sky with razor-sharp beaks and talons. Crows, seagulls, ravens - all manner of winged creatures have joined this murderous flock. Their eyes seem to gleam with an unnatural intelligence, and their attacks are anything but random.`
    }
  },
  // Vignette: Terror From the Grave (Season 2)
  's2-terror-from-grave': {
    filmId: 's2-terror-from-grave',
    isVignette: true,
    vignetteDescription: `The dead have risen. Everyone wants to know why, how it happened. But we have no answers. The only thing we can do is survive. Take each day, hour, minute, and second, one at a time. Protect ourselves and the ones we love.

It shouldn't have happened like it did. They are slow. They are easy to kill. But their sheer numbers, their collective resiliency, their ability to multiply by killing the living, it is something that we are struggling to contain.

Hordes of them now walk the land. Boarding up and staying put only works for so long. If you can find a secluded place their taint has not yet touched, you might be able to live in peace for a few days or weeks. We are living on hope. And it is running out. We are tired. The old world is gone. We, the living, now coexist with the dead. Not by choice, but by necessity.

Kill if and when you must, but never believe you are safe. For there are always more.`,
    finalGirls: [
      {
        name: 'Patsy',
        backstory: `Patsy had never had a violent interaction in her whole life. There was an aggressive survival instinct laying dormant inside of her that would be awoken one day when the dead started rising from their graves.

Patsy would have her innocence stolen, not by the living, but by the dead. And oh it would awaken a rage inside of her. She just found out she was expecting her first child. She had to survive. THEY had to survive.`
      }
    ],
    killer: {
      name: 'Zombies',
      description: `The dead have risen. Hordes of shambling corpses now walk the land, their numbers growing with every victim they claim. They are slow. They are easy to kill. But their sheer numbers, their collective resiliency, their ability to multiply by killing the living—it is something that we are struggling to contain.

Boarding up and staying put only works for so long. The old world is gone. We, the living, now coexist with the dead. Not by choice, but by necessity. Kill if and when you must, but never believe you are safe. For there are always more.`
    }
  },
  // Vignette: Terror From Destiny (Season 3)
  's3-terror-from-destiny': {
    filmId: 's3-terror-from-destiny',
    isVignette: true,
    vignetteDescription: `The five close friends should have died in the horrifying and bloody accident. Only because of a freakish premonition did they manage to avoid the accident and escape the reaper's blade. But now they are dying one by one in increasingly bizarre accidents, and it has become clear that some power from beyond the grave—call it death, fate, or Destiny—is taking the lives that were stolen from it.

Can you solve the puzzle of who is fated to die next and get to them in time before the long arm of Destiny claims yet another victim? If you can't, then there's no hope that you will survive this Terror From Destiny.

Destiny doesn't represent a traditional physical killer. There is no masked murderer stalking the board, no single body to fight. Instead, the "killer" is an invisible force: fate, death, inevitability. The theme is that death was cheated, and now it is correcting the ledger. The threat comes from chains of events, unlucky combinations, and puzzle-like prediction rather than pursuit. Victims don't just get attacked—they fall into situations. Something tips, something fails, something goes wrong at exactly the wrong time. The horror is inevitability, not brutality.`,
    finalGirls: [
      {
        name: 'Gabrielle',
        backstory: `Gabrielle always had an overactive imagination. Her parents had her professionally tested multiple times, thinking she was gifted or neurodivergent or "special" in some way. The tests always came back negative, the doctors insisting her daydreams and "visions" were normal for her age.

And then one day Gabby's visions saved her life and the life of her friends. Or so she thought.`
      }
    ],
    killer: {
      name: 'Destiny',
      description: `Destiny is not a creature, not a person, not something that can be fought in any traditional sense. It is the invisible hand of fate itself, reaching out to correct a cosmic imbalance. When the five friends cheated death through Gabrielle's premonition, they created a debt that must be paid.

Now death is collecting. One by one, in increasingly elaborate and seemingly accidental ways, the survivors are being claimed. A loose bolt here, a faulty wire there, a chain of unfortunate coincidences that all lead to the same inevitable conclusion. You cannot outrun Destiny. You cannot hide from it. You can only hope to predict its design and intervene before the next victim falls.

The horror lies not in a monster lurking in the shadows, but in the realization that the universe itself has turned against you. Every creak, every flicker, every minor malfunction could be the beginning of a carefully orchestrated demise. Destiny is patient, methodical, and absolutely certain.`
    }
  },

  's4-shriek': {
    filmId: 's4-shriek',
    finalGirls: [
      {
        name: 'Adrianne',
        backstory: 'No detailed backstory available yet.'
      },
      {
        name: 'Maureen',
        backstory: 'No detailed backstory available yet.'
      }
    ],
    location: {
      name: 'MegaBGCon',
      description: `MegaBGCon is a sprawling board game convention packed wall-to-wall with booths, crowds, food vendors, and nonstop activity. What should feel like a celebration of gaming instead becomes a maze of noise, panic, and danger, with victims too overwhelmed to follow willingly and chaos erupting across the convention floor. The location is divided into Exhibit Areas, the Food Court, and General Areas, with crowded hallways, busy exits, and booth activity constantly introducing new people and new problems. MegaBGCon is convention chaos weaponized. The floor is crammed with search opportunities, parody booths, food, fans, and bottlenecks, but saving people here is harder than it looks. Victims won't simply follow along, booth activity keeps generating new trouble, and the packed hallways make every turn feel like a scramble to stay ahead of mounting panic.`,
      setupCards: [
        { name: 'Busiest Day', description: 'The event is packed to capacity with attendees.' },
        { name: 'Family Day', description: 'The event is full of families.' },
        { name: 'First Day', description: 'It is the first day of the convention.' },
        { name: 'Last Day', description: 'It is the last day of the convention.' },
        { name: 'Mega Events', description: 'The biggest event day—all the things are going on!' }
      ],
      events: [
        { name: 'Annoying Reporter', description: '"This is Courtney Storm, on the scene!" An annoying reporter follows you around.' },
        { name: 'Food Trucks Are Here!', description: '"Let\'s get some Island Noods!" Food trucks have arrived at the convention.' },
        { name: 'Industry Bad Boy', description: '"Some love him, some hate him." He can either be your friend or your enemy.' },
        { name: 'Lunch Time!', description: '"Let\'s go check out the food trucks!" It\'s lunch time at the convention.' },
        { name: 'Media Starlet', description: '"I heard she has over 1 million subscribers OMG!" The media starlet shows up but won\'t follow you anywhere.' },
        { name: 'Nervous Attendees', description: '"Something feels... off this year." The attendees are nervous and uneasy.' },
        { name: 'Popular Game Designer', description: 'There is a board game booth with a popular Game Designer drawing crowds.' },
        { name: 'Stampede', description: '"The doors are open. Go! Go! Go!" A stampede of attendees rushes through.' },
        { name: 'SWAG Roulette', description: '"Don\'t open it until we leave. I want it to be a surprise!" Mystery swag bags are being distributed.' },
        { name: 'Ticketed Events', description: '"Hand me your tickets and have a seat." Two new victims enter the location.' }
      ]
    },
    killer: {
      name: 'Mort the Teenage Dirtbag',
      description: `Mort the Teenage Dirtbag wears a charcoal hoodie, red-and-black pants, and a ghost mask with one large eye. Inspired by the 'Scream' series, Mort's powers revolve around multiple killers working together to confuse investigators as to their identities. As one witness described: "I saw this dude in a pig mask kill a guy! But then he disappeared, and then I saw him and ripped his mask off and it was my best bro Tom! And Tom was like, 'I didn't kill no one, what's your damage?' And then we saw a babe in one of those Tormentor outfits and she TOTALLY killed this other babe, and we tackled her, but then it was just some kid who swore she didn't kill anyone. So WHAT THE HELL IS GOING ON?" The horror of Mort is that anyone could be the killer—and by the time you figure out who's behind the mask, it might already be too late.`
    }
  },
};

export const getFilmDetails = (filmId: string): FeatureFilmDetail | undefined => {
  return FEATURE_FILM_DETAILS[filmId];
};

// Helper to get setup cards for a location
export const getSetupCardsForLocation = (filmId: string): { name: string; description: string }[] => {
  return FEATURE_FILM_DETAILS[filmId]?.location?.setupCards ?? [];
};

// Helper to get events for a location
export const getEventsForLocation = (filmId: string): { name: string; description: string }[] => {
  return FEATURE_FILM_DETAILS[filmId]?.location?.events ?? [];
};
