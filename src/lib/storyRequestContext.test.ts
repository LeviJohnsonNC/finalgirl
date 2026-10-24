import { expect, it, vi } from 'vitest';

vi.mock('https://deno.land/x/zod@v3.22.4/mod.ts', async () => import('zod'));
import { StoryRequestSchema, EndingRequestSchema } from '../../supabase/functions/_shared/validation';
import { getEntityPromptContext, getModulePromptContext } from '@/data/rules/moduleRules';
import { getKillerNarrativeRules } from '@/data/killerSpecialRules';
import { FEATURE_FILMS } from '@/types/gameData';
import { getStoryRequestRules } from './storyRequestContext';

const opening = 'A complete opening with enough characters to maintain continuity.';
const requestFor = (killer: string, location: string) => {
  const { killerRules, locationRules } = getStoryRequestRules(killer, location);
  return {
    killer: { name: killer, specialRules: killerRules },
    location: { name: location, specialRules: locationRules },
    finalGirl: { name: 'Nancy' },
  };
};

it('accepts opening and ending rules for every catalog killer/location combination', () => {
  const killers = [...new Set(FEATURE_FILMS.map(film => film.killer))];
  const locations = [...new Set(FEATURE_FILMS.map(film => film.location).filter(Boolean))];
  for (const killer of killers) for (const location of locations) {
    const request = requestFor(killer, location);
    const label = `${killer} / ${location}`;
    expect(StoryRequestSchema.safeParse(request).success, label).toBe(true);
    expect(EndingRequestSchema.safeParse({ ...request, introStory: opening, outcome: 'won' }).success, label).toBe(true);
  }
});

it('preserves full owner guidance without duplicating location rules under the killer', () => {
  for (const killer of ['Hans', 'Billy the Bear', 'Geppetto', 'Dr. Fright']) {
    for (const location of ['Camp Happy Trails', 'Buddyland', 'Carnival of Blood', 'Maple Lane']) {
      const { killerRules, locationRules } = getStoryRequestRules(killer, location);
      const ownKiller = getEntityPromptContext(killer)!;
      const ownLocation = getEntityPromptContext(location)!;
      for (const text of [getKillerNarrativeRules(killer), ownKiller.rulesSummary, ownKiller.narrativeGuidance])
        expect(killerRules).toContain(text);
      for (const text of [ownLocation.rulesSummary, ownLocation.narrativeGuidance])
        expect(locationRules).toContain(text);
      expect(killerRules).not.toContain(ownLocation.rulesSummary);
      expect(locationRules).not.toContain(ownKiller.rulesSummary);
    }
  }
});

it('covers the previously rejected Dr. Fright payload without weakening server limits', () => {
  const combined = getModulePromptContext('Dr. Fright', 'Maple Lane')!;
  const oldRules = [getKillerNarrativeRules('Dr. Fright'), combined.rulesSummary, combined.narrativeGuidance].join('\n');
  expect(oldRules.length).toBeGreaterThan(3000);
  const request = requestFor('Dr. Fright', 'Maple Lane');
  expect(StoryRequestSchema.safeParse({ ...request, killer: { ...request.killer, specialRules: oldRules } }).success).toBe(false);
  expect(StoryRequestSchema.safeParse(request).success).toBe(true);
});

it('retains legacy killer guidance and leaves absent module references absent', () => {
  expect(getStoryRequestRules('Poltergeist', 'Uncatalogued location')).toEqual({
    killerRules: getKillerNarrativeRules('Poltergeist'), locationRules: undefined,
  });
  expect(getStoryRequestRules('Uncatalogued killer', 'Uncatalogued location')).toEqual({
    killerRules: undefined, locationRules: undefined,
  });
});
