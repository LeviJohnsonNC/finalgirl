import { FICTION_BOUNDARY, hasMechanicalShotLeak } from '../../supabase/functions/_shared/fictionBoundary';
import { openingReferenceNames } from '../../supabase/functions/_shared/openingReferences';
import { describe, it, expect } from 'vitest';
import { characterFate, endingFacts } from '../../supabase/functions/_shared/storyFacts';
import { buildOpeningUser, buildEndingUser, OPENING_SYSTEM, ENDING_SYSTEM } from '../../supabase/functions/_shared/storyPrompts';
import { NARRATIVE_QUANTITIES } from '../../supabase/functions/_shared/narrativeStyle';
import { deathPrompt } from '../../supabase/functions/_shared/deathPrompt';
import { deathFacts } from './play/death';
import { newPlayEvent } from './play/events';
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
  it('lets every narrative omit statistical recaps while retaining exact reviewed quantities and death scope', () => {
    const context = { ...cases[0], story };
    const start = newPlayEvent({ kind: 'start', saved: 7, killed: 6, round: 11 });
    const event = newPlayEvent({ kind: 'killed', quantity: 2, cause: 'event' });
    const death = deathPrompt(deathFacts(context, [start, event], event.id)!, []);
    for (const system of [OPENING_SYSTEM, ENDING_SYSTEM, death.system, buildShotBriefSystem(context)]) {
      expect(system).toContain(NARRATIVE_QUANTITIES);
      expect(system).toContain('Use an exact number only when');
      expect(system).toContain('Never invent, round or contradict a recorded quantity');
    }
    expect(JSON.parse(death.user).recordedFacts.quantity).toBe(2);
    expect(death.system).toContain('Exactly the recorded quantity dies');
    const user = buildEndingUser({ ...context, introStory: story, victimsSaved: 7, victimsKilled: 6, roundsPlayed: 11 });
    expect(user).toContain('"victimsSaved": 7');
    expect(user).toContain('"victimsKilled": 6');
    expect(user).toContain('"roundsPlayed": 11');
    expect(user).toContain('Final Girl fate: survived');
  });
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
      expect(photo).toContain('believable live-action photograph');
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
  it('applies the same physical photographic contract to planning and rendering without importing the example scene', () => {
    for (const cast of [
      { killer:'Inkanyamba', finalGirl:'Barbara', location:'Sacred Groves' },
      { killer:'Billy the Bear', finalGirl:'Rena', location:'Buddyland' },
      { killer:'Dr. Fright', finalGirl:'Nancy', location:'Camp Happy Trails' },
    ]) {
      const ctx = { ...cast, story:'A figure pauses beside the doorway.', sceneType:'beginning' as const, shotBrief:'A figure pauses beside the doorway under an ordinary ceiling lamp.' };
      for (const prompt of [buildShotBriefSystem(ctx),buildBeginningPrompt(ctx)]) {
        expect(prompt).toContain('single exposure');
        expect(prompt).toContain('camera distance, focus and light');
        expect(prompt).toContain('only where the scene supports them');
        expect(prompt).toContain('same exposure, white balance');
        expect(prompt).toContain('consumer 35mm color-negative film camera');
        expect(prompt).toContain('follow the scene for its historical period');
        expect(prompt).toContain('No decorative scratches');
        expect(prompt).toContain('cannot disguise synthetic anatomy or materials');
        expect(prompt).not.toMatch(/orange juice|Minute Maid|foreground axe|Sacred Groves map/);
      }
      const photo = buildBeginningPrompt(ctx);
      for (const name of Object.values(cast)) expect(photo).toContain(name);
      expect(photo).toContain(ctx.shotBrief);
      const poster = buildPosterPrompt({...ctx,sceneType:'ending'});
      expect(poster).toContain('Visibly hand-painted');
      expect(poster).not.toContain('consumer 35mm color-negative film camera');
    }
  });
  it('keeps existing identity continuity while overriding inherited photographic processing instructions', () => {
    const record = JSON.stringify({finalGirl:'Brown curls and a blue rain jacket.',killer:'Carved wooden mask and a feather mantle.',location:'Stone paths and tropical foliage.',palette:'Heavy teal/orange grading with artificial glow.'});
    const ctx = {killer:'Inkanyamba',finalGirl:'Barbara',location:'Sacred Groves',story,sceneType:'beginning' as const,visualBible:record};
    const photo = buildBeginningPrompt(ctx);
    expect(photo).toContain(record);
    expect(photo).toContain('ignore inherited rendering-style, exposure and color-grading directions');
    expect(VISUAL_BIBLE_SYSTEM).toContain('not a mandatory global tint or color-grading recipe');
    expect(photo).toContain('no invented casualties, injuries, rescues, powers, weapons or defeated threat');
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

describe('physical fiction and selected heroine identity',()=>{
 for (const [finalGirl, anchor] of [['Cassie', 'purple hoodie'], ['Mandy', 'black athletic hand wraps'], ['Alice', 'wavy copper-red hair'], ['Selena', 'high round bun']]) {
  it(`uses ${finalGirl}'s reviewed identity despite stale client text and continuity`, () => {
   const visualBible = JSON.stringify({ finalGirl: 'STALE_IDENTITY: a generic pale fighter in a mesh shirt.', killer: 'A masked figure in heavy work clothes.', location: 'A warehouse with steel doors and concrete floors.', palette: 'Grey concrete and amber practical lamps.' });
   const ctx = { finalGirl, killer: 'Hans', location: 'Marrek Warehouse', story: 'A woman stopped at the locked warehouse door.', finalGirlDescription: 'CROSSED_CALLER_DESCRIPTION', visualBible };
   expect(buildVisualBiblePrompt(ctx)).toContain(anchor);
   expect(buildVisualBiblePrompt(ctx)).not.toContain('CROSSED_CALLER_DESCRIPTION');
   for (const sceneType of ['beginning', 'ending'] as const) {
    const context = { ...ctx, sceneType, outcome: 'won' as const, finalGirlHealth: 2 };
    for (const prompt of [buildShotBriefPrompt(context), sceneType === 'beginning' ? buildBeginningPrompt(context) : buildPosterPrompt(context)]) {
     expect(prompt).toContain(getFinalGirlDescription(finalGirl)!);
     expect(prompt).toContain('CAST IDENTITY LOCK: The selected Final Girl is ' + finalGirl);
     expect(prompt).toContain('override contradictory old continuity');
     expect(prompt).not.toMatch(/CROSSED_CALLER_DESCRIPTION|STALE_IDENTITY/);
     expect(prompt).toContain('Grey concrete and amber practical lamps.');
    }
   }
   expect(ctx.visualBible).toBe(visualBible);
   expect(parseVisualBible(visualBible)).toBe(visualBible);
   const input = { finalGirl: { name: finalGirl, backstory: 'An older biography describes different hair. She trains after work.' }, killer: { name: 'Hans' }, location: { name: 'Marrek Warehouse' } };
   for (const prompt of [buildOpeningUser(input), buildEndingUser({ ...input, introStory: 'A pale fighter waited at the door.', outcome: 'won', finalGirlHealth: 2 })]) {
    expect(prompt).toContain('CURRENT SELECTED FINAL GIRL IDENTITY: ' + finalGirl);
    expect(prompt).toContain(anchor);
    expect(prompt).toContain('overrides conflicting appearance in biography');
    expect(prompt).toContain('She trains after work.');
   }
  });
 }
 it('separates game procedures from physical cast facts without discarding the rules',()=>{const input={killer:{name:'Inkanyamba',specialRules:'Wrath 2'},location:{name:'Sacred Groves',specialRules:'Victim modifier'},finalGirl:{name:'Barbara'},startingEvent:{name:'Fire and Brimstone',description:'Roll a die and place its token'}};const user=buildOpeningUser(input);const [world,constraints]=user.split('NON-DEPICTABLE GAME CONTEXT');expect(world).not.toContain('Roll a die');expect(constraints).toContain('Roll a die');expect(world).toContain('Barbara');expect(OPENING_SYSTEM).toContain(FICTION_BOUNDARY);expect(ENDING_SYSTEM).toContain(FICTION_BOUNDARY);});
 it('rejects the observed die bowl and card-name placard while allowing independently grounded games and signs',()=>{expect(hasMechanicalShotLeak('She rolls a die into a bowl to determine the token location.','Sacred Groves')).toBe(true);expect(hasMechanicalShotLeak('A note reads Fire and Brimstone.','Sacred Groves')).toBe(true);expect(hasMechanicalShotLeak('She rolls a die into a bowl beside a real gaming table.','MegaBoardGameCon')).toBe(false);expect(hasMechanicalShotLeak('She passes a Welcome Center sign.','Sacred Groves')).toBe(false);});
 it('restores Barbara and Adelaide identity over contaminated legacy prose and continuity on Reshoot',()=>{for(const girl of ['Barbara','Adelaide']){const ctx={killer:'Inkanyamba',finalGirl:girl,location:'Sacred Groves',story:'A generic blonde heroine rolls a die.',finalGirlDescription:getFinalGirlDescription(girl),visualBible:JSON.stringify({finalGirl:'A generic blonde woman in a white blouse.',killer:'A masked figure by trees.',location:'A dice bowl and a Fire and Brimstone placard.',palette:'Natural daylight across stone.'}),shotBrief:'A generic blonde survivor sits by the dice bowl.'};const image=buildBeginningPrompt(ctx);expect(image).toContain('CAST IDENTITY LOCK: The selected Final Girl is '+girl);expect(image).toContain(getFinalGirlDescription(girl)!);expect(image).toContain(FICTION_BOUNDARY);expect(image).toContain('override contradictory old continuity');expect(openingReferenceNames(girl,'Inkanyamba')).toEqual([girl,'Inkanyamba']);}});
});
