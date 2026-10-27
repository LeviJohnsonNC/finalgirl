import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
const compile = path => ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const references = {};
new Function('exports',compile('../supabase/functions/_shared/imageReference.ts'))(references);
const project='https://archive.example.test', owner='owner', game='game';
const own=`${project}/storage/v1/object/public/posters/game-posters/${owner}/${game}-scene-123.png`;
test('only the current owner and game opening can condition a poster',()=>{
  assert.equal(references.ownedOpeningReference(own,project,owner,game),own);
  for(const value of [own.replace('/owner/','/other/'),own.replace('game-scene','other-scene'),own.replace('archive.example.test','foreign.example.test'),own+'?token=secret',own+'#fragment',own.replace('https:','http:'),own.replace('-scene-','-poster-'),own.replace('123.png','../123.png')]) assert.equal(references.ownedOpeningReference(value,project,owner,game),undefined);
  assert.equal(references.ownedOpeningReference(own,project,owner,undefined),undefined);
});
function gateway(status=200,body='') {
  const calls=[], exports={};
  new Function('require','exports','Deno','fetch',compile('../supabase/functions/_shared/aiGateway.ts'))(name=>{
    if(name==='./models.ts')return { IMAGE_MODEL_CANDIDATES:['test-image'],usesResponsesApi:()=>false };
    throw Error(name);
  },exports,{env:{get:()=> 'fake-key'}},async(_url,options)=>{
    calls.push(JSON.parse(options.body));
    if((calls.length===1 || status===401) && status!==200)return new Response(body,{status});
    return new Response(JSON.stringify({choices:[{message:{images:[{image_url:{url:'data:image/png;base64,dGVzdA=='}}]}}]}));
  });
  return {calls,exports};
}
test('the image gateway passes a real identity reference alongside the prompt',async()=>{
  const {calls,exports}=gateway();
  assert.equal((await exports.generateImage('paint the ending',own)).mimeType,'image/png');
  assert.equal(calls[0].messages[0].content[1].image_url.url,own);
  assert.match(calls[0].messages[0].content[0].text,/IDENTITY reference only/);
  assert.match(calls[0].messages[0].content[0].text,/current named cast identity overrides a contradictory person/);
});
test('opening stills explicitly request widescreen dimensions without changing default poster requests',async()=>{
  const {calls,exports}=gateway();
  await exports.generateImage('opening photo',undefined,{aspectRatio:'16:9'});
  assert.deepEqual(calls[0].image_config,{aspect_ratio:'16:9'});
  await exports.generateImage('paint the ending',own);
  assert.equal(calls[1].image_config,undefined);
});
test('opening identity photos carry named subjects and never inherit painted poster instructions', async () => {
  const { calls, exports } = gateway();
  const references = [{ name: 'Rena', url: 'data:image/jpeg;base64,portrait-A' }, { name: 'Billy the Bear', url: 'data:image/jpeg;base64,portrait-B' }];
  await exports.generateImage('Photograph the new opening.', undefined, { aspectRatio: '16:9', references });
  const content = calls[0].messages[0].content;
  assert.match(content[0].text, /cast IDENTITY references/);
  assert.match(content[0].text, /same exposure|available light, exposure and white balance/);
  assert.match(content[0].text, /Match identity, not the reference's rendering style/);
  assert.match(content[0].text, /physically credible forms without changing the identity/);
  assert.doesNotMatch(content[0].text, /painted medium|ending|opening photograph is/);
  assert.deepEqual(content.filter(part => part.type === 'image_url').map(part => part.image_url.url), references.map(ref => ref.url));
  assert(content.some(part => part.text === 'Identity photograph: Rena'));
  assert(content.some(part => part.text === 'Identity photograph: Billy the Bear'));
});
test('image dimensions survive the existing reference-input fallback',async()=>{
  const {calls,exports}=gateway(422,'Unsupported image input');
  await exports.generateImage('opening photo',own,{aspectRatio:'16:9'});
  assert.equal(calls.length,2);
  assert(calls.every(call=>call.image_config.aspect_ratio==='16:9'));
});
test('a route rejecting image input falls back to text continuity once',async()=>{
  const {calls,exports}=gateway(422,'Unsupported image input');
  await exports.generateImage('paint the ending',own);
  assert.equal(calls.length,2);
  assert.equal(calls[1].messages[0].content,'paint the ending');
});
test('reference fallback never bypasses credits, safety or authorization errors',async()=>{
  for(const [status,body] of [[402,'credits'],[400,'content policy'],[401,'unauthorized']]) {
    const {calls,exports}=gateway(status,body);
    await assert.rejects(exports.generateImage('paint the ending',own));
    assert.equal(calls.length,1);
    assert(calls.every(call=>Array.isArray(call.messages[0].content)));
  }
});

// Exercise the real gateway with fake providers and clock. No paid AI calls.
function imageFailover(respond, models = ['primary', 'backup', 'last']) {
  const calls = [], timeouts = [], exports = {};
  let now = 0;
  new Function('require', 'exports', 'Deno', 'fetch', 'Date', 'AbortSignal', compile('../supabase/functions/_shared/aiGateway.ts'))(
    () => ({ IMAGE_MODEL_CANDIDATES: models }), exports, { env: { get: () => 'fake-key' } },
    async (_url, options) => {
      const body = JSON.parse(options.body); calls.push(body);
      return await respond({ body, signal: options.signal, advance: ms => { now += ms; } });
    }, { now: () => now }, { timeout: ms => {
      const controller = new AbortController(); timeouts.push({ ms, controller }); return controller.signal;
    } },
  );
  return { calls, timeouts, exports };
}
const generatedImage = () => new Response(JSON.stringify({ choices: [{ message: { images: [{ image_url: { url: 'data:image/png;base64,dGVzdA==' } }] } }] }));

function planningFailover(respond, models = ['primary', 'backup']) {
  const calls = [], timeouts = [], exports = {};
  let now = 0;
  new Function('require', 'exports', 'Deno', 'fetch', 'Date', 'AbortSignal', compile('../supabase/functions/_shared/aiGateway.ts'))(
    () => ({ UTILITY_MODEL_CANDIDATES: models, usesResponsesApi: model => model.startsWith('openai/') }),
    exports, { env: { get: () => 'fake-key' } },
    async (_url, options) => {
      const body = JSON.parse(options.body); calls.push(body);
      return await respond({ body, signal: options.signal, advance: ms => { now += ms; }, timeout: timeouts.at(-1) });
    }, { now: () => now }, { timeout: ms => {
      const controller = new AbortController(); timeouts.push({ ms, controller }); return controller.signal;
    } },
  );
  return { calls, timeouts, exports };
}
const planOptions = { system: 'Plan three factual photographic shots.', user: 'Recorded story and cast.', maxTokens: 4000, requireComplete: true, reasoningEffort: 'low' };
const generatedPlan = () => new Response(JSON.stringify({ choices: [{ finish_reason: 'stop', message: { content: 'complete plan' } }] }));
const stallPlanner = ({ signal, advance, timeout }) => new Promise((_resolve, reject) => {
  signal.addEventListener('abort', () => reject(signal.reason), { once: true });
  advance(timeout.ms);
  timeout.controller.abort(new DOMException('Signal timed out.', 'TimeoutError'));
});

test('the observed planning 503 tries the backup once with the same complete-shot requirements', async () => {
  const f = planningFailover(({ body, advance }) => {
    if (body.model === 'primary') { advance(6_000); return new Response('Service temporarily unavailable', { status: 503 }); }
    return generatedPlan();
  });
  assert.deepEqual(await f.exports.generateShotPlanText(planOptions), { text: 'complete plan', model: 'backup' });
  assert.deepEqual(f.calls.map(call => call.model), ['primary', 'backup']);
  assert.deepEqual(f.calls[0].messages, f.calls[1].messages);
  assert(f.calls.every(call => call.max_tokens === 4000 && call.reasoning_effort === 'low'));
  assert.deepEqual(f.timeouts.map(t => t.ms), [10_000, 10_000]);
});

test('a timed-out planner leaves a fresh signal and ten seconds for a successful backup', async () => {
  const f = planningFailover(call => call.body.model === 'primary' ? stallPlanner(call) : generatedPlan());
  assert.equal((await f.exports.generateShotPlanText(planOptions)).model, 'backup');
  assert.equal(f.timeouts[0].controller.signal.aborted, true);
  assert.equal(f.timeouts[1].controller.signal.aborted, false);
  assert.deepEqual(f.calls.map(call => call.model), ['primary', 'backup']);
});

test('planning stalls cannot exceed the shared twenty-second budget, including an override model', async () => {
  const f = planningFailover(stallPlanner, ['override', 'primary', 'backup']);
  await assert.rejects(f.exports.generateShotPlanText(planOptions), error => {
    assert.equal(f.exports.statusFor(error), 504);
    assert.match(f.exports.userFacingMessage(error), /planning.*too long.*story is safe.*try again/i);
    return true;
  });
  assert.deepEqual(f.calls.map(call => call.model), ['override', 'primary']);
  assert.deepEqual(f.timeouts.map(t => t.ms), [10_000, 10_000]);
});

test('fast planning outages exhaust distinct candidates and report a specific retryable 503', async () => {
  const f = planningFailover(() => new Response('unavailable', { status: 503 }), ['primary', 'primary', 'backup']);
  await assert.rejects(f.exports.generateShotPlanText(planOptions), error => {
    assert.equal(f.exports.statusFor(error), 503);
    assert.match(f.exports.userFacingMessage(error), /could not be planned.*temporarily unavailable.*story is safe/i);
    return true;
  });
  assert.deepEqual(f.calls.map(call => call.model), ['primary', 'backup']);
});

test('planning fails over on availability errors, unknown models and connection loss only', async () => {
  for (const status of [500, 502, 504, 404]) {
    const f = planningFailover(({ body }) => body.model === 'primary' ? new Response('unavailable', { status }) : generatedPlan());
    assert.equal((await f.exports.generateShotPlanText(planOptions)).model, 'backup');
  }
  const f = planningFailover(({ body }) => { if (body.model === 'primary') throw new TypeError('connection lost'); return generatedPlan(); });
  assert.equal((await f.exports.generateShotPlanText(planOptions)).model, 'backup');
});

test('planning never advances on protected errors, empty output or truncated completions', async () => {
  for (const [status, body] of [
    [402, 'credits'], [429, 'rate limit'], [401, 'unauthorized'], [403, 'forbidden'], [400, 'content policy'], [422, 'invalid request'],
    [200, '{}'], [200, JSON.stringify({ choices: [{ finish_reason: 'length', message: { content: '{partial' } }] })],
    [200, JSON.stringify({ choices: [{ finish_reason: 'content_filter', message: { refusal: 'declined' } }] })],
  ]) {
    const f = planningFailover(() => new Response(body, { status }));
    await assert.rejects(f.exports.generateShotPlanText(planOptions));
    assert.deepEqual(f.calls.map(call => call.model), ['primary']);
  }
});

test('successful planning never spends another call and also supports Responses overrides', async () => {
  const f = planningFailover(() => generatedPlan());
  assert.equal((await f.exports.generateShotPlanText(planOptions)).model, 'primary');
  assert.equal(f.calls.length, 1);
  const responses = planningFailover(({ body }) => {
    assert.deepEqual(body.reasoning, { effort: 'low' });
    return new Response('data: {"type":"response.output_text.delta","delta":"complete plan"}\n\ndata: {"type":"response.completed"}\n\n');
  }, ['openai/override']);
  assert.equal((await responses.exports.generateShotPlanText(planOptions)).text, 'complete plan');
  assert.equal(responses.calls.length, 1);
});

test('the observed slow 503 switches image model instead of repeating the failed provider', async () => {
  const f = imageFailover(({ body, advance }) => {
    if (body.model === 'primary') { advance(59_000); return new Response('{"error":{"message":"Service temporarily unavailable","type":"upstream_error"}}', { status: 503 }); }
    advance(12_000); return generatedImage();
  });
  const image = await f.exports.generateImage('paint the recorded ending', own);
  assert.equal(image.model, 'backup');
  assert.deepEqual(f.calls.map(call => call.model), ['primary', 'backup']);
  assert.deepEqual(f.calls[0].messages, f.calls[1].messages);
  assert.deepEqual(f.timeouts.map(t => t.ms), [65_000, 46_000]);
});

test('image failover keeps the photographic opening prompt, references and widescreen size', async () => {
  const f = imageFailover(({ body }) => body.model === 'primary' ? new Response('unavailable', { status: 502 }) : generatedImage());
  await f.exports.generateImage('Photograph a lifelike scene.', undefined, { aspectRatio: '16:9', references: [{ name: 'Rena', url: 'data:image/jpeg;base64,portrait' }] });
  assert.deepEqual(f.calls.map(call => call.model), ['primary', 'backup']);
  assert.deepEqual(f.calls[0].messages, f.calls[1].messages);
  assert(f.calls.every(call => call.image_config.aspect_ratio === '16:9'));
  assert.doesNotMatch(f.calls[1].messages[0].content[0].text, /painted medium/);
});

test('stalled image requests are aborted and all attempts share one finite budget', async () => {
  let f;
  f = imageFailover(({ signal, advance }) => new Promise((_resolve, reject) => {
    signal.addEventListener('abort', () => reject(signal.reason), { once: true });
    const timeout = f.timeouts.at(-1);
    advance(timeout.ms);
    timeout.controller.abort(new DOMException('Timed out', 'TimeoutError'));
  }));
  await assert.rejects(f.exports.generateImage('paint the ending', own), error => {
    assert.equal(f.exports.statusFor(error), 504);
    assert.match(f.exports.userFacingMessage(error), /temporarily unavailable.*result are safe.*again/i);
    return true;
  });
  assert.deepEqual(f.calls.map(call => call.model), ['primary', 'backup']);
  assert.deepEqual(f.timeouts.map(t => t.ms), [65_000, 40_000]);
});

test('repeated outages exhaust distinct image models once and report a retryable service failure', async () => {
  const f = imageFailover(() => new Response('temporarily unavailable', { status: 503 }), ['primary', 'primary', 'backup']);
  await assert.rejects(f.exports.generateImage('paint the ending'), error => f.exports.statusFor(error) === 503);
  assert.deepEqual(f.calls.map(call => call.model), ['primary', 'backup']);
});

test('image failover does not retry credits, rate limits, authorization, safety or empty output', async () => {
  for (const [status, body] of [[402, 'credits'], [429, 'rate limit'], [401, 'unauthorized'], [403, 'forbidden'], [400, 'content policy'], [200, '{}']]) {
    const f = imageFailover(() => new Response(body, { status }));
    await assert.rejects(f.exports.generateImage('paint the ending', own));
    assert.deepEqual(f.calls.map(call => call.model), ['primary']);
  }
});

test('all generated text rejects em dashes, including escaped and split SSE payloads', async () => {
  const { exports } = gateway();
  assert.equal(exports.normalizeGeneratedText('She stopped\u2014then ran.'), 'She stopped, then ran.');
  const input = 'data: {"choices":[{"delta":{"content":"She stopped\\u2014then ran."}}]}\n\ndata: {"choices":[{"delta":{"content":"Café\u2014still."}}]}\n\ndata: {"error":"interrupted"}\n\ndata: [DONE]\n\n';
  const bytes = new TextEncoder().encode(input);
  const upstream = new ReadableStream({ start(controller) { for (const byte of bytes) controller.enqueue(Uint8Array.of(byte)); controller.close(); } });
  const normalized = await new Response(exports.normalizeGeneratedStream(upstream)).text();
  assert.doesNotMatch(normalized, /\u2014|\\u2014/);
  assert.match(normalized, /Café, still/);
  assert.match(normalized, /"error":"interrupted"/);
  assert.match(normalized, /data: \[DONE\]/);
});

test("a death request rejects the observed two-word fragment when the provider hits its token limit", async () => {
  const exports = {};
  new Function(
    "require",
    "exports",
    "Deno",
    "fetch",
    compile("../supabase/functions/_shared/aiGateway.ts"),
  )(
    () => ({ usesResponsesApi: () => false }),
    exports,
    { env: { get: () => "fake-key" } },
    async () =>
      new Response(
        JSON.stringify({
          choices: [
            {
              finish_reason: "length",
              message: { content: "The grease-stained" },
            },
          ],
          usage: {
            completion_tokens: 340,
            completion_tokens_details: { reasoning_tokens: 334 },
          },
        }),
      ),
  );
  await assert.rejects(
    exports.generateText({
      system: "Write a complete story.",
      user: "Recorded facts",
      candidates: ["google/gemini-3.8-flash"],
      maxTokens: 340,
      requireComplete: true,
      singleAttempt: true,
    }),
    /complete|finish|limit/i,
  );
});

test('death overrides using Responses require a completed stream and pass low reasoning explicitly', async () => {
  for (const ending of ['response.completed','response.incomplete','missing']) {
    const exports = {};
    new Function('require','exports','Deno','fetch',compile('../supabase/functions/_shared/aiGateway.ts'))(
      () => ({usesResponsesApi:()=>true}), exports, {env:{get:()=> 'fake-key'}},
      async (_url, init) => {
        const body=JSON.parse(init.body);
        assert.deepEqual(body.reasoning,{effort:'low'});
        const events=[{type:'response.output_text.delta',delta:'The grease-stained counter was empty.'}];
        if(ending!=='missing')events.push({type:ending});
        return new Response(events.map(e=>'data: '+JSON.stringify(e)+'\n\n').join('')+'data: [DONE]\n\n');
      },
    );
    const request=exports.generateText({system:'Complete story.',user:'Facts',candidates:['openai/test'],requireComplete:true,reasoningEffort:'low'});
    if(ending==='response.completed')assert.equal((await request).text,'The grease-stained counter was empty.');
    else await assert.rejects(request,/stream|completion/i);
  }
});
