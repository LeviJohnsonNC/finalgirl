import { CREECH_SOURCE,CREECH_VISUAL,CREECH_SETUPS,CREECH_EVENTS,CREECH_ITEMS,CREECH_TERRORS,CREECH_SPACES,CREECH_ONE_WAY,HELICOPTER_INTERPRETATION,creechSetupDescription } from '../../../supabase/functions/_shared/play/creech';
import type { EntityRuleModule,ModulePromptContext } from './moduleRules';
const cards=(list:readonly {name:string;effect:string}[])=>[...list].sort((a,b)=>a.name.localeCompare(b.name)).map(c=>`${c.name}: ${c.effect}`);
export const creechRules:EntityRuleModule={
 entity:'Creech Manor',kind:'location',filmId:'s1-creech-manor',source:CREECH_SOURCE,credits:{design:'A.J. Porfirio',art:'Tyler Johnson; additional Item art Tumo Mere'},
 tags:['creech manor','windows','ladder','rope ladder','padlock','helicopter','ghost hunters','skull','attic','light’s out','setups'],seeAlso:['saving-victims','bloodlust','horror-rolls'],
 setup:[{type:'paragraph',text:'Choose any Killer independently. Use the selected Setup below, the three Item decks at Garage, Closet and Attic, and resolve the starting Event physically. Board-relative descriptions below label unnamed spaces without inventing official room names. All five Setups place 10 ordinary Victims; special Events replace or add Victims only as instructed.'},...CREECH_SETUPS.flatMap(s=>[{type:'heading' as const,level:3 as const,text:s.name},{type:'paragraph' as const,text:creechSetupDescription(s)}])],
 rules:[
 {type:'heading',level:3,text:'Movement, adjacency and the external ladder'},
 {type:'paragraph',text:'Three one-way connections restrict movement for the Final Girl, Enemies and Victims. The spaces remain adjacent in both directions. You cannot climb the tire swing back into a Window or climb up through the hole above the left washroom. Rope Ladder is the exception and makes its chosen one-way connection two-way.'},
 {type:'list',items:CREECH_ONE_WAY.map(r=>r.name)},
 {type:'paragraph',text:'The external ladder joins the left outside Exit to the left washroom (called the 3rd-floor washroom on the sheet). Broken Ladder removes both movement and adjacency between these endpoints. The drawn Attic ladder is decorative and never affected by ladder effects. Rope Ladder is discarded either to repair the external ladder or to place its own token, not both.'},
 {type:'heading',level:3,text:'Windows and inside/outside'},
 {type:'paragraph',text:'There are three blue Window spaces: the left washroom and two right-side Windows. They have no inherent additional rule; Events and Terrors refer to them. Only the three green Exit spaces are outside; every other board space is inside. The Helicopter is not an Exit.'},
 {type:'table',headers:['Board-relative ID','Space'],rows:CREECH_SPACES.map(s=>[s.id,s.name])},
 {type:'heading',level:3,text:'Events and Ghost Hunters'}, {type:'list',items:cards(CREECH_EVENTS)},
 {type:'callout',variant:'note',title:'Helicopter and Epic Power · unresolved interaction',text:HELICOPTER_INTERPRETATION},
 {type:'paragraph',text:'Keep the once-per-game Helicopter use even when its Event ends. Ghost Hunters uses up to three replacement Victims, identified by orange, blue and white meeples; their names and appearances are not printed character identities. A hunter outcome and an optional observed final Bloodlust value save together. Resolve the ordinary increase, extra increase and all track consequences on the physical board. Status corrections do not repeat them. Saved/killed totals remain separate observations.'},
 {type:'heading',level:3,text:'Location Terror cards · 8 cards'}, {type:'list',items:cards(CREECH_TERRORS)},
 {type:'heading',level:3,text:'Items · 18 cards'}, {type:'list',items:cards(CREECH_ITEMS)},
 {type:'paragraph',text:'Token controls report actual placements and outcomes. Finding an Item is not proof it is still held or used. Light’s Out can remain active while its penalty is ignored with a held Flashlight or Candle. The temporary windows/doors restriction is explicitly ended after the next Action phase; a round increment alone does not resolve it. No One Comes Back records a hazard, not an inferred death count.'},
 ]
};
export const CREECH_PROMPT_CONTEXT:ModulePromptContext={
 visualGuidance:CREECH_VISUAL,
 rulesSummary:'Creech Manor has three one-way movements but bidirectional adjacency, except Broken Ladder removes both for its external connection. Three blue Windows; only three green Exits are outside. Rope Ladder can repair the external ladder OR reverse one one-way route. Ghost Hunters replaces up to three Victims, cannot follow before a group death, adds one extra Bloodlust per killed hunter. Helicopter is one use, not an Exit. Only explicit observations establish outcomes.',
 narrativeGuidance:'Creech Manor follows the selected Location, independently of the Killer. Preserve real manor rooms and board-relative unnamed spaces. Do not invent hunter identities, a roof rescue, casualties, inventory or damage from decorative photos or card activation. Ghost Hunters replaces existing people. Skull hazard and broken routes are only present when recorded. A helicopter rescue is distinct from entering an Exit and does not automatically establish victory. Preserve reviewed rescue route and passengers; unknown is unknown.'
};
