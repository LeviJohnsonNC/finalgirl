import {describe,it,expect} from 'vitest';
import {KONRAD_ART,konradArt} from './konradArt';
import {KONRAD_EVENTS,KONRAD_FUNCTIONS,KONRAD_SHAFTS} from '@/lib/play/konrad';
describe('USS Konrad exact photograph mapping',()=>{
 it('covers every runtime environmental/role/Event state with no missing-art fallback',()=>{
  expect(Object.keys(KONRAD_ART)).toHaveLength(44);expect(new Set(Object.values(KONRAD_ART).map(x=>x.src)).size).toBe(34);
  for(const f of KONRAD_FUNCTIONS)expect(konradArt(`${f.id}-unknown`).src).toBeTruthy();for(const shaft of KONRAD_SHAFTS)for(const state of ['unknown','inactive','active'])expect(konradArt(`shaft-${shaft}-${state}`).src).toBeTruthy();for(const e of KONRAD_EVENTS.filter(e=>e.kind!=='instant'))expect(konradArt(e.id).src).toBeTruthy();
  expect(konradArt('header').src).toContain('/banners/konrad.webp');expect(konradArt('loader-equipped').src).toBe(konradArt('loader-powered').src);expect(()=>konradArt('unmapped-owner-art')).toThrow('Missing USS Konrad photograph');
 });
});
