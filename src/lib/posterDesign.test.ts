import { describe, it, expect } from 'vitest';
import { fallbackPosterDesign, parsePosterDesign, posterArtDirection, POSTER_LAYOUTS, posterLayouts } from '../../supabase/functions/_shared/posterDesign';
import { buildPosterPrompt, buildShotBriefSystem, parseArtPlan, parsePosterCopy } from '../../supabase/functions/_shared/prompts';

const copy = {title:'NIGHT SHIFT',tagline:'THE LAST GAME NEVER ENDS.'};
const plan = {...copy,concepts:['A figure pauses beside a darkened doorway.','A face is reflected in the wet arcade glass.','An empty corridor ends at one open door.'],selected:1};
const context = {story:'Rena escaped the arcade while the bear remained inside.',sceneType:'ending' as const,outcome:'won' as const,finalGirl:'Rena',killer:'Billy the Bear',location:'Buddyland'};
describe('coordinated poster print direction',()=>{
  it('uses the same validated design in the plan, image safe areas and raster geometry',()=>{
    for(const layout of POSTER_LAYOUTS) {
      const design={layout,face:'brush' as const,palette:'bone' as const};
      const parsed=parseArtPlan(JSON.stringify({...plan,design}));
      expect(parsed?.design).toEqual(design);
      const prompt=buildPosterPrompt({...context,posterDesign:parsed!.design});
      expect(prompt).toContain(posterArtDirection(design));
      expect(prompt).not.toContain('Keep top 12% and bottom 25%');
      expect(prompt).toContain('Visibly hand-painted');
      for(const rect of Object.values(posterLayouts[layout]).filter(v=>typeof v==='object')) {
        expect(rect.x).toBeGreaterThanOrEqual(0);expect(rect.y).toBeGreaterThanOrEqual(0);
        expect(rect.x+rect.width).toBeLessThanOrEqual(1000);expect(rect.y+rect.height).toBeLessThanOrEqual(1500);
      }
    }
  });
  it('retains valid copy and old plans when optional design or composition is broken',()=>{
    for(const design of [undefined,null,{},'crown',{layout:'constructor',face:'brush',palette:'bone'},{layout:'crown',face:'remote-font-url',palette:'bone'},{layout:'crown',face:'brush',palette:'#fff'}]) {
      expect(parseArtPlan(JSON.stringify({...plan,design}))).toEqual(plan);
      expect(parsePosterDesign(design)).toBeUndefined();
    }
    expect(parsePosterCopy(JSON.stringify({...copy,concepts:['broken'],selected:99}))).toEqual(copy);
    expect(parseArtPlan(JSON.stringify({...copy,concepts:['broken'],selected:99}))).toBeNull();
    for(const value of ['{','null','[]',JSON.stringify({...copy,title:'X'.repeat(33)})]) expect(parsePosterCopy(value)).toBeNull();
  });
  it('gives stable, varied recovery designs without changing story facts or opening photography',()=>{
    const seeds=Array.from({length:24},(_,n)=>`Rena|Billy the Bear|Buddyland|Night ${n}`);
    const designs=seeds.map(fallbackPosterDesign);
    expect(seeds.map(fallbackPosterDesign)).toEqual(designs);
    expect(new Set(designs.map(d=>d.layout)).size).toBe(4);
    expect(new Set(designs.map(d=>d.face)).size).toBeGreaterThanOrEqual(4);
    expect(new Set(designs.map(d=>d.palette)).size).toBe(4);
    expect(buildShotBriefSystem({...context,sceneType:'beginning'})).not.toContain('"design"');
    expect(buildShotBriefSystem(context)).toContain('Do not default every film to a red lower title');
  });
});
