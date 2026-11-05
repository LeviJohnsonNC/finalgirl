import {test,expect,activeGame,gameId,userId} from './fixtures';
const key=`final-girl-active-game-v1:${userId}`;
const complete='Laurie reached the camp gate. The road beyond it was empty, but she could hear the two people she had brought with her breathing in the dark.';

async function finishGame(page:import('@playwright/test').Page) {
  await page.goto('/');
  await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  await page.getByRole('button',{name:'WON',exact:true}).first().click();
  await page.getByRole('button',{name:'Generate ending',exact:true}).click();
}

test('a reframed ending replaces the interrupted draft and only checkpoints the completed story',async({page,archive},info)=>{
  archive.autoImages=true;
  await archive.install(page,{draft:activeGame});
  // A controlled response exercises the real reader while the rewrite is in flight.
  await page.addInitScript(()=>{
    const original=window.fetch.bind(window);
    Object.assign(window,{endingRequests:0});
    window.fetch=async(input,init)=>{
      if(String(input).endsWith('/functions/v1/generate-ending')){
        const state=window as unknown as {endingRequests:number;endingBody:unknown;finishEnding:(text:string)=>void};
        state.endingRequests++;
        state.endingBody=JSON.parse(String(init?.body));
        const encoder=new TextEncoder();
        return new Response(new ReadableStream({start(controller){
          controller.enqueue(encoder.encode('data: {"choices":[{"delta":{"content":"INTERRUPTED_DRAFT"}}]}\n\ndata: {"recovery":{"kind":"ending","state":"reframing"}}\n\n'));
          state.finishEnding=text=>{controller.enqueue(encoder.encode('data: '+JSON.stringify({choices:[{delta:{content:text}}]})+'\n\ndata: {"choices":[{"finish_reason":"stop"}]}\n\ndata: [DONE]\n\n'));controller.close();};
        }}),{headers:{'Content-Type':'text/event-stream'}});
      }
      return original(input,init);
    };
  });
  await finishGame(page);
  await expect(page.getByText('Reframing the ending…',{exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:'Save to scrapbook',exact:true})).toBeDisabled();
  expect(archive.generationRequests.some(r=>r.name==='generate-scene-image'&&r.body.sceneType==='ending')).toBe(false);
  const draft=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)!),key);
  expect(draft.endingStory).toBeFalsy();
  const sizes=info.project.name==='mobile'?[[390,844],[320,568]]:[[1280,640],[1366,768],[1440,900]];
  for(const [width,height] of sizes){
    await page.setViewportSize({width,height});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    const caption=await page.getByText('Reframing the ending…',{exact:true}).boundingBox();
    expect(caption!.y+caption!.height).toBeLessThan(height-44);
    const bounds=await page.locator('.ending-body').boundingBox();
    for(const child of await page.locator('.ending-body > *').all()){const box=await child.boundingBox();expect(box!.width).toBeGreaterThan(200);expect(box!.x+box!.width).toBeLessThanOrEqual(bounds!.x+bounds!.width+1);}
    await page.screenshot({path:info.outputPath(`ending-reframing-${width}.png`)});
  }
  await page.evaluate(text=>(window as unknown as {finishEnding:(text:string)=>void}).finishEnding(text),complete);
  await expect(page.getByRole('region',{name:'Ending narration',exact:true})).toHaveText(complete);
  await expect(page.getByText('Reframing the ending…',{exact:true})).toHaveCount(0);
  await expect(page.getByRole('button',{name:'Save to scrapbook',exact:true})).toBeEnabled();
  expect(await page.evaluate(()=>(window as unknown as {endingRequests:number}).endingRequests)).toBe(1);
  expect(await page.evaluate(()=>(window as unknown as {endingBody:unknown}).endingBody)).toMatchObject({endingStreamVersion:1});
  await expect.poll(()=>archive.generationRequests.find(r=>r.name==='generate-scene-image'&&r.body.sceneType==='ending')?.body.story).toBe(complete);
  await page.reload();await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  await expect(page.getByRole('region',{name:'Ending narration',exact:true})).toHaveText(complete);
  await page.getByRole('button',{name:'Save to scrapbook',exact:true}).click();
  await expect.poll(()=>archive.history[0]?.ending_narration).toBe(complete);
});

for(const mode of ['policy','truncated'] as const)test(`a ${mode} failure leaves the result safe and cannot save, narrate or develop a partial ending`,async({page,archive},info)=>{
  archive.autoImages=true;
  await archive.install(page,{draft:activeGame});
  let requests=0;
  await page.route('**/functions/v1/generate-ending',route=>{
    requests++;
    const body=mode==='policy'
      ? 'data: {"recovery":{"kind":"ending","state":"reframing"}}\n\ndata: {"choices":[{"delta":{"content":"UNFINISHED_REWRITE"}}]}\n\ndata: {"error":"private provider reason","code":"content_policy"}\n\n'
      : 'data: {"choices":[{"delta":{"content":"UNFINISHED_REWRITE"}}]}\n\ndata: [DONE]\n\n';
    return route.fulfill({contentType:'text/event-stream',body});
  });
  await finishGame(page);
  const reader=page.getByRole('region',{name:'Ending narration',exact:true});
  await expect(reader).toContainText(mode==='policy'?'Your game result is safe':'stopped before it was finished');
  await expect(reader).not.toContainText('UNFINISHED_REWRITE');await expect(reader).not.toContainText('private provider reason');
  await expect(page.getByRole('button',{name:'Save to scrapbook',exact:true})).toBeDisabled();
  await expect(page.getByRole('button',{name:'Narrate',exact:true})).toHaveCount(0);
  expect(requests).toBe(1);
  expect(archive.generationRequests.some(r=>r.name==='generate-scene-image'&&r.body.sceneType==='ending')).toBe(false);
  const draft=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)!),key);
  expect(draft.result).toMatchObject({id:gameId,outcome:'won'});expect(draft.endingStory).toBeFalsy();
  await page.screenshot({path:info.outputPath(`ending-${mode}.png`)});
  await page.getByRole('button',{name:'Save record only',exact:true}).click();
  await expect.poll(()=>archive.history.length).toBe(1);expect(archive.history[0].ending_narration).toBeNull();
});
