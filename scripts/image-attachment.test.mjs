import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
const compile = path => ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const storyFacts = {}, prompts = {};
new Function('exports', compile('../supabase/functions/_shared/storyFacts.ts'))(storyFacts);
new Function('require', 'exports', compile('../supabase/functions/_shared/prompts.ts'))(name => {
  assert.equal(name, './storyFacts.ts'); return storyFacts;
}, prompts);

function imageHandler({ rowExists = true, attachError = null, composeError = false, invalidPlan = false, discardedBefore = false, discardedDuring = false } = {}) {
  const filters = []; const removed = []; const phases = []; const imageCalls = []; const textCalls = []; let handler;
  let uploaded=false;
  const discardedHelpers={};new Function('require','exports',ts.transpileModule(readFileSync(new URL('../supabase/functions/_shared/discardedGame.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText)(()=>{},discardedHelpers);
  const client = {
    rpc:async()=>({error:null}),
    from: table => table === 'discarded_games' ? {select:()=>{const q={eq:()=>q,maybeSingle:async()=>({data:discardedBefore || discardedDuring && uploaded ? {game_id:'record'} : null,error:null})};return q;}} : ({ update: () => {
      const query = { eq: (key, value) => { filters.push([key, value]); return query; }, select: async () => ({ data: rowExists ? [{ id: 'record' }] : [], error: attachError }) };
      return query;
    } }),
    storage: { from: () => ({
      upload: async (_path, bytes, options) => { uploaded=true;phases.push('upload'); assert.equal(Buffer.from(bytes).toString(), _path.includes('-scene-') ? 'test' : 'complete-poster'); assert.equal(options.contentType, 'image/png'); return { error: null }; },
      getPublicUrl: () => ({ data: { publicUrl: 'https://example.test/new.png' } }),
      remove: async paths => { removed.push(...paths); return { error: null }; },
    }) },
  };
  const source = readFileSync(new URL('../supabase/functions/generate-scene-image/index.ts', import.meta.url), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const modules = {
    '../_shared/discardedGame.ts':discardedHelpers,
    '../_shared/imageReference.ts': { ownedOpeningReference: () => undefined },
    '../_shared/auth.ts': { getCorsHeaders: () => ({ 'Access-Control-Allow-Origin': 'https://example.test' }) },
    '../_shared/guard.ts': { requireUser: async () => ({ ok: true, adminClient:client, user: { id: 'owner-A' }, logUsage: async () => {} }) },
    '../_shared/validation.ts': { validateRequest: (_schema, data) => ({ success: true, data }) },
    '../_shared/aiGateway.ts': { generateText: async opts => {
      textCalls.push(opts);
      const copy = opts.system.includes('"title"') ? { title: 'TITLE', tagline: 'TAGLINE' } : {};
      return { text: invalidPlan ? '{' : JSON.stringify({ concepts: ['A doorway with a small figure at the far end.', 'A face seen beside a darkened arcade machine.', 'An empty chair beneath a practical ceiling lamp.'], selected: 1, ...copy }), model: 'text' };
    }, generateImage: async (...args) => { imageCalls.push(args); return { base64: 'dGVzdA==', mimeType: 'image/png', model: 'image' }; }, statusFor: () => 500, userFacingMessage: () => 'failed' },
    '../_shared/poster.ts': { composePoster: async (_bytes, copy) => { phases.push('compose'); assert.equal(copy.title, invalidPlan ? 'BUDDYLAND' : 'TITLE'); if(composeError) throw new Error('composition failed'); return Buffer.from('complete-poster'); } },
    '../_shared/prompts.ts': prompts,
  };
  new Function('require', 'exports', 'Deno', code)(name => {
    if (name.includes('/http/server.ts')) return { serve: fn => { handler = fn; } };
    if (name.includes('supabase-js')) return { createClient: () => client };
    if (name.includes('/xhr@')) return {};
    if (modules[name]) return modules[name];
    throw new Error('Unexpected image handler import: ' + name);
  }, {}, { env: { get: () => 'configured' } });
  return { handler, filters, removed, phases, imageCalls, textCalls };
}
const request = (sceneType = 'ending') => new Request('https://example.test', { method: 'POST', body: JSON.stringify({ sceneType, killer: 'Billy the Bear', finalGirl: 'Rena', location: 'Buddyland', story: 'Rena held her flashlight toward the empty prize counter. Across the arcade, the bear began to move.', gameId: 'record', previousImageUrl: 'https://example.test/storage/v1/object/public/posters/game-posters/owner-A/old.png' }) });
test('opening generation uses a photographic planner without poster copy, with a safe full-story fallback', async () => {
  for (const invalidPlan of [false, true]) {
    const f = imageHandler({ invalidPlan });
    assert.equal((await f.handler(request('beginning'))).status, 200);
    assert.match(f.textCalls[0].system, /real camera shot/);
    assert.doesNotMatch(f.textCalls[0].system, /poster art director|"title"|"tagline"/);
    assert.match(f.imageCalls[0][0], /ultra-photorealistic live-action/);
    assert.match(f.imageCalls[0][0], invalidPlan ? /Rena held her flashlight/ : /A face seen beside a darkened arcade machine/);
    assert.equal(f.imageCalls[0][1], undefined);
    assert.deepEqual(f.phases, ['upload']);
  }
  const poster = imageHandler();
  assert.equal((await poster.handler(request('ending'))).status, 200);
  assert.match(poster.textCalls[0].system, /painted 1980s one-sheet/);
  assert.match(poster.imageCalls[0][0], /Visibly hand-painted/);
  assert.deepEqual(poster.phases, ['compose', 'upload']);
});
test('new opening stills use the screen ratio while closing posters retain their generation settings',async()=>{
  for(const sceneType of ['beginning','ending']) {
    const f=imageHandler();
    assert.equal((await f.handler(request(sceneType))).status,200);
    assert.deepEqual(f.imageCalls[0][2],sceneType==='beginning'?{aspectRatio:'16:9'}:undefined);
    assert.deepEqual(f.phases,sceneType==='beginning'?['upload']:['compose','upload']);
  }
});
test('late images attach only to the supplied record and authenticated owner', async () => {
  const { handler, filters, removed } = imageHandler();
  const response = await handler(request());
  assert.equal(response.status, 200);
  assert.deepEqual(filters, [['id', 'record'], ['user_id', 'owner-A']]);
  assert.deepEqual(removed, ['game-posters/owner-A/old.png']);
});
test('an absent row never authorizes deletion of the previous archived image', async () => {
  const { handler, removed } = imageHandler({ rowExists: false });
  assert.equal((await handler(request())).status, 200);
  assert.deepEqual(removed, []);
});
test('a failed attachment keeps the previous image available for client retry', async () => {
  const { handler, removed } = imageHandler({ attachError: { message: 'database unavailable' } });
  assert.equal((await handler(request())).status, 200);
  assert.deepEqual(removed, []);
});


test('only a complete raster poster is uploaded; malformed planning uses bounded fallback copy', async () => {
  for(const invalidPlan of [false,true]) {
    const f=imageHandler({invalidPlan});
    assert.equal((await f.handler(request())).status,200);
    assert.deepEqual(f.phases,['compose','upload']);
  }
});
test('composition failure cannot attach incomplete art or delete the previous poster',async()=>{
  const f=imageHandler({composeError:true});
  assert.equal((await f.handler(request())).status,500);
  assert.deepEqual(f.phases,['compose']);
  assert.deepEqual(f.filters,[]);
  assert.deepEqual(f.removed,[]);
});

test('discarded games authorize no new image generation and late uploads are removed without attachment',async()=>{
 const before=imageHandler({discardedBefore:true});assert.equal((await before.handler(request())).status,410);assert.equal(before.imageCalls.length,0);
 const during=imageHandler({discardedDuring:true});assert.equal((await during.handler(request())).status,410);assert.equal(during.imageCalls.length,1);assert.equal(during.filters.length,0);assert.equal(during.removed.length,1);assert.match(during.removed[0],/^game-posters\/owner-A\/record-poster-/);
});
