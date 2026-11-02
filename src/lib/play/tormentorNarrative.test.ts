import {describe,it,expect} from 'vitest';
import {reviewedCharacterFate,endingFacts} from '../../../supabase/functions/_shared/storyFacts';
import {tormentorOpeningGuidance} from './tormentor';
import {TORMENTOR_ART,tormentorArt} from '@/components/play/tormentorArt';
import {TORMENTOR_TRAPS,TORMENTOR_POWERS,TORMENTOR_FINALES,TORMENTOR_TERRORS} from './tormentor';
describe('Tormentor narrative truth and original photograph mappings',()=>{
 it('gives terminal trap death precedence over positive Health and reviewed ship survival',()=>{expect(reviewedCharacterFate(5,{fate:'survived'},{loss:'trap-terminal'})).toBe('died');for(const loss of ['no-escape','endless-traps'] as const){expect(reviewedCharacterFate(5,undefined,{loss})).toBe('survived');expect(reviewedCharacterFate(undefined,undefined,{loss})).toBe('unknown');expect(reviewedCharacterFate(5,{fate:'airlock-loss'},{loss})).toBe('died');}expect(endingFacts({tormentorReview:{loss:'trap-terminal'},finalGirlHealth:5})).toContain('Final Girl fate: died');});
 it('keeps fresh openings unseen and legacy provenance uncertain',()=>{expect(tormentorOpeningGuidance('fresh-v1')).toContain('unseen/off-frame');expect(tormentorOpeningGuidance('legacy-unknown')).toContain('unrecorded');});
 it('maps every unique card to its own original full photo and small thumbnail before sorting',()=>{const ids=[...TORMENTOR_TRAPS,...TORMENTOR_POWERS,...TORMENTOR_FINALES,...TORMENTOR_TERRORS].map(c=>c.id);expect(ids).toHaveLength(26);expect(Object.keys(TORMENTOR_ART)).toHaveLength(51);expect(new Set(ids.map(id=>tormentorArt(id).src)).size).toBe(26);for(const id of ids){expect(tormentorArt(id,true).src).toContain('-thumb.webp');expect(tormentorArt(id).src).not.toContain('thumb');}expect(()=>tormentorArt('missing')).toThrow();});
});
