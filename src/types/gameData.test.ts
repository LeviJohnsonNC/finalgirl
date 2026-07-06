import { describe, it, expect } from "vitest";
import { 
  FEATURE_FILMS, 
  getOwnedContent, 
  getFilmIdByLocation, 
  getFilmIdByKiller, 
  getFilmIdByFinalGirl,
  CHARACTER_IMAGES,
  LOCATION_IMAGES
} from "./gameData";

describe("FEATURE_FILMS data", () => {
  it("contains films for all seasons", () => {
    const seasons = [...new Set(FEATURE_FILMS.map(f => f.season))];
    expect(seasons).toContain(1);
    expect(seasons).toContain(2);
    expect(seasons).toContain(3);
    expect(seasons).toContain(4);
  });

  it("each film has required properties", () => {
    for (const film of FEATURE_FILMS) {
      expect(film.id).toBeTruthy();
      expect(film.name).toBeTruthy();
      expect(film.season).toBeGreaterThanOrEqual(1);
      expect(film.killer).toBeTruthy();
      if (film.isVignette) {
        // Vignettes intentionally have no location and a single final girl.
        expect(film.location).toBe('');
        expect(film.finalGirls).toHaveLength(1);
      } else {
        expect(film.location).toBeTruthy();
        expect(film.finalGirls).toHaveLength(2);
      }
    }
  });

  it("film IDs are unique", () => {
    const ids = FEATURE_FILMS.map(f => f.id);
    const uniqueIds = [...new Set(ids)];
    expect(uniqueIds.length).toBe(ids.length);
  });
});

describe("getOwnedContent", () => {
  it("returns empty arrays for no owned films", () => {
    const result = getOwnedContent([]);
    expect(result.killers).toEqual([]);
    expect(result.locations).toEqual([]);
    expect(result.finalGirls).toEqual([]);
  });

  it("returns correct content for single owned film", () => {
    const result = getOwnedContent(['s1-camp-happy-trails']);
    expect(result.killers).toContain('Hans');
    expect(result.locations).toContain('Camp Happy Trails');
    expect(result.finalGirls).toContain('Laurie');
    expect(result.finalGirls).toContain('Reiko');
  });

  it("returns deduplicated content for multiple films", () => {
    const result = getOwnedContent([
      's1-camp-happy-trails',
      's1-creech-manor',
      's1-maple-lane'
    ]);
    
    expect(result.killers).toHaveLength(3);
    expect(result.locations).toHaveLength(3);
    // 3 films * 2 final girls each = 6 unique final girls
    expect(result.finalGirls).toHaveLength(6);
  });

  it("handles non-existent film IDs gracefully", () => {
    const result = getOwnedContent(['non-existent-film', 's1-camp-happy-trails']);
    expect(result.killers).toHaveLength(1);
    expect(result.killers).toContain('Hans');
  });
});

describe("getFilmIdByLocation", () => {
  it("returns film ID for existing location", () => {
    expect(getFilmIdByLocation('Camp Happy Trails')).toBe('s1-camp-happy-trails');
    expect(getFilmIdByLocation('Creech Manor')).toBe('s1-creech-manor');
    expect(getFilmIdByLocation('Maple Lane')).toBe('s1-maple-lane');
  });

  it("returns null for non-existent location", () => {
    expect(getFilmIdByLocation('Nonexistent Location')).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(getFilmIdByLocation('')).toBeNull();
  });
});

describe("getFilmIdByKiller", () => {
  it("returns film ID for existing killer", () => {
    expect(getFilmIdByKiller('Hans')).toBe('s1-camp-happy-trails');
    expect(getFilmIdByKiller('Dr. Fright')).toBe('s1-maple-lane');
    expect(getFilmIdByKiller('Poltergeist')).toBe('s1-creech-manor');
  });

  it("returns null for non-existent killer", () => {
    expect(getFilmIdByKiller('Unknown Killer')).toBeNull();
  });
});

describe("getFilmIdByFinalGirl", () => {
  it("returns film ID for existing final girl", () => {
    expect(getFilmIdByFinalGirl('Laurie')).toBe('s1-camp-happy-trails');
    expect(getFilmIdByFinalGirl('Reiko')).toBe('s1-camp-happy-trails');
    expect(getFilmIdByFinalGirl('Nancy')).toBe('s1-maple-lane');
    expect(getFilmIdByFinalGirl('Alice')).toBe('s1-creech-manor');
  });

  it("returns null for non-existent final girl", () => {
    expect(getFilmIdByFinalGirl('Unknown Girl')).toBeNull();
  });
});

describe("CHARACTER_IMAGES", () => {
  it("has images for main Season 1 characters", () => {
    expect(CHARACTER_IMAGES['Hans']).toBeTruthy();
    expect(CHARACTER_IMAGES['Laurie']).toBeTruthy();
    expect(CHARACTER_IMAGES['Dr. Fright']).toBeTruthy();
    expect(CHARACTER_IMAGES['Nancy']).toBeTruthy();
    expect(CHARACTER_IMAGES['Poltergeist']).toBeTruthy();
  });

  it("has images for Season 2 characters", () => {
    expect(CHARACTER_IMAGES['Evomorph']).toBeTruthy();
    expect(CHARACTER_IMAGES['Ginny']).toBeTruthy();
    expect(CHARACTER_IMAGES['Ava']).toBeTruthy();
    expect(CHARACTER_IMAGES['The Intruders']).toBeTruthy();
  });
});

describe("LOCATION_IMAGES", () => {
  it("has images for main Season 1 locations", () => {
    expect(LOCATION_IMAGES['Camp Happy Trails']).toBeTruthy();
    expect(LOCATION_IMAGES['Creech Manor']).toBeTruthy();
    expect(LOCATION_IMAGES['Maple Lane']).toBeTruthy();
  });

  it("has images for Season 2 locations", () => {
    expect(LOCATION_IMAGES['USS Konrad']).toBeTruthy();
    expect(LOCATION_IMAGES['Wingard Cottage']).toBeTruthy();
  });
});
