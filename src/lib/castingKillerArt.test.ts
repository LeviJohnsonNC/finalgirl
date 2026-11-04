import { describe, expect, it } from 'vitest';
import { CHARACTER_IMAGES_AI } from '@/types/gameData';
import { castingKillerArt } from './castingKillerArt';

describe('casting killer artwork', () => {
  it('uses new casting photographs only for the corresponding photographic identity', () => {
    const original = CHARACTER_IMAGES_AI.Poltergeist;
    expect(castingKillerArt('Poltergeist', original, 'picker')).toMatchObject({
      src: expect.stringMatching(/casting-killers\/poltergeist\.webp$/),
      portrait: true,
    });
    for (const source of ['/official/poltergeist.png', '/custom/poltergeist.png']) {
      expect(castingKillerArt('Poltergeist', source, 'picker')).toEqual({ src: source });
    }
  });

  it('preserves the original image for focal-point corrections and approved portraits', () => {
    const evomorph = CHARACTER_IMAGES_AI.Evomorph;
    expect(castingKillerArt('Evomorph', evomorph, 'slot')).toEqual({
      src: evomorph, style: { objectPosition: '16% 50%' },
    });
    for (const name of ['Big Bad Wolf', 'Billy the Bear', 'Hans', 'Inkanyamba', 'Ratchet Lady', 'The Tormentor']) {
      expect(castingKillerArt(name, CHARACTER_IMAGES_AI[name], 'picker')).toEqual({ src: CHARACTER_IMAGES_AI[name] });
    }
  });
});
