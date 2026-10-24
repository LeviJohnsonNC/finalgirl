import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { z } from 'zod';
import { test, expect, activeGame } from './fixtures';

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
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await expect(page.getByRole('region', { name: 'Ending narration', exact: true })).toContainText(archive.endingText);
    if (location === 'Maple Lane') await page.screenshot({ path: info.outputPath('fright-ending-recovered.png') });
    expect(checked).toEqual(['generate-story', 'generate-ending']);
  });
}
