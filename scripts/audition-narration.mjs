/** Paid, opt-in provider comparison. Nothing runs without --run and a local key.
 * Outputs are intentionally untracked. Never prints credentials or response bodies. */
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import ts from 'typescript';
const ex = {};
new Function('exports', ts.transpileModule(await readFile(new URL('../supabase/functions/_shared/narration.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText)(ex);
const { NARRATION_MODEL, NARRATION_PROFILE, delivery } = ex;
if (!process.argv.includes('--run') || !process.env.INWORLD_API_KEY) {
  console.log('Set INWORLD_API_KEY locally, then run: node scripts/audition-narration.mjs --run [output-directory]. Generates 10 short paid comparison clips.');
  process.exit(0);
}
const directory = process.argv[process.argv.indexOf('--run') + 1] || '/tmp/final-girl-narration-audition';
await mkdir(directory, { recursive: true });
const samples = [
  { kind: 'dread', voice: 'Levi', text: 'The lights went out at Camp Happy Trails. Laurie heard a branch snap behind the cabins. Then another, closer. “Nobody goes alone,” she whispered. The empty doorway gave her nothing back. Somewhere beyond the lake, a radio kept playing to a room full of people who were no longer listening.' },
  { kind: 'dread', voice: 'Damon', text: 'The lights went out at Camp Happy Trails. Laurie heard a branch snap behind the cabins. Then another, closer. “Nobody goes alone,” she whispered. The empty doorway gave her nothing back. Somewhere beyond the lake, a radio kept playing to a room full of people who were no longer listening.' },
  { kind: 'survivor', voice: 'Warren', text: 'Morning found Laurie on the road, still holding the flashlight. She had stopped running. That was all she could say for certain. Behind her, the camp lay quiet. The first car slowed, and the driver leaned across to open the door. Laurie looked once at the trees before she got in.' },
  { kind: 'cold', voice: 'Conrad', text: 'The phone rang until the machine picked up. Her own voice filled the empty kitchen, promising she would call back. Outside, the porch light clicked off in the morning sun. Nobody came to collect the paper. By noon, the rain had softened it into the concrete.' },
  { kind: 'cold', voice: 'Conrad', text: 'The door shut before anyone reached it. A chair scraped once across the tiles, then fell. On the other side, someone whispered a name. There was no answer. The flashlight lay where it had landed, illuminating a narrow strip of floor and the shoes of the person who was still standing.' },
];
const results = [];
for (const [index, sample] of samples.entries()) for (const model of ['inworld-tts-1.5-max', NARRATION_MODEL]) {
  const text = model === NARRATION_MODEL ? `[${delivery[sample.kind]}] ${sample.text}` : sample.text;
  const start = performance.now();
  const response = await fetch('https://api.inworld.ai/tts/v1/voice', {
    method: 'POST', headers: { Authorization: `Basic ${process.env.INWORLD_API_KEY}`, 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(45000),
    body: JSON.stringify({ text, voiceId: sample.voice, modelId: model, audioConfig: { audioEncoding: 'MP3', sampleRateHertz: 48000, bitRate: 128000 } }),
  });
  if (!response.ok) throw new Error(`Audition ${index + 1} failed (${response.status}); no further paid calls made.`);
  const payload = await response.json(); if (!payload.audioContent) throw new Error('Empty audition audio.');
  const file = `${index + 1}-${sample.voice}-${model}.mp3`;
  await writeFile(`${directory}/${file}`, Buffer.from(payload.audioContent, 'base64'));
  results.push({ file, model, voice: sample.voice, kind: sample.kind, fullGenerationMs: Math.round(performance.now() - start), profile: NARRATION_PROFILE, text: sample.text });
  console.log(file);
}
await writeFile(`${directory}/results.json`, JSON.stringify(results, null, 2));
console.log('Compare intelligibility, natural pacing, restrained delivery, name pronunciation and repeat-listening fatigue. These batch timings are not streaming time-to-first-audio.');
