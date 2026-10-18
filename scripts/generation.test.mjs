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
