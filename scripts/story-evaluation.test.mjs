import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";
import ts from "typescript";
import { z } from "zod";
const compile = (path) =>
  ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
function load(path, dependencies = {}) {
  const exports = {};
  new Function("exports", "require", compile(path))(exports, (name) => {
    if(name==='./falconwood.ts'||name==='./play/falconwood.ts')return falconwood;
    if(name==='./slayer.ts'||name==='./play/slayer.ts')return slayer;
    if(name==='./play/hunter.ts')return hunter;
    if (!(name in dependencies)) throw Error(`Missing ${name}`);
    return dependencies[name];
  });
  return exports;
}
const hunter=load('../supabase/functions/_shared/play/hunter.ts');
const falconwood=load('../supabase/functions/_shared/play/falconwood.ts',{});
const slayer=load('../supabase/functions/_shared/play/slayer.ts',{});
const encoder = new TextEncoder();
const frame = (value) =>
  `data: ${typeof value === "string" ? value : JSON.stringify(value)}\n\n`;
const delta = (text) => ({ choices: [{ delta: { content: text } }] });
const stop = { choices: [{ delta: {}, finish_reason: "stop" }] };
const bytes = (text) =>
  new ReadableStream({
    start(c) {
      c.enqueue(encoder.encode(text));
      c.close();
    },
  });
const actualGateway = load("../supabase/functions/_shared/aiGateway.ts", {
  "./models.ts": {},
});
const { observeStoryStream, evaluationMetadata } = load(
  "../supabase/functions/_shared/storyEvaluation.ts",
  { "./aiGateway.ts": actualGateway },
);
const gameId = "11111111-1111-4111-8111-111111111111";

test("stream capture preserves every emitted byte, Unicode, full text and explicit completion across split frames", async () => {
  const text =
    "Laurie’s flashlight flickered.\n\nShe heard a café door. 🌙 " +
    "Complete prose. ".repeat(500);
  const wire = frame(delta(text)) + frame(stop) + frame("[DONE]");
  const split = encoder.encode(wire);
  let i = 0,
    result;
  const upstream = new ReadableStream({
    pull(c) {
      if (i === split.length) return c.close();
      c.enqueue(split.slice(i, ++i));
    },
  });
  const output = await new Response(
    observeStoryStream(
      upstream,
      async (value) => {
        result = value;
        return true;
      },
      "attempt",
    ),
  ).text();
  assert.equal(
    output,
    wire + frame({ evaluation: { id: "attempt", saved: true } }),
  );
  assert.equal(result.story_text, text);
  assert.equal(result.word_count, text.trim().split(/\s+/u).length);
  assert.equal(result.status, "complete");
});

test("empty, error, cut-off, malformed and missing-stop output cannot be graded as complete", async () => {
  for (const [wire, status] of [
    [frame(stop), "failed"],
    [
      frame(delta("Partial")) + frame({ error: "private provider detail" }),
      "incomplete",
    ],
    [
      frame(delta("Cut off")) +
        frame({ choices: [{ finish_reason: "length" }] }),
      "incomplete",
    ],
    [frame(delta("No stop")) + frame("[DONE]"), "incomplete"],
    [frame(delta("Broken")) + "data: not-json\n\n" + frame(stop), "incomplete"],
  ]) {
    let result;
    await new Response(
      observeStoryStream(
        bytes(wire),
        async (value) => {
          result = value;
          return true;
        },
        null,
      ),
    ).text();
    assert.equal(result.status, status);
    assert(!JSON.stringify(result).includes("private provider detail"));
  }
});

test("transport failure retains partial prose and cancellation propagates without duplicated finalization", async () => {
  let captures = [],
    pulls = 0;
  const upstream = new ReadableStream({
    pull(c) {
      if (!pulls++) c.enqueue(encoder.encode(frame(delta("Partial"))));
      else c.error(Error("broken wire"));
    },
  });
  await assert.rejects(
    new Response(
      observeStoryStream(
        upstream,
        async (value) => {
          captures.push(value);
          return true;
        },
        null,
      ),
    ).text(),
    /broken wire/,
  );
  assert.equal(captures[0].story_text, "Partial");
  assert.equal(captures[0].status, "incomplete");
  captures = [];
  let cancelled = false;
  const waiting = new ReadableStream({
    start(c) {
      c.enqueue(encoder.encode(frame(delta("Before cancellation"))));
    },
    cancel() {
      cancelled = true;
    },
  });
  const reader = observeStoryStream(
    waiting,
    async (value) => {
      captures.push(value);
      return true;
    },
    null,
  ).getReader();
  await reader.read();
  await reader.cancel();
  assert.equal(cancelled, true);
  assert.equal(captures.length, 1);
  assert.equal(captures[0].status, "cancelled");
  assert.equal(captures[0].story_text, "Before cancellation");
});

test("diagnostics are separate, bounded without truncation, and optional for old clients", () => {
  assert.equal(evaluationMetadata({}).diagnostic_status, "not_provided");
  assert.equal(
    evaluationMetadata({ evaluation: { gameId, context: { playEvents: [] } } })
      .diagnostic_status,
    "provided",
  );
  assert.equal(
    evaluationMetadata({ evaluation: { gameId: "wrong", context: {} } })
      .game_id,
    null,
  );
  const big = evaluationMetadata({
    evaluation: { gameId, context: { note: "x".repeat(2_000_001) } },
  });
  assert.equal(big.diagnostic_status, "invalid");
  assert.equal(big.diagnostic_context, null);
});

function harness(
  stream = () => bytes(frame(delta("A whole story.")) + frame(stop)),
  failWrite = () => false,
) {
  const rows = [],
    writes = [],
    calls = [];
  const owner = "owner-from-verified-token";
  const adminClient = {
    from(table) {
      assert.equal(table, "story_evaluations");
      let values,
        inserting,
        filters = {};
      const query = {
        insert(v) {
          values = v;
          inserting = true;
          return query;
        },
        update(v) {
          values = v;
          return query;
        },
        eq(k, v) {
          filters[k] = v;
          return query;
        },
        select() {
          return query;
        },
        abortSignal(signal) {
          assert(signal);
          return query;
        },
        async maybeSingle() {
          writes.push({ values, filters, inserting });
          if (failWrite(writes.length)) return { error: Error("offline") };
          if (inserting) rows.push({ ...values });
          else {
            assert.equal(filters.user_id, owner);
            Object.assign(
              rows.find((row) => row.id === filters.id),
              values,
            );
          }
          return { data: { id: inserting ? values.id : filters.id } };
        },
      };
      return query;
    },
  };
  const gateway = {
    effectiveTextSystem: actualGateway.effectiveTextSystem,
    GatewayError: actualGateway.GatewayError,
    async streamChat(opts) {
      calls.push(opts);
      return { body: await stream(opts,calls.length), model: "selected-fallback-model" };
    },
  };
  const capture = load("../supabase/functions/_shared/storyEvaluation.ts", {
    "./aiGateway.ts": gateway,
  });
  return {
    rows,
    writes,
    calls,
    capture,
    guard: {
      ok: true,
      user: { id: owner },
      adminClient,
      logUsage: async () => {},
    },
  };
}
const options = (h) => ({
  guard: h.guard,
  kind: "opening",
  request: {
    user_id: "forged",
    evaluation: { gameId, context: { playEvents: ["private diagnostic"] } },
  },
  context: { killer: "Hans" },
  system: "system",
  user: "exact user",
});

test("each retry is a distinct owner-authenticated record with effective prompts, selected model and full output", async () => {
  const h = harness();
  for (let i = 0; i < 2; i++)
    await new Response(
      (await h.capture.generateEvaluatedStory(options(h))).body,
    ).text();
  assert.equal(h.rows.length, 2);
  assert.notEqual(h.rows[0].id, h.rows[1].id);
  for (const row of h.rows) {
    assert.equal(row.user_id, h.guard.user.id);
    assert.equal(row.game_id, gameId);
    assert.equal(
      row.system_prompt,
      actualGateway.effectiveTextSystem("system"),
    );
    assert.equal(row.user_prompt, "exact user");
    assert.deepEqual(row.model_context, { killer: "Hans" });
    assert.equal(row.diagnostic_context.playEvents[0], "private diagnostic");
    assert.equal(row.story_text, "A whole story.");
    assert.equal(row.model, "selected-fallback-model");
    assert.equal(row.status, "complete");
    assert(row.finished_at);
    assert(row.duration_ms >= 0);
  }
  assert(
    h.calls.every(
      (call) =>
        JSON.stringify(call) ===
        JSON.stringify({ system: "system", user: "exact user" }),
    ),
  );
});

test("initial/final persistence failures leave the complete story usable and report missing evaluation copy", async () => {
  for (const fail of [(n) => n === 1, (n) => n === 2]) {
    const h = harness(undefined, fail);
    const output = await new Response(
      (await h.capture.generateEvaluatedStory(options(h))).body,
    ).text();
    assert(output.includes("A whole story."));
    assert(output.includes('"saved":false'));
    assert.equal(h.calls.length, 1);
  }
});

test("a failed provider request records the attempt without persisting provider error details", async () => {
  const h = harness(() => {
    throw Error("private provider body");
  });
  await assert.rejects(
    h.capture.generateEvaluatedStory(options(h)),
    /private provider body/,
  );
  assert.equal(h.rows[0].status, "failed");
  assert.equal(h.rows[0].error_code, "generation_request_failed");
  assert(!JSON.stringify(h.rows).includes("private provider body"));
});

const schemas = load("../supabase/functions/_shared/validation.ts", {
  "https://deno.land/x/zod@v3.22.4/mod.ts": { z },
  "./auth.ts": { corsHeaders: {} },
});
const quantities = load("../supabase/functions/_shared/narrativeStyle.ts");
const facts = load("../supabase/functions/_shared/storyFacts.ts");
const marrek = load('../supabase/functions/_shared/play/marrekWarehouse.ts');
const tormentor = load('../supabase/functions/_shared/play/tormentor.ts');
const prompts = load("../supabase/functions/_shared/storyPrompts.ts", {
  "./play/intruders.ts": load("../supabase/functions/_shared/play/intruders.ts"),
  "./finalGirlIdentity.ts": load("../supabase/functions/_shared/finalGirlIdentity.ts"),
  "./fictionBoundary.ts": load("../supabase/functions/_shared/fictionBoundary.ts"),
  "./storyFacts.ts": facts,
  "./play/marrekWarehouse.ts":marrek,
  "./play/tormentor.ts":tormentor,
  "./narrativeStyle.ts": quantities,
});
for (const kind of ["opening", "ending"])
  test(`${kind} route captures validated model facts while excluding full diagnostic log from the prompt`, async () => {
    let handler, captured;
    const h = harness();
    const path = `../supabase/functions/generate-${kind === "opening" ? "story" : "ending"}/index.ts`;
    new Function("exports", "require", compile(path))({}, (name) => {
      const deps = {
        "https://deno.land/std@0.168.0/http/server.ts": {
          serve: (fn) => {
            handler = fn;
          },
        },
        "../_shared/auth.ts": { getCorsHeaders: () => ({}) },
        "../_shared/validation.ts": schemas,
        "../_shared/guard.ts": { requireUser: async () => h.guard },
        "../_shared/storyPrompts.ts": prompts,
        "../_shared/aiGateway.ts": actualGateway,
        "../_shared/endingRecovery.ts": {generateEndingWithRecovery:()=>{throw Error("Unexpected opt-in");}},
        "../_shared/storyEvaluation.ts": {
          generateEvaluatedStory: async (opts) => {
            captured = opts;
            return h.capture.generateEvaluatedStory(opts);
          },
        },
      };
      if (!(name in deps)) throw Error(name);
      return deps[name];
    });
    const body = {
      killer: { name: "Hans" },
      location: { name: "Camp Happy Trails" },
      finalGirl: { name: "Laurie" },
      ...(kind === "ending"
        ? {
            outcome: "won",
            introStory: "A meaningful opening story. ".repeat(4),
            playSummary: "Only this selected event.",
          }
        : {}),
      evaluation: { gameId, context: { playEvents: ["UNSENT_FULL_LOG"] } },
      user_id: "forged",
    };
    const response = await handler(
      new Request("http://test", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    );
    assert.equal(response.status, 200);
    await response.text();
    assert.equal(captured.kind, kind);
    assert(!JSON.stringify(captured.context).includes("UNSENT_FULL_LOG"));
    assert(!captured.user.includes("UNSENT_FULL_LOG"));
    assert(!captured.user.includes("forged"));
    assert.equal(h.rows[0].diagnostic_context.playEvents[0], "UNSENT_FULL_LOG");
  });

test("the real Responses gateway exposes explicit completion and the exact effective prompt, with normalized prose", async () => {
  const exports = {},
    calls = [];
  new Function(
    "require",
    "exports",
    "Deno",
    "fetch",
    compile("../supabase/functions/_shared/aiGateway.ts"),
  )(
    () => ({
      TEXT_MODEL_CANDIDATES: ["openai/test"],
      usesResponsesApi: () => true,
    }),
    exports,
    { env: { get: () => "test-key" } },
    async (_url, options) => {
      calls.push(JSON.parse(options.body));
      return new Response(
        frame({ type: "response.output_text.delta", delta: "Laurie—alive." }) +
          frame({ type: "response.completed" }),
      );
    },
  );
  const { body, model } = await exports.streamChat({
    system: "System",
    user: "User",
  });
  let result;
  await new Response(
    observeStoryStream(
      body,
      async (row) => {
        result = row;
        return true;
      },
      "id",
    ),
  ).text();
  assert.equal(model, "openai/test");
  assert.equal(
    calls[0].input[0].content[0].text,
    exports.effectiveTextSystem("System"),
  );
  assert.equal(calls[0].input[1].content[0].text, "User");
  assert.equal(result.status, "complete");
  assert.equal(result.story_text, "Laurie, alive.");
});


function recovering(h, signal) {
  const recovery = load('../supabase/functions/_shared/endingRecovery.ts', {
    './aiGateway.ts':actualGateway, './storyEvaluation.ts':h.capture, './storyPrompts.ts':prompts,
  });
  const context={killer:{name:'Hans',description:'INHERITED_DESCRIPTION'},location:{name:'Camp Happy Trails'},finalGirl:{name:'Laurie'},introStory:'INHERITED_PROSE',outcome:'won',finalGirlHealth:0,victimsSaved:2,gameHighlights:'She saved the Guide.'};
  return recovery.generateEndingWithRecovery({...options(h),kind:'ending',system:prompts.ENDING_SYSTEM,user:prompts.buildEndingUser(context),context}, context, signal);
}
const policyFrame=frame({error:'private provider detail',code:'content_policy'});
const whole=()=>bytes(frame(delta('A complete aftermath.'))+frame(stop));

test('ending recovery replaces a blocked draft once, pins the original model and records both full attempts',async()=>{
 const h=harness((_opts,n)=>n===1?bytes(frame(delta('Interrupted draft.'))+policyFrame):whole());
 const wire=await new Response(recovering(h)).text();
 assert.equal(h.calls.length,2);
 assert.deepEqual(h.calls[1].candidates,['selected-fallback-model']);
 assert(wire.indexOf('reframing')>wire.indexOf('Interrupted draft.'));
 assert(wire.indexOf('A complete aftermath.')>wire.indexOf('reframing'));
 assert(!wire.includes('private provider detail'));
 assert.deepEqual(h.rows.map(r=>r.status),['incomplete','complete']);
 assert.equal(h.rows[0].finish_reason,'content_filter');
 assert.equal(h.rows[0].error_code,'content_policy');
 assert.equal(h.rows[0].story_text,'Interrupted draft.');
 assert.equal(h.rows[1].story_text,'A complete aftermath.');
 assert.match(h.rows[1].prompt_version,/aftermath/);
 assert(!h.calls[1].user.includes('INHERITED_PROSE'));
 assert(!h.calls[1].user.includes('INHERITED_DESCRIPTION'));
 assert(h.calls[1].user.includes('She saved the Guide.'));
 assert(h.calls[1].user.includes('Final Girl fate: died'));
 assert(h.calls[1].user.includes('"victimsSaved": 2'));
 assert(!h.calls[1].user.includes('private diagnostic'));
});

test('a pre-stream policy rejection gets one recorded rewrite on the rejected model',async()=>{
 const h=harness((_opts,n)=>{
  if(n===1){const error=new actualGateway.GatewayError('content_policy','private details');error.model='selected-fallback-model';throw error;}
  return whole();
 });
 const wire=await new Response(recovering(h)).text();
 assert.equal(h.calls.length,2);assert(wire.includes('A complete aftermath.'));
 assert.equal(h.rows[0].status,'failed');assert.equal(h.rows[0].model,'selected-fallback-model');
 assert.equal(h.rows[0].error_code,'content_policy');assert(!JSON.stringify(h.rows).includes('private details'));
});

test('a second policy block stops gracefully, with no model hopping or third attempt',async()=>{
 const h=harness(()=>bytes(policyFrame));
 const wire=await new Response(recovering(h)).text();
 assert.equal(h.calls.length,2);assert.deepEqual(h.calls[1].candidates,['selected-fallback-model']);
 assert.deepEqual(h.rows.map(r=>r.status),['failed','failed']);
 assert.equal((wire.match(/"state":"reframing"/g)||[]).length,1);
 assert(wire.includes('Your game result is safe'));assert(!wire.includes('private provider detail'));
});

test('availability, rate limits, credits, empty and truncated output never trigger the policy rewrite',async()=>{
 for(const kind of ['upstream','credits','rate_limit','model_unavailable']){
  const h=harness(()=>{throw new actualGateway.GatewayError(kind,'private provider detail');});
  const wire=await new Response(recovering(h)).text();assert.equal(h.calls.length,1);assert(!wire.includes('reframing'));
 }
 for(const wire of [frame(delta('Cut off'))+frame('[DONE]'),frame(delta('Cut off'))+frame({error:'truncated',code:'incomplete_response'}),frame(stop)]){
  const h=harness(()=>bytes(wire));const output=await new Response(recovering(h)).text();
  assert.equal(h.calls.length,1);assert(!output.includes('reframing'));assert(output.includes('"code":"incomplete_response"'));
 }
});

test('telemetry outages do not prevent a complete rewritten ending',async()=>{
 const h=harness((_opts,n)=>n===1?bytes(policyFrame):whole(),()=>true);
 const wire=await new Response(recovering(h)).text();assert(wire.includes('A complete aftermath.'));assert.equal(h.calls.length,2);
});

test('cancelling a pending attempt cancels its stream and never starts a rewrite',async()=>{
 let cancelled=false;
 const h=harness(()=>new ReadableStream({start(c){c.enqueue(encoder.encode(frame(delta('Partial'))));},cancel(){cancelled=true;}}));
 const reader=recovering(h).getReader();await reader.read();await reader.cancel();
 assert(cancelled);assert.equal(h.calls.length,1);assert.equal(h.rows[0].status,'cancelled');
});

test('cancelling the rewrite preserves both records and stops the second provider stream',async()=>{
 let cancelled=false;
 const h=harness((_opts,n)=>n===1?bytes(policyFrame):new ReadableStream({start(c){c.enqueue(encoder.encode(frame(delta('Aftermath'))));},cancel(){cancelled=true;}}));
 const reader=recovering(h).getReader();let text='';
 while(!text.includes('Aftermath')){const chunk=await reader.read();text+=new TextDecoder().decode(chunk.value);}
 await reader.cancel();assert(cancelled);assert.equal(h.calls.length,2);assert.equal(h.rows[0].status,'failed');assert.equal(h.rows[1].status,'cancelled');
});


function endingHandler(h) {
 let handler;
 const recovery=load('../supabase/functions/_shared/endingRecovery.ts',{'./aiGateway.ts':actualGateway,'./storyEvaluation.ts':h.capture,'./storyPrompts.ts':prompts});
 const dependencies={
  'https://deno.land/std@0.168.0/http/server.ts':{serve:fn=>{handler=fn;}},
  '../_shared/auth.ts':{getCorsHeaders:()=>({})},'../_shared/validation.ts':schemas,
  '../_shared/guard.ts':{requireUser:async()=>h.guard},'../_shared/storyPrompts.ts':prompts,
  '../_shared/aiGateway.ts':actualGateway,'../_shared/storyEvaluation.ts':h.capture,'../_shared/endingRecovery.ts':recovery,
 };
 new Function('exports','require',compile('../supabase/functions/generate-ending/index.ts'))({},name=>dependencies[name]);
 return handler;
}
const endingRequest=(version)=>new Request('http://test',{method:'POST',body:JSON.stringify({
 killer:{name:'Hans'},location:{name:'Camp Happy Trails'},finalGirl:{name:'Laurie'},introStory:'A meaningful opening story. '.repeat(4),outcome:'won',
 ...(version!==undefined&&{endingStreamVersion:version}),evaluation:{gameId,context:{playEvents:['DIAGNOSTIC_ONLY']}},
})});

test('the real ending route opts into recovery without exposing the protocol flag or diagnostic log to the model',async()=>{
 const h=harness((_opts,n)=>n===1?bytes(policyFrame):whole());
 const response=await endingHandler(h)(endingRequest(1));
 assert.equal(response.status,200);assert.match(response.headers.get('Content-Type'),/event-stream/);
 const wire=await response.text();assert(wire.includes('reframing'));assert(wire.includes('A complete aftermath.'));assert.equal(h.calls.length,2);
 for(const row of h.rows){assert(!row.user_prompt.includes('endingStreamVersion'));assert(!row.user_prompt.includes('DIAGNOSTIC_ONLY'));assert(!('endingStreamVersion' in row.model_context));assert.equal(row.game_id,gameId);}
});

test('old ending clients keep their one-attempt protocol and unknown protocol versions are rejected',async()=>{
 const old=harness(()=>bytes(policyFrame));
 const wire=await(await endingHandler(old)(endingRequest())).text();
 assert.equal(old.calls.length,1);assert(!wire.includes('reframing'));
 const invalid=harness();const response=await endingHandler(invalid)(endingRequest(2));
 assert.equal(response.status,400);assert.equal(invalid.calls.length,0);
});

test('a request already cancelled starts no paid generation',async()=>{
 const h=harness(),abort=new AbortController();abort.abort();
 await assert.rejects(new Response(recovering(h,abort.signal)).text());assert.equal(h.calls.length,0);
});
