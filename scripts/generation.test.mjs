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
    if((calls.length===1 || status===401 || (status===422 && calls.length<=2)) && status!==200)return new Response(body,{status});
    return new Response(JSON.stringify({choices:[{message:{images:[{image_url:{url:'data:image/png;base64,dGVzdA=='}}]}}]}));
  });
  return {calls,exports};
}
test('the image gateway passes a real identity reference alongside the prompt',async()=>{
  const {calls,exports}=gateway();
  assert.equal((await exports.generateImage('paint the ending',own)).mimeType,'image/png');
  assert.equal(calls[0].messages[0].content[1].image_url.url,own);
  assert.match(calls[0].messages[0].content[0].text,/IDENTITY reference only/);
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
  assert.doesNotMatch(content[0].text, /painted medium|ending|opening photograph is/);
  assert.deepEqual(content.filter(part => part.type === 'image_url').map(part => part.image_url.url), references.map(ref => ref.url));
  assert(content.some(part => part.text === 'Identity photograph: Rena'));
  assert(content.some(part => part.text === 'Identity photograph: Billy the Bear'));
});
test('image dimensions survive the existing reference-input fallback',async()=>{
  const {calls,exports}=gateway(422,'Unsupported image input');
  await exports.generateImage('opening photo',own,{aspectRatio:'16:9'});
  assert.equal(calls.length,3);
  assert(calls.every(call=>call.image_config.aspect_ratio==='16:9'));
});
test('a route rejecting image input falls back to text continuity once',async()=>{
  const {calls,exports}=gateway(422,'Unsupported image input');
  await exports.generateImage('paint the ending',own);
  assert.equal(calls.length,3);
  assert.equal(calls[2].messages[0].content,'paint the ending');
});
test('reference fallback never bypasses credits, safety or authorization errors',async()=>{
  for(const [status,body] of [[402,'credits'],[400,'content policy'],[401,'unauthorized']]) {
    const {calls,exports}=gateway(status,body);
    await assert.rejects(exports.generateImage('paint the ending',own));
    assert.equal(calls.length,status===401 ? 2 : 1);
    assert(calls.every(call=>Array.isArray(call.messages[0].content)));
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
