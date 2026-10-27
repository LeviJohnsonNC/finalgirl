import { describe, it, expect } from 'vitest';
import { newPlayEvent as event, summarizePlay, playStoryBeats, isPlayEvent } from './events';
import { moduleState, moduleContext, initialModuleObservations, killerMomentCards } from './modules';
import { deathFacts, deathSignature } from './death';
import { POLTERGEIST_TERRORS, POLTERGEIST_ITEMS, POLTERGEIST_BLOODLUST, resolvePoltergeistAction, poltergeistParent, poltergeistPower, type PoltergeistAction } from '../../../supabase/functions/_shared/play/poltergeist';
import { selectionItems, playItems, applicablePlayCards } from './catalog';
import { playStartingValues } from './defaults';
const selection = { killer: 'Poltergeist', location: 'Camp Happy Trails', finalGirl: 'Laurie' };
const start = () => event({ kind: 'start', saved: 0, killed: 0, round: 1 });
function act(log: ReturnType<typeof event>[], command: PoltergeistAction['command'], key?: string, value?: string | null) {
    const entries = summarizePlay(log).entries;
    const action = { parent: poltergeistParent(entries), command, ...(key && { key }), ...(value !== undefined && { value }) };
    const changes = resolvePoltergeistAction(action, moduleState(entries, 'poltergeist'), entries);
    if (!changes)
        throw new Error('rejected ' + command);
    const e = event({ kind: 'module', moduleData: { module: 'poltergeist', changes }, poltergeistAction: action });
    log.push(e);
    return e;
}
describe('source-backed Poltergeist module', () => {
    it('reconciles all physical faces and independent catalogs', () => {
        expect(POLTERGEIST_TERRORS.reduce((n, c) => n + c.quantity, 0)).toBe(16);
        expect(POLTERGEIST_TERRORS).toHaveLength(12);
        expect(POLTERGEIST_BLOODLUST).toHaveLength(9);
        expect(POLTERGEIST_BLOODLUST[1]).toMatchObject({ horror: 1 });
        expect(POLTERGEIST_BLOODLUST[2]).toMatchObject({ darkPower: true });
        expect(playStartingValues('Poltergeist', 'Laurie').finalHorrorLevel).toBe(3);
        expect(killerMomentCards('Poltergeist', 'dark-power')).toHaveLength(4);
        expect(killerMomentCards('Poltergeist', 'finale')).toHaveLength(3);
        expect(selectionItems(selection)).toHaveLength(playItems(selection.location).length + 2);
        expect(selectionItems({ ...selection, killer: 'Hans' })).toEqual(playItems(selection.location));
        expect(POLTERGEIST_ITEMS[1].effect).toContain('Carolyn?');
        expect(POLTERGEIST_ITEMS[1].effect).not.toContain('ignore the Dark Power');
        expect(applicablePlayCards(selection, 'terror').filter(c => c.killer === 'Poltergeist')).toHaveLength(12);
    });
    it('seeds only explicitly new sessions; legacy absent is unknown', () => {
        expect(moduleState([], 'poltergeist')).toEqual({});
        expect(initialModuleObservations(selection, false).some(m => m.module === 'poltergeist')).toBe(false);
        expect(initialModuleObservations(selection, false, false, false, false, false, false, true)).toContainEqual(expect.objectContaining({ module: 'poltergeist', changes: expect.objectContaining({ carolyn: 'hidden', floppy: 'hidden' }) }));
    });
    it('saves joining and both Minor removals as one reversible observation without victim changes', () => {
        const log = [start()];
        act(log, 'activate-minor', 'psychic-confusion');
        act(log, 'activate-minor', 'unseen-forces');
        const join = act(log, 'join');
        expect(moduleState(summarizePlay(log).entries, 'poltergeist')).toMatchObject({ carolyn: 'with-you', minorsRemoved: true, 'minor.psychic-confusion': 'removed', 'minor.unseen-forces': 'removed' });
        expect(summarizePlay(log)).toMatchObject({ saved: 0, killed: 0 });
        log.push(event({ kind: 'undo', target: join.id }));
        expect(moduleState(summarizePlay(log).entries, 'poltergeist')).toMatchObject({ 'minor.psychic-confusion': 'active', 'minor.unseen-forces': 'active' });
        log.push(event({ kind: 'restore', target: join.id }));
        act(log, 'return');
        expect(moduleState(summarizePlay(log).entries, 'poltergeist')).toMatchObject({ carolyn: 'in-deck', 'minor.psychic-confusion': 'removed' });
    });
    it('rejects stale actions, duplicate joins and illegal Minor activation', () => {
        const log = [start()];
        const stale = { parent: 'root', command: 'join' as const };
        act(log, 'join');
        const es = summarizePlay(log).entries;
        const st = moduleState(es, 'poltergeist');
        expect(resolvePoltergeistAction(stale, st, es)).toBeNull();
        expect(resolvePoltergeistAction({ ...stale, parent: poltergeistParent(es) }, st, es)).toBeNull();
        expect(resolvePoltergeistAction({ parent: poltergeistParent(es), command: 'activate-minor', key: 'unseen-forces' }, st, es)).toBeNull();
    });
    it('makes the Epic requirement conditional and never spends Floppy twice', () => {
        const log = [start(), event({ kind: 'moment', momentType: 'dark-power', text: 'Dark Power', killerCard: 'Forgetting Something?', permanent: true })];
        act(log, 'join');
        let es = summarizePlay(log).entries;
        expect(resolvePoltergeistAction({ parent: poltergeistParent(es), command: 'rescue' }, moduleState(es, 'poltergeist'), es)).toBeNull();
        act(log, 'find-floppy');
        es = summarizePlay(log).entries;
        expect(resolvePoltergeistAction({ parent: poltergeistParent(es), command: 'protect' }, moduleState(es, 'poltergeist'), es)).toBeNull();
        act(log, 'rescue');
        expect(moduleState(summarizePlay(log).entries, 'poltergeist').carolyn).toBe('rescued');
    });
    it('protects against the named Terror only after a known normal reveal; correction does not repeat use', () => {
        const log = [start()];
        act(log, 'join');
        act(log, 'find-floppy');
        let es = summarizePlay(log).entries;
        expect(resolvePoltergeistAction({ parent: poltergeistParent(es), command: 'protect' }, moduleState(es, 'poltergeist'), es)).toBeNull();
        const reveal = event({ kind: 'moment', momentType: 'dark-power', text: 'Dark Power', permanent: true, killerCard: 'Stiff Wind' });
        log.push(reveal);
        act(log, 'protect');
        expect(moduleState(summarizePlay(log).entries, 'poltergeist')).toMatchObject({ floppy: 'removed', carolyn: 'with-you' });
        log.push(event({ kind: 'details', target: reveal.id, killerCard: '' }));
        es = summarizePlay(log).entries;
        expect(poltergeistPower(es)).toMatchObject({ revealed: true, known: false });
        expect(moduleState(es, 'poltergeist').floppy).toBe('removed');
    });
    it('keeps old death fingerprints and uses state at the death instead of later rescue', async () => {
        const death = event({ kind: 'killed', quantity: 1, cause: 'killer' });
        const log = [start(), death];
        const old = deathFacts(selection, log, death.id)!;
        const hash = await deathSignature(old);
        expect(old).not.toHaveProperty('moduleContext');
        act(log, 'join');
        expect(await deathSignature(deathFacts(selection, log, death.id)!)).toBe(hash);
        const next = event({ kind: 'killed', quantity: 1, cause: 'terror', terrorCard: 'Corporeal Form', attacker: 'Behemoth' });
        log.push(next);
        expect(deathFacts(selection, log, next.id)?.moduleContext?.poltergeist).toMatchObject({ carolyn: 'with-you' });
        expect(deathFacts({ ...selection, killer: 'Hans' }, log, next.id)).toBeNull();
    });
    it('keeps rescue and location facts within mixed-owner context budgets', () => {
        for (const location of ['Sacred Groves', 'Maple Lane', 'Carnival of Blood', 'Buddyland', 'Camp Happy Trails']) {
            const log = [start(), event({ kind: 'moment', momentType: 'dark-power', text: 'Dark Power', killerCard: 'Forgetting Something?', permanent: true })];
            for (const m of initialModuleObservations({ ...selection, location }, false, true, true, true, false, true))
                log.push(event({ kind: 'module', moduleData: m }));
            act(log, 'join');
            act(log, 'find-floppy');
            act(log, 'rescue');
            const text = playStoryBeats(log, { ...selection, location });
            expect(text.length).toBeLessThanOrEqual(1800);
            expect(text).toContain('Carolyn: rescued');
            expect(text).toContain('Epic requires both');
            expect(moduleContext({ ...selection, location }, summarizePlay(log).entries)?.poltergeist).toMatchObject({ carolyn: 'rescued' });
        }
    });
    it('rejects invented state names and malformed actions', () => {
        expect(isPlayEvent({ ...start(), kind: 'module', moduleData: { module: 'poltergeist', changes: { carolyn: 'killed' } } })).toBe(false);
        expect(isPlayEvent({ ...start(), kind: 'module', moduleData: { module: 'poltergeist', changes: { carolyn: 'with-you' } }, poltergeistAction: { parent: 'root', command: 'attack' } })).toBe(false);
    });
});
it('does not accept a join with omitted Minor cleanup or arbitrary uncommanded observations', () => {
    const e = { ...start(), kind: 'module', moduleData: { module: 'poltergeist', changes: { carolyn: 'with-you' } }, poltergeistAction: { command: 'join', parent: 'root' } };
    expect(isPlayEvent(e)).toBe(false);
    expect(isPlayEvent({ ...e, poltergeistAction: undefined })).toBe(false);
    expect(playStartingValues('Poltergeist', 'Laurie')).not.toHaveProperty('killerHealth');
});
