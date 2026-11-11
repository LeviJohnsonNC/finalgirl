// Execute the native Deno schema tests locally through a small import adapter.
// CI also runs the same test file in Deno, including its native typecheck.
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
const require = createRequire(import.meta.url);
const shared = new URL('../supabase/functions/_shared/', import.meta.url);
const modules = new Map();

function load(file) {
  if (modules.has(file.href)) return modules.get(file.href);
  const exports = {};
  modules.set(file.href, exports);
  const { outputText } = ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  new Function('require', 'exports', 'Deno', outputText)(name => {
    if (name === 'https://deno.land/x/zod@v3.22.4/mod.ts') return require('zod');
    if (name === 'https://deno.land/std@0.224.0/assert/mod.ts') {
      return { assertEquals: assert.deepEqual, assertExists: value => assert.notEqual(value, undefined) };
    }
    const dependency = new URL(name, file);
    if (dependency.href === new URL('auth.ts', shared).href) {
      return { corsHeaders: { 'Access-Control-Allow-Origin': 'https://example.test' } };
    }
    if (dependency.href.startsWith(shared.href) && dependency.pathname.endsWith('.ts')) return load(dependency);
    throw new Error('Unexpected validation import: ' + name);
  }, exports, { test });
  return exports;
}

load(new URL('validation_test.ts', shared));
