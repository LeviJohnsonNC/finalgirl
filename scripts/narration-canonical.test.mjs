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
    if (imports[name]) return imports[name];
    throw new Error(name);
  }, ex);
  return ex;
};
const buddyland = load('../supabase/functions/_shared/play/buddyland.ts', {});
const camp = load('../supabase/functions/_shared/play/camp.ts', {});
const geppetto = load('../supabase/functions/_shared/play/geppetto.ts', {});
const modules = load('../supabase/functions/_shared/play/modules.ts', {'./buddyland.ts':buddyland,'./camp.ts':camp,'./geppetto.ts':geppetto});
const events = load('../supabase/functions/_shared/play/events.ts', {'./modules.ts':modules}),
  death = load('../supabase/functions/_shared/play/death.ts', { './events.ts': events, './modules.ts':modules });
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
  const signature = await death.deathSignature(
    death.deathFacts(state.selection, state.playEvents, eventId),
  );
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
        return { candidates: ['test'], label: 'cold' };
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
      if (imports[name]) return imports[name];
      throw new Error(name);
    },
    {},
    { env: { get: () => 'configured' } },
    async (_url, opts) => {
      spoken.push(JSON.parse(opts.body).text);
      assert.ok(opts.signal instanceof AbortSignal);
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
