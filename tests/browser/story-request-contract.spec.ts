import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { z } from 'zod';
import { test, expect, activeGame } from './fixtures';
import { newPlayEvent as event, summarizePlay, type PlayEvent } from '../../src/lib/play/events';
import { moduleState } from '../../src/lib/play/modules';
import { initialTormentor, resolveTormentorAction, tormentorParent, type TormentorAction } from '../../src/lib/play/tormentor';
import { initialKonrad, resolveKonradAction, konradParent } from '../../src/lib/play/konrad';

// Exercise real request validation, substituting only the Deno module imports.
const schemas = {} as { StoryRequestSchema: z.ZodTypeAny; EndingRequestSchema: z.ZodTypeAny };
const source = ts.transpileModule(readFileSync('supabase/functions/_shared/validation.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
new Function('require', 'exports', source)((name: string) => {
  if (name.includes('zod')) return { z };
  if (name === './auth.ts') return { corsHeaders: {} };
  throw new Error(`Unexpected schema dependency: ${name}`);
}, schemas);

for (const location of ['Maple Lane', 'Camp Happy Trails', 'Buddyland', 'Carnival of Blood']) {
  test(`Dr. Fright at ${location} generates opening and ending with server-valid requests`, async ({ page, archive }, info) => {
    await archive.install(page, {
      draft: { ...activeGame, introStory: undefined, selection: {
        ...activeGame.selection, killer: 'Dr. Fright', finalGirl: 'Nancy', location,
      } },
    });
    const checked: string[] = [];
    await page.route('**/functions/v1/generate-*', async route => {
      const endpoint = new URL(route.request().url()).pathname.split('/').pop()!;
      const schema = endpoint === 'generate-story' ? schemas.StoryRequestSchema
        : endpoint === 'generate-ending' ? schemas.EndingRequestSchema : undefined;
      if (!schema || route.request().method() !== 'POST') return route.fallback();
      const parsed = schema.safeParse(route.request().postDataJSON());
      if (!parsed.success) return route.fulfill({ status: 400, json: { error: 'Invalid request format' } });
      checked.push(endpoint);
      return route.fallback();
    });
    await page.goto('/');
    await page.getByRole('button', { name: 'RESUME GAME', exact: true }).click();
    await expect(page.getByRole('region', { name: 'Opening narration', exact: true })).toContainText(archive.storyText);
    if (location === 'Maple Lane') await page.screenshot({ path: info.outputPath('fright-opening-recovered.png') });
    await page.getByRole('button', { name: 'WON', exact: true }).first().click();
    await page.getByRole('button', { name: 'Generate ending', exact: true }).click();
    await expect(page.getByRole('region', { name: 'Ending narration', exact: true })).toContainText(archive.endingText);
    if (location === 'Maple Lane') await page.screenshot({ path: info.outputPath('fright-ending-recovered.png') });
    expect(checked).toEqual(['generate-story', 'generate-ending']);
  });
}

for (const killer of ['The Tormentor', 'Evomorph']) {
  test(`${killer} ending request carries observed turning points after reload`, async ({ page, archive }) => {
    const location = killer === 'The Tormentor' ? 'Marrek Warehouse' : 'USS Konrad';
    const playEvents: PlayEvent[] = [event({ kind: 'start', saved: 0, killed: 0, round: 1 })];
    if (killer === 'The Tormentor') {
      playEvents.push(event({ kind: 'module', moduleData: { module: 'tormentor', changes: initialTormentor() } }));
      const commands = [{ command: 'add', id: 'electric-cage', subject: 'Laurie', space: null }, ...Array.from({ length: 3 }, () => ({ command: 'task', id: 'electric-cage' }))];
      for (const command of commands) {
        const entries = summarizePlay(playEvents).entries;
        const action = { ...command, parent: tormentorParent(entries) } as TormentorAction;
        const changes = resolveTormentorAction(action, moduleState(entries, 'tormentor'), entries)!;
        playEvents.push(event({ kind: 'module', moduleData: { module: 'tormentor', changes }, tormentorAction: action }));
      }
    } else {
      playEvents.push(event({ kind: 'module', moduleData: { module: 'konrad', changes: initialKonrad() } }));
      for (const active of [true, false]) {
        const entries = summarizePlay(playEvents).entries;
        const action = { command: 'toggle' as const, target: 'system:self-destruct', active, parent: konradParent(entries) };
        const changes = resolveKonradAction(action, moduleState(entries, 'konrad'), entries)!;
        playEvents.push(event({ kind: 'module', moduleData: { module: 'konrad', changes }, konradAction: action }));
      }
    }
    playEvents.push(event({ kind: 'state', field: 'finalGirlHealth', value: 0 }));
    await archive.install(page, { draft: { ...activeGame, playMode: true, selection: { ...activeGame.selection, killer, location }, playEvents } });
    let context = '';
    await page.route('**/functions/v1/generate-ending', async route => {
      if (route.request().method() === 'POST') {
        const body = route.request().postDataJSON();
        expect(schemas.EndingRequestSchema.safeParse(body).success).toBe(true);
        context = body.playSummary;
      }
      return route.fallback();
    });
    await page.goto('/');
    await page.reload();
    await page.getByRole('button', { name: 'RESUME GAME', exact: true }).click();
    await page.getByRole('button', { name: 'LOST', exact: true }).first().click();
    await page.getByRole('button', { name: 'Generate ending', exact: true }).click();
    await expect(page.getByRole('region', { name: 'Ending narration', exact: true })).toContainText(archive.endingText);
    expect(context).toContain(killer === 'The Tormentor' ? 'Final Girl escaped: Electric Cage' : 'observed on in round 1, then observed off in round 1');
    expect(context.length).toBeLessThanOrEqual(1800);
  });
}
