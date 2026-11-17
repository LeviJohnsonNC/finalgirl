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
  Sheila: ['medium-brown skin', 'long dark waves worn loose', 'round wire-frame glasses', 'pink sweater', 'cream shearling trim'],
  Kenzie: ['undercut', 'black choker with a silver ring'],
  Julie: ['brow-length bangs', 'light-wash denim jacket'],
};

describe('selected Final Girl appearance descriptions', () => {
  it('covers every named catalogued Final Girl with text and her own reference', () => {
    const names = new Set(FEATURE_FILMS.flatMap(film => film.finalGirls).filter(name => name !== 'TBD'));
    expect(names.size).toBeGreaterThan(30);
    for (const name of names) {
      const appearance = getFinalGirlDescription(name);
      expect(appearance, name).toBeTruthy();
      expect(resolveFinalGirlIdentity(name, 'stale cast'), name).toBe(appearance);
      expect(openingReferenceNames(name, 'Unknown'), name).toEqual([name]);
    }
  });

  for (const [name, anchors] of Object.entries(portraitAnchors)) it(`${name} matches her selected portrait in the app and edge prompts`, () => {
    const description = getFinalGirlDescription(name)!;
    expect(description).toBe(reviewedFinalGirlIdentity(name));
    expect(resolveFinalGirlIdentity(name, 'An obsolete caller description.')).toBe(description);
    for (const anchor of anchors) expect(description).toContain(anchor);
    expect(description).not.toMatch(/blood|cuts|bruises/);
  });

  it('keeps Cassie and Mandy distinct and leaves other/unknown cast behavior intact', () => {
    expect(getFinalGirlDescription('Cassie')).not.toMatch(/blue eyes|chin-length|mesh athletic|hand wraps/);
    expect(getFinalGirlDescription('Mandy')).not.toMatch(/purple hoodie|septum|medium-brown skin/);
    expect(resolveFinalGirlIdentity('Unknown', 'An unlisted cast description.')).toBe('An unlisted cast description.');
    for (const name of ['Unknown', '__proto__', 'constructor', 'toString']) {
      expect(reviewedFinalGirlIdentity(name)).toBeUndefined();
      expect(resolveFinalGirlIdentity(name)).toBeUndefined();
    }
  });
});
