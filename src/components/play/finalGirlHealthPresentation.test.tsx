import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { healthPortraitState, finalGirlHealthPortrait } from './finalGirlHealthPresentation';
import { FinalGirlHealthPortrait } from './FinalGirlHealthPortrait';
import manifest from '@/assets/play/final-girl-health/manifest.json';
import { FEATURE_FILMS } from '@/types/gameData';
import { observedFinalGirlMaxHealth } from '@/data/finalGirlReferences';

afterEach(cleanup);
describe('Final Girl health photographs', () => {
  it.each([
    [undefined, 5, 'original'], [5, undefined, 'original'],
    [0, 5, 'critical'], [1, 5, 'critical'], [2, 5, 'critical'],
    [3, 5, 'original'], [4, 5, 'original'], [5, 5, 'healthy'],
    [7, 4, 'original'], [-1, 5, 'original'], [1.5, 5, 'original'],
  ] as const)('observed %s HP with maximum %s shows %s', (health, maximum, expected) => {
    expect(healthPortraitState(health, maximum)).toBe(expected);
  });

  it('uses the session snapshot, observed Ultimate, Undo and restore without healing', () => {
    const ultimate = { kind: 'moment', momentType: 'ultimate-unlocked', id: 'ultimate' };
    const undo = { kind: 'undo', id: 'undo', target: 'ultimate' };
    const restore = { kind: 'restore', id: 'restore', target: 'ultimate' };
    expect(healthPortraitState(4, observedFinalGirlMaxHealth('Kate', [], 4))).toBe('healthy');
    expect(healthPortraitState(4, observedFinalGirlMaxHealth('Kate', [ultimate], 4))).toBe('original');
    expect(healthPortraitState(7, observedFinalGirlMaxHealth('Kate', [ultimate], 4))).toBe('healthy');
    expect(healthPortraitState(4, observedFinalGirlMaxHealth('Kate', [ultimate, undo], 4))).toBe('healthy');
    expect(healthPortraitState(4, observedFinalGirlMaxHealth('Kate', [ultimate, undo, restore], 4))).toBe('original');
    expect(observedFinalGirlMaxHealth('Kate', [ultimate])).toBeUndefined();
  });

  it('covers every concrete catalog Final Girl with her own two photographs', () => {
    const names = [...new Set(FEATURE_FILMS.flatMap(film => film.finalGirls))].filter(name => name !== 'TBD').sort();
    expect(manifest.map(entry => entry.name).sort()).toEqual(names);
    const paths = new Set<string>();
    for (const name of names) for (const [health, maximum] of [[5, 5], [1, 5]]) {
      const portrait = finalGirlHealthPortrait(name, health, maximum, true);
      expect(portrait, `${name}: ${health} HP`).toBeDefined();
      paths.add(portrait!.src);
    }
    expect(paths.size).toBe(names.length * 2);
    expect(finalGirlHealthPortrait('TBD', 1, 5, true)).toBeUndefined();
    expect(finalGirlHealthPortrait('Cassie', 5, 5, false)).toBeUndefined();
  });

  it('falls back after a failed variant without changing health, and respects official artwork', () => {
    const props = { name: 'Cassie', health: 1, maximum: 5, original: '/cassie-original.png', aiEnabled: true };
    const view = render(<FinalGirlHealthPortrait {...props} />);
    const image = view.container.querySelector('img')!;
    expect(image.dataset.healthPortrait).toBe('critical');
    fireEvent.error(image);
    expect(image.getAttribute('src')).toBe(props.original);
    expect(image.dataset.healthPortrait).toBeUndefined();
    view.rerender(<FinalGirlHealthPortrait {...props} health={5} />);
    expect(image.dataset.healthPortrait).toBe('healthy');
    view.rerender(<FinalGirlHealthPortrait {...props} health={5} aiEnabled={false} />);
    expect(image.getAttribute('src')).toBe(props.original);
    expect(image.dataset.healthPortrait).toBeUndefined();
  });
});
