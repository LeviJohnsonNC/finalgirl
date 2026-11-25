import { expect, it, vi } from 'vitest';

vi.mock('https://deno.land/x/zod@v3.22.4/mod.ts', async () => import('zod'));
import { StoryRequestSchema, EndingRequestSchema } from '../../supabase/functions/_shared/validation';
import { getEntityPromptContext, getModulePromptContext } from '@/data/rules/moduleRules';
import { getKillerNarrativeRules } from '@/data/killerSpecialRules';
import { FEATURE_FILMS } from '@/types/gameData';
import { OPENING_DIRECTIONS } from '../../supabase/functions/_shared/narrativeStyle';
import { openingSystemForTake } from '../../supabase/functions/_shared/storyPrompts';
import { getStoryRequestRules, openingRotation } from './storyRequestContext';

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
  for (const killer of ['Hans', 'Billy the Bear', 'Geppetto', 'Dr. Fright','Poltergeist','Evomorph']) {
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

it('combines Ratchet Lady guidance and leaves absent module references absent', () => {
  expect(getStoryRequestRules('Ratchet Lady', 'Uncatalogued location')).toEqual({
    killerRules: expect.stringContaining(getKillerNarrativeRules('Ratchet Lady')!), locationRules: undefined,
  });
  expect(getStoryRequestRules('Uncatalogued killer', 'Uncatalogued location')).toEqual({
    killerRules: undefined, locationRules: undefined,
  });
});

it('accepts a bounded owner-specific rescue review without weakening other request fields',()=>{
 const review={carolynRescued:true,floppyAtEscape:null,epicRequired:null};
 const valid={...requestFor('Poltergeist','Sacred Groves'),introStory:opening,outcome:'won',poltergeistReview:review};
 expect(EndingRequestSchema.safeParse(valid).success).toBe(true);
 expect(EndingRequestSchema.safeParse({...valid,killer:{name:'Hans'}}).success).toBe(false);
 expect(EndingRequestSchema.safeParse({...valid,poltergeistReview:{...review,carolynRescued:false}}).success).toBe(false);
 expect(EndingRequestSchema.safeParse({...valid,playSummary:'x'.repeat(1801)}).success).toBe(false);
});


it('cycles each discovery direction once per owner and pairing, including abandoned games', () => {
  const random = vi.spyOn(Math, 'random').mockReturnValue(0);
  try {
    const opening = () => openingRotation('replay-user', 'The Hunter', 'Sunnydaze Mall');
    const prompts = new Set<string>();
    for (let take = 0; take < OPENING_DIRECTIONS.length; take++) {
      const rotation = opening();
      expect(rotation.take).toBe(take);
      expect(opening().take).toBe(take); // A draft that failed to save consumes no turn.
      const parsed = StoryRequestSchema.parse({ ...requestFor('The Hunter', 'Sunnydaze Mall'), openingTake: take });
      prompts.add(openingSystemForTake(parsed.openingTake));
      rotation.remember();
    }
    expect(prompts.size).toBe(OPENING_DIRECTIONS.length);
    expect(opening().take).toBe(0);
    opening().remember();
    expect(opening().take).toBe(1);
    expect(openingRotation('another-user', 'The Hunter', 'Sunnydaze Mall').take).toBe(0);
    expect(openingRotation('replay-user', 'The Hunter', 'Falconwood').take).toBe(0);
    expect(openingSystemForTake()).toBe(openingSystemForTake(0)); // Legacy client.
  } finally {
    random.mockRestore();
    localStorage.removeItem('final-girl-opening-take-v1:' + JSON.stringify(['replay-user', 'The Hunter', 'Sunnydaze Mall']));
  }
});
