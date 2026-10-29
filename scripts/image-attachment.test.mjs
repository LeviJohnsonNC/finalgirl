import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
const compile = path => ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const fiction = {};
new Function('exports', compile('../supabase/functions/_shared/fictionBoundary.ts'))(fiction);
const storyFacts = {}, prompts = {}, narrativeStyle = {};
const posterDesign = {};
new Function('exports', compile('../supabase/functions/_shared/posterDesign.ts'))(posterDesign);
const finalGirlIdentity = {};
new Function('exports', compile('../supabase/functions/_shared/finalGirlIdentity.ts'))(finalGirlIdentity);
const manifest = {}, opening = {};
new Function('exports', compile('../supabase/functions/_shared/openingReferenceManifest.ts'))(manifest);
const REFERENCE_MANIFEST = manifest.OPENING_REFERENCE_MANIFEST;
// The real module is exercised against a synthetic manifest so digests can be checked
// without touching Storage: tests never read the bucket.
function openingWith(entries) {
  const bound = { OPENING_REFERENCE_MANIFEST: entries };
  const out = {};
  new Function('require', 'exports', compile('../supabase/functions/_shared/openingReferences.ts'))(
    name => { if (name === './openingReferenceManifest.ts') return bound; throw new Error('Unexpected opening import: ' + name); }, out);
  return out;
}
new Function('require', 'exports', compile('../supabase/functions/_shared/openingReferences.ts'))(
  name => { if (name === './openingReferenceManifest.ts') return manifest; throw new Error('Unexpected opening import: ' + name); }, opening);
new Function('exports', compile('../supabase/functions/_shared/storyFacts.ts'))(storyFacts);
new Function('exports', compile('../supabase/functions/_shared/narrativeStyle.ts'))(narrativeStyle);
new Function('require', 'exports', compile('../supabase/functions/_shared/prompts.ts'))(name => {
  if (name === './posterDesign.ts') return posterDesign;
  if (name === './finalGirlIdentity.ts') return finalGirlIdentity;
  if (name === './fictionBoundary.ts') return fiction;
  if (name === './narrativeStyle.ts') return narrativeStyle;
  assert.equal(name, './storyFacts.ts'); return storyFacts;
}, prompts);

function imageHandler({ rowExists = true, attachError = null, composeError = false, invalidPlan = false, incompletePlan = false, mechanicalPlan = false, planningGateway, discardedBefore = false, discardedDuring = false, referenceError = false, printDesign, brokenConcepts = false } = {}) {
  const filters = []; const removed = []; const phases = []; const imageCalls = []; const textCalls = []; const openingCalls = []; const compositions = []; let handler;
  const identityReferences = [{ name: 'Rena', url: 'data:image/jpeg;base64,RENA' }, { name: 'Billy the Bear', url: 'data:image/jpeg;base64,BEAR' }];
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
    '../_shared/openingReferences.ts': { OpeningReferenceError: Error, openingReferences: async (girl, killer) => { openingCalls.push([girl, killer]); if (referenceError) throw new Error('the stored reference does not match its reviewed digest'); return identityReferences; } },
    './referenceLoader.ts': { downloadReference: async () => new Uint8Array() },
    '../_shared/auth.ts': { getCorsHeaders: () => ({ 'Access-Control-Allow-Origin': 'https://example.test' }) },
    '../_shared/guard.ts': { requireUser: async () => ({ ok: true, adminClient:client, user: { id: 'owner-A' }, logUsage: async () => {} }) },
    '../_shared/validation.ts': { validateRequest: (_schema, data) => ({ success: true, data }) },
    '../_shared/aiGateway.ts': { generateShotPlanText: planningGateway?.generateShotPlanText ?? (async opts => {
      textCalls.push(opts);
      if (incompletePlan) throw new Error('Generation did not finish: length');
      const copy = opts.system.includes('"title"') ? { title: 'TITLE', tagline: 'TAGLINE' } : {};
      return { text: invalidPlan ? '{' : JSON.stringify({ concepts: brokenConcepts ? [] : ['A doorway with a small figure at the far end.', mechanicalPlan ? 'The woman rolls a die into a bowl beside a sign reading Fire and Brimstone.' : 'A face seen beside a darkened arcade machine.', 'An empty chair beneath a practical ceiling lamp.'], selected: 1, ...copy, design:printDesign }), model: 'text' };
    }), GatewayError: planningGateway?.GatewayError ?? Error, generateImage: async (...args) => { imageCalls.push(args); return { base64: 'dGVzdA==', mimeType: 'image/png', model: 'image' }; }, statusFor: planningGateway?.statusFor ?? (() => 500), userFacingMessage: planningGateway?.userFacingMessage ?? (() => 'failed') },
    '../_shared/poster.ts': { composePoster: async (_bytes, copy, design, cast) => { phases.push('compose'); compositions.push({copy,design,cast}); assert.equal(copy.title, invalidPlan || incompletePlan ? 'BUDDYLAND' : 'TITLE'); if(composeError) throw new Error('composition failed'); return Buffer.from('complete-poster'); } },
    '../_shared/prompts.ts': prompts,
    '../_shared/posterDesign.ts': posterDesign,
    '../_shared/fictionBoundary.ts': fiction,
  };
  new Function('require', 'exports', 'Deno', code)(name => {
    if (name.includes('/http/server.ts')) return { serve: fn => { handler = fn; } };
    if (name.includes('supabase-js')) return { createClient: () => client };
    if (name.includes('/xhr@')) return {};
    if (modules[name]) return modules[name];
    throw new Error('Unexpected image handler import: ' + name);
  }, {}, { env: { get: () => 'configured' } });
  return { handler, filters, removed, phases, imageCalls, textCalls, openingCalls, identityReferences, compositions };
}
const request = (sceneType = 'ending') => new Request('https://example.test', { method: 'POST', body: JSON.stringify({ sceneType, killer: 'Billy the Bear', finalGirl: 'Rena', location: 'Buddyland', story: 'Rena held her flashlight toward the empty prize counter. Across the arcade, the bear began to move.', gameId: 'record', previousImageUrl: 'https://example.test/storage/v1/object/public/posters/game-posters/owner-A/old.png' }) });
test('scene planning and rendering correct crossed caller identity for openings and posters', async () => {
  for (const [finalGirl, anchor] of [['Cassie', 'purple hoodie'], ['Mandy', 'black mesh athletic top'], ['Alice', 'copper-red hair'], ['Selena', 'high round bun']]) {
    for (const sceneType of ['beginning', 'ending']) {
      const f = imageHandler();
      const body = { ...await request(sceneType).json(), finalGirl, finalGirlDescription: 'OBSOLETE_CALLER_IDENTITY', visualBible: JSON.stringify({finalGirl:'OBSOLETE_CONTINUITY: a different woman.',killer:'A bear with exposed mechanical joints.',location:'An arcade with old machines.',palette:'Amber lamps and dark painted walls.'}) };
      assert.equal((await f.handler(new Request('https://example.test', {method:'POST',body:JSON.stringify(body)}))).status, 200);
      for (const prompt of [f.textCalls[0].user, f.imageCalls[0][0]]) {
        assert(prompt.includes(anchor));
        assert(!prompt.includes('OBSOLETE_CALLER_IDENTITY'));
        assert(!prompt.includes('OBSOLETE_CONTINUITY'));
      }
      if (sceneType === 'beginning') assert.deepEqual(f.openingCalls, [[finalGirl, 'Billy the Bear']]);
    }
  }
});
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
    '../_shared/fictionBoundary.ts': fiction,
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
    assert.deepEqual(f.imageCalls[0][2],sceneType==='beginning'?{aspectRatio:'16:9',references:f.identityReferences}:undefined);
    assert.deepEqual(f.openingCalls,sceneType==='beginning'?[['Rena','Billy the Bear']]:[]);
    assert.deepEqual(f.phases,sceneType==='beginning'?['upload']:['compose','upload']);
  }
});
test('an unloadable cast reference refuses the opening without spending a planning or image call', async () => {
  const f = imageHandler({ referenceError: true });
  const response = await f.handler(request('beginning'));
  assert.equal(response.status, 503);
  assert.match((await response.json()).error, /cast references could not be loaded/i);
  assert.equal(f.textCalls.length, 0);
  assert.equal(f.imageCalls.length, 0);
  assert.deepEqual(f.phases, []);
  assert.deepEqual(f.removed, []);
});
test('only reviewed selected portraits condition openings, including mixed-film casts', async () => {
  const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
  const sha256 = createHash('sha256').update(jpeg).digest('hex');
  const entries = {
    Alice: { path: 'alice.jpg', sha256 },
    Rena: { path: 'rena.jpg', sha256 },
    Gwynn: { path: 'gwynn.jpg', sha256 },
    'Billy the Bear': { path: 'billy-the-bear.jpg', sha256 },
  };
  const loaded = [];
  const loader = async path => { loaded.push(path); return jpeg; };
  const subject = openingWith(entries);
  assert.deepEqual((await subject.openingReferences('Alice', 'Hans', loader)).map(r=>r.name), ['Alice']);
  for (const girl of ['Rena', 'Gwynn']) {
    const refs = await subject.openingReferences(girl, 'Billy the Bear', loader);
    assert.deepEqual(refs.map(ref => ref.name), [girl, 'Billy the Bear']);
    assert(refs.every(ref => ref.url.startsWith('data:image/jpeg;base64,')));
  }
  assert.deepEqual((await subject.openingReferences('Rena', 'Hans', loader)).map(ref => ref.name), ['Rena']);
  assert.deepEqual(await subject.openingReferences('__proto__', 'constructor', loader), []);
  assert(loaded.every(path => Object.values(entries).some(entry => entry.path === path)));
});
test('a reviewed portrait that cannot be served exactly refuses the shot instead of substituting', async () => {
  const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
  const entries = { Rena: { path: 'rena.jpg', sha256: createHash('sha256').update(jpeg).digest('hex') } };
  const subject = openingWith(entries);
  await assert.rejects(() => subject.openingReferences('Rena', 'Nobody', async () => { throw new Error('object missing'); }), /object missing/);
  await assert.rejects(() => subject.openingReferences('Rena', 'Nobody', async () => Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d])), /not a JPEG/);
  await assert.rejects(() => subject.openingReferences('Rena', 'Nobody', async () => Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x11])), /does not match its reviewed digest/);
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

test('painting and complete saved poster receive the same design and selected cast',async()=>{
 for(const layout of posterDesign.POSTER_LAYOUTS) {
  const design={layout,face:'slash',palette:'electric'}, f=imageHandler({printDesign:design});
  assert.equal((await f.handler(request())).status,200);
  assert.match(f.imageCalls[0][0],new RegExp('PRINT DESIGN: '+layout));
  assert.deepEqual(f.compositions[0].design,design);
  assert.deepEqual(f.compositions[0].cast,{finalGirl:'Rena',killer:'Billy the Bear',location:'Buddyland'});
  assert.deepEqual(f.phases,['compose','upload']);
 }
});
test('broken optional designs and broken concepts preserve valid copy and use a coordinated bounded fallback',async()=>{
 for(const options of [{printDesign:{layout:'bad'}},{brokenConcepts:true},{invalidPlan:true}]) {
  const a=imageHandler(options), b=imageHandler(options);
  assert.equal((await a.handler(request())).status,200);assert.equal((await b.handler(request())).status,200);
  const design=a.compositions[0].design;
  assert(posterDesign.parsePosterDesign(design));
  assert.deepEqual(design,b.compositions[0].design);
  assert.match(a.imageCalls[0][0],new RegExp('PRINT DESIGN: '+design.layout));
 }
});

test('discarded games authorize no new image generation and late uploads are removed without attachment',async()=>{
 const before=imageHandler({discardedBefore:true});assert.equal((await before.handler(request())).status,410);assert.equal(before.imageCalls.length,0);
 const during=imageHandler({discardedDuring:true});assert.equal((await during.handler(request())).status,410);assert.equal(during.imageCalls.length,1);assert.equal(during.filters.length,0);assert.equal(during.removed.length,1);assert.match(during.removed[0],/^game-posters\/owner-A\/record-poster-/);
});

test('a literal rules shot never spends on an image or replaces the existing picture',async()=>{const f=imageHandler({mechanicalPlan:true});assert.equal((await f.handler(request('beginning'))).status,500);assert.equal(f.imageCalls.length,0);assert.deepEqual(f.phases,[]);assert.deepEqual(f.removed,[]);});
test('every catalogued Final Girl has her own reviewed reference, independent of killer and film',()=>{const catalog=readFileSync(new URL('../src/types/gameData.ts',import.meta.url),'utf8');const names=new Set([...catalog.matchAll(/finalGirls: *\[([^\]]+)\]/g)].flatMap(([,part])=>[...part.matchAll(/'([^']+)'/g)].map(([,name])=>name)).filter(name=>name!=='TBD'));for(const name of names){const entry=REFERENCE_MANIFEST[name];assert(entry,`${name} has no reviewed reference`);assert.match(entry.path,/^[a-z0-9-]+\.jpg$/);assert.match(entry.sha256,/^[0-9a-f]{64}$/);}for(const killer of ['Billy the Bear','Inkanyamba'])assert(REFERENCE_MANIFEST[killer]);assert(names.size>30);assert.equal(new Set(Object.values(REFERENCE_MANIFEST).map(entry=>entry.path)).size,Object.keys(REFERENCE_MANIFEST).length);assert.equal(typeof opening.openingReferences,'function');});

test('Poltergeist uses the exact staged portrait and preserves independent Final Girl references',async()=>{
 const bytes=new Uint8Array(readFileSync(new URL('../supabase/reference-assets/poltergeist.jpg',import.meta.url)));
 assert.deepEqual(REFERENCE_MANIFEST.Poltergeist,{path:'poltergeist.jpg',sha256:createHash('sha256').update(bytes).digest('hex')});
 assert.deepEqual(opening.openingReferenceNames('Alice','Poltergeist'),['Alice','Poltergeist']);
 const refs=await opening.openingReferences('Unknown','Poltergeist',async path=>{assert.equal(path,'poltergeist.jpg');return bytes;});assert.equal(refs.length,1);assert.equal(refs[0].name,'Poltergeist');
 const bad=bytes.slice();bad[100]^=1;await assert.rejects(()=>opening.openingReferences('Unknown','Poltergeist',async()=>bad),/digest/);
});
test('reviewed rescue uncertainty overrides stale spirit Health and earlier tracker state',()=>{
 const facts=storyFacts.endingFacts({killer:{name:'Poltergeist'},outcome:'won',killerHealth:0,poltergeistReview:{carolynRescued:null,floppyAtEscape:true,epicRequired:null}});
 assert.match(facts,/Carolyn escape unconfirmed/);assert.match(facts,/takes precedence over earlier observations/);assert.match(facts,/Unconfirmed means unknown, not failure/);assert.doesNotMatch(facts,/Killer health remaining: 0/);
 assert.match(storyFacts.endingFacts({killer:{name:'Hans'},killerHealth:0}),/Killer health remaining: 0/);
});

test('reviewed fatal Konrad fate overrides stale positive Health in ending prose and painted poster planning',()=>{
 for(const fate of ['airlock-loss','explosion-loss']) {
  const context={killer:'Poltergeist',location:'USS Konrad',finalGirl:'Laurie',sceneType:'ending',outcome:'lost',story:'The ship fell silent as the recorded disaster consumed its last compartment.',finalGirlHealth:5,konradReview:{fate}};
  assert.match(storyFacts.endingFacts(context),/Final Girl fate: died/);
  assert.match(prompts.buildPosterPrompt(context),/Final Girl fate: died/);
 }
});
