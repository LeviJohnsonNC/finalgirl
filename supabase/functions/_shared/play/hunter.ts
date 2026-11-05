/** The Hunter, photographed owner sources H1–H6 (IMG_9485–9490). */
export const HUNTER = 'The Hunter';
export const HUNTER_MODULE = 'hunter';
export const HUNTER_SOURCE = 'The Killer from Tomorrow — owner photographs IMG_9485.jpeg–IMG_9490.jpeg';
export const HUNTER_VISUAL = 'Mark V is a tall broad humanoid cyborg in a burgundy hood, black leather jacket and dark trousers, opaque black face visor and shotgun. Mark X is a separate upgraded pursuer, not the repaired Mark V. Mark X is a pale female android with a straight dark bob and bangs, fitted black shirt, trousers and boots. A repaired Mark V is an Ally, never a Victim. Use the selected location; decorative pictures establish no events.';
export const HUNTER_POWERS = [
 {id:'titanium-tissue',name:'Titanium-Laced Bio Tissue',epic:false,effect:'Mark V: each Cybernetic Part requires 3 damage to remove. Ally: each Repair restores one additional Health.'},
 {id:'cybernetic-agility',name:'Cybernetic Agility',epic:false,effect:'Mark V moves one additional space per move symbol. Ally: after moving at least one space, it may move one additional space.'},
 {id:'reinforced-endoskeleton',name:'Reinforced Endoskeleton',epic:false,effect:'Mark V and Ally ignore lose-Health effects; damage effects still apply.'},
 {id:'minigun',name:'M134 Minigun Armament',epic:true,effect:'Mark V attacks at range 0–1; Reaction cards cannot be played against attacks at range 1. Ally: attacks deal one additional damage and have range 0–1.'},
] as const;
export const HUNTER_FINALES = [
 {id:'relentless-pursuit',name:'Relentless Pursuit',effect:'On reveal, increase Bloodlust by 6. Target the Final Girl, move, then attack.'},
 {id:'termination-mode',name:'“Termination Mode... Active”',effect:'Increase Bloodlust by 1. Target the Final Girl, move, then attack twice.'},
 {id:'adaptive-ai',name:'Adaptive A.I.',effect:'Increase Bloodlust by 1. Target the Final Girl, move, then attack. Mark X attacks deal one additional damage. Damage from Mark V to Mark X is reduced by one, to a minimum of one.'},
] as const;
export const HUNTER_MINORS = [
 {id:'titanium-shield',name:'Titanium Shield',health:4,effect:'Four Health.'},
 {id:'advanced-ai',name:'Advanced A.I.',health:2,effect:'Whenever Hunter-inflicted damage to you or an Ally increases Bloodlust, increase it one additional time.'},
] as const;
const chase='Target the Final Girl, move, then attack.';
export const HUNTER_TERRORS = [
 {id:'target-acquired',name:'“Target Acquired”',quantity:3,effect:'Increase Horror by 1. '+chase},
 {id:'intimidation-mode',name:'“Intimidation Mode... Active!”',quantity:2,effect:'Target the Final Girl, move twice, then increase Horror by 2.'},
 {id:'system-reboot',name:'System Reboot',quantity:1,effect:'If Mark V is the Active Killer, add one Cybernetic Part to the Finale stack. If Mark X is the Active Killer, it recovers four Health.'},
 {id:'move-or-be-eliminated',name:'“Move or Be Eliminated”',quantity:1,effect:'Target the Final Girl and move. Kill one Victim in each space passed through, including the starting and ending spaces. Increase Bloodlust once per Victim killed, at most twice.'},
 {id:'terminate-obstacles',name:'“Eliminate All Obstacles”',quantity:1,effect:'Target the closest Final Girl, Victim or Ally and attack. Kill one Victim in each adjacent space. Increase Bloodlust once per Victim killed, at most twice.'},
 {id:'impersonation-mode',name:'“Impersonation Mode... Active”',quantity:1,effect:'Roll a die. On 1–2 deal one damage; on 3–4 move all Victims one space closer to the Hunter; on 5–6 move all Victims two spaces closer. Victims do not follow during either movement. Target the Final Girl and attack.'},
 {id:'counter-measures',name:'“Deploy Counter-Measures”',quantity:1,effect:'Put a Counter-Measure token in each adjacent space. Entering a token’s space causes you or an Ally to lose one Health, then discard that token. Increase Horror by 1.'},
 {id:'seen-this-person',name:'“Have You Seen This Person?”',quantity:1,effect:'If there are no Victims, discard this and draw the next Terror. Otherwise target the closest Victim and move twice. For each Victim in the Hunter’s space, lose one Time and increase Horror by 1.'},
 {id:'shock-awe',name:'Shock & Awe',quantity:1,effect:'Roll one fewer Horror die, to a minimum of one, for Reaction cards. '+chase},
 {id:'terminate-mark-v',name:'“Terminate Mark V”',quantity:1,effect:'If either model is not on the board, discard and draw the next Terror. If Mark X shares a space with unrepaired Mark V, remove Mark V and discard its Ally card. Otherwise Mark X targets Mark V, moves twice and attacks twice.'},
 {id:'analyze-weaknesses',name:'“Analyze... Targeting Weaknesses”',quantity:1,effect:chase+' For each damage you take, discard a random Action card from your hand.'},
 {id:'hunter-mark-x',name:'Hunter Mark X',quantity:1,special:true,effect:'If Mark V is active, immediately shut it down, raise Bloodlust to the top, drop all remaining Parts in its space and put its Dark Power beneath its Ally card; Minor Powers transfer to Mark X. If Mark X is absent, discard remaining Countdown tokens, draw a new Setup and place Mark X in its Killer starting space. Discard all remaining Terror cards and reveal the Finale.'},
] as const;
export const HUNTER_BLOODLUST = [[1,1,'Start'],[1,1,''],[2,1,'Reveal Dark Power'],[2,1,'Increase Horror by 1'],[2,1,''],[2,1,'Increase Horror by 1'],[3,2,''],[3,2,'Increase Horror by 1'],[4,2,''],[5,2,'Increase Horror by 1'],[5,3,'']] as const;
export const HUNTER_ACTIONS = [
 {id:'attack',name:'Attack · 2 damage',cooldown:2},
 {id:'move',name:'Move 1 space',cooldown:2},
 {id:'quick-move',name:'Move 1 space · fast',cooldown:1},
 {id:'react',name:'Reduce attack by 1 · deal 1 damage',cooldown:2},
] as const;
type Fields=Record<string,string|number|boolean|null>;
type Entry={id?:string;kind:string;momentType?:string;killerCard?:string;moduleData?:{module:string;changes:Fields}};
export type HunterPart={id:number;status:'on-board'|'backpack'|'installed';health:number|null};
export interface HunterState {
 phase:'unknown'|'mark-v'|'countdown'|'mark-x';
 remaining:number|null; countdown:number|null; damage:number|null;
 ally:'unknown'|'unrepaired'|'alive'|'destroyed'; allyHealth:number|null;
 parts:HunterPart[]; cooldowns:Record<string,number|null>;
 forced:boolean;
}
export const unknownHunter=():HunterState=>({phase:'unknown',remaining:null,countdown:null,damage:null,ally:'unknown',allyHealth:null,parts:[],cooldowns:Object.fromEntries(HUNTER_ACTIONS.map(a=>[a.id,null])),forced:false});
export const initialHunter=()=>({snapshot:JSON.stringify({...unknownHunter(),phase:'mark-v',remaining:3,countdown:2,damage:0,ally:'unrepaired',allyHealth:0,cooldowns:Object.fromEntries(HUNTER_ACTIONS.map(a=>[a.id,0]))})});
const n=(v:unknown,min=0,max=99):v is number=>typeof v==='number'&&Number.isInteger(v)&&v>=min&&v<=max;
export function parseHunter(value:unknown):HunterState|null {
 if(typeof value!=='string'||value.length>12000)return null;
 try {const s=JSON.parse(value) as HunterState;
 if(!s||!['unknown','mark-v','countdown','mark-x'].includes(s.phase)||!['unknown','unrepaired','alive','destroyed'].includes(s.ally)||typeof s.forced!=='boolean')return null;
 if(!['remaining','countdown','damage','allyHealth'].every(k=>s[k as keyof HunterState]===null||n(s[k as keyof HunterState],0,k==='countdown'?2:99)))return null;
 if(!Array.isArray(s.parts)||s.parts.length>20||s.parts.some(p=>!p||!n(p.id,1,99)||!['on-board','backpack','installed'].includes(p.status)||(p.health!==null&&!n(p.health,1,99)))||new Set(s.parts.map(p=>p.id)).size!==s.parts.length)return null;
 if(!s.cooldowns||Object.keys(s.cooldowns).length!==4||HUNTER_ACTIONS.some(a=>s.cooldowns[a.id]!==null&&!n(s.cooldowns[a.id],0,a.cooldown)))return null;
 if(s.ally==='alive'&&(!n(s.allyHealth,1)||s.phase==='mark-v'))return null;
 if(s.ally==='destroyed'&&s.allyHealth!==0)return null;
 return {phase:s.phase,remaining:s.remaining,countdown:s.countdown,damage:s.damage,ally:s.ally,allyHealth:s.allyHealth,parts:s.parts.map(p=>({id:p.id,status:p.status,health:p.health})),cooldowns:Object.fromEntries(HUNTER_ACTIONS.map(a=>[a.id,s.cooldowns[a.id]])),forced:s.forced};
 }catch{return null;}
}
export const hunterState=(fields:Fields):HunterState=>parseHunter(fields.snapshot)??unknownHunter();
export const hunterParent=(entries:readonly Entry[])=>[...entries].reverse().find(e=>e.moduleData?.module===HUNTER_MODULE)?.id??'root';
export function hunterCard(entries:readonly Entry[],type:'dark-power'|'finale') {return entries.find(e=>e.kind==='moment'&&e.momentType===type)?.killerCard;}
export const hunterMinorField=(id:string)=>`minor.${id}`;
export function validHunterField(key:string,value:unknown) {
 if(key==='snapshot')return parseHunter(value)!==null;
 if(key==='rebootCount')return n(value,1,999);
 return HUNTER_MINORS.some(c=>key===hunterMinorField(c.id)&&(value===null||n(value,0,c.health))) || ['counterMeasures','shockAwe'].includes(key)&&(value===null||typeof value==='boolean');
}
export type HunterAction={parent:string}&(
 |{command:'damage';value:number}
 |{command:'end-action'|'countdown'|'force-mark-x'|'reboot'|'upkeep'|'destroy-ally'}
 |{command:'pickup'|'drop';part:number}
 |{command:'repair';part:number;value:number}
 |{command:'ally-health';value:number}
 |{command:'use';action:string}
 |{command:'cooldown';action:string;value:number}
 |{command:'minor';card:string;value:number|null}
 |{command:'effect';key:'counterMeasures'|'shockAwe';value:boolean}
 |{command:'recover';phase:'mark-v'|'countdown'|'mark-x';remaining:number;countdown:number;ally:'unrepaired'|'alive'|'destroyed';health:number}
);
export function validHunterAction(v:unknown):v is HunterAction {
 if(!v||typeof v!=='object')return false;const a=v as HunterAction;
 if(typeof a.parent!=='string'||! /^(root|[\da-f-]{36})$/i.test(a.parent))return false;
 switch(a.command){
 case 'damage':return n(a.value,1);
 case 'repair':return n(a.part,1)&&n(a.value,1);
 case 'pickup':case 'drop':return n(a.part,1);
 case 'ally-health':return n(a.value);
 case 'cooldown':return HUNTER_ACTIONS.some(c=>c.id===a.action&&n(a.value,0,c.cooldown));
 case 'use':return HUNTER_ACTIONS.some(c=>c.id===a.action);
 case 'minor':return HUNTER_MINORS.some(c=>c.id===a.card&&(a.value===null||n(a.value,0,c.health)));
 case 'effect':return ['counterMeasures','shockAwe'].includes(a.key)&&typeof a.value==='boolean';
 case 'recover':return ['mark-v','countdown','mark-x'].includes(a.phase)&&n(a.remaining,0,20)&&n(a.countdown,0,2)&&['unrepaired','alive','destroyed'].includes(a.ally)&&n(a.health);
 default:return ['end-action','countdown','force-mark-x','reboot','upkeep','destroy-ally'].includes(a.command);
 }
}
export function resolveHunterAction(a:HunterAction,fields:Fields,entries:readonly Entry[]):Fields|undefined {
 if(!validHunterAction(a)||a.parent!==hunterParent(entries))return;
 const s=hunterState(fields);const power=hunterCard(entries,'dark-power');
 if(a.command==='minor')return (fields[hunterMinorField(a.card)]??null)===a.value?undefined:{[hunterMinorField(a.card)]:a.value};
 if(a.command==='effect')return fields[a.key]===a.value?undefined:{[a.key]:a.value};
 const drop=()=>{if(s.remaining===null)return false;for(let i=0;i<s.remaining;i++)s.parts.push({id:Math.max(0,...s.parts.map(p=>p.id))+1,status:'on-board',health:null});s.remaining=0;s.damage=0;return true;};
 switch(a.command){
 case 'recover':
  if(s.phase!=='unknown'||a.phase==='mark-v'&&a.remaining<1||a.phase!=='mark-v'&&a.remaining!==0||a.phase==='countdown'&&a.countdown<1||a.phase==='mark-x'&&a.countdown!==0)return;
  Object.assign(s,{phase:a.phase,remaining:a.remaining,countdown:a.countdown,damage:0,ally:a.ally,allyHealth:a.ally==='alive'?a.health:0});
  if(a.ally==='alive'&&!a.health)return;
  break;
 case 'damage':{
  if(s.phase!=='mark-v'||s.remaining===null||s.remaining<1||s.damage===null)return;
  const threshold=power===HUNTER_POWERS[0].name?3:2;
  const damage=s.damage+a.value;const removed=Math.min(s.remaining,Math.floor(damage/threshold));
  for(let i=0;i<removed;i++)s.parts.push({id:Math.max(0,...s.parts.map(p=>p.id))+1,status:'on-board',health:null});
  s.remaining-=removed;s.damage=s.remaining?damage%threshold:0;
  if(!s.remaining)s.phase='countdown';
  break;}
 case 'end-action':if(s.damage===null||s.damage===0)return;s.damage=0;break;
 case 'countdown':if(s.phase!=='countdown'||s.countdown===null||s.countdown===0)return;s.countdown--;if(!s.countdown)s.phase='mark-x';break;
 case 'force-mark-x':if(s.forced||s.phase==='unknown')return;if(s.phase==='mark-v'&&!drop())return;s.phase='mark-x';s.countdown=0;s.forced=true;break;
 case 'reboot':if(s.phase==='mark-x')return {rebootCount:Number(fields.rebootCount??0)+1};if(s.phase!=='mark-v'||s.remaining===null||s.remaining>=20)return;s.remaining++;break;
 case 'pickup':{const p=s.parts.find(p=>p.id===a.part);if(!p||p.status!=='on-board')return;p.status='backpack';break;}
 case 'drop':{const p=s.parts.find(p=>p.id===a.part);if(!p||p.status!=='backpack')return;p.status='on-board';break;}
 case 'repair':{const p=s.parts.find(p=>p.id===a.part);if(!p||p.status!=='backpack'||s.phase==='mark-v'||s.ally==='destroyed'||s.ally==='unknown'||s.allyHealth===null||s.allyHealth+a.value+(power===HUNTER_POWERS[0].name?1:0)>99)return;
 p.status='installed';p.health=a.value;s.ally='alive';s.allyHealth+=a.value+(power===HUNTER_POWERS[0].name?1:0);break;}
 case 'ally-health':if(s.ally!=='alive'||a.value===s.allyHealth)return;s.allyHealth=a.value;if(!a.value)s.ally='destroyed';break;
 case 'destroy-ally':if(s.phase==='mark-v'||s.ally==='destroyed'||s.ally==='unknown')return;s.ally='destroyed';s.allyHealth=0;break;
 case 'cooldown':if(s.ally!=='alive'||s.cooldowns[a.action]!==null)return;s.cooldowns[a.action]=a.value;break;
 case 'use':{const action=HUNTER_ACTIONS.find(c=>c.id===a.action);if(s.ally!=='alive'||!action||s.cooldowns[action.id]!==0)return;s.cooldowns[action.id]=action.cooldown;break;}
 case 'upkeep':if(s.ally!=='alive'||!Object.values(s.cooldowns).some(v=>typeof v==='number'&&v>0))return;for(const key of Object.keys(s.cooldowns)){const v=s.cooldowns[key];if(typeof v==='number')s.cooldowns[key]=Math.max(0,v-1);}break;
 }
 if(s.parts.length>20)return;
 const snapshot=JSON.stringify(s);if(!parseHunter(snapshot))return;
 return {snapshot};
}
export type HunterReview=Pick<HunterState,'phase'|'ally'|'allyHealth'>;
export function hunterReview(fields:Fields):HunterReview {const s=hunterState(fields);return {phase:s.phase,ally:s.ally,allyHealth:s.allyHealth};}
export function hunterReviewFacts(s:HunterReview) {
 return `Hunter reviewed model: ${s.phase}. Mark V Ally state: ${s.ally}${s.ally==='alive'?`, ${s.allyHealth??'unrecorded'} Health`:''}. Mark V's shutdown is not Mark X's defeat. The repaired Mark V is a separate Ally and is not the Killer. ${s.phase==='mark-v'?'Only Mark V is hunting; Mark X has not arrived.':s.phase==='countdown'?'Mark V is shut down; Mark X has not arrived.':s.phase==='mark-x'?'The Active Killer is the female android Mark X.':'Do not infer either model’s arrival or fate.'} Never infer repair, permanent destruction, casualties or final survival from the game result alone.`;
}
export function hunterFacts(fields:Fields,entries:readonly Entry[]=[]) {
 const s=hunterState(fields);
 if(s.phase==='unknown')return ['Hunter model and Ally state unrecorded. Do not infer Mark X or a repaired Ally.',...HUNTER_MINORS.flatMap(c=>typeof fields[hunterMinorField(c.id)]==='number'?[`${c.name}: ${fields[hunterMinorField(c.id)]} Health.`]:[])].join(' ');
 const power=hunterCard(entries,'dark-power');const finale=hunterCard(entries,'finale');
 return [
 `Hunter: ${s.phase==='mark-v'?'Mark V active':s.phase==='countdown'?'Mark V shut down; Mark X absent':'Mark X active'}.`,
 s.phase==='mark-v'?`${s.remaining??'Unknown'} Cybernetic Parts remain.`:s.phase==='countdown'?`${s.countdown??'Unknown'} Countdown tokens remain.`:'',
 s.ally==='alive'?`Mark V is a repaired Ally with ${s.allyHealth} Health.`:s.ally==='destroyed'?'Mark V is permanently destroyed.':s.phase!=='mark-v'?'Mark V remains unrepaired.':'',
 power?`Mark V ${s.phase==='mark-v'?'Dark Power':'Ally ability'}: ${power}.`:'',finale?`Finale: ${finale}.`:s.forced?'Finale revealed; name unrecorded.':'',
 ...HUNTER_MINORS.flatMap(c=>typeof fields[hunterMinorField(c.id)]==='number'?[`${c.name}: ${fields[hunterMinorField(c.id)]} Health.`]:[]),
 fields.counterMeasures===true?'Counter-Measures recorded on board.':'',fields.shockAwe===true?'Shock & Awe recorded in play.':'',
 ].filter(Boolean).join(' ');
}

export function describeHunterAction(a:HunterAction,fields:Fields):string {
 const s=hunterState(fields);
 switch(a.command){
 case 'damage':return `Applied ${a.value} damage to Mark V Parts${s.phase==='countdown'?' · Mark V shut down':''}`;
 case 'end-action':return 'Ended Action phase · cleared unfinished Part damage';
 case 'countdown':return s.phase==='mark-x'?'Removed last Countdown token · Mark X arrived':'Removed one Countdown token';
 case 'force-mark-x':return 'Resolved Hunter Mark X Terror · Finale revealed';
 case 'pickup':return `Retrieved Cybernetic Part ${a.part}`;
 case 'drop':return `Dropped Cybernetic Part ${a.part}`;
 case 'repair':return `Repaired Mark V using Part ${a.part} · ${a.value} printed Health`;
 case 'ally-health':return a.value===0?'Mark V Ally permanently destroyed':`Mark V Ally Health: ${a.value}`;
 case 'destroy-ally':return 'Unrepaired Mark V permanently removed';
 case 'reboot':return 'Resolved System Reboot';
 case 'upkeep':return 'Advanced Mark V Ally cooldowns';
 case 'use':return `Mark V Ally: ${HUNTER_ACTIONS.find(c=>c.id===a.action)?.name??a.action}`;
 case 'cooldown':return `Recorded Mark V ${a.action} cooldown: ${a.value}`;
 case 'minor':return `${HUNTER_MINORS.find(c=>c.id===a.card)?.name}: ${a.value===null?'record cleared':a.value+' Health'}`;
 case 'effect':return `${a.key==='counterMeasures'?'Counter-Measures':'Shock & Awe'}: ${a.value?'in play':'inactive'}`;
 case 'recover':return 'Recorded observed Hunter model and Ally state';
 }
}
