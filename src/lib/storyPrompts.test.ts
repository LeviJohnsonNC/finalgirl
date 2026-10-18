import { describe, it, expect } from 'vitest';
import { characterFate, endingFacts } from '../../supabase/functions/_shared/storyFacts';
import { buildEndingUser } from '../../supabase/functions/_shared/storyPrompts';
import { buildBeginningPrompt, buildPosterPrompt, buildShotBriefPrompt, buildVisualBiblePrompt, parseArtPlan } from '../../supabase/functions/_shared/prompts';
import { getKillerNarrativeRules } from '@/data/killerSpecialRules';
import { getKillerDescription } from '@/data/killerDescriptions';

const story = 'Rena left the turquoise pendant on the prize counter. Behind her, the disconnected bear began to move.';
const cases = [
  { name: 'Buddyland victory', killer: 'Billy the Bear', location: 'Buddyland', finalGirl: 'Rena', outcome: 'won', finalGirlHealth: 1, killerHealth: 0 },
  { name: 'Noncombat rescue', killer: 'Poltergeist', location: 'Creech Manor', finalGirl: 'Alice', outcome: 'won', finalGirlHealth: 2, killerHealth: 10 },
  { name: 'Sci-fi defeat', killer: 'Evomorph', location: 'USS Konrad', finalGirl: 'Ellen', outcome: 'lost', finalGirlHealth: 0, killerHealth: 8 },
  { name: 'Mission victory', killer: 'Slayer', location: 'Falconwood', finalGirl: 'Nancy', outcome: 'won', finalGirlHealth: 2, mission: { name: 'Save Your Father', description: 'Help him escape before transport.' } },
  { name: 'Sparse record', killer: 'Dr. Fright', location: 'Maple Lane', finalGirl: 'Nancy', outcome: 'lost' },
  { name: 'Sacrificial victory', killer: 'Hans', location: 'Camp Happy Trails', finalGirl: 'Laurie', outcome: 'won', finalGirlHealth: 0, killerHealth: 0 },
] as const;

describe('reviewed story facts survive every generation handoff', () => {
  for (const scenario of cases) it(scenario.name, () => {
    const context = { ...scenario, story, scenarioRules: getKillerNarrativeRules(scenario.killer) };
    const narrative = buildEndingUser({ ...scenario, introStory: story, killer: { name: scenario.killer }, location: { name: scenario.location }, finalGirl: { name: scenario.finalGirl } });
    const shot = buildShotBriefPrompt(context), poster = buildPosterPrompt(context);
    for (const prompt of [narrative, shot, poster]) {
      expect(prompt).toContain(scenario.killer);
      expect(prompt).toContain(scenario.finalGirl);
      expect(prompt).toContain(scenario.location);
      expect(prompt).toContain(`Final Girl fate: ${characterFate('finalGirlHealth' in scenario ? scenario.finalGirlHealth : undefined)}`);
      expect(prompt).not.toContain('/20');
      if ('mission' in scenario) expect(prompt).toContain('Save Your Father');
    }
    if (scenario.killer === 'Poltergeist') {
      expect(shot).toContain('combat is not possible');
      expect(poster).toContain('combat is not possible');
    }
  });

  it('does not infer deaths from losses, survival from wins, or zero from missing data', () => {
    expect(endingFacts({ outcome: 'won', finalGirlHealth: 0 })).toContain('fate: died');
    expect(endingFacts({ outcome: 'lost', finalGirlHealth: 2 })).toContain('fate: survived');
    expect(endingFacts({ outcome: 'won' })).toContain('fate: unknown');
    expect(endingFacts({ outcome: 'lost' })).toContain('health unrecorded');
  });
  it('keeps names even when visual descriptions are absent; passes identity to continuity planning', () => {
    expect(buildBeginningPrompt({ ...cases[0], story })).toContain('Billy the Bear');
    expect(buildVisualBiblePrompt({ ...cases[0], killerDescription: 'Orange-brown animatronic.', finalGirlDescription: 'Burgundy curls, turquoise pendant.' })).toContain('Burgundy curls');
    expect(getKillerNarrativeRules('Dr. Fright')).toContain('supernatural Dream Doctor');
    expect(getKillerDescription('Dr. Fright')).toContain('milky-white eyes');
  });
});
describe('bounded art planning', () => {
  const plan = { concepts: ['A doorway with a small figure at the far end.', 'A face seen beside a darkened arcade machine.', 'An empty chair beneath a practical ceiling lamp.'], selected: 1, title: 'The Last Birthday', tagline: 'No one gets to go home.' };
  it('chooses one of three complete concepts and returns clean, bounded typography', () => {
    expect(parseArtPlan('```json\n' + JSON.stringify(plan) + '\n```')).toMatchObject({ selected: 1, title: 'THE LAST BIRTHDAY' });
  });
  it('rejects truncated JSON, missing alternatives, invalid selections and overlong typography', () => {
    for (const value of ['{"concepts":', JSON.stringify({ ...plan, concepts: ['one'] }), JSON.stringify({ ...plan, selected: 3 }), JSON.stringify({ ...plan, title: 'A'.repeat(33) }), JSON.stringify({ ...plan, tagline: '' })]) expect(parseArtPlan(value)).toBeNull();
  });
  it('poster direction is stable and never injects random framing', () => {
    const ctx = { ...cases[0], story, shotBrief: plan.concepts[1] };
    expect(buildPosterPrompt(ctx)).toBe(buildPosterPrompt(ctx));
    expect(buildPosterPrompt(ctx)).toContain(plan.concepts[1]);
  });
});
