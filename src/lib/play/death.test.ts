import { describe, it, expect } from 'vitest';
import { deathFacts, deathSignature } from './death';
import { newPlayEvent } from './events';
const selection = {
  killer: 'Billy the Bear',
  location: 'Camp Happy Trails',
  finalGirl: 'Rena',
};
describe('death identity and factual context', () => {
  it('uses the selected location and cause, ignores later unrelated taps, and excludes undone deaths', async () => {
    const start = newPlayEvent({
      kind: 'start',
      saved: 0,
      killed: 0,
      round: 3,
    });
    const death = newPlayEvent({ kind: 'killed', quantity: 2, cause: 'event' });
    const log = [start, death];
    const facts = deathFacts(selection, log, death.id)!;
    expect(facts).toMatchObject({
      killer: 'Billy the Bear',
      location: 'Camp Happy Trails',
      quantity: 2,
      cause: 'event',
      room: '',
      victim: '',
      round: 3,
    });
    expect(await deathSignature(facts)).toBe(
      await deathSignature(
        deathFacts(
          selection,
          [...log, newPlayEvent({ kind: 'round' })],
          death.id,
        )!,
      ),
    );
    expect(
      deathFacts(
        selection,
        [...log, newPlayEvent({ kind: 'undo', target: death.id })],
        death.id,
      ),
    ).toBeNull();
  });
  it('invalidates a cached scene when the player corrects the recorded details', async () => {
    const start = newPlayEvent({
      kind: 'start',
      saved: 0,
      killed: 0,
      round: null,
    });
    const death = newPlayEvent({ kind: 'killed', quantity: 1 });
    const log = [start, death];
    const before = await deathSignature(deathFacts(selection, log, death.id)!);
    const updated = deathFacts(
      selection,
      [
        ...log,
        newPlayEvent({
          kind: 'details',
          target: death.id,
          room: 'Kitchen',
          cause: 'hazard',
          text: 'Collapse',
        }),
      ],
      death.id,
    )!;
    expect(updated).toMatchObject({
      room: 'Kitchen',
      cause: 'hazard',
      note: 'Collapse',
    });
    expect(await deathSignature(updated)).not.toBe(before);
  });
});
