import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';

function guardFor({ user = { id: 'user-A' }, slot = [{ allowed: true, event_id: 17 }], rpcError = null } = {}) {
  const annotations = [];
  const admin = {
    rpc: async () => ({ data: slot, error: rpcError }),
    from: () => ({ update: details => {
      const filters = [];
      const query = { eq: (key, value) => { filters.push([key, value]); return query; }, then: resolve => {
        annotations.push({ details, filters }); return Promise.resolve({ error: null }).then(resolve);
      } };
      return query;
    } }),
  };
  const createClient = (_url, key) => key === 'service' ? admin : { auth: { getUser: async () => ({ data: { user }, error: null }) } };
  const source = readFileSync(new URL('../supabase/functions/_shared/guard.ts', import.meta.url), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  new Function('require', 'exports', 'Deno', code)(() => ({ createClient }), exports, { env: { get: name => name === 'SUPABASE_SERVICE_ROLE_KEY' ? 'service' : 'configured' } });
  return { requireUser: exports.requireUser, annotations };
}
const request = () => new Request('https://example.test', { headers: { Authorization: 'Bearer test' } });

test('requires a signed-in user before reserving allowance', async () => {
  const { requireUser } = guardFor({ user: null });
  const result = await requireUser(request(), {}, { functionName: 'generate-story' });
  assert.equal(result.response.status, 401);
});
test('failed reservation blocks paid work, including text', async () => {
  const { requireUser } = guardFor({ slot: null, rpcError: { message: 'insert failed' } });
  const result = await requireUser(request(), {}, { functionName: 'generate-story', failClosed: false });
  assert.equal(result.ok, false);
  assert.equal(result.response.status, 503);
});
test('a claimed reservation without an event id never authorizes work', async () => {
  const { requireUser } = guardFor({ slot: [{ allowed: true }] });
  const result = await requireUser(request(), {}, { functionName: 'generate-scene-image' });
  assert.equal(result.response.status, 503);
});
test('an exhausted allowance is a retryable 429', async () => {
  const { requireUser } = guardFor({ slot: [{ allowed: false, event_id: null, reason: 'Daily allowance reached' }] });
  const result = await requireUser(request(), {}, { functionName: 'generate-scene-image' });
  assert.equal(result.response.status, 429);
});
test('successful generation annotates the exact committed reservation and owner', async () => {
  const { requireUser, annotations } = guardFor();
  const result = await requireUser(request(), {}, { functionName: 'generate-story' });
  assert.equal(result.ok, true);
  await result.logUsage({ model: 'test-model', kind: 'story' });
  assert.deepEqual(annotations, [{ details: { model: 'test-model', kind: 'story' }, filters: [['id', 17], ['user_id', 'user-A']] }]);
});
