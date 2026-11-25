// See docs/story-generation-review.md. No session or evaluation-table writes.
import { buildEndingRecovery, buildEndingUser, buildOpeningUser, ENDING_SYSTEM, openingSystemForTake } from '../supabase/functions/_shared/storyPrompts.ts';
import { EndingRequestSchema, StoryRequestSchema } from '../supabase/functions/_shared/validation.ts';

interface Attempt {
  kind: 'opening' | 'ending';
  status: string;
  game_id: string | null;
  prompt_version: string;
  model_context: Record<string, unknown>;
  story_text: string;
}

const [file, openingRow, ...rest] = Deno.args;
const live = rest.at(-1) === '--live';
const endingRows = live ? rest.slice(0, -1) : rest;
if (!file || !openingRow || !endingRows.length) {
  throw new Error('Expected an export path, a 1-based opening row and one or more ending rows, optionally followed by --live.');
}
const corpus = JSON.parse(await Deno.readTextFile(file));
if (corpus.format !== 'final-girl-story-evaluations' || !Array.isArray(corpus.attempts)) throw new Error('Expected a story evaluation export.');
const attempts: Attempt[] = corpus.attempts;
function completeRow(row: string, kind: Attempt['kind']) {
  const index = Number(row) - 1;
  const attempt = attempts[index];
  if (!Number.isInteger(index) || attempt?.kind !== kind || attempt.status !== 'complete' || !attempt.story_text?.trim()) {
    throw new Error('Row ' + row + ' must be a complete ' + kind + '.');
  }
  return attempt;
}

const opening = completeRow(openingRow, 'opening');
const { openingTake = 0, ...world } = StoryRequestSchema.parse(opening.model_context);
const samples = [0, 1, 2].map(offset => ({
  label: 'Opening ' + (offset + 1),
  system: openingSystemForTake(openingTake + offset),
  user: buildOpeningUser(world),
  original: '',
}));
for (const row of endingRows) {
  const attempt = completeRow(row, 'ending');
  const aftermath = attempt.prompt_version.includes('aftermath');
  // Recovery strips the intro. Restore the paired input solely for schema validation;
  // the recovery builder strips it again before the request leaves the machine.
  const primary = aftermath && attempt.game_id
    ? attempts.slice(0, Number(row) - 1).findLast(other =>
      other.game_id === attempt.game_id && other.kind === 'ending' && typeof other.model_context.introStory === 'string')
    : undefined;
  const context = EndingRequestSchema.parse({
    ...(primary && { introStory: primary.model_context.introStory }),
    ...attempt.model_context,
  });
  const prompt = aftermath ? buildEndingRecovery(context) : { system: ENDING_SYSTEM, user: buildEndingUser(context) };
  samples.push({ label: 'Ending row ' + row, system: prompt.system, user: prompt.user, original: attempt.story_text });
}
console.log('Prepared ' + samples.length + ' prompts. The first three share the same setup and use distinct discovery directions.');
if (live) {
  if (Deno.env.get('AI_TEXT_PROVIDER') !== 'openai' || !Deno.env.get('OPENAI_API_KEY')) {
    throw new Error('Live comparison requires the direct OpenAI text provider and its API key.');
  }
  const { streamChat } = await import('../supabase/functions/_shared/aiGateway.ts');
  const { observeStoryStream } = await import('../supabase/functions/_shared/storyEvaluation.ts');
  const directory = await Deno.makeTempDir({ prefix: 'final-girl-story-review-' });
  console.log('Private comparison directory: ' + directory);
  const answerKey: string[] = [];
  for (const [i, sample] of samples.entries()) {
    const { body, model } = await streamChat({ system: sample.system, user: sample.user });
    let revised = '';
    await new Response(observeStoryStream(body, async result => {
      if (result.status === 'complete') revised = result.story_text;
      return false;
    }, null)).arrayBuffer();
    if (!revised) throw new Error(sample.label + ' did not complete; no partial story was graded.');
    let text = revised;
    if (sample.original) {
      const revisedFirst = crypto.getRandomValues(new Uint8Array(1))[0] % 2 === 0;
      const [a, b] = revisedFirst ? [revised, sample.original] : [sample.original, revised];
      text = '## A\n\n' + a + '\n\n## B\n\n' + b;
      answerKey.push(sample.label + ' — revised ' + (revisedFirst ? 'A' : 'B') + ' (' + model + ')');
    }
    await Deno.writeTextFile(directory + '/' + (i + 1) + '.md', '# ' + sample.label + '\n\n' + text + '\n');
    await Deno.writeTextFile(directory + '/answer-key.txt', answerKey.join('\n'));
  }
}
