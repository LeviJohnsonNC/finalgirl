import { describe, expect, it } from 'vitest';
import { deathPrompt } from '../../../supabase/functions/_shared/deathPrompt';
import { deathSpaceCue } from '../../../supabase/functions/_shared/deathLocation';
import { deathFacts, deathSignature } from './death';
import { newPlayEvent } from './events';

const death = newPlayEvent({ kind: 'killed', quantity: 1, cause: 'hazard', room: 'Lower-left room', text: 'A fall through the window' });
const facts = deathFacts({ killer: 'Hans', location: 'Creech Manor', finalGirl: 'Cassie' }, [
  newPlayEvent({ kind: 'start', saved: 0, killed: 0, round: 2 }), death,
], death.id)!;
describe('death location prose context', () => {
  it.each([
    ['Lower-left room', 'the room'], [' lower-left room ', 'the room'], ['Upper-left room (below Attic)', 'the room'],
    ['Upper-right Window', 'the window'], ['lower-right-window', 'the window'],
    ['Lower-center stairwell', 'the stairwell'], ['Left outside Exit', 'outside'],
    ['Attic', 'Attic'], ['Ballroom', 'Ballroom'],
  ])('offers natural wording for %s without requiring it', (room, expected) => {
    expect(deathSpaceCue('Creech Manor', room)?.suggestedWording).toBe(expected);
  });
  it('preserves free text, owner boundaries and unknown spaces', () => {
    expect(deathSpaceCue('Maple Lane', 'Lower-left room')?.suggestedWording).toBeUndefined();
    expect(deathSpaceCue('Creech Manor', 'Turn left at the window')?.recordedLabel).toBe('Turn left at the window');
    expect(deathSpaceCue('Creech Manor', '')).toBeUndefined();
  });
  it('adds prose guidance without mutating historical facts, causes or cache identity', async () => {
    const before = JSON.stringify(facts), signature = await deathSignature(facts);
    const prompt = deathPrompt(facts, []), payload = JSON.parse(prompt.user);
    expect(payload.recordedFacts).toEqual(facts);
    expect(payload.spaceProseContext.suggestedWording).toBe('the room');
    expect(prompt.system).toContain('Keep the window, stairs or other physical feature when essential');
    expect(prompt.system).toContain('an event/hazard/other cause must not be reassigned to the killer');
    expect(JSON.stringify(facts)).toBe(before);
    expect(await deathSignature(facts)).toBe(signature);
  });
});
