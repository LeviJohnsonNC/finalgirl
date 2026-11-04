import { describe, expect, it } from 'vitest';
import { playStoryBeats, summarizePlay, validPlayLog, type PlayEvent } from './events';
import { buildEndingUser } from '../../../supabase/functions/_shared/storyPrompts';

// Synthetic observation logs only: never saved to an account or used as evidence
// of provider prose quality. Deterministic seeds make every failure reproducible.
function simulate(seed: number) {
  let count = 0, random = seed + 1;
  const next = () => { random = (Math.imul(random, 1664525) + 1013904223) >>> 0; return random; };
  const event = (fields: Omit<PlayEvent, 'id' | 'at'>): PlayEvent => ({ ...fields,
    id: `00000000-0000-4000-8000-${String(++count).padStart(12, '0')}`, at: count,
  });
  const log: PlayEvent[] = [event({ kind: 'start', saved: 0, killed: 0, round: seed % 2 ? null : 1 })];
  const wrong = event({ kind: 'killed', quantity: 1, room: 'WRONG-ROOM' });
  log.push(wrong, event({ kind: 'undo', target: wrong.id }));
  log.push(event({ kind: 'moment', momentType: 'girl-revived', text: 'Second wind' }));
  log.push(event({ kind: 'moment', momentType: 'killer-revived', text: 'Back from the dead' }));
  const item = event({ kind: 'moment', momentType: 'item', text: 'Found a weapon', detail: 'WRONG-ITEM' });
  log.push(item, event({ kind: 'details', target: item.id, detail: 'Recorded Fire Axe' }));
  for (let i = 0; i < 80 + seed % 80; i++) {
    switch (next() % 5) {
      case 0: log.push(event({ kind: 'state', field: 'bloodlust', value: next() % 9 })); break;
      case 1: log.push(event({ kind: 'state', field: 'finalHorrorLevel', value: next() % 8 })); break;
      case 2: log.push(event({ kind: 'state', field: 'finalGirlHealth', value: next() % 9 })); break;
      case 3: log.push(event({ kind: 'moment', momentType: 'other', text: `Observation ${i}: ${'A recorded minor detail. '.repeat(5)}` })); break;
      default: if (!(seed % 2)) log.push(event({ kind: 'round' }));
    }
  }
  log.push(event({ kind: 'moment', momentType: 'turning-point', text: 'Recorded escape through the service door' }));
  const death = event({ kind: 'killed', quantity: 3, cause: 'event', victim: 'Recorded camper' });
  log.push(death, event({ kind: 'death-count', target: death.id, delta: -1 }));
  log.push(event({ kind: 'saved', quantity: 2 }));
  return { log, item };
}

describe('synthetic story continuity stress corpus', () => {
  it.each(Array.from({ length: 120 }, (_, seed) => seed))('keeps pivotal facts, corrections and bounds in synthetic game %i', seed => {
    const { log } = simulate(seed), before = JSON.stringify(log);
    expect(validPlayLog(log)).toBe(true);
    const text = playStoryBeats(log, { killer: 'Hans', location: 'Camp Happy Trails' });
    expect(text.length).toBeLessThanOrEqual(1800);
    for (const fact of ['Second wind', 'Back from the dead', 'Recorded Fire Axe', 'Recorded escape', '2 victims killed', 'Saved 2 victims']) expect(text).toContain(fact);
    expect(text).not.toMatch(/WRONG-ROOM|WRONG-ITEM|3 victims killed|Totals corrected/);
    expect(text.indexOf('Second wind')).toBeLessThan(text.indexOf('Back from the dead'));
    expect(text.indexOf('Back from the dead')).toBeLessThan(text.indexOf('Recorded escape'));
    if (seed % 2) expect(text).not.toMatch(/Round \d/);
    expect(playStoryBeats(log)).toBe(playStoryBeats(log));
    expect(JSON.stringify(log)).toBe(before);
    expect(summarizePlay(log)).toMatchObject({ saved: 2, killed: 2 });
  });
  it.each(Array.from({ length: 120 }, (_, seed) => seed))('keeps undo/restore and reviewed outcome precedence in synthetic game %i', seed => {
    const { log, item } = simulate(seed);
    const correction: PlayEvent = { id: 'ffffffff-ffff-4fff-8fff-ffffffffffff', at: 999, kind: 'undo', target: item.id };
    expect(playStoryBeats([...log, correction])).not.toContain('Recorded Fire Axe');
    expect(playStoryBeats([...log, correction, { ...correction, id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', kind: 'restore' }])).toContain('Recorded Fire Axe');
    const facts = { introStory: 'Synthetic opening: Laurie locked the service door.', outcome: seed % 2 ? 'lost' as const : 'won' as const,
      finalGirl: { name: 'Laurie' }, killer: { name: 'Hans' }, location: { name: 'Camp Happy Trails' },
      finalGirlHealth: seed % 2 ? 0 : 1, killerHealth: seed % 2 ? 4 : 0, playSummary: playStoryBeats(log), victimsSaved: 2, victimsKilled: 2,
    };
    const prompt = buildEndingUser(facts);
    expect(prompt).toContain('REVIEWED ENDING FACTS:');
    expect(prompt).toContain(JSON.stringify(facts.outcome));
    expect(prompt).toContain('Second wind');
    expect(prompt).not.toContain('WRONG-ROOM');
  });
});
