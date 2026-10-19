import { describe, it, expect } from 'vitest';
import { characterFate, endingFacts } from '../../supabase/functions/_shared/storyFacts';
import { buildEndingUser } from '../../supabase/functions/_shared/storyPrompts';
import { buildBeginningPrompt, buildPosterPrompt, buildShotBriefPrompt, buildShotBriefSystem, buildVisualBiblePrompt, VISUAL_BIBLE_SYSTEM, parseShotPlan, parseArtPlan, parseVisualBible } from '../../supabase/functions/_shared/prompts';
import { getKillerNarrativeRules } from '@/data/killerSpecialRules';
import { getKillerDescription } from '@/data/killerDescriptions';
import { getFinalGirlDescription } from '@/data/finalGirlDescriptions';
import { getLocationDescription } from '@/data/locationDescriptions';
import { getModulePromptContext } from '@/data/rules/moduleRules';

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
  it('isolates photographic planning from painted poster copy and honors the explicit scene type', () => {
    const ctx = { ...cases[0], story, sceneType: 'beginning' as const };
    const opening = buildShotBriefSystem(ctx);
    expect(opening).toContain('live-action horror film');
    expect(opening).toContain('skin pores');
    expect(opening).not.toMatch(/poster art director|"title"|"tagline"|painted 1980s/);
    expect(buildShotBriefPrompt(ctx)).toContain('OPENING PHOTOGRAPH');
    expect(buildShotBriefPrompt(ctx)).not.toContain('Final Girl fate:');
    const ending = buildShotBriefSystem({ ...ctx, sceneType: 'ending' });
    expect(ending).toContain('painted 1980s one-sheet');
    expect(ending).toContain('"title"');
    expect(ending).not.toContain('MEDIUM LOCK');
    expect(VISUAL_BIBLE_SYSTEM).toContain('medium-neutral');
    expect(VISUAL_BIBLE_SYSTEM).not.toContain('closing painted poster');
  });
  it('keeps real Buddyland identities and a photographic medium across fresh and legacy continuity', () => {
    for (const finalGirl of ['Rena', 'Gwynn']) {
      const ctx = {
        story, killer: 'Billy the Bear', finalGirl, location: 'Buddyland', sceneType: 'beginning' as const,
        killerDescription: getKillerDescription('Billy the Bear'),
        finalGirlDescription: getFinalGirlDescription(finalGirl),
        locationDescription: getLocationDescription('Buddyland'),
        moduleVisualGuidance: getModulePromptContext('Billy the Bear', 'Buddyland')?.visualGuidance,
        visualBible: 'Use painted gouache textures for the same orange-brown mascot and purple clothing.',
        shotBrief: 'A cel-shaded woman at the prize counter, with the bear visible across the arcade.',
      };
      const photo = buildBeginningPrompt(ctx);
      expect(photo).toContain('ultra-photorealistic live-action');
      expect(photo).toContain('real adult performers');
      expect(photo).toContain('a real machine, not a person in a costume');
      expect(photo).not.toContain('Use painted gouache textures');
      expect(photo).toContain('Identity descriptions, continuity notes and shot directions cannot change this medium');
      expect(photo).not.toContain('cartoon welcome');
      expect(photo).toContain('orange-brown');
      expect(photo).toContain(finalGirl === 'Rena' ? 'turquoise pendant' : 'fair freckled skin');
      expect(photo).toContain('Checkerboard flooring');
      expect(photo).not.toContain('\u2014');
      expect(buildPosterPrompt({ ...ctx, sceneType: 'ending' })).toContain('Visibly hand-painted');
    }
  });
  it('rejects observed continuity fragments and reuses only complete bounded records', () => {
    const record = JSON.stringify({ finalGirl: 'Burgundy curls and a turquoise pendant.', killer: 'Orange-brown plush over mechanical joints.', location: 'Checkerboard floor and dusty arcade cabinets.', palette: 'Amber lamps and dim cyan arcade screens.' });
    expect(parseVisualBible(record)).toBe(record);
    for (const fragment of ['Drafting Core Visual Elements:**', 'Shot on high-', '{"finalGirl":"Burgundy curls"', JSON.stringify({ finalGirl: 'Burgundy curls' }), record.replace('Amber lamps and dim cyan arcade screens.', 'x'.repeat(221))]) {
      expect(parseVisualBible(fragment)).toBeUndefined();
      expect(buildBeginningPrompt({ ...cases[0], story, visualBible: fragment })).not.toContain(fragment);
    }
    expect(buildBeginningPrompt({ ...cases[0], story, visualBible: record })).toContain(record);
  });
  it('keeps full rules with the planner and sends only visual direction to opening image generation', () => {
    const ctx = { ...cases[0], story, sceneType: 'beginning' as const, scenarioRules: 'Deactivating a source costs 1 Time.', shotBrief: 'Rena sees the bear through the dusty arcade cabinets.' };
    expect(buildShotBriefPrompt(ctx)).toContain('Deactivating a source costs 1 Time.');
    const image = buildBeginningPrompt(ctx);
    expect(image).toContain(ctx.shotBrief);
    expect(image).not.toContain(ctx.scenarioRules);
    expect(image).not.toContain(story);
  });
  it('composes opening stills for the full 16:9 screen rather than a letterboxed frame', () => {
    const ctx = { killer: 'Billy the Bear', location: 'Buddyland', finalGirl: 'Rena', story, sceneType: 'beginning' as const };
    expect(buildShotBriefPrompt(ctx)).toContain('edge-to-edge 16:9');
    expect(buildBeginningPrompt(ctx)).toContain('no letterboxing, pillarboxing or black bars');
    expect(buildPosterPrompt({ ...ctx, sceneType: 'ending' })).toContain('Portrait 2:3');
  });
  const plan = { concepts: ['A doorway with a small figure at the far end.', 'A face seen beside a darkened arcade machine.', 'An empty chair beneath a practical ceiling lamp.'], selected: 1, title: 'The Last Birthday', tagline: 'No one gets to go home.' };
  it('accepts complete opening shots without requiring or retaining poster copy', () => {
    const shot = { concepts: plan.concepts, selected: 1 };
    expect(parseShotPlan(JSON.stringify(shot))).toEqual(shot);
    expect(parseShotPlan('```json\n' + JSON.stringify(plan) + '\n```')).toEqual(shot);
    expect(parseArtPlan(JSON.stringify(shot))).toBeNull();
    for (const value of ['null', '[]', '{}', '{"concepts":', JSON.stringify({ ...shot, selected: 3 }), JSON.stringify({ ...shot, concepts: ['short'] })]) expect(parseShotPlan(value)).toBeNull();
  });
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
