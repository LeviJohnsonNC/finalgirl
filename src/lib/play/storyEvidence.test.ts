import { describe, expect, it } from 'vitest';
import { newPlayEvent as event, playStoryBeats, summarizePlay, validPlayLog, type PlayEvent } from './events';
import { moduleState } from './modules';
import { initialTormentor, resolveTormentorAction, tormentorParent, type TormentorAction } from './tormentor';
import { initialKonrad, konradParent, resolveKonradAction, type KonradAction } from './konrad';
import { fitStoryFacts, fitStoryText } from '../../../supabase/functions/_shared/play/storyText';
import { buildEndingUser, OPENING_SYSTEM } from '../../../supabase/functions/_shared/storyPrompts';

// Synthetic reproductions of failure shapes found in the owner's private export.
// No exported prose, account identifiers or personal-item effects are committed.
const start = () => event({ kind: 'start', saved: 0, killed: 0, round: 1 });
type Command<T> = T extends { parent: string } ? Omit<T, 'parent'> : never;
function traps() {
  const log: PlayEvent[] = [start(), event({ kind: 'module', moduleData: { module: 'tormentor', changes: initialTormentor() } })];
  const act = (command: Command<TormentorAction>) => {
    const entries = summarizePlay(log).entries;
    const action = { ...command, parent: tormentorParent(entries) } as TormentorAction;
    const changes = resolveTormentorAction(action, moduleState(entries, 'tormentor'), entries);
    expect(changes).not.toBeNull();
    const e = event({ kind: 'module', moduleData: { module: 'tormentor', changes: changes! }, tormentorAction: action });
    log.push(e); return e;
  };
  return { log, act, text: () => playStoryBeats(log, { killer: 'The Tormentor', location: 'Marrek Warehouse' }) };
}

describe('real-game narrative failure regressions', () => {
  it('retains a completed Electric Cage escape without manufacturing a rescue or a used item', () => {
    const t = traps();
    t.act({ command: 'add', id: 'electric-cage', subject: 'Mandy', space: null });
    for (let i = 0; i < 3; i++) t.act({ command: 'task', id: 'electric-cage' });
    t.log.push(event({ kind: 'moment', momentType: 'girl-revived', text: 'Second wind' }));
    for (let i = 0; i < 40; i++) t.log.push(event({ kind: 'moment', momentType: 'other', text: `Minor observation ${i}` }));
    const before = JSON.stringify(t.log);
    expect(validPlayLog(t.log)).toBe(true);
    expect(t.text()).toContain('Final Girl escaped: Electric Cage');
    expect(t.text()).toContain('does not establish an Exit rescue');
    expect(t.text()).toContain('Second wind');
    expect(t.text().length).toBeLessThanOrEqual(1800);
    expect(summarizePlay(t.log)).toMatchObject({ saved: 0, killed: 0 });
    expect(JSON.stringify(t.log)).toBe(before);
    expect(playStoryBeats(t.log, { killer: 'Hans', location: 'Marrek Warehouse' })).not.toContain('Electric Cage');
  });
  it('retracts a mistaken escape, respects Undo/restore, and keeps corrections explicit', () => {
    const t = traps(); t.act({ command: 'add', id: 'electric-cage', subject: 'Mandy', space: null });
    t.act({ command: 'task', id: 'electric-cage' }); t.act({ command: 'task', id: 'electric-cage' });
    const complete = t.act({ command: 'task', id: 'electric-cage' });
    t.log.push(event({ kind: 'undo', target: complete.id }));
    expect(t.text()).not.toContain('Final Girl escaped');
    t.log.push(event({ kind: 'restore', target: complete.id }));
    expect(t.text()).toContain('Final Girl escaped');
    t.act({ command: 'task-progress', id: 'electric-cage', value: 2 });
    expect(t.text()).not.toContain('Final Girl escaped');
    t.act({ command: 'task-progress', id: 'electric-cage', value: 3 });
    expect(t.text()).toContain('escape status corrected to escaped: Electric Cage');
    t.act({ command: 'clear', id: 'electric-cage' });
    expect(t.text()).not.toContain('Electric Cage');
  });
  it('does not turn an escaped Victim trap into a saved Victim', () => {
    const t = traps(); t.act({ command: 'add', id: 'temple-drills', subject: 'Victim', space: null });
    t.act({ command: 'task', id: 'temple-drills' }); t.act({ command: 'task', id: 'temple-drills' });
    expect(t.text()).toContain('Victim escaped: Temple Drills');
    expect(summarizePlay(t.log).saved).toBe(0);
  });
  it('keeps both self-destruct observations together without inventing a solar flare, payment or explosion', () => {
    const log: PlayEvent[] = [start(), event({ kind: 'module', moduleData: { module: 'konrad', changes: initialKonrad() } })];
    const act = (command: Command<KonradAction>) => {
      const entries = summarizePlay(log).entries;
      const action = { ...command, parent: konradParent(entries) } as KonradAction;
      const changes = resolveKonradAction(action, moduleState(entries, 'konrad'), entries);
      expect(changes).not.toBeNull();
      const e = event({ kind: 'module', moduleData: { module: 'konrad', changes: changes! }, konradAction: action });
      log.push(e); return e;
    };
    act({ command: 'toggle', target: 'system:self-destruct', active: true });
    log.push(event({ kind: 'round' }));
    const off = act({ command: 'toggle', target: 'system:self-destruct', active: false });
    for (let i = 0; i < 50; i++) log.push(event({ kind: 'moment', momentType: 'other', text: `Routine observation ${i}` }));
    const selection = { killer: 'Evomorph', location: 'USS Konrad' };
    const text = playStoryBeats(log, selection);
    expect(text).toContain('Self Destruct: observed on in round 1, then observed off in round 2');
    expect(text).toContain('Cause and effects unrecorded');
    expect(text).not.toMatch(/solar flare|ship exploded/i);
    expect(text.length).toBeLessThanOrEqual(1800);
    expect(playStoryBeats(log, { ...selection, location: 'Maple Lane' })).not.toContain('Self Destruct');
    log.push(event({ kind: 'undo', target: off.id }));
    expect(playStoryBeats(log, selection)).not.toContain('observed off');
  });
  it('prioritizes an explicit named death over an older roster without changing totals or the source roster', () => {
    const roster = event({ kind: 'module', moduleData: { module: 'buddyland', changes: { 'victim.nick': 'on-board' } } });
    const death = event({ kind: 'killed', quantity: 1, victim: 'Nick the Janitor', cause: 'minion', attacker: 'Boris' });
    const log = [start(), roster, death, ...Array.from({ length: 6 }, () => event({ kind: 'killed', quantity: 1 }))];
    const selection = { killer: 'Billy the Bear', location: 'Buddyland' };
    const text = playStoryBeats(log, selection);
    expect(text).toContain('Nick the Janitor: killed (explicit named death supersedes the earlier roster)');
    expect(text).toContain('by Boris');
    expect(text).not.toContain('Nick the Janitor: on-board');
    expect(moduleState(summarizePlay(log).entries, 'buddyland')['victim.nick']).toBe('on-board');
    expect(summarizePlay(log).killed).toBe(7);
    expect(playStoryBeats([...log, event({ kind: 'undo', target: death.id })], selection)).toContain('Nick the Janitor: on-board');
    const correction = event({ kind: 'details', target: death.id, victim: 'Someone else' });
    expect(playStoryBeats([...log, correction], selection)).toContain('Nick the Janitor: on-board');
  });
  it('qualifies a later incompatible roster rather than inventing a resurrection or silently overwriting it', () => {
    const log = [start(), event({ kind: 'killed', quantity: 1, victim: 'Nick the Janitor' }),
      event({ kind: 'module', moduleData: { module: 'buddyland', changes: { 'victim.nick': 'on-board' } } })];
    const text = playStoryBeats(log, { killer: 'Billy the Bear', location: 'Buddyland' });
    expect(text).toContain('conflicting observations: named death and on-board roster; final fate unconfirmed');
    expect(text).not.toContain('resurrect');
  });
  it('never treats an unspecified death as a named character fate', () => {
    const log = [start(), event({ kind: 'module', moduleData: { module: 'camp', changes: { 'victim.girlfriend': 'in-play' } } }), event({ kind: 'killed', quantity: 3 })];
    expect(playStoryBeats(log, { killer: 'Hans', location: 'Camp Happy Trails' })).not.toContain('explicit named death');
  });
  it('packs complete item facts, retaining the qualification or omitting the whole item', () => {
    const item = 'Found Tool: Can open a door. Finding does not establish use, charges remaining or current inventory.';
    expect(fitStoryFacts([item], item.length - 1)).toBe('');
    expect(fitStoryFacts([item], item.length)).toBe(item);
    expect(fitStoryText('Mr. Floppy: carried. Carolyn: rescued. ' + 'A'.repeat(100), 42)).toBe('Mr. Floppy: carried.\nCarolyn: rescued.');
  });
  it('preserves a late qualification in a player note rather than cutting off the negation', () => {
    const detail = 'A'.repeat(214) + ' but nobody died.';
    const text = playStoryBeats([start(), event({ kind: 'moment', momentType: 'turning-point', text: 'Hull breach', detail })]);
    expect(text).toContain(detail);
    expect(text).not.toContain('…');
  });
  it('keeps reviewed facts above observations and asks for an immediate handoff without a tense switch', () => {
    expect(OPENING_SYSTEM).not.toContain('present-tense problem');
    expect(OPENING_SYSTEM).toContain('consistent narrative tense');
    const text = buildEndingUser({ introStory: 'A past-tense opening.', outcome: 'lost', finalGirlHealth: 0, killerHealth: 4, gameHighlights: 'The final blow missed.', playSummary: 'Earlier: Final Girl Health: 1' });
    expect(text.indexOf('Final Girl fate: died')).toBeLessThan(text.indexOf('Earlier: Final Girl Health: 1'));
    expect(text).toContain('The final blow missed.');
    expect(text).not.toContain('human callback');
  });
});
