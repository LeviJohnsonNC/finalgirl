import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
const compile = path => ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const storyFacts = {}, prompts = {}, narrativeStyle = {};
const referenceData = {}, opening = {};
new Function('exports', compile('../supabase/functions/_shared/openingReferenceData.ts'))(referenceData);
new Function('require', 'exports', compile('../supabase/functions/_shared/openingReferences.ts'))(() => referenceData, opening);
new Function('exports', compile('../supabase/functions/_shared/storyFacts.ts'))(storyFacts);
new Function('exports', compile('../supabase/functions/_shared/narrativeStyle.ts'))(narrativeStyle);
new Function('require', 'exports', compile('../supabase/functions/_shared/prompts.ts'))(name => {
  if (name === './narrativeStyle.ts') return narrativeStyle;
  assert.equal(name, './storyFacts.ts'); return storyFacts;
}, prompts);

function imageHandler({ rowExists = true, attachError = null, composeError = false, invalidPlan = false, incompletePlan = false, planningGateway, discardedBefore = false, discardedDuring = false } = {}) {
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
    '../_shared/openingReferences.ts': opening,
    '../_shared/auth.ts': { getCorsHeaders: () => ({ 'Access-Control-Allow-Origin': 'https://example.test' }) },
    '../_shared/guard.ts': { requireUser: async () => ({ ok: true, adminClient:client, user: { id: 'owner-A' }, logUsage: async () => {} }) },
    '../_shared/validation.ts': { validateRequest: (_schema, data) => ({ success: true, data }) },
    '../_shared/aiGateway.ts': { generateShotPlanText: planningGateway?.generateShotPlanText ?? (async opts => {
      textCalls.push(opts);
      if (incompletePlan) throw new Error('Generation did not finish: length');
      const copy = opts.system.includes('"title"') ? { title: 'TITLE', tagline: 'TAGLINE' } : {};
      return { text: invalidPlan ? '{' : JSON.stringify({ concepts: ['A doorway with a small figure at the far end.', 'A face seen beside a darkened arcade machine.', 'An empty chair beneath a practical ceiling lamp.'], selected: 1, ...copy }), model: 'text' };
    }), GatewayError: planningGateway?.GatewayError ?? Error, generateImage: async (...args) => { imageCalls.push(args); return { base64: 'dGVzdA==', mimeType: 'image/png', model: 'image' }; }, statusFor: planningGateway?.statusFor ?? (() => 500), userFacingMessage: planningGateway?.userFacingMessage ?? (() => 'failed') },
    '../_shared/poster.ts': { composePoster: async (_bytes, copy) => { phases.push('compose'); assert.equal(copy.title, invalidPlan || incompletePlan ? 'BUDDYLAND' : 'TITLE'); if(composeError) throw new Error('composition failed'); return Buffer.from('complete-poster'); } },
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
test('opening generation uses only a complete photographic plan, without poster copy', async () => {
    const f = imageHandler();
    assert.equal((await f.handler(request('beginning'))).status, 200);
    assert.match(f.textCalls[0].system, /real camera shot/);
    assert.doesNotMatch(f.textCalls[0].system, /poster art director|"title"|"tagline"/);
    assert.match(f.imageCalls[0][0], /believable live-action photograph/);
    assert.match(f.imageCalls[0][0], /captured together in a single exposure/);
    assert.match(f.imageCalls[0][0], /consumer 35mm color-negative film camera/);
    assert.match(f.imageCalls[0][0], /follow the scene for its historical period/);
    assert.match(f.textCalls[0].system, /daytime need not become artificially dim/);
    assert.match(f.imageCalls[0][0], /A face seen beside a darkened arcade machine/);
    assert.equal(f.textCalls[0].maxTokens, 4000);
    assert.equal(f.textCalls[0].requireComplete, true);
    assert.equal(f.textCalls[0].reasoningEffort, 'low');
    assert.equal(f.imageCalls[0][1], undefined);
    assert.deepEqual(f.phases, ['upload']);
  const poster = imageHandler();
  assert.equal((await poster.handler(request('ending'))).status, 200);
  assert.match(poster.textCalls[0].system, /painted 1980s one-sheet/);
  assert.match(poster.imageCalls[0][0], /Visibly hand-painted/);
  assert.doesNotMatch(poster.imageCalls[0][0], /consumer 35mm color-negative film camera/);
  assert.deepEqual(poster.phases, ['compose', 'upload']);
});
test('real planning failover reaches one image; exhausted planning never uploads or replaces the opening', async () => {
  for (const recover of [true, false]) {
    const calls = [], planningGateway = {};
    new Function('require', 'exports', 'Deno', 'fetch', compile('../supabase/functions/_shared/aiGateway.ts'))(
      () => ({ UTILITY_MODEL_CANDIDATES: ['primary', 'backup'], usesResponsesApi: () => false }), planningGateway,
      { env: { get: () => 'fake-key' } }, async (_url, opts) => {
        const body = JSON.parse(opts.body); calls.push(body.model);
        return body.model === 'backup' && recover
          ? new Response(JSON.stringify({ choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ concepts: ['A doorway with a small figure at the far end.', 'A face seen beside a darkened arcade machine.', 'An empty chair beneath a practical ceiling lamp.'], selected: 1 }) } }] }))
          : new Response('Service temporarily unavailable', { status: 503 });
      },
    );
    const f = imageHandler({ planningGateway });
    const response = await f.handler(request('beginning'));
    assert.equal(response.status, recover ? 200 : 503);
    assert.deepEqual(calls, ['primary', 'backup']);
    assert.equal(f.imageCalls.length, recover ? 1 : 0);
    if (recover) assert.match(f.imageCalls[0][0], /A face seen beside a darkened arcade machine/);
    else {
      assert.match((await response.json()).error, /could not be planned.*story is safe/i);
      assert.deepEqual(f.phases, []);
      assert.deepEqual(f.removed, []);
      assert.deepEqual(f.filters, []);
    }
  }
});
test('malformed or token-limited opening planning spends no image call and changes no saved image', async () => {
  for (const options of [{ invalidPlan: true }, { incompletePlan: true }]) {
    const f = imageHandler(options);
    assert.equal((await f.handler(request('beginning'))).status, 500);
    assert.equal(f.imageCalls.length, 0);
    assert.deepEqual(f.phases, []);
    assert.deepEqual(f.removed, []);
    assert.deepEqual(f.filters, []);
  }
});
test('continuity endpoint returns complete structured notes, never clipped or heading-only text', async () => {
  const valid = JSON.stringify({ finalGirl: 'Burgundy curls and a turquoise pendant.', killer: 'Orange-brown plush over mechanical joints.', location: 'Checkerboard floor and dusty arcade cabinets.', palette: 'Amber lamps and dim cyan arcade screens.' });
  for (const output of [valid, 'Drafting Core Visual Elements:**', valid.slice(0, -12)]) {
    let handler;
    const modules = {
      '../_shared/auth.ts': { getCorsHeaders: () => ({}) },
      '../_shared/guard.ts': { requireUser: async () => ({ ok: true, logUsage: async () => {} }) },
      '../_shared/validation.ts': { validateRequest: (_schema, data) => ({ success: true, data }) },
      '../_shared/aiGateway.ts': { generateText: async opts => {
        assert.equal(opts.requireComplete, true);
        assert.equal(opts.reasoningEffort, 'low');
        assert.equal(opts.maxTokens, 4000);
        return { text: output, model: 'text' };
      }, statusFor: () => 500, userFacingMessage: () => 'failed' },
      '../_shared/prompts.ts': prompts,
    };
    new Function('require', 'exports', compile('../supabase/functions/generate-visual-bible/index.ts'))(name => {
      if (name.includes('/http/server.ts')) return { serve: fn => { handler = fn; } };
      if (modules[name]) return modules[name];
      throw new Error(name);
    }, {});
    const response = await handler(request('beginning'));
    assert.equal(response.status, output === valid ? 200 : 500);
    const body = await response.json();
    assert.equal(body.visualBible, output === valid ? valid : undefined);
  }
});
test('new opening stills use the screen ratio while closing posters retain their generation settings',async()=>{
  for(const sceneType of ['beginning','ending']) {
    const f=imageHandler();
    assert.equal((await f.handler(request(sceneType))).status,200);
    assert.deepEqual(f.imageCalls[0][2],sceneType==='beginning'?{aspectRatio:'16:9',references:opening.openingReferences('Rena','Billy the Bear')}:undefined);
    assert.deepEqual(f.phases,sceneType==='beginning'?['upload']:['compose','upload']);
  }
});
test('only reviewed selected portraits condition openings, including mixed-film casts', () => {
  assert.deepEqual(opening.openingReferences('Alice', 'Hans'), []);
  for (const girl of ['Rena', 'Gwynn']) {
    const refs = opening.openingReferences(girl, 'Billy the Bear');
    assert.deepEqual(refs.map(ref => ref.name), [girl, 'Billy the Bear']);
    assert(refs.every(ref => ref.url.startsWith('data:image/jpeg;base64,/9j/')));
  }
  assert.deepEqual(opening.openingReferences('Rena', 'Hans').map(ref => ref.name), ['Rena']);
  assert.deepEqual(opening.openingReferences('__proto__', 'constructor'), []);
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
  for(const options of [{}, {invalidPlan:true}, {incompletePlan:true}]) {
    const f=imageHandler(options);
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
