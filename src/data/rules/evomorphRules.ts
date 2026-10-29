import { EVOMORPH_SOURCE, EVOMORPH_VISUAL, EVOMORPH_POWERS, EVOMORPH_FINALES, EVOMORPH_MINORS, EVOMORPH_TERRORS, EVOMORPH_AMBUSH, EVOMORPH_BLOODLUST, EVOMORPH_OVERFLOW, EVOMORPH_SCAN } from '../../../supabase/functions/_shared/play/evomorph';
import type { EntityRuleModule, ModulePromptContext } from './moduleRules';
const cards=(list:readonly {name:string;effect:string;quantity?:number}[])=>[...list].sort((a,b)=>a.name.localeCompare(b.name)).map(c=>`${c.name}${c.quantity&&c.quantity>1?` (×${c.quantity})`:''}: ${c.effect}`);
export const evomorphRules:EntityRuleModule={
  entity:'Evomorph',kind:'killer',filmId:'s2-into-the-void',source:EVOMORPH_SOURCE,
  credits:{design:'Evan Derrick',art:'Tyler Johnson'},tags:['evomorph','evolution','hatchling','youngling','adult','ambush','scan','vanish'],seeAlso:['bloodlust','horror-rolls'],
  setup:[{type:'list',items:['Place the Evolution card beside the Killer board with the marker at Hatchling. Starting Health 4, Horror 4 and Bloodlust 0.','Shuffle the selected Location and Evomorph Terror cards together, but build an 8-card Terror deck instead of 10.','Shuffle the ten Ambush cards facedown beside the Terror deck with the light-green Youngling side readable.','Keep the three identical Scan Action cards, six Scan tokens and Evolution marker available. Follow the physical Action Tableau and ordinary Power/Finale setup.']}],
  rules:[
    {type:'heading',level:3,text:'Evolution'},
    {type:'paragraph',text:'Evolve when increasing Bloodlust reaches a printed Evolve space. Hatchling: Bloodlust increases ONLY when Hatchling itself kills a Victim. Replace every other Bloodlust increase, including Terror/Event effects or Victims dying in other ways, with gaining that much Time. Youngling: immediately Vanish on evolution; Bloodlust now increases normally. Adult: maximum Health becomes 10, immediately recover all Health, reveal the Dark Power, and rotate the Ambush deck to its dark-green Adult side.'},
    {type:'heading',level:3,text:'Vanishing and Ambush'},
    {type:'paragraph',text:'Vanish immediately ends the Killer phase. Remove Evomorph from the map and place it on the Terror deck. While vanished, ignore the normal Killer phase steps, both the Killer Action and drawing a Terror card; draw and resolve an Ambush instead. Use the face for the stage when drawn. Danger runs from 1–10 independently on each stage’s side. If the deck runs out, shuffle the discards into a new deck. Sideswipe acts before disappearance; its attack is not automatic damage.'},
    {type:'heading',level:3,text:'Scanning'},
    {type:'paragraph',text:EVOMORPH_SCAN},
    {type:'paragraph',text:'A Scan token marks a scanned space where Evomorph is not hiding. Only one token can occupy a space; placing a second there is ignored. Multiple spaces can be scanned. When all six tokens are in use, move the token farthest from the Final Girl to the required space. Use the physical map to determine distance. Remove tokens when a specific card instructs it; Scan’s three-success line does not itself say to remove all tokens.'},
    {type:'heading',level:3,text:'Minor Dark Powers'}, {type:'list',items:cards(EVOMORPH_MINORS.map(p=>({...p,effect:`${p.health} Health. ${p.effect}`})))},
    {type:'heading',level:3,text:'Dark Powers and Epic'}, {type:'list',items:cards(EVOMORPH_POWERS)},
    {type:'heading',level:3,text:'Finales'}, {type:'list',items:cards(EVOMORPH_FINALES)},
    {type:'paragraph',text:'Before Finale, target the closest Victim, move and attack. Draw-extra/highest-Danger and low-Danger replacement instructions remain physical card resolution; the companion does not invent a combined ordering.'},
    {type:'heading',level:3,text:'Terror cards · 16 physical cards'}, {type:'list',items:cards(EVOMORPH_TERRORS)},
    {type:'heading',level:3,text:'Ambush cards · 10 paired cards'},
    {type:'list',items:EVOMORPH_AMBUSH.map(c=>`Youngling Danger ${c.youngling}: ${c.younglingEffect} Adult Danger ${c.adult} on the same card: ${c.adultEffect}`)},
    {type:'heading',level:3,text:'Bloodlust board'},
    {type:'list',items:EVOMORPH_BLOODLUST.map((r,i)=>`Position ${i}: Attack ${r.attack}, Movement ${r.move}${'horror'in r?`; increase Horror by ${r.horror}`:''}${'evolve'in r?'; Evolve':''}.`)},
    {type:'paragraph',text:EVOMORPH_OVERFLOW},
    {type:'heading',level:3,text:'Companion observations'},
    {type:'paragraph',text:'Record the physical state you observe. Evolution and Scan results save linked observations together; a quiet correction does not replay their effects. Power and Finale reveals remain permanently observed when reversible effects are undone. Scan copies removed are not cards available in hand. Explicitly consume a skipped Killer phase and end temporary effects at the physical timing. Record deaths through the ordinary death flow, including Epic casualties already resolved at the table; token/presence changes never add Victim deaths. Unknown is distinct from empty or zero. USS Konrad location systems and Final Girl personal cards are separate imports.'},
  ],
};
export const EVOMORPH_PROMPT_CONTEXT:ModulePromptContext={
  rulesSummary:'Evomorph evolves Hatchling → Youngling → Adult at Bloodlust Evolve effects. Hatchling Bloodlust increases only for its own Victim kills; other increases become Time. Youngling immediately Vanishes. Adult maximum Health 10, recovers all Health on evolution and reveals Dark Power. While vanished, Ambush replaces normal Killer phase steps. Scan can force its return and skip a Killer phase. Reveals, card references and attacks alone establish no outcomes. Preserve unknown stage and physical-table observations.',
  narrativeGuidance:'An alien predator, not a human slasher. Use the explicitly reported stage; never equate any casualty with evolution or invent a past host death. Vanished means off the physical board, not destroyed, teleporting or in another dimension. Keep the selected Location. Only recorded casualties and effects happened. The starting stage is Hatchling only when verified fresh standard setup is supplied.',
  visualGuidance:EVOMORPH_VISUAL,
};
