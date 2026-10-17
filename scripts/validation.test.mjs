// Execute the native Deno schema tests locally through a small import adapter.
// CI also runs the same test file in Deno, including its native typecheck.
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
const require = createRequire(import.meta.url);
const transpile = file => ts.transpileModule(readFileSync(new URL(file, import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const schemas = {};
new Function('require', 'exports', transpile('../supabase/functions/_shared/validation.ts'))(name => {
  if (name.includes('zod')) return require('zod');
  if (name === './auth.ts') return { corsHeaders: { 'Access-Control-Allow-Origin': 'https://example.test' } };
  throw new Error('Unexpected schema import: ' + name);
}, schemas);
new Function('require', 'exports', 'Deno', transpile('../supabase/functions/_shared/validation_test.ts'))(name => {
  if (name === './validation.ts') return schemas;
  if (name.includes('/assert/')) return { assertEquals: assert.deepEqual, assertExists: value => assert.notEqual(value, undefined) };
  throw new Error('Unexpected test import: ' + name);
}, {}, { test });
