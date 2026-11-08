import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
const require = createRequire(import.meta.url);
const code = (path) =>
  ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
const load = (path, imports) => {
  const ex = {};
  new Function('require', 'exports', code(path))((name) => {
    if(name==='./slayer.ts'||name==='./play/slayer.ts')return slayer;
    if(name==='./hunter.ts'||name==='./play/hunter.ts')return hunter;
    if(name==='./sunnydaze.ts'||name==='./play/sunnydaze.ts')return mall;
    if(name==='./sunnydazeCatalog.ts')return mallCatalog;
    if (name === '../_shared/narration.ts') return load('../supabase/functions/_shared/narration.ts', {});
      if (imports[name]) return imports[name];
    throw new Error(name);
  }, ex);
  return ex;
};
const mallCatalog=load('../supabase/functions/_shared/play/sunnydazeCatalog.ts',{});
const mall=load('../supabase/functions/_shared/play/sunnydaze.ts',{'./sunnydazeCatalog.ts':mallCatalog});
const hunter=load('../supabase/functions/_shared/play/hunter.ts',{});
const slayer=load('../supabase/functions/_shared/play/slayer.ts',{});
const buddyland = load('../supabase/functions/_shared/play/buddyland.ts', {});
const camp = load('../supabase/functions/_shared/play/camp.ts', {});
const geppetto = load('../supabase/functions/_shared/play/geppetto.ts', {});
const carnival = load("../supabase/functions/_shared/play/carnival.ts", {});
const maple = load("../supabase/functions/_shared/play/maple.ts", {});
const fright = load("../supabase/functions/_shared/play/fright.ts", {});
const inkanyamba = load("../supabase/functions/_shared/play/inkanyamba.ts", {});
const groves = load("../supabase/functions/_shared/play/groves.ts", {"./inkanyamba.ts":inkanyamba});
const creech = load("../supabase/functions/_shared/play/creech.ts", {});
const poltergeist = load("../supabase/functions/_shared/play/poltergeist.ts", {});
const shady=load('../supabase/functions/_shared/play/shadyAcres.ts',{});
const grimlash=load('../supabase/functions/_shared/play/grimlash.ts',{});
const evomorph = load("../supabase/functions/_shared/play/evomorph.ts", {});
const konradCatalog = load('../supabase/functions/_shared/play/konradCatalog.ts', {});
const konrad = load('../supabase/functions/_shared/play/konrad.ts', {'./konradCatalog.ts':konradCatalog});
const marrek=load('../supabase/functions/_shared/play/marrekWarehouse.ts',{});
const tormentor=load('../supabase/functions/_shared/play/tormentor.ts',{});
const woods = load('../supabase/functions/_shared/play/storybookWoods.ts', {});
const wolf = load('../supabase/functions/_shared/play/bigBadWolf.ts', {});
const intruders = load('../supabase/functions/_shared/play/intruders.ts', {});
const storyText = load('../supabase/functions/_shared/play/storyText.ts', {});
const storyTransitions = load('../supabase/functions/_shared/play/storyTransitions.ts', { './intruders.ts': intruders,'./tormentor.ts':tormentor,'./konradCatalog.ts':konradCatalog});
const wingardCatalog = load('../supabase/functions/_shared/play/wingardCatalog.ts', {});
const wingard = load('../supabase/functions/_shared/play/wingardCottage.ts', { './wingardCatalog.ts': wingardCatalog });
const modules = load('../supabase/functions/_shared/play/modules.ts', { './wingardCatalog.ts': wingardCatalog, './wingardCottage.ts': wingard, './intruders.ts': intruders, './storyText.ts': storyText, './storybookWoods.ts': woods, './bigBadWolf.ts': wolf,'./marrekWarehouse.ts':marrek,'./tormentor.ts':tormentor,'./konrad.ts':konrad,'./konradCatalog.ts':konradCatalog,'./shadyAcres.ts':shady,'./grimlash.ts':grimlash,'./evomorph.ts':evomorph,'./creech.ts':creech,'./poltergeist.ts':poltergeist,'./groves.ts':groves,'./inkanyamba.ts':inkanyamba,'./maple.ts':maple,'./buddyland.ts':buddyland,'./camp.ts':camp,'./geppetto.ts':geppetto,'./carnival.ts':carnival,'./fright.ts':fright});
const events = load('../supabase/functions/_shared/play/events.ts', { './wingardCatalog.ts': wingardCatalog, './wingardCottage.ts': wingard, './intruders.ts': intruders, './storyText.ts': storyText, './storyTransitions.ts': storyTransitions, './storybookWoods.ts': woods, './bigBadWolf.ts': wolf,'./marrekWarehouse.ts':marrek,'./tormentor.ts':tormentor,'./konrad.ts':konrad,'./konradCatalog.ts':konradCatalog,'./shadyAcres.ts':shady,'./grimlash.ts':grimlash,'./evomorph.ts':evomorph,'./creech.ts':creech,'./poltergeist.ts':poltergeist,'./groves.ts':groves,'./modules.ts':modules,'./fright.ts':fright}),
  death = load('../supabase/functions/_shared/play/death.ts', { './wingardCatalog.ts': wingardCatalog, './wingardCottage.ts': wingard, './intruders.ts': intruders, './storybookWoods.ts': woods, './bigBadWolf.ts': wolf, './events.ts': events, './modules.ts':modules });
const schemas = load('../supabase/functions/_shared/validation.ts', {
  'https://deno.land/x/zod@v3.22.4/mod.ts': require('zod'),
  './auth.ts': { corsHeaders: {} },
});
const eventId = '22222222-2222-4222-8222-222222222222',
  sceneId = '33333333-3333-4333-8333-333333333333';
async function fixture({
  foreign = false,
  undone = false,
  changed = false,
  camp = false,
  drFright = false,
  expandedFright = false,
  legacy = false,
  countChanged = false,
  sacredGroves = false,
  stream = false,
  provider,
  candidates = ['test'],
} = {}) {
  const state = {
    selection: {
      killer: 'Hans',
      location: 'Camp Happy Trails',
      finalGirl: 'Laurie',
    },
    playEvents: [
      {
        id: '11111111-1111-4111-8111-111111111111',
        at: 1,
        kind: 'start',
        saved: 0,
        killed: 0,
        round: 1,
      },
      { id: eventId, at: 2, kind: 'killed', quantity: 1 },
    ],
  };
  if (camp) state.playEvents.splice(1,0,
    {id:'55555555-5555-4555-8555-555555555555',at:1,kind:'module',moduleData:{module:'camp',changes:{'event.dark-waters':'active','victim.boyfriend':'in-play'}}},
    {id:'66666666-6666-4666-8666-666666666666',at:1,kind:'module',moduleData:{module:'hans',changes:{'minor.unholy-speed.health':1}}},
  );
  if (drFright) {
    state.selection.killer='Dr. Fright';
    const deathEvent=state.playEvents.pop();
    state.playEvents.push(events.newPlayEvent({kind:'module',moduleData:{module:'fright',changes:{snapshot:JSON.stringify(fright.initialFright())}}}));
    for(const action of [{command:'digital'},{command:'asleep'},{command:'slide',direction:'U'}]) {
      const entries=events.summarizePlay(state.playEvents).entries;
      const snapshot=fright.frightTransition(fright.frightState(entries),action,state.playEvents,entries,()=> '0132');
      state.playEvents.push(events.newPlayEvent({kind:'module',moduleData:{module:'fright',changes:{snapshot:JSON.stringify(snapshot)}}}));
    }
    if (expandedFright) for (const action of [{command:'minor',minor:'endless-sleep',health:1},{command:'condition',condition:'blurred-reality',active:true}]) {
      const entries=events.summarizePlay(state.playEvents).entries;
      const snapshot=fright.frightTransition(fright.frightState(entries),action,state.playEvents,entries,()=> '0132');
      assert.ok(snapshot);
      state.playEvents.push(events.newPlayEvent({kind:'module',moduleData:{module:'fright',changes:{snapshot:JSON.stringify(snapshot)}}}));
    }
    state.playEvents.push(deathEvent);
  }
  if (sacredGroves) {
    state.selection.killer='Inkanyamba';state.selection.location='Sacred Groves';
    state.playEvents.splice(1,0,{id:crypto.randomUUID(),at:1,kind:'module',moduleData:{module:'groves',changes:{wrath:1,'person.holy-man':'removed','event.holy-man':'ended'}},linkedModule:{module:'inkanyamba',changes:{wrath:1}},grovesAction:{kind:'outcome',parent:'root',person:'holy-man',outcome:'blessed',incense:false}});
  }
  const signature = await death.deathSignature(
    death.deathFacts(state.selection, state.playEvents, eventId), legacy ? "legacy" : "current",
  );
  if (countChanged) state.playEvents.push(events.newPlayEvent({kind:"death-count",target:eventId,delta:1}));
  if (undone)
    state.playEvents.push({
      id: '44444444-4444-4444-8444-444444444444',
      at: 3,
      kind: 'undo',
      target: eventId,
    });
  if (changed)
    state.playEvents.push({
      id: '44444444-4444-4444-8444-444444444444',
      at: 3,
      kind: 'details',
      target: eventId,
      room: 'Cabin',
      cause: 'event',
    });
  const filters = [],
    spoken = [];
  let handler;
  const admin = {
    from: (table) => {
      const q = {
        select: () => q,
        eq: (key, value) => {
          filters.push([table, key, value]);
          return q;
        },
        maybeSingle: async () => ({
          data:
            table === 'play_sessions'
              ? { state }
              : foreign
                ? null
                : {
                    scene_text: 'The canonical owned scene is narrated.',
                    session_id: 'session',
                    event_id: eventId,
                    signature,
                    status: 'ready',
                  },
        }),
      };
      return q;
    },
  };
  const imports = {
    '../_shared/auth.ts': { getCorsHeaders: () => ({}) },
    '../_shared/guard.ts': {
      requireUser: async () => ({
        ok: true,
        user: { id: 'owner-A' },
        adminClient: admin,
        logUsage: async () => {},
      }),
    },
    '../_shared/validation.ts': schemas,
    '../_shared/voices.ts': {
      castVoice: (opts) => {
        assert.equal(opts.kind, 'death');
        return { candidates, label: 'cold' };
      },
    },
    '../_shared/play/death.ts': death,
    '../_shared/play/events.ts': events,
  };
  new Function(
    'require',
    'exports',
    'Deno',
    'fetch',
    code('../supabase/functions/narrate-story/index.ts'),
  )(
    (name) => {
      if (name.includes('/http/server.ts'))
        return {
          serve: (fn) => {
            handler = fn;
          },
        };
      if (name.includes('/encoding/base64.ts'))
        return {
          decode: (v) => Buffer.from(v, 'base64'),
          encode: (v) => Buffer.from(v).toString('base64'),
        };
      if (name === '../_shared/narration.ts') return load('../supabase/functions/_shared/narration.ts', {});
      if (imports[name]) return imports[name];
      throw new Error(name);
    },
    {},
    { env: { get: () => 'configured' } },
    async (_url, opts) => {
      spoken.push(JSON.parse(opts.body).text.replace(/^\[[^\]]*\] /, ''));
      assert.ok(opts.signal instanceof AbortSignal);
      if (provider) return provider(_url, opts);
      return new Response(JSON.stringify({ audioContent: 'dGVzdA==' }), {
        status: 200,
      });
    },
  );
  return {
    handler,
    filters,
    spoken,
    request: () =>
      new Request('https://example.test', {
        method: 'POST',
        body: JSON.stringify({
          text: 'Caller-supplied replacement content.',
          stream,
          kind: 'death',
          deathSceneId: sceneId,
        }),
      }),
  };
}
test('death narration reads the owned canonical scene instead of caller replacement text', async () => {
  const f = await fixture();
  assert.equal((await f.handler(f.request())).status, 200);
  assert.deepEqual(f.spoken, ['The canonical owned scene is narrated.']);
  for (const table of ['play_death_scenes', 'play_sessions'])
    assert.ok(
      f.filters.some(
        ([t, k, v]) => t === table && k === 'user_id' && v === 'owner-A',
      ),
    );
});
test('foreign, undone and context-changed scenes cannot authorize speech', async () => {
  for (const options of [
    { foreign: true },
    { undone: true },
    { changed: true },
  ]) {
    const f = await fixture(options);
    assert.ok([404, 409].includes((await f.handler(f.request())).status));
    assert.deepEqual(f.spoken, []);
  }
});
test('saved Camp scenes with Hans observations retain their canonical narration identity',async()=>{
  const f=await fixture({camp:true});
  assert.equal((await f.handler(f.request())).status,200);
  assert.deepEqual(f.spoken,['The canonical owned scene is narrated.']);
});

test('Dr. Fright saved narration accepts owned snapshots with public historical identity',async()=>{const f=await fixture({drFright:true});assert.equal((await f.handler(f.request())).status,200);assert.deepEqual(f.spoken,['The canonical owned scene is narrated.']);});

test('expanded Dr. Fright saved scenes narrate with canonical Minor and temporary-effect identity',async()=>{const f=await fixture({drFright:true,expandedFright:true});assert.equal((await f.handler(f.request())).status,200);assert.deepEqual(f.spoken,['The canonical owned scene is narrated.']);});

for (const legacy of [false,true]) test(`Dr. Fright ${legacy?'legacy':'current'} canonical narration survives profile changes but rejects a changed victim count`, async()=>{
  const valid=await fixture({drFright:true,legacy});
  assert.equal((await valid.handler(valid.request())).status,200);
  const changed=await fixture({drFright:true,legacy,countChanged:true});
  assert.equal((await changed.handler(changed.request())).status,409);
  assert.deepEqual(changed.spoken,[]);
});

 test('Sacred Groves linked history retains canonical saved narration identity',async()=>{const f=await fixture({sacredGroves:true});assert.equal((await f.handler(f.request())).status,200);assert.deepEqual(f.spoken,['The canonical owned scene is narrated.']);});


test('streaming relays the first PCM before synthesis ends and terminates with explicit completion', async () => {
  let finish;
  const f = await fixture({ stream: true, provider: async (url, opts) => {
    assert.ok(url.endsWith('voice:stream'));
    const body = JSON.parse(opts.body);
    assert.equal(body.modelId, 'inworld-tts-2'); assert.equal(body.audioConfig.audioEncoding, 'PCM');
    return new Response(new ReadableStream({ start(c) {
      c.enqueue(new TextEncoder().encode('{"result":{"audioContent":"AAAA"}}\n'));
      finish = () => { c.enqueue(new TextEncoder().encode('{"result":{"audioContent":"AAAA"}}')); c.close(); };
    } }));
  } });
  const response = await f.handler(f.request());
  assert.equal(response.headers.get('Content-Type'), 'application/x-ndjson');
  const reader = response.body.getReader();
  const first = new TextDecoder().decode((await reader.read()).value);
  assert.match(first, /"type":"start"/);
  const next = new TextDecoder().decode((await reader.read()).value);
  assert.match(next, /"type":"audio"/);
  finish(); let rest = ''; while (true) { const item = await reader.read(); if (item.done) break; rest += new TextDecoder().decode(item.value); }
  assert.match(rest, /"type":"done"/);
});

test('stream errors after HTTP 200 never become completed audio', async () => {
  const f = await fixture({ stream: true, provider: async () => new Response('{"result":{"audioContent":"AAAA"}}\n{"error":{"code":13,"message":"interrupted"}}\n') });
  const response = await f.handler(f.request()); const body = await response.text();
  assert.match(body, /"type":"audio"/); assert.match(body, /"type":"error"/); assert.doesNotMatch(body, /"type":"done"/);
});

test('only a specific missing voice triggers a fallback, not an arbitrary bad request', async () => {
  for (const missing of [false, true]) {
    let calls = 0;
    const f = await fixture({ candidates: ['missing', 'available'], stream: true, provider: async () => {
      calls++; if (calls === 1) return new Response(JSON.stringify({ code: missing ? 5 : 3, message: missing ? 'Voice not found' : 'Invalid audio config' }), { status: 400 });
      return new Response('{"result":{"audioContent":"AAAA"}}\n');
    } });
    const body = await (await f.handler(f.request())).text();
    assert.equal(calls, missing ? 2 : 1); assert.match(body, missing ? /"type":"done"/ : /"type":"error"/);
  }
});

test('cancelling the downstream reader aborts the paid upstream request', async () => {
  let upstreamSignal;
  const f = await fixture({ stream: true, provider: async (_url, opts) => {
    upstreamSignal = opts.signal;
    return new Response(new ReadableStream({ start(c) {
      c.enqueue(new TextEncoder().encode('{"result":{"audioContent":"AAAA"}}\n'));
      opts.signal.addEventListener('abort', () => c.error(new Error('cancelled')), { once: true });
    } }));
  } });
  const response = await f.handler(f.request()); const reader = response.body.getReader();
  await reader.read(); await reader.cancel(); assert.equal(upstreamSignal.aborted, true);
});
