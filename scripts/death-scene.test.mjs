import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";
const require = createRequire(import.meta.url);
const code = (path) =>
  ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
function moduleAt(path, imports) {
  const ex = {};
  new Function("require", "exports", code(path))((name) => {
    if (imports[name]) return imports[name];
    throw new Error("Unexpected import " + name);
  }, ex);
  return ex;
}
const buddyland = moduleAt(
  "../supabase/functions/_shared/play/buddyland.ts",
  {},
);
const camp = moduleAt("../supabase/functions/_shared/play/camp.ts", {});
const geppetto = moduleAt("../supabase/functions/_shared/play/geppetto.ts", {});
const carnival = moduleAt("../supabase/functions/_shared/play/carnival.ts", {});
const maple = moduleAt("../supabase/functions/_shared/play/maple.ts", {});
const fright = moduleAt("../supabase/functions/_shared/play/fright.ts", {});
const inkanyamba = moduleAt("../supabase/functions/_shared/play/inkanyamba.ts", {});
const groves = moduleAt("../supabase/functions/_shared/play/groves.ts", {"./inkanyamba.ts":inkanyamba});
const modules = moduleAt("../supabase/functions/_shared/play/modules.ts", {
  "./groves.ts": groves,
  "./inkanyamba.ts": inkanyamba,
  "./maple.ts": maple,
  "./buddyland.ts": buddyland,
  "./camp.ts": camp,
  "./geppetto.ts": geppetto,
  "./carnival.ts": carnival,
  "./fright.ts": fright,
});
const events = moduleAt("../supabase/functions/_shared/play/events.ts", {
  "./groves.ts": groves,
  "./modules.ts": modules,
  "./fright.ts": fright,
});
const death = moduleAt("../supabase/functions/_shared/play/death.ts", {
  "./events.ts": events,
  "./groves.ts": groves,
  "./modules.ts": modules,
  "./fright.ts": fright,
});
const schemas = moduleAt("../supabase/functions/_shared/validation.ts", {
  "https://deno.land/x/zod@v3.22.4/mod.ts": require("zod"),
  "./auth.ts": { corsHeaders: {} },
});
const sessionId = "11111111-1111-4111-8111-111111111111",
  eventId = "22222222-2222-4222-8222-222222222222";
const state = {
  selection: {
    killer: "Billy the Bear",
    location: "Camp Happy Trails",
    finalGirl: "Rena",
  },
  playEvents: [
    {
      id: "33333333-3333-4333-8333-333333333333",
      at: 1,
      kind: "start",
      saved: 0,
      killed: 0,
      round: 1,
    },
    { id: eventId, at: 2, kind: "killed", quantity: 2, cause: "event" },
  ],
};
const completeText =
  "The kitchen clock stopped while the plates were still shaking. Two adults crouched beneath the steel counter and watched the doorway, certain the shelves had taken the worst of it. Then the bolts above them began to unwind, one at a time. When the ceiling finally settled, the counter had become a narrow lid. The clock started again, ticking beneath the silence.";
function fixture(options = {}) {
  const calls = [],
    updates = [],
    filters = [];
  let handler;
  const deadlines = [];
  const owned = options.foreign ? null : structuredClone(state);
  if (options.undone)
    owned.playEvents.push({
      id: "44444444-4444-4444-8444-444444444444",
      at: 3,
      kind: "undo",
      target: eventId,
    });
  const client = {
    auth: {
      getUser: async () => ({
        data: { user: options.unauthorized ? null : { id: "owner-A" } },
      }),
    },
    rpc: async () => {
      calls.push("claim");
      return options.claimError
        ? { error: { message: "offline" } }
        : {
            data: {
              action:
                calls.filter((c) => c === "claim").length > 1
                  ? (options.repairAction ?? "generate")
                  : (options.action ?? "generate"),
              id: "scene",
              lease: "lease-token",
              text: options.cachedText ?? completeText,
              model: "cheap",
            },
          };
    },
    from: (table) => {
      const query = {
        select: () => query,
        eq: (key, value) => {
          filters.push([table, key, value]);
          return query;
        },
        order: () => query,
        limit: () => query,
        update: (value) => {
          updates.push(value);
          return query;
        },
        maybeSingle: async () => ({
          data:
            table === "play_sessions"
              ? owned
                ? { state: owned }
                : null
              : { id: "scene" },
          error: null,
        }),
        then: (resolve, reject) =>
          Promise.resolve({
            data: [],
            error: options.repairError ? { message: "repair offline" } : null,
          }).then(resolve, reject),
      };
      return query;
    },
  };
  const imports = {
    "../_shared/auth.ts": { getCorsHeaders: () => ({}) },
    "../_shared/guard.ts": {
      requireUser: async () => {
        calls.push("guard");
        return options.deny
          ? { ok: false, response: new Response("{}", { status: 503 }) }
          : {
              ok: true,
              user: { id: "owner-A" },
              adminClient: client,
              logUsage: async () => {
                calls.push("log");
              },
            };
      },
    },
    "../_shared/validation.ts": schemas,
    "../_shared/aiGateway.ts": {
      generateText: async (opts) => {
        calls.push("AI");
        assert.equal(opts.singleAttempt, true);
        assert.ok(opts.signal instanceof AbortSignal);
        assert.equal(opts.maxTokens, 4096);
        assert.equal(opts.reasoningEffort, "low");
        assert.equal(opts.requireComplete, true);
        // Advance the provider's clock without waiting in real time. The signal is
        // still a real AbortSignal, so the handler sees the production timeout.
        if (options.elapsedMs !== undefined) {
          for (const { ms, controller } of deadlines)
            if (options.elapsedMs >= ms)
              controller.abort(new DOMException("Signal timed out.", "TimeoutError"));
          opts.signal.throwIfAborted();
        }
        if (options.aiError) throw new Error("offline");
        return {
          text: options.text ?? completeText,
          model: "cheap",
        };
      },
      statusFor: () => 500,
      userFacingMessage: () => "The reel jammed.",
      GatewayError: class extends Error {},
    },
    "../_shared/models.ts": { DEATH_MODEL_CANDIDATES: ["cheap"] },
    "../_shared/deathPrompt.ts": {
      deathPrompt: (facts) => {
        for (const [key, value] of Object.entries(options.expectedFacts ?? {
          location: "Camp Happy Trails", cause: "event", quantity: 2,
        })) assert.deepEqual(facts[key], value);
        return { system: "original", user: JSON.stringify(facts) };
      },
    },
    "../_shared/play/death.ts": death,
    "../_shared/play/events.ts": events,
  };
  if (options.realGateway) {
    const real = {};
    new Function(
      "require",
      "exports",
      "Deno",
      "fetch",
      code("../supabase/functions/_shared/aiGateway.ts"),
    )(
      () => ({ usesResponsesApi: () => false }),
      real,
      { env: { get: () => "fake-key" } },
      async (_url, init) => {
        calls.push("AI");
        const body = JSON.parse(init.body);
        assert.equal(body.max_tokens, 4096);
        assert.equal(body.reasoning_effort, "low");
        return new Response(
          JSON.stringify({
            choices: [
              {
                finish_reason: options.finishReason,
                message: { content: options.text ?? completeText },
              },
            ],
          }),
        );
      },
    );
    imports["../_shared/aiGateway.ts"] = real;
  }
  new Function(
    "require",
    "exports",
    "Deno",
    "AbortSignal",
    code("../supabase/functions/generate-death-scene/index.ts"),
  )(
    (name) => {
      if (name.includes("/http/server.ts"))
        return {
          serve: (fn) => {
            handler = fn;
          },
        };
      if (name.includes("supabase-js")) return { createClient: () => client };
      if (imports[name]) return imports[name];
      throw new Error(name);
    },
    {},
    { env: { get: () => "configured" } },
    options.elapsedMs === undefined ? AbortSignal : {
      timeout(ms) {
        const controller = new AbortController();
        deadlines.push({ ms, controller });
        return controller.signal;
      },
    },
  );
  const request = (body) =>
    new Request("https://example.test", {
      method: "POST",
      headers: { Authorization: "Bearer test" },
      body: JSON.stringify(body ?? { sessionId, eventId }),
    });
  return { handler, calls, updates, filters, request, owned };
}
test("cached and in-flight scenes never reserve quota or call a model", async () => {
  for (const action of ["cached", "busy"]) {
    const f = fixture({ action });
    const r = await f.handler(f.request());
    assert.equal(r.status, action === "cached" ? 200 : 409);
    assert.deepEqual(f.calls, ["claim"]);
  }
});
test('Hans and Camp module logs authorize killer, Terror and Event death payoffs without replaying later state', async () => {
  for (const cause of ['killer','terror','event']) {
    const f = fixture({expectedFacts:{killer:'Hans',cause,quantity:1,moduleContext:{
      hans:{power:'Feed','minor.unholy-rage.health':2},camp:{'event.dark-waters':'active'},
    }}});
    f.owned.selection.killer='Hans';
    const killed={...f.owned.playEvents[1],cause,quantity:1};
    f.owned.playEvents=[f.owned.playEvents[0],
      {id:crypto.randomUUID(),at:2,kind:'moment',momentType:'dark-power',text:'Dark Power',killerCard:'Feed'},
      {id:crypto.randomUUID(),at:3,kind:'module',moduleData:{module:'hans',changes:{'minor.unholy-rage.health':2}}},
      {id:crypto.randomUUID(),at:4,kind:'module',moduleData:{module:'camp',changes:{'event.dark-waters':'active'}}},
      killed,
      {id:crypto.randomUUID(),at:6,kind:'module',moduleData:{module:'camp',changes:{'event.dark-waters':'resolved'}}},
    ];
    const original=structuredClone(f.owned.playEvents);
    const response=await f.handler(f.request());
    assert.equal(response.status,200);
    assert.equal((await response.json()).scene.scene_text,completeText);
    assert.deepEqual(f.owned.playEvents,original);
    assert.equal(f.calls.filter(c=>c==='AI').length,1);
  }
});
test("a 21-second Toby death completes; a true timeout stays retryable without another victim", async () => {
  const options = { elapsedMs: 21000, expectedFacts: {
    location: "Buddyland", cause: "minion", quantity: 1, attacker: "Toby", room: "Arcade",
  } };
  const f = fixture(options);
  f.owned.selection.location = "Buddyland";
  Object.assign(f.owned.playEvents[1], {quantity:1,cause:"minion",attacker:"Toby",room:"Arcade"});
  const original = structuredClone(f.owned.playEvents);
  const response = await f.handler(f.request());
  assert.equal(response.status, 200);
  assert.equal((await response.json()).scene.scene_text, completeText);
  assert.deepEqual(f.owned.playEvents, original);
  assert.equal(f.calls.filter(c => c === "AI").length, 1);

  const slowOptions = {...options,elapsedMs:31000};
  const slow = fixture(slowOptions);
  slow.owned.selection = structuredClone(f.owned.selection);
  slow.owned.playEvents = structuredClone(original);
  const timeout = await slow.handler(slow.request());
  assert.equal(timeout.status, 504);
  const error = await timeout.json();
  assert.equal(error.code, "generation_timeout");
  assert.match(error.error, /took too long/);
  assert.ok(slow.updates.some(u => u.status === "failed"));
  slowOptions.elapsedMs = 21000;
  assert.equal((await slow.handler(slow.request())).status, 200);
  assert.deepEqual(slow.owned.playEvents, original);
  assert.equal(slow.owned.playEvents.filter(e => e.kind === "killed").length, 1);
});
test("generation uses canonical owned observations and a lease before any paid call", async () => {
  const f = fixture();
  assert.equal((await f.handler(f.request())).status, 200);
  assert.deepEqual(f.calls, ["claim", "guard", "AI", "log"]);
  assert.deepEqual(f.owned.playEvents, state.playEvents);
  assert.ok(
    f.filters.some(
      ([table, key, value]) =>
        table === "play_sessions" && key === "user_id" && value === "owner-A",
    ),
  );
  assert.ok(
    f.filters.some(
      ([, key, value]) => key === "lease" && value === "lease-token",
    ),
  );
  assert.ok(f.updates.some((u) => u.status === "ready"));
});
test("new reveal moments are accepted by the real death handler using the owned session", async () => {
  const f = fixture();
  f.owned.playEvents.splice(1, 0,
    events.newPlayEvent({ kind: "moment", momentType: "dark-power", text: "Dark Power", killerCard: "Backup Generator" }),
    events.newPlayEvent({ kind: "moment", momentType: "finale", text: "Finale", killerCard: "Power Surge" }),
  );
  const facts = death.deathFacts(f.owned.selection, f.owned.playEvents, eventId);
  assert.equal(facts.moduleContext.billy.finale, "power-surge");
  assert.equal(facts.moduleContext.billy["power.backup-generator.revealed"], true);
  assert.equal((await f.handler(f.request())).status, 200);
  assert.deepEqual(f.calls, ["claim", "guard", "AI", "log"]);
});
test("foreign, undone and unauthorized deaths do not authorize work", async () => {
  for (const options of [
    { foreign: true },
    { undone: true },
    { unauthorized: true },
  ]) {
    const f = fixture(options);
    const r = await f.handler(f.request());
    assert.ok([401, 409].includes(r.status));
    assert.deepEqual(f.calls, []);
  }
});
test("claim and allowance failures fail closed; AI failure leaves the death intact", async () => {
  for (const options of [
    { claimError: true },
    { deny: true },
    { aiError: true },
  ]) {
    const f = fixture(options);
    const r = await f.handler(f.request());
    assert.ok(r.status >= 500);
    if (!options.aiError) assert.ok(!f.calls.includes("AI"));
    assert.deepEqual(f.owned.playEvents, state.playEvents);
    if (!options.claimError)
      assert.ok(f.updates.some((u) => u.status === "failed"));
  }
});
test("invalid take or caller-supplied fictional actors are rejected before authentication or spending", async () => {
  for (const bad of [
    { sessionId, eventId, take: 3 },
    { sessionId, eventId, killer: "other" },
  ]) {
    const f = fixture();
    assert.equal((await f.handler(f.request(bad))).status, 400);
    assert.deepEqual(f.calls, []);
  }
});

test("the observed fragment is never persisted as a ready death scene", async () => {
  const f = fixture({ text: "The grease-stained" });
  const response = await f.handler(f.request());
  assert.equal(response.status, 500);
  assert.ok(!f.updates.some((u) => u.status === "ready"));
  assert.ok(f.updates.some((u) => u.status === "failed"));
});

test("real gateway and death handler reject clipped, missing-finish and short responses before publishing, and accept a complete story", async () => {
  for (const options of [
    { finishReason: "length", text: "The grease-stained" },
    { finishReason: "length", text: completeText },
    { finishReason: undefined, text: completeText },
    { finishReason: "stop", text: "The grease-stained" },
    { finishReason: "stop", text: completeText },
  ]) {
    const f = fixture({ ...options, realGateway: true });
    const response = await f.handler(f.request());
    const success =
      options.finishReason === "stop" && options.text === completeText;
    assert.equal(response.status, success ? 200 : 500);
    assert.equal(
      f.updates.some((u) => u.status === "ready"),
      success,
    );
    assert.equal(f.calls.filter((c) => c === "AI").length, 1);
    if (success)
      assert.equal((await response.json()).scene.scene_text, completeText);
  }
});

test("cached fragments are repaired in the same slot through a fresh lease, and contention/failures spend no allowance", async () => {
  const f = fixture({ action: "cached", cachedText: "The grease-stained" });
  const response = await f.handler(f.request());
  assert.equal(response.status, 200);
  assert.equal((await response.json()).scene.scene_text, completeText);
  assert.deepEqual(f.calls, ["claim", "claim", "guard", "AI", "log"]);
  assert.ok(
    f.filters.some(
      ([, key, value]) =>
        key === "scene_text" && value === "The grease-stained",
    ),
  );
  assert.ok(
    f.filters.some(
      ([, key, value]) => key === "user_id" && value === "owner-A",
    ),
  );
  assert.equal(f.updates.filter((u) => u.status === "ready").length, 1);
  for (const options of [{ repairAction: "busy" }, { repairError: true }]) {
    const failed = fixture({
      action: "cached",
      cachedText: "The grease-stained",
      ...options,
    });
    assert.ok((await failed.handler(failed.request())).status >= 400);
    assert.ok(!failed.calls.includes("AI"));
    assert.ok(!failed.calls.includes("guard"));
  }
});

test('Gepetto observations authorize a Puppet scene from historical owned state without creating another casualty',async()=>{
 const f=fixture({expectedFacts:{killer:'Geppetto',cause:'minion',quantity:1,attacker:'Puppet 2',moduleContext:{geppetto:{'puppet.1.status':'ready','puppet.2.status':'on-board','puppet.3.status':'exhausted','minor.am-i-a-puppet.health':1}}}});
 f.owned.selection.killer='Geppetto';
 const killed={...f.owned.playEvents[1],cause:'minion',quantity:1,attacker:'Puppet 2'};
 f.owned.playEvents=[f.owned.playEvents[0],{id:crypto.randomUUID(),at:1,kind:'module',moduleData:{module:'geppetto',changes:{'puppet.1.status':'ready','puppet.2.status':'on-board','puppet.3.status':'exhausted','minor.am-i-a-puppet.health':1}}},killed,
 {id:crypto.randomUUID(),at:3,kind:'module',moduleData:{module:'geppetto',changes:{'puppet.2.status':'exhausted'}}}];
 const original=structuredClone(f.owned.playEvents);
 assert.equal((await f.handler(f.request())).status,200);
 assert.deepEqual(f.owned.playEvents,original);
 assert.equal(f.calls.filter(c=>c==='AI').length,1);
});


test('Carnival trap scenes authorize from historical canonical state and preserve old non-Carnival signatures',async()=>{
 const f=fixture({expectedFacts:{location:'Carnival of Blood',cause:'hazard',quantity:1,mechanism:'Acid Pitfall Trap',moduleContext:{carnival:{'trap.acid.status':'placed','trap.acid.space':'Outer path',searchPenalty:true,zappo:'lost'}}}});
 f.owned.selection.location='Carnival of Blood';
 const killed={...f.owned.playEvents[1],cause:'hazard',quantity:1,mechanism:'Acid Pitfall Trap'};
 f.owned.playEvents=[f.owned.playEvents[0],{id:crypto.randomUUID(),at:1,kind:'module',moduleData:{module:'carnival',changes:{'trap.acid.status':'placed','trap.acid.space':'Outer path',searchPenalty:true,zappo:'lost'}}},killed,{id:crypto.randomUUID(),at:3,kind:'module',moduleData:{module:'carnival',changes:{'trap.acid.status':'not-placed'}}}];
 const original=structuredClone(f.owned.playEvents);
 assert.equal((await f.handler(f.request())).status,200);
 assert.deepEqual(f.owned.playEvents,original);
});

test('Dr. Fright snapshots authorize historical public facts without exposing or changing a deal',async()=>{
 const f=fixture({expectedFacts:{killer:'Dr. Fright',cause:'killer',quantity:1,moduleContext:{fright:{sleep:'asleep',boilerCardsResolved:1,attackPending:false}}}});
 f.owned.selection.killer='Dr. Fright';
 const killed={...f.owned.playEvents[1],cause:'killer',quantity:1};
 f.owned.playEvents=[f.owned.playEvents[0],events.newPlayEvent({kind:'module',moduleData:{module:'fright',changes:{snapshot:JSON.stringify(fright.initialFright())}}})];
 for(const action of [{command:'digital'},{command:'asleep'},{command:'slide',direction:'U'}]){
  const entries=events.summarizePlay(f.owned.playEvents).entries;
  const snapshot=fright.frightTransition(fright.frightState(entries),action,f.owned.playEvents,entries,()=> '0132');
  f.owned.playEvents.push(events.newPlayEvent({kind:'module',moduleData:{module:'fright',changes:{snapshot:JSON.stringify(snapshot)}}}));
 }
 f.owned.playEvents.push(killed);
 const historical=death.deathFacts(f.owned.selection,f.owned.playEvents,eventId);
 assert.ok(!JSON.stringify(historical).includes('0132'));
 const original=structuredClone(f.owned.playEvents);
 assert.equal((await f.handler(f.request())).status,200);
 assert.deepEqual(f.owned.playEvents,original);
});

test('expanded Dr. Fright Minor Powers and temporary effects authorize canonical scenes without exposing a deal', async()=>{
 const f=fixture({expectedFacts:{killer:'Dr. Fright',cause:'terror',quantity:2}});f.owned.selection.killer='Dr. Fright';
 f.owned.playEvents=[f.owned.playEvents[0],events.newPlayEvent({kind:'module',moduleData:{module:'fright',changes:{snapshot:JSON.stringify(fright.initialFright())}}})];
 for(const action of [{command:'digital'},{command:'minor',minor:'endless-sleep',health:1},{command:'condition',condition:'blurred-reality',active:true}]){
  const entries=events.summarizePlay(f.owned.playEvents).entries;
  const snapshot=fright.frightTransition(fright.frightState(entries),action,f.owned.playEvents,entries,()=> '0132');
  assert.ok(snapshot);f.owned.playEvents.push(events.newPlayEvent({kind:'module',moduleData:{module:'fright',changes:{snapshot:JSON.stringify(snapshot)}}}));
 }
 f.owned.playEvents.push({...state.playEvents[1],cause:'terror',terrorCard:'Grab Your Crucifix'});
 const facts=death.deathFacts(f.owned.selection,f.owned.playEvents,eventId);
 assert.equal(facts.moduleContext.fright['minor.endless-sleep.health'],1);
 assert.equal(facts.moduleContext.fright['condition.blurred-reality'],true);
 assert.ok(!JSON.stringify(facts).includes('0132'));
 assert.equal((await f.handler(f.request())).status,200);
});

test('group count corrections reach canonical generation after a later manual baseline',async()=>{
 const f=fixture({expectedFacts:{killer:'Dr. Fright',quantity:3,round:1,cause:'killer'}});
 f.owned.selection.killer='Dr. Fright';
 const killed={...f.owned.playEvents[1],quantity:1,cause:'killer'};
 f.owned.playEvents=[f.owned.playEvents[0],killed,
   events.newPlayEvent({kind:'adjust',saved:5,killed:8,round:9}),
   events.newPlayEvent({kind:'death-count',target:killed.id,delta:1}),
   events.newPlayEvent({kind:'death-count',target:killed.id,delta:1})];
 assert.equal(events.summarizePlay(f.owned.playEvents).killed,10);
 const response=await f.handler(f.request());
 assert.equal(response.status,200);
 assert.ok(f.calls.includes('AI'));
});

test('backend-first rollout preserves old-tab identities and opts new Dr. Fright requests into the new profile',async()=>{
 for(const narrativeProfile of [undefined,'fright-private-nightmares-v1']){
  const f=fixture({expectedFacts:{killer:'Dr. Fright',quantity:2,cause:'event'}});
  f.owned.selection.killer='Dr. Fright';
  const response=await f.handler(f.request({sessionId,eventId,...(narrativeProfile&&{narrativeProfile})}));
  assert.equal(response.status,200);
  const body=await response.json();
  assert.equal(body.scene.signature,await death.deathSignature(death.deathFacts(f.owned.selection,f.owned.playEvents,eventId),narrativeProfile?'current':'legacy'));
 }
 const f=fixture();
 const rejected=await f.handler(f.request({sessionId,eventId,narrativeProfile:'arbitrary-cache-slot'}));
 assert.equal(rejected.status,400);
 assert.ok(!f.calls.includes('AI'));
});

test('Inkanyamba observations reach the real death handler at historical Wrath without applying physical effects',async()=>{
 const f=fixture({expectedFacts:{killer:'Inkanyamba',cause:'killer',quantity:1,moduleContext:{inkanyamba:{wrath:7,'minor.boiling-anger.health':0}}}});
 f.owned.selection.killer='Inkanyamba';
 f.owned.playEvents=[f.owned.playEvents[0],{id:crypto.randomUUID(),at:1,kind:'module',moduleData:{module:'inkanyamba',changes:{wrath:7,'minor.boiling-anger.health':0}}},{...f.owned.playEvents[1],cause:'killer',quantity:1}, {id:crypto.randomUUID(),at:3,kind:'module',moduleData:{module:'inkanyamba',changes:{wrath:10}}}];
 const original=structuredClone(f.owned.playEvents);
 assert.equal((await f.handler(f.request())).status,200);
 assert.deepEqual(f.owned.playEvents,original);
 assert.equal(f.calls.filter(c=>c==='AI').length,1);
});

test('Sacred Groves linked outcomes reach the real death handler with both historical owners',async()=>{
 const f=fixture({expectedFacts:{killer:'Inkanyamba',location:'Sacred Groves',quantity:1,moduleContext:{groves:{wrath:1,'person.holy-man':'removed','event.holy-man':'ended'},inkanyamba:{wrath:1}}}});
 f.owned.selection={...f.owned.selection,killer:'Inkanyamba',location:'Sacred Groves'};
 const before={id:crypto.randomUUID(),at:1,kind:'module',moduleData:{module:'inkanyamba',changes:{wrath:8}}};
 const linked={id:crypto.randomUUID(),at:2,kind:'module',moduleData:{module:'groves',changes:{'person.holy-man':'removed',wrath:1,'event.holy-man':'ended'}},linkedModule:{module:'inkanyamba',changes:{wrath:1}},grovesAction:{kind:'outcome',parent:before.id,person:'holy-man',outcome:'blessed',incense:false}};
 f.owned.playEvents=[f.owned.playEvents[0],before,linked,{...f.owned.playEvents[1],quantity:1},{id:crypto.randomUUID(),at:4,kind:'module',moduleData:{module:'groves',changes:{wrath:10}}}];
 const original=structuredClone(f.owned.playEvents);
 assert.equal((await f.handler(f.request())).status,200);
 assert.deepEqual(f.owned.playEvents,original);
 assert.equal(f.calls.filter(c=>c==='AI').length,1);
});
