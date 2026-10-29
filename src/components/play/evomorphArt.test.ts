import {expect,it} from 'vitest';
import {EVOMORPH_MINORS} from '../../../supabase/functions/_shared/play/evomorph';
import {evomorphArt,evomorphStageArt} from './evomorphArt';
import {illustratedKillerCards} from './killerPresentation';
it('ships ten distinct custom Evomorph card photographs shared by both reveal entry points',()=>{
 const cards=[...illustratedKillerCards('Evomorph','dark-power'),...illustratedKillerCards('Evomorph','finale')];
 const pictures=[...cards.map(card=>card.art),...EVOMORPH_MINORS.map(card=>evomorphArt(card.id))];
 expect(pictures).toHaveLength(10);
 expect(new Set(pictures.map(art=>art.src)).size).toBe(10);
 for(const art of pictures){expect(art.src).toContain('/photos/evomorph/');expect(art.atlas).toBeUndefined();}
 for(const card of cards)expect(card.heroArt).toEqual(card.art);
});
it('keeps live stage identities distinct and leaves an unknown stage visually unknown',()=>{
 const stages=['hatchling','youngling','adult'].map(evomorphStageArt);
 expect(new Set(stages.map(art=>art.src)).size).toBe(3);
 const unknown=evomorphStageArt(undefined);
 expect(stages.map(art=>art.src)).not.toContain(unknown.src);
 expect(evomorphStageArt('legacy-unknown')).toEqual(unknown);
 expect(()=>evomorphArt('missing-card')).toThrow('Missing Evomorph photograph');
});
