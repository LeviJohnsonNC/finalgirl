import {describe,it,expect} from 'vitest';
import {KONRAD_ART,konradArt} from './konradArt';
import {KONRAD_EVENTS,KONRAD_FUNCTIONS,KONRAD_SHAFTS} from '@/lib/play/konrad';
describe('USS Konrad exact photograph mapping',()=>{
 it('covers every runtime environmental/role/Event state with no missing-art fallback',()=>{
  expect(Object.keys(KONRAD_ART)).toHaveLength(50);expect(new Set(Object.values(KONRAD_ART).map(x=>x.src)).size).toBe(41);
  for(const f of KONRAD_FUNCTIONS)expect(konradArt(`${f.id}-unknown`).src).toBeTruthy();for(const shaft of KONRAD_SHAFTS)for(const state of ['unknown','inactive','active'])expect(konradArt(`shaft-${shaft}-${state}`).src).toBeTruthy();for(const e of KONRAD_EVENTS.filter(e=>e.kind!=='instant'))expect(konradArt(e.id).src).toBeTruthy();
  expect(konradArt('header').src).toContain('/banners/konrad.webp');for(const id of ['captain','jonas','orphan'])expect(new Set([id,`${id}-saved`,`${id}-killed`].map(k=>konradArt(k).src)).size).toBe(3);expect(new Set(['parked','powered','equipped','lost'].map(k=>konradArt(`loader-${k}`).src)).size).toBe(4);expect(()=>konradArt('unmapped-owner-art')).toThrow('Missing USS Konrad photograph');
 });
});
