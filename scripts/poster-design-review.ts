/** Internal visual QA: real compositor, supplied art/contexts; not a live-provider benchmark.
 * deno run --allow-read --allow-write --allow-net=deno.land,cdn.jsdelivr.net scripts/poster-design-review.ts cases.json /tmp/poster-review
 * Pass --prompts as the third argument to prepare art-only prompts without composing.
 */
/* global Deno */
import { composePoster } from '../supabase/functions/_shared/poster.ts';
import { buildPosterPrompt, type SceneContext } from '../supabase/functions/_shared/prompts.ts';
import { parsePosterDesign, type PosterCopy, type PosterDesign, type PosterCast } from '../supabase/functions/_shared/posterDesign.ts';
interface ReviewCase extends PosterCopy { id:string; art:string; design:PosterDesign; cast:PosterCast; context?:SceneContext }
const [input, output, mode, sourceDirectory] = Deno.args;
if (!input || !output) throw new Error('Supply cases.json and an output directory');
const cases:ReviewCase[] = JSON.parse(await Deno.readTextFile(input));
await Deno.mkdir(output,{recursive:true});
const results=[];
for(const item of cases) {
  if(!/^[a-z0-9-]+$/.test(item.id) || !parsePosterDesign(item.design)) throw new Error('Invalid review fixture');
  if(mode==='--prompts') {
    if(!item.context) throw new Error('Missing synthetic scene context');
    await Deno.writeTextFile(`${output}/${item.id}-prompt.txt`,buildPosterPrompt({...item.context,posterDesign:item.design}));
    continue;
  }
  const start=performance.now();
  const artPath=item.art.startsWith('/')?item.art:`${sourceDirectory || '.'}/${item.art}`;
  const bytes=await composePoster(await Deno.readFile(artPath),item,item.design,item.cast);
  await Deno.writeFile(`${output}/${item.id}.png`,bytes);
  results.push({id:item.id,design:item.design,milliseconds:Math.round(performance.now()-start),bytes:bytes.length});
}
await Deno.writeTextFile(`${output}/review.json`,JSON.stringify(results,null,2)+'\n');
console.log(JSON.stringify(results));
