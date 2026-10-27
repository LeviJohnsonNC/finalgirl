import { describe, expect, it } from 'vitest';
import { FEATURE_FILMS } from '@/types/gameData';
import { getFinalGirlDescription } from './finalGirlDescriptions';
import { reviewedFinalGirlIdentity, resolveFinalGirlIdentity } from '../../supabase/functions/_shared/finalGirlIdentity';
import { openingReferenceNames } from '../../supabase/functions/_shared/openingReferences';

// Independent anchors from visual inspection of the selected photographs.
const portraitAnchors = {
  Cassie: ['medium-brown skin', 'brown eyes', 'wavy black hair', 'nostril hoop', 'septum ring', 'purple hoodie'],
  Mandy: ['fair skin', 'blue eyes', 'dark chin-length hair', 'black mesh athletic top', 'black athletic hand wraps'],
  Alice: ['fair freckled skin', 'green eyes', 'wavy copper-red hair', 'green short-sleeved V-neck T-shirt'],
  Selena: ['medium-brown skin', 'brown eyes', 'tightly textured hair', 'high round bun', 'yellow athletic tank top'],
};

describe('selected Final Girl appearance descriptions', () => {
  it('covers every named catalogued Final Girl with text and her own reference', () => {
    const names = new Set(FEATURE_FILMS.flatMap(film => film.finalGirls).filter(name => name !== 'TBD'));
    expect(names.size).toBeGreaterThan(30);
    for (const name of names) {
      expect(getFinalGirlDescription(name), name).toBeTruthy();
      expect(openingReferenceNames(name, 'Unknown'), name).toEqual([name]);
    }
  });

  for (const [name, anchors] of Object.entries(portraitAnchors)) it(`${name} matches her selected portrait in the app and edge prompts`, () => {
    const description = getFinalGirlDescription(name)!;
    expect(description).toBe(reviewedFinalGirlIdentity(name));
    expect(resolveFinalGirlIdentity(name, 'An obsolete caller description.')).toBe(description);
    for (const anchor of anchors) expect(description).toContain(anchor);
    expect(description).toContain('do not establish injuries');
  });

  it('keeps Cassie and Mandy distinct and leaves other/unknown cast behavior intact', () => {
    expect(getFinalGirlDescription('Cassie')).not.toMatch(/blue eyes|chin-length|mesh athletic|hand wraps/);
    expect(getFinalGirlDescription('Mandy')).not.toMatch(/purple hoodie|septum|medium-brown skin/);
    expect(resolveFinalGirlIdentity('Laurie', 'Her existing supported description.')).toBe('Her existing supported description.');
    for (const name of ['Unknown', '__proto__', 'constructor', 'toString']) {
      expect(reviewedFinalGirlIdentity(name)).toBeUndefined();
      expect(resolveFinalGirlIdentity(name)).toBeUndefined();
    }
  });
});
