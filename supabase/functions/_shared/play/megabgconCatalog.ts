export const MEGABGCON = "MegaBGCon";
export const MEGABGCON_MODULE = "megabgcon";
export const MEGABGCON_SOURCE = "Shriek · MegaBGCon location sheet and cards";

export const CON_SETUPS = ["First Day", "Family Day", "Busiest Day", "Last Day", "Mega Events"] as const;
export const BOOTHS = [
  "Hatrock Games", "OutsideDown Games", "Rumbleworks Games", "Soxley",
  "Sorcerous Marvels", "Publicly Traded Company Games", "Pristine Continent Games",
  "Van Ryder Games", "Fortunate Fowl Games", "Slatemayor Games", "Follower Games",
  "Upstanding Citizen Studios",
] as const;
export type Booth = (typeof BOOTHS)[number];
export const CON_SPACES = [
  ...BOOTHS, "Food Court", "Main Hallway", "Side Hallway", "Center Hallway",
  "Back Docks", "Side Docks", "Event Docks", "Event Hall", "Tarmac",
] as const;

export const CON_PEOPLE = [
  { id: "designer", name: "Popular Game Designer", person: "Game Designer", booth: true, effect: "Draw a Booth to place the Designer. While sharing their space, reroll one die of your choice once per Action phase. Their death adds one extra Bloodlust." },
  { id: "starlet", name: "Media Starlet", person: "Media Starlet", booth: true, effect: "Draw a Booth to place the Starlet. They never follow. Saving them lets you choose one unused Item." },
  { id: "reporter", name: "Annoying Reporter", person: "Annoying Reporter", booth: false, effect: "Place the Reporter with you. She must follow you and costs one Time if still with you at the end of the Action phase. To save her, discard Weak Attack in an Exit space." },
  { id: "bad-boy", name: "Industry Bad Boy", person: "Industry Bad Boy", booth: true, effect: "Draw a Booth for him and choose Friend or Enemy. Saving a Friend reduces Horror twice and his death raises Horror twice. Saving an Enemy costs one Health. An Enemy death adds no Bloodlust." },
] as const;
export const CON_ONGOING = [
  { id: "food-trucks", name: "Food Trucks Are Here!", effect: "You can save Victims from the Side Hallway remotely. Discard after the first rescue made without being there." },
  { id: "nervous", name: "Nervous Attendees", effect: "Add a die to Horror rolls for Create a Panic." },
] as const;
export const CON_EVENTS = [
  ...CON_PEOPLE, ...CON_ONGOING,
  { id: "lunch", name: "Lunch Time!", effect: "For the next two Action phases, Victims can follow out of Exhibit Areas. Remove one marker at the end of each of those phases, then discard." },
  { id: "stampede", name: "Stampede", effect: "Panic Victims in the Main and Side Hallways. Move only those whose result sends them into an Exhibit Area." },
  { id: "tickets", name: "Ticketed Events", effect: "Add two new Victims to the Event Hall." },
  { id: "swag", name: "SWAG Roulette", effect: "Draw three Booths as locations. Add a Victim with a sealed SWAG token at each. Reveal and resolve their reward on rescue. Discard it unseen if they die. Discard the Event when all three are out of play." },
] as const;
export const BOOTH_EFFECTS = [
  { id: "crowd", name: "Shoulder to Shoulder", label: "Crowd", effect: "At this Booth, roll one fewer die on Action cards, to a minimum of one." },
  { id: "wet-floor", name: "Wet Floor", label: "Wet Floor", effect: "End your movement when you enter this Booth." },
  { id: "sale", name: "Mega Sale!", label: "Mega Sale", effect: "You may add one die to Search at this Booth." },
] as const;
export const BOOTH_EVENTS = [
  ...BOOTH_EFFECTS,
  { id: "sold-out", name: "Sold Out!", effect: "Panic every Victim in the Booth." },
  { id: "cosplay", name: "Cosplay Conundrum", effect: "Move all Victims one space toward the Killer." },
  { id: "star-sighting", name: "Star Sighting", effect: "If needed, reveal Events until one brings a Special Victim into play and shuffle the other revealed cards back. Move the nearest Special Victim to the Booth." },
  { id: "hotness", name: "New Hotness", effect: "Add two new Victims at the Booth." },
  { id: "shady", name: "Shady Practices", effect: "Place the Killer in the Booth." },
  { id: "accident", name: "Tragic Accident", effect: "A Victim at the Booth dies. If there are no Victims there, raise Bloodlust instead." },
  { id: "promo", name: "Free Promo Card!", effect: "Move Victims from adjacent spaces into the Booth." },
] as const;

export const CON_TERRORS = [
  { name: "Deadly Encounter", effect: "With no Victims, discard and draw another Terror. Otherwise, pursue and attack a Victim, then move toward a Victim again.", death: true },
  { name: "Someone Is Following Me!", effect: "With no Victims, discard and draw another Terror. Otherwise, panic Victims at or adjacent to the Killer, then pursue and attack a Victim.", death: true },
  { name: "No One Is Safe!", effect: "Draw a Booth for the Killer and attack the nearest Victim or Final Girl. Repeat the Booth placement and attack twice. Raise Bloodlust twice if nobody was attacked.", death: true },
  { name: "A Lot Going On Today!", effect: "Resolve an Event. With at most one regular Event still in play, raise Horror twice. With at least two, resolve another Terror. Exclude Booth Events from this count." },
  { name: "Killer Choices", effect: "Move toward the Final Girl, then a Victim, then pursue and attack the nearest Victim or Final Girl.", death: true },
  { name: "Angry Customers", effect: "With no Victims in Exhibit Areas, discard and draw another Terror. Otherwise, reveal Booths until one contains Victims. They attack one target there in order of priority: Final Girl, Minion, Killer. Damage equals the Victim count there. If no one was attacked, raise Horror twice." },
  { name: "What’s the Commotion?", effect: "Pursue and attack the nearest Victim or Final Girl, then resolve an Event.", death: true },
  { name: "Organized Theft", effect: "Remove the top Item from each deck. Lose one Time for each face-up card and raise Horror once for each face-down card. Then resolve an Event." },
] as const;

export const CON_ITEMS = [
  { name: "Box Cutter", copies: 2, effect: "One-handed attack aid adding one damage at range zero." },
  { name: "Convention Staff Badge", effect: "Victims will follow you out of Exhibit Areas." },
  { name: "Energy Drink", effect: "Discard to skip the next Killer phase." },
  { name: "Hammer", effect: "Adds one die to Create a Panic. It is also a one-handed attack aid adding one damage at range zero." },
  { name: "Coupon Book", effect: "Add one die to Search in Exhibit Areas." },
  { name: "Cash Money", copies: 2, effect: "Three uses. Take a Search Action card into your hand from anywhere." },
  { name: "Magic Potion", effect: "Discard and roll. On 1–2 reduce Horror three times, on 3–4 take any Action card, on 5 reveal your Ultimate Ability, and on 6 gain an extra die for the game." },
  { name: "Food", effect: "Two uses. Roll a die and heal half the result rounded up." },
  { name: "Convention Program", effect: "You may peek at the top of either or both Booth and Booth Event decks at any time." },
  { name: "Deodorant", effect: "Five uses. Panic one Victim in your space. You may reroll once and must keep the new result." },
  { name: "Van Ryder Games Bag", effect: "Discard immediately and take the top two Items from one Item deck." },
  { name: "Medical Buggy Keys", effect: "Place the Buggy with you. It can move with you and causes Victims in a space it enters to panic, except those following you. When entering an Enemy’s space, you may discard it to deal two damage to that Enemy." },
  { name: "Folding Chair", effect: "Two-handed attack aid adding one damage at range zero or one. Discard after using it at range one." },
  { name: "Convention Beer", effect: "Roll an extra die for Horror rolls for the rest of the Action phase. Discard the Beer and your hand at the end of that phase." },
  { name: "Giant Board Game", effect: "Two uses. Two-handed attack aid adding two damage at range zero." },
  { name: "LARP Shield", effect: "Three uses. If you would take at least two damage, reduce it by one." },
] as const;
export const CON_VISUAL = "Candid consumer 35mm photographs in a busy gaming convention with colorful fabric booth dividers, analog tabletop displays, red patterned carpet and fluorescent practical light. The Food Court, main corridor, and grey freight docks have distinct landmarks. Keep the selected cast consistent and use specific event details only when observed.";
