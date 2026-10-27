/** Standard-mode owner photos creech1–creech6.jpeg, 2026-10-27. */
import type { ModuleState, ModuleValue, ModuleObservation } from './modules.ts';
export const CREECH_SOURCE = 'Owner photos creech1–creech6.jpeg (2026-10-27), standard mode';
export const CREECH_VISUAL = 'A real old multi-storey manor, dark timber and stone, aging plaster, narrow stairs, Trophy Room, Ballroom, Foyer, Garage, Closet and Attic. Preserve the selected Creech Manor identity. Three window spaces and an external left-side ladder are distinct landmarks. The Attic drawing ladder is decorative. Helicopter, Skull, hunters, broken routes and Items exist in the story only if explicitly reported, never from UI photographs.';
export const HELICOPTER_INTERPRETATION = 'The Helicopter is not an Exit. Its Carolyn rescue permission and the Epic Power requirement to reach an Exit are not authoritatively reconciled by the supplied components. Record your confirmed physical outcome; the app does not adjudicate victory or treat the Helicopter as an Exit. Invisible Barrier specifically restricts entering an Exit.';
export const CREECH_SPACES = [
 ['attic','Attic'],['upper-left','Upper-left room (below Attic)'],['upper-center','Upper-center room (below Attic)'],['upper-right','Upper-right room (below Attic)'],['closet','Closet'],
 ['washroom','Left washroom (external ladder)'],['trophy-room','Trophy Room'],['middle-center','Middle-center room'],['middle-stairs','Middle-right stairwell'],['upper-right-window','Upper-right Window'],
 ['lower-left','Lower-left room'],['lower-center','Lower-center stairwell'],['lower-right','Lower-right room'],['lower-right-window','Lower-right Window'],
 ['garage','Garage'],['ground-left','Ground-floor room beside Garage'],['foyer','Foyer'],['ballroom','Ballroom'],['outside-left','Left outside Exit'],['outside-center','Center outside Exit'],['outside-right','Right outside Exit'],
].map(([id,name])=>({id,name}));
export const creechSpaceName = (id: unknown) => CREECH_SPACES.find(s=>s.id===id)?.name ?? 'Not recorded';
/** Printed interior connections for Padlock choices; IDs are board-relative, not invented official room names. */
export const CREECH_CONNECTIONS = [
 ['garage','ground-left'],['ground-left','foyer'],['foyer','ballroom'],['foyer','outside-center'],['outside-left','outside-center'],['outside-center','outside-right'],
 ['lower-left','lower-center'],['lower-center','lower-right'],['lower-right','lower-right-window'],['foyer','lower-center'],['lower-center','trophy-room'],['lower-center','middle-center'],
 ['washroom','trophy-room'],['trophy-room','middle-center'],['middle-center','middle-stairs'],['middle-stairs','upper-right-window'],['middle-stairs','upper-right'],
 ['upper-left','upper-center'],['upper-center','upper-right'],['upper-right','closet'],['upper-center','attic'],['outside-left','washroom'],
 ['upper-left','washroom'],['upper-right-window','outside-right'],['lower-right-window','outside-right'],
].filter(([a,b])=>!a.startsWith('outside-')&&!b.startsWith('outside-')).map(([a,b])=>({id:`${a}~${b}`,a,b,name:`${creechSpaceName(a)} ↔ ${creechSpaceName(b)}`}));
export const CREECH_ONE_WAY = [
 {id:'left-drop',from:'upper-left',to:'washroom',name:'Upper-left room → left washroom'},
 {id:'upper-window',from:'upper-right-window',to:'outside-right',name:'Upper-right Window → right outside Exit'},
 {id:'lower-window',from:'lower-right-window',to:'outside-right',name:'Lower-right Window → right outside Exit'},
] as const;
export const CREECH_HUNTERS = ['orange','blue','white'] as const;
export const CREECH_PEOPLE = CREECH_HUNTERS.map(id=>({id,name:`${id[0].toUpperCase()+id.slice(1)} Ghost Hunter`}));
export const CREECH_EVENTS = [
 {id:'liquid-courage',name:'Liquid Courage',ongoing:true,effect:'Victims will follow you into the Killer’s space.'},
 {id:'frozen-in-fear',name:'Frozen in Fear',ongoing:true,effect:'Victims no longer panic during the Panic phase.'},
 {id:'curiosity',name:'Curiosity Killed the People',ongoing:false,effect:'Place 3 new Victims in the Foyer and panic them immediately. Discard this Event.'},
 {id:'afraid',name:"I Ain’t Afraid of No Ghost",ongoing:false,effect:'Move each Victim 1 space toward the Attic. Discard this Event.'},
 {id:'helicopter',name:'Helicopter Rescue',ongoing:true,effect:'Place the Helicopter token on the roof. Once during the game, move from the Attic to the Helicopter as if adjacent. Any Victims or Carolyn with you may be saved. Unless Carolyn is saved, return to the Attic and remove the token. The Helicopter is not an Exit. Discard this Event when the token leaves play.'},
 {id:'lights-out',name:"Light’s Out",ongoing:true,effect:'Roll 1 fewer die (minimum 1) when resolving an Action card that allows movement. Ignore this penalty if you have a Flashlight or Candle.'},
 {id:'skull',name:'No One Comes Back',ongoing:true,effect:'Place the Skull token in the Attic. Kill all Victims there; a Victim entering the Attic is killed immediately. Recording the hazard does not record casualties.'},
 {id:'pushed',name:'Pushed to the Edge',ongoing:false,effect:'Roll a die for each Victim in a Window space. On 1–4 that Victim jumps and is killed. Discard this Event.'},
 {id:'clingy-victims',name:'Clingy Victims',ongoing:true,effect:'At least 1 Victim must follow you if able.'},
 {id:'hunters',name:'Ghost Hunters',ongoing:true,effect:'Replace the 3 closest Victims (or as many as able) with orange, blue and white Special Victims. They do not follow until one has been killed. Each killed hunter increases Bloodlust by 1 more. Discard this Event when the last Special Victim leaves play. These replace ordinary Victims; they are not additional people.'},
] as const;
export const CREECH_TERRORS = [
 {name:'Something unholy happened in the…',effect:'Roll a die and place the Killer: 1–3 Attic; 4–5 Closet; 6 Ballroom. Target the closest Final Girl or Victim and attack. Then target the closest Final Girl or Victim, move and attack.'},
 {name:'The trees are alive!',effect:'If you are in a Window space, lose 1 Health. Kill every Victim in a Window space. If at least one Victim was killed, increase Bloodlust by 1. Draw an Event.'},
 {name:'Voices… I hear voices!',effect:'If no Victims remain on the board, discard and replace this Terror. Otherwise all Victims able to move up to the next floor do so. Increase Bloodlust by 1. Target a Victim, move and attack.'},
 {name:'It’s coming, it’s coming!',effect:'Target a Victim and move three times the Killer Movement value (three movement icons). Kill one Victim in each space passed through, including the starting and final spaces.'},
 {name:'It’s a fake!',effect:'Discard a random Item. If you have no Items, discard and replace this Terror. Then target the closest Final Girl or Victim, move and attack. Respect the selected Killer’s protected Item restrictions, including Carolyn and Mr. Floppy.'},
 {name:'It’s broken!',effect:'Cover the external ladder with the Broken Ladder token. It can no longer be used and its endpoints are no longer adjacent. Increase Bloodlust by 1.'},
 {name:'Something is coming through the wall!',effect:'If no Victims remain on the board, discard and replace this Terror. Otherwise panic all Victims. Victims exiting through a Window are killed. Draw an Event.'},
 {name:'The windows and doors just slammed shut!',effect:'If inside, you cannot move during the next Action phase. If outside, you cannot enter the house during the next Action phase. Draw an Event.'},
].map(c=>({...c,quantity:1,location:'Creech Manor',source:CREECH_SOURCE}));
export const CREECH_ITEMS = [
 {name:'Ancient Text',effect:'You may lose 1 Health to gain 2 Time.'},
 {name:'Lucky Rabbit’s Foot',effect:'Discard during the Action phase and make a Horror roll. For each success, choose one: gain 2 Time, recover 1 Health, reduce Horror by 1, or move 1 space.'},
 {name:'Lucky Dice',effect:'Discard to reroll any or all of your dice.'},
 {name:'Energy Drink',effect:'Discard during the Action phase: gain 3 Time OR move 1 space.'},
 {name:'A List of Things in the…',effect:'Immediately roll a die: 1–2 Garage; 3–4 Closet; 5–6 Attic. Reveal all Items in that deck, preserving their order, then discard this Item.'},
 {name:'Map',effect:'Discard during the Action phase. For each Item deck, you may turn a facedown top card faceup; if already faceup, you may discard it and turn the next card faceup.'},
 {name:'Crucifix',effect:'Discard to ignore the effects of a single Terror card.'},
 {name:'Mysterious Pills',effect:'Discard during the Action phase: reduce Horror by 1 OR recover 2 Health.'},
 {name:'Old Revolver',effect:'One hand; range 1; +1 damage. May modify only the Weak Attack Action card.'},
 {name:'Trashcan Lid',effect:'One hand; three uses. Spend a use to ignore 1 damage.'},
 {name:'Padlock',effect:'Place the Padlock token between two rooms. Only you and Victims moving with you may pass it. If an Enemy attacks while in a room adjacent to it, ignore that attack and remove the token instead.'},
 {name:'Candle',effect:'Once per Action phase, move a Victim from an adjacent space into your space. Also ignores Light’s Out while held.'},
 {name:'First Aid Kit',effect:'One hand. Whenever you use an Action card to recover Health, recover 1 additional Health.'},
 {name:'Rope Ladder',effect:'Discard to remove Broken Ladder OR place the Rope Ladder token in a room with a one-way movement arrow, making movement to and from that space two-way.'},
 {name:'Flashlight',effect:'Once per Action phase, spend 1 Time to look at the top Terror card. Leave it or put it at the bottom. Also ignores Light’s Out while held.'},
 {name:'Ritual Dagger',effect:'One hand; range 0; +1 damage. You may discard it to kill a Victim in your space, increasing Bloodlust normally; then remove all Minor Dark Powers OR deal 3 damage to the Killer. The Poltergeist cannot be damaged.'},
 {name:'Knife',effect:'One hand; range 0; +1 damage.'},
 {name:'Shotgun',effect:'Two hands; range 0; 1 damage per success. Cannot modify an Action card and must be used without one. Once per turn discard 2 hand cards and roll 6 dice. Deal 1 damage to each Enemy in your space for each success. If at least half the dice are blank, discard the Shotgun.'},
] as const;
type Setup = {name:string;girl:string;killer:string;victims:Record<string,number>};
export const CREECH_SETUPS: Setup[] = [
 {name:'The Dead Zone',girl:'attic',killer:'washroom',victims:{'upper-center':2,closet:2,'upper-right-window':1,'lower-left':1,'lower-center':1,'ground-left':1,ballroom:2}},
 {name:'Dancing Queen',girl:'ballroom',killer:'garage',victims:{attic:2,washroom:1,'middle-stairs':1,'upper-right-window':1,'lower-center':1,'lower-right-window':1,foyer:1,ballroom:2}},
 {name:'Creepshow',girl:'outside-center',killer:'closet',victims:{attic:3,'upper-left':1,'upper-center':1,garage:1,'upper-right-window':1,'lower-right-window':1,ballroom:2}},
 {name:'Strange Trophies',girl:'trophy-room',killer:'foyer',victims:{attic:2,'upper-left':1,'upper-center':1,'upper-right':1,closet:1,'upper-right-window':1,'lower-right-window':1,'lower-center':2}},
 {name:'The Ladder',girl:'washroom',killer:'ballroom',victims:{attic:2,'upper-left':1,'trophy-room':2,'lower-center':1,'upper-right-window':1,'lower-right-window':1,'ground-left':1,closet:1}},
];
export const creechSetupDescription = (s: Setup) => `Final Girl: ${creechSpaceName(s.girl)}. Killer: ${creechSpaceName(s.killer)}. Victims: ${Object.entries(s.victims).map(([id,n])=>`${n} in ${creechSpaceName(id)}`).join('; ')}.`;
export type CreechAction =
 | {parent:string;kind:'correct';key:string;value:ModuleValue}
 | {parent:string;kind:'event';id:string;active:boolean}
 | {parent:string;kind:'hunters';colors:string[]}
 | {parent:string;kind:'hunter';color:string;outcome:'saved'|'killed';bloodlust?:number}
 | {parent:string;kind:'helicopter';victims:number|null;carolyn:boolean;floppy:boolean|null;confirmed:true}
 | {parent:string;kind:'rope';position:string}
 | {parent:string;kind:'repair'}
 | {parent:string;kind:'padlock';connection:string}
 | {parent:string;kind:'block-attack'};
const has = (list:readonly string[],v:unknown) => typeof v==='string' && list.includes(v);
export function validCreechField(key:string,value:unknown):boolean {
 if (key==='initialized') return value===true;
 if (key==='hunters.firstDeath'||key==='helicopter.used') return value===null||typeof value==='boolean';
 if (key==='helicopter.victims') return value===null||typeof value==='number'&&Number.isInteger(value)&&value>=0&&value<=50;
 if (key==='helicopter.carolyn'||key==='helicopter.floppy') return value===null||typeof value==='boolean';
 if (key==='ladder') return value===null||has(['usable','broken'],value);
 if (key==='rope') return value===null||has(['unplaced',...CREECH_ONE_WAY.map(x=>x.id)],value);
 if (key==='padlock') return value===null||has(['unplaced','removed',...CREECH_CONNECTIONS.map(x=>x.id)],value);
 if (key==='restriction') return value===null||has(['inside','outside','ended'],value);
 if (key==='helicopter.route') return value===null||value==='helicopter';
 if (CREECH_HUNTERS.some(c=>key===`hunter.${c}`)) return value===null||has(['in-play','saved','killed','left-play','not-participating'],value);
 if (CREECH_EVENTS.some(e=>e.ongoing&&key===`event.${e.id}`)) return value===null||has(['active','ended'],value);
 return false;
}
export function validCreechAction(value:unknown):value is CreechAction {
 if(!value||typeof value!=='object'||Array.isArray(value))return false;
 const a=value as CreechAction;
 if(typeof a.parent!=='string'||!/^(root|[0-9a-f-]{36})$/.test(a.parent))return false;
 let fields:string[]=[];let valid=false;
 switch(a.kind){
 case 'correct':fields=['key','value'];valid=typeof a.key==='string'&&a.key!=='initialized'&&validCreechField(a.key,a.value);break;
 case 'event':fields=['id','active'];valid=CREECH_EVENTS.some(e=>e.ongoing&&e.id===a.id)&&typeof a.active==='boolean';break;
 case 'hunters':fields=['colors'];valid=Array.isArray(a.colors)&&a.colors.length<=3&&new Set(a.colors).size===a.colors.length&&a.colors.every(c=>has(CREECH_HUNTERS,c));break;
 case 'hunter':fields=['color','outcome','bloodlust'];valid=has(CREECH_HUNTERS,a.color)&&has(['saved','killed'],a.outcome)&&(a.bloodlust===undefined||a.outcome==='killed'&&typeof a.bloodlust==='number'&&Number.isInteger(a.bloodlust)&&a.bloodlust>=0&&a.bloodlust<=99);break;
 case 'helicopter':fields=['victims','carolyn','floppy','confirmed'];valid=(a.victims===null||Number.isInteger(a.victims)&&a.victims>=0&&a.victims<=50)&&typeof a.carolyn==='boolean'&&(a.floppy===null||typeof a.floppy==='boolean')&&a.confirmed===true;break;
 case 'rope':fields=['position'];valid=has(CREECH_ONE_WAY.map(x=>x.id),a.position);break;
 case 'padlock':fields=['connection'];valid=has(CREECH_CONNECTIONS.map(x=>x.id),a.connection);break;
 case 'repair':case 'block-attack':valid=true;break;
 }
 return valid&&Object.keys(a).every(k=>['parent','kind',...fields].includes(k));
}
export function resolveCreechAction(a:CreechAction,s:ModuleState,polter:ModuleState,killer:string):{changes:Record<string,ModuleValue>;linkedModule?:ModuleObservation}|null {
 if(!validCreechAction(a))return null;
 let changes:Record<string,ModuleValue>={};let linkedModule:ModuleObservation|undefined;
 switch(a.kind){
 case 'correct':changes={[a.key]:a.value};break;
 case 'event':
   if(a.id==='helicopter'&&a.active&&s['helicopter.used']===true)return null;
   changes={[`event.${a.id}`]:a.active?'active':'ended'};break;
 case 'hunters':
   if(s['event.hunters']!=='active'||CREECH_HUNTERS.some(c=>s[`hunter.${c}`]!==undefined))return null;
   changes={...Object.fromEntries(CREECH_HUNTERS.map(c=>[`hunter.${c}`,a.colors.includes(c)?'in-play':'not-participating'])),'hunters.firstDeath':false,...(!a.colors.length?{'event.hunters':'ended'}:{})};break;
 case 'hunter':
   if(s[`hunter.${a.color}`]!=='in-play')return null;
   changes={[`hunter.${a.color}`]:a.outcome,...(a.outcome==='killed'?{'hunters.firstDeath':true}:{})};
   if(!CREECH_HUNTERS.some(c=>c!==a.color&&s[`hunter.${c}`]==='in-play'))changes['event.hunters']='ended';break;
 case 'helicopter':
   if(s['event.helicopter']!=='active'||s['helicopter.used']===true||a.carolyn&&(killer!=='Poltergeist'||polter.carolyn!=='with-you')||a.floppy!==null&&(!a.carolyn||killer!=='Poltergeist'))return null;
   changes={'helicopter.used':true,'helicopter.route':'helicopter','helicopter.victims':a.victims,'helicopter.carolyn':a.carolyn,'helicopter.floppy':a.floppy,...(!a.carolyn?{'event.helicopter':'ended'}:{})};
   if(a.carolyn)linkedModule={module:'poltergeist',changes:{carolyn:'rescued'}};break;
 case 'rope':changes={rope:a.position};break;
 case 'repair':if(s.ladder!=='broken')return null;changes={ladder:'usable'};break;
 case 'padlock':changes={padlock:a.connection};break;
 case 'block-attack':if(!CREECH_CONNECTIONS.some(c=>c.id===s.padlock))return null;changes={padlock:'removed'};break;
 }
 if(Object.entries(changes).every(([k,v])=>v===null?s[k]===undefined:s[k]===v))return null;
 return {changes,...(linkedModule?{linkedModule}:{})};
}
/** Structural payload agreement. State-dependent eligibility is checked at durable append. */
export function validCreechObservation(a:CreechAction|undefined,changes:Record<string,ModuleValue>):boolean {
 if(!a)return [undefined,...CREECH_EVENTS.filter(e=>e.ongoing).map(e=>e.name)].some(start=>JSON.stringify(Object.entries(creechStartingObservations(start)).sort())===JSON.stringify(Object.entries(changes).sort()));
 if(a.kind==='correct')return validCreechAction(a)&&Object.keys(changes).length===1&&changes[a.key]===a.value;
 if(!validCreechAction(a))return false;
 // Enumerate possible states needed by conditional cleanup; require an exact resolver output.
 const candidates:ModuleState[]=[{},...['orange','blue','white'].map(c=>({[`hunter.${c}`]:'in-play'}))];
 if(a.kind==='hunter')candidates.push({[`hunter.${a.color}`]:'in-play'},...CREECH_HUNTERS.map(c=>({[`hunter.${a.color}`]:'in-play',[`hunter.${c}`]:'in-play'})));
 if(a.kind==='helicopter')candidates.push({'event.helicopter':'active'});
 if(a.kind==='hunters')candidates.push({'event.hunters':'active'});
 if(a.kind==='repair')candidates.push({ladder:'broken'});
 if(a.kind==='block-attack')candidates.push({padlock:CREECH_CONNECTIONS[0].id});
 return candidates.some(s=>{const r=resolveCreechAction(a,s,{carolyn:'with-you'},'Poltergeist');return r&&JSON.stringify(Object.entries(r.changes).sort())===JSON.stringify(Object.entries(changes).sort());});
}
export function creechStartingObservations(start?:string|null):Record<string,ModuleValue>{
 const e=CREECH_EVENTS.find(e=>e.ongoing&&e.name.toLowerCase().replace(/[’']/g,'')===start?.toLowerCase().replace(/[’']/g,''));
 return {initialized:true,ladder:'usable',rope:'unplaced',padlock:'unplaced','helicopter.used':false,...(e?{[`event.${e.id}`]:'active'}:{})};
}
/** Priority order protects outcomes before atmospheric state within bounded prompts. */
export function creechFacts(s:ModuleState):string[]{
 const lines:string[]=[];
 if(s['helicopter.used']===true)lines.push(`Helicopter used once; not an Exit. Carolyn rescue ${s['helicopter.carolyn']===true?'confirmed':'not reported'}; Floppy at rescue ${s['helicopter.floppy']===true?'confirmed':'unknown/not confirmed'}; ordinary passengers ${s['helicopter.victims']??'unknown'}. No inferred win or victim totals.`);
 for(const h of CREECH_PEOPLE)if(s[`hunter.${h.id}`]!==undefined&&s[`hunter.${h.id}`]!=='not-participating')lines.push(`${h.name}: ${s[`hunter.${h.id}`]}.`);
 if(s['hunters.firstDeath']!==undefined)lines.push(`Hunter first death: ${s['hunters.firstDeath']===true?'reported; survivors can follow':'not reported; group will not follow'}.`);
 if(s.ladder!==undefined)lines.push(`External ladder: ${s.ladder}; broken removes movement AND adjacency.`);
 if(s.rope&&s.rope!=='unplaced')lines.push(`Rope Ladder: ${CREECH_ONE_WAY.find(r=>r.id===s.rope)?.name}.`);
 if(s.padlock&&s.padlock!=='unplaced')lines.push(`Padlock: ${CREECH_CONNECTIONS.find(c=>c.id===s.padlock)?.name??s.padlock}.`);
 if(s.restriction&&s.restriction!=='ended')lines.push(`Next Action restriction: ${s.restriction==='inside'?'no movement inside':'cannot enter from outside'}; completion unreported.`);
 const active=CREECH_EVENTS.filter(e=>s[`event.${e.id}`]==='active').map(e=>e.name);if(active.length)lines.push(`Active Events: ${active.join(', ')}. Effects do not prove casualties.`);
 return lines;
}
