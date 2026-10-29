import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { test, expect, activeGame, gameId } from '../../../tests/browser/fixtures';
const cases=JSON.parse(readFileSync(resolve('docs/reference/ending-posters/cases.json'),'utf8')) as Array<{id:string;cast:{finalGirl:string;killer:string;location:string};context:{story:string;outcome:'won'|'lost';finalGirlHealth?:number}}>;
const source=process.env.POSTER_REVIEW_OUTPUT || '/tmp/poster-review-eight';
for(const item of cases) test(`complete poster ${item.id}`,async({page,archive},info)=>{
  const file=resolve(source,item.id+'.png');
  if(!existsSync(file)) throw new Error('Render the eight native posters before running visual capture');
  const url=`https://example.test/print-review/${item.id}.png`;
  const selection={...activeGame.selection,...item.cast};
  await archive.install(page,{draft:{...activeGame,selection,phase:'ending',endingStory:item.context.story,posterImageUrl:url,
    result:{...selection,id:gameId,timestamp:1,outcome:item.context.outcome},formData:{finalGirlHealth:item.context.finalGirlHealth}}});
  await page.route('**/print-review/*.png',route=>route.fulfill({contentType:'image/png',path:file}));
  await page.goto('/');await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  const image=page.getByRole('img',{name:'Movie poster',exact:true});
  await image.evaluate(async(node:HTMLImageElement)=>{await node.decode();});
  expect(await image.evaluate((node:HTMLImageElement)=>[node.naturalWidth,node.naturalHeight])).toEqual([1000,1500]);
  for(const [width,height] of [[1280,640],[1366,768],[1440,900],[390,844],[320,568]]) {
    await page.setViewportSize({width,height});
    await page.evaluate(()=>document.fonts.ready);
    await image.scrollIntoViewIfNeeded();
    const bounds=(await image.boundingBox())!;
    expect(Math.abs(bounds.width/bounds.height-2/3)).toBeLessThan(.01);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.locator('.narration-photo--poster').screenshot({path:info.outputPath(`${item.id}-${width}.png`),style:'.app-footer{visibility:hidden}'});
  }
  await expect(page.getByRole('button',{name:'Reshoot',exact:true})).toBeEnabled();
  await page.getByRole('button',{name:'Expand movie poster',exact:true}).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.screenshot({path:info.outputPath(`${item.id}-expanded-320.png`)});
});
