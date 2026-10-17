import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';

function imageHandler({ rowExists = true, attachError = null } = {}) {
  const filters = []; const removed = []; let handler;
  const client = {
    from: () => ({ update: () => {
      const query = { eq: (key, value) => { filters.push([key, value]); return query; }, select: async () => ({ data: rowExists ? [{ id: 'record' }] : [], error: attachError }) };
      return query;
    } }),
    storage: { from: () => ({
      upload: async () => ({ error: null }),
      getPublicUrl: () => ({ data: { publicUrl: 'https://example.test/new.png' } }),
      remove: async paths => { removed.push(...paths); return { error: null }; },
    }) },
  };
  const source = readFileSync(new URL('../supabase/functions/generate-scene-image/index.ts', import.meta.url), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const modules = {
    '../_shared/auth.ts': { getCorsHeaders: () => ({ 'Access-Control-Allow-Origin': 'https://example.test' }) },
    '../_shared/guard.ts': { requireUser: async () => ({ ok: true, user: { id: 'owner-A' }, logUsage: async () => {} }) },
    '../_shared/validation.ts': { validateRequest: (_schema, data) => ({ success: true, data }) },
    '../_shared/aiGateway.ts': { generateText: async () => ({ text: 'Shot brief', model: 'text' }), generateImage: async () => ({ base64: 'dGVzdA==', mimeType: 'image/png', model: 'image' }), statusFor: () => 500, userFacingMessage: () => 'failed' },
    '../_shared/prompts.ts': { buildBeginningPrompt: () => 'scene', buildPosterPrompt: () => 'poster', buildShotBriefPrompt: () => 'brief' },
  };
  new Function('require', 'exports', 'Deno', code)(name => {
    if (name.includes('/http/server.ts')) return { serve: fn => { handler = fn; } };
    if (name.includes('supabase-js')) return { createClient: () => client };
    if (name.includes('/xhr@')) return {};
    if (modules[name]) return modules[name];
    throw new Error('Unexpected image handler import: ' + name);
  }, {}, { env: { get: () => 'configured' } });
  return { handler, filters, removed };
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
