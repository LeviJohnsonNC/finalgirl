import { describe, expect, it } from 'vitest';
import { FEATURE_FILMS } from '@/types/gameData';
import { openingFilmStills } from './openingFilm';
import { filmOffset, framePitch, pullEnd, pullStart } from './openingFilmGeometry';

describe('opening film', () => {
  it('registers three distinct stills for each named catalog location', () => {
    const locations = new Set(FEATURE_FILMS.map(film => film.location).filter(location => location && location !== 'TBD'));
    const files = [...locations].flatMap(openingFilmStills);
    expect(files).toHaveLength(locations.size * 3);
    expect(files.every(Boolean)).toBe(true);
    expect(new Set(files).size).toBe(files.length);
  });

  it('uses neutral leader for a vignette or unknown saved location', () => {
    for (const location of ['', 'TBD', 'Legacy Location']) {
      expect(openingFilmStills(location).every(still => !still)).toBe(true);
    }
  });

  it('pulls forward by one frame and holds through a long wait', () => {
    expect(filmOffset(pullStart)).toBe(-framePitch);
    expect(filmOffset((pullStart + pullEnd) / 2)).toBeCloseTo(-framePitch / 2);
    expect(Math.abs(filmOffset(pullEnd))).toBe(0);
    expect(Math.abs(filmOffset(300))).toBe(0);
  });
});
