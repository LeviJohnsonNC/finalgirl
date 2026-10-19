// Opt-in paid diagnostic: 4 utility calls + 2 images, no database/session writes.
// Run with LOVABLE_API_KEY supplied securely in the environment. Never prints it.
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import ts from 'typescript';
if (!process.env.LOVABLE_API_KEY) throw new Error('Supply LOVABLE_API_KEY securely to run this paid diagnostic.');
const output = resolve(tmpdir(), `finalgirl-opening-${Date.now()}`);
mkdirSync(output);
const cache = new Map();
const calls = [];
let imageCalls = 0, textCalls = 0;
async function diagnosticFetch(url, init) {
  if (url !== 'https://ai.gateway.lovable.dev/v1/chat/completions') throw new Error('Unexpected diagnostic destination.');
  const body = JSON.parse(init.body);
  const image = body.model === 'google/gemini-3-pro-image';
  if (!image && body.model !== 'google/gemini-3.8-flash') throw new Error('Model fallback is disabled in this diagnostic.');
  if (image ? ++imageCalls > 2 : ++textCalls > 4) throw new Error('Diagnostic request budget exhausted.');
  const start = Date.now();
  const response = await fetch(url, init);
  const data = await response.clone().json();
  calls.push({ model: data.model, status: response.status, finish: data.choices?.[0]?.finish_reason,
    nativeFinish: data.choices?.[0]?.native_finish_reason, elapsedMs: Date.now() - start, usage: data.usage });
  return response;
}
function load(file) {
  file = resolve(file.endsWith('.ts') ? file : file + '.ts');
  if (cache.has(file)) return cache.get(file);
  const exports = {};
  cache.set(file, exports);
  const code = ts.transpileModule(readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  new Function('require', 'exports', 'Deno', 'fetch', code)(name => {
    if (!name.startsWith('.')) throw new Error('Unexpected diagnostic dependency: ' + name);
    return load(resolve(dirname(file), name));
  }, exports, { env: { get: key => process.env[key] } }, diagnosticFetch);
  return exports;
}
const prompts = load('supabase/functions/_shared/prompts.ts');
const gateway = load('supabase/functions/_shared/aiGateway.ts');
const references = load('supabase/functions/_shared/openingReferences.ts');
const { getKillerDescription } = load('src/data/killerDescriptions.ts');
const { getFinalGirlDescription } = load('src/data/finalGirlDescriptions.ts');
const { getLocationDescription } = load('src/data/locationDescriptions.ts');
const { getKillerNarrativeRules } = load('src/data/killerSpecialRules.ts');
const { getModulePromptContext } = load('src/data/rules/moduleRules.ts');
const module = getModulePromptContext('Billy the Bear', 'Buddyland');
for (const finalGirl of ['Rena', 'Gwynn']) {
  const context = {
    killer: 'Billy the Bear', finalGirl, location: 'Buddyland', sceneType: 'beginning',
    killerDescription: getKillerDescription('Billy the Bear'), finalGirlDescription: getFinalGirlDescription(finalGirl),
    locationDescription: getLocationDescription('Buddyland'), moduleVisualGuidance: module.visualGuidance,
    scenarioRules: [getKillerNarrativeRules('Billy the Bear'), module.rulesSummary, module.narrativeGuidance].join('\n'),
    story: `${finalGirl} stood between the dusty arcade cabinets, holding a flashlight. At the far end of the arcade Billy the Bear stepped into the amber light. His torn plush hide exposed rods and cables, and one mechanical paw rose in a welcoming gesture that ratcheted beyond its proper stopping point. Behind her, a party-room door slammed. No one had been injured yet.`,
  };
  const bible = await gateway.generateText({ system: prompts.VISUAL_BIBLE_SYSTEM, user: prompts.buildVisualBiblePrompt(context),
    maxTokens: 4000, temperature: 0.5, reasoningEffort: 'low', requireComplete: true, candidates: ['google/gemini-3.8-flash'] });
  context.visualBible = prompts.parseVisualBible(bible.text);
  if (!context.visualBible) throw new Error('Invalid complete continuity for ' + finalGirl);
  const brief = await gateway.generateText({ system: prompts.buildShotBriefSystem(context), user: prompts.buildShotBriefPrompt(context),
    maxTokens: 4000, reasoningEffort: 'low', requireComplete: true, candidates: ['google/gemini-3.8-flash'] });
  const plan = prompts.parseShotPlan(brief.text);
  if (!plan) throw new Error('Invalid complete shot plan for ' + finalGirl);
  context.shotBrief = plan.concepts[plan.selected];
  const prompt = prompts.buildBeginningPrompt(context);
  const image = await gateway.generateImage(prompt, undefined, { aspectRatio: '16:9', references: references.openingReferences(finalGirl, context.killer) });
  const path = resolve(output, `${finalGirl.toLowerCase()}.png`);
  writeFileSync(path, Buffer.from(image.base64, 'base64'));
  console.log(JSON.stringify({ finalGirl, path, imageModel: image.model, promptCharacters: prompt.length, visualBible: context.visualBible, shot: context.shotBrief, calls }, null, 2));
  calls.length = 0;
}
