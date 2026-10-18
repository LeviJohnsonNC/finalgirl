import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';

function imageHandler({ rowExists = true, attachError = null, composeError = false, invalidPlan = false } = {}) {
  const filters = []; const removed = []; const phases = []; let handler;
  const client = {
    from: () => ({ update: () => {
      const query = { eq: (key, value) => { filters.push([key, value]); return query; }, select: async () => ({ data: rowExists ? [{ id: 'record' }] : [], error: attachError }) };
      return query;
    } }),
    storage: { from: () => ({
      upload: async (_path, bytes, options) => { phases.push('upload'); assert.equal(Buffer.from(bytes).toString(), 'complete-poster'); assert.equal(options.contentType, 'image/png'); return { error: null }; },
      getPublicUrl: () => ({ data: { publicUrl: 'https://example.test/new.png' } }),
      remove: async paths => { removed.push(...paths); return { error: null }; },
    }) },
  };
  const source = readFileSync(new URL('../supabase/functions/generate-scene-image/index.ts', import.meta.url), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const modules = {
    '../_shared/imageReference.ts': { ownedOpeningReference: () => undefined },
    '../_shared/auth.ts': { getCorsHeaders: () => ({ 'Access-Control-Allow-Origin': 'https://example.test' }) },
    '../_shared/guard.ts': { requireUser: async () => ({ ok: true, user: { id: 'owner-A' }, logUsage: async () => {} }) },
    '../_shared/validation.ts': { validateRequest: (_schema, data) => ({ success: true, data }) },
    '../_shared/aiGateway.ts': { generateText: async () => ({ text: invalidPlan ? '{' : 'valid', model: 'text' }), generateImage: async () => ({ base64: 'dGVzdA==', mimeType: 'image/png', model: 'image' }), statusFor: () => 500, userFacingMessage: () => 'failed' },
    '../_shared/poster.ts': { composePoster: async (_bytes, copy) => { phases.push('compose'); assert.equal(copy.title, invalidPlan ? 'FALLBACK' : 'TITLE'); if(composeError) throw new Error('composition failed'); return Buffer.from('complete-poster'); } },
    '../_shared/prompts.ts': { buildBeginningPrompt: () => 'scene', buildPosterPrompt: () => 'poster', buildShotBriefPrompt: () => 'brief', parseArtPlan: text => text === 'valid' ? {concepts:['one','two','three'],selected:1,title:'TITLE',tagline:'TAGLINE'} : null, fallbackPosterCopy: () => ({title:'FALLBACK',tagline:'TAGLINE'}) },
  };
  new Function('require', 'exports', 'Deno', code)(name => {
    if (name.includes('/http/server.ts')) return { serve: fn => { handler = fn; } };
    if (name.includes('supabase-js')) return { createClient: () => client };
    if (name.includes('/xhr@')) return {};
    if (modules[name]) return modules[name];
    throw new Error('Unexpected image handler import: ' + name);
  }, {}, { env: { get: () => 'configured' } });
  return { handler, filters, removed, phases };
}
const request = () => new Request('https://example.test', { method: 'POST', body: JSON.stringify({ sceneType: 'ending', gameId: 'record', previousImageUrl: 'https://example.test/storage/v1/object/public/posters/game-posters/owner-A/old.png' }) });
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
