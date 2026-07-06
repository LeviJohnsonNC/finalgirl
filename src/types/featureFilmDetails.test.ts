import { describe, it, expect } from "vitest";
import { 
  FEATURE_FILM_DETAILS, 
  getFilmDetails, 
  getSetupCardsForLocation, 
  getEventsForLocation 
} from "./featureFilmDetails";

describe("FEATURE_FILM_DETAILS data", () => {
  it("contains Season 1 films", () => {
    expect(FEATURE_FILM_DETAILS['s1-camp-happy-trails']).toBeDefined();
    expect(FEATURE_FILM_DETAILS['s1-creech-manor']).toBeDefined();
    expect(FEATURE_FILM_DETAILS['s1-maple-lane']).toBeDefined();
    expect(FEATURE_FILM_DETAILS['s1-carnival-of-blood']).toBeDefined();
    expect(FEATURE_FILM_DETAILS['s1-sacred-groves']).toBeDefined();
  });

  it("contains Season 2 films", () => {
    expect(FEATURE_FILM_DETAILS['s2-into-the-void']).toBeDefined();
    expect(FEATURE_FILM_DETAILS['s2-knock-at-door']).toBeDefined();
  });

  it("each film has required structure", () => {
    for (const [filmId, detail] of Object.entries(FEATURE_FILM_DETAILS)) {
      expect(detail.filmId).toBe(filmId);
      expect(detail.finalGirls).toBeDefined();
      expect(detail.finalGirls.length).toBeGreaterThanOrEqual(1);
      if (detail.isVignette) {
        // Vignettes have no location by design (location? is optional in the
        // type); they describe their setting via vignetteDescription.
        expect(detail.vignetteDescription).toBeTruthy();
      } else {
        expect(detail.location).toBeDefined();
        expect(detail.location!.name).toBeTruthy();
      }
      expect(detail.killer).toBeDefined();
      expect(detail.killer.name).toBeTruthy();
    }
  });

  it("final girls have backstories", () => {
    const campHappyTrails = FEATURE_FILM_DETAILS['s1-camp-happy-trails'];
    for (const fg of campHappyTrails.finalGirls) {
      expect(fg.name).toBeTruthy();
      expect(fg.backstory).toBeTruthy();
      expect(fg.backstory.length).toBeGreaterThan(50);
    }
  });

  it("locations have setup cards and events", () => {
    const campHappyTrails = FEATURE_FILM_DETAILS['s1-camp-happy-trails'];
    expect(campHappyTrails.location.setupCards.length).toBeGreaterThan(0);
    expect(campHappyTrails.location.events.length).toBeGreaterThan(0);
    
    // Check setup card structure
    const firstSetupCard = campHappyTrails.location.setupCards[0];
    expect(firstSetupCard.name).toBeTruthy();
    expect(firstSetupCard.description).toBeTruthy();
    
    // Check event structure
    const firstEvent = campHappyTrails.location.events[0];
    expect(firstEvent.name).toBeTruthy();
    expect(firstEvent.description).toBeTruthy();
  });
});

describe("getFilmDetails", () => {
  it("returns details for existing film ID", () => {
    const result = getFilmDetails('s1-camp-happy-trails');
    expect(result).toBeDefined();
    expect(result?.filmId).toBe('s1-camp-happy-trails');
    expect(result?.killer.name).toBe('Hans');
    expect(result?.location.name).toBe('Camp Happy Trails');
  });

  it("returns undefined for non-existent film ID", () => {
    const result = getFilmDetails('non-existent-film');
    expect(result).toBeUndefined();
  });

  it("returns undefined for empty string", () => {
    const result = getFilmDetails('');
    expect(result).toBeUndefined();
  });

  it("returns complete final girl data", () => {
    const result = getFilmDetails('s1-maple-lane');
    expect(result?.finalGirls).toHaveLength(2);
    
    const nancy = result?.finalGirls.find(fg => fg.name === 'Nancy');
    expect(nancy).toBeDefined();
    expect(nancy?.backstory).toContain('Nancy Lang');
  });
});

describe("getSetupCardsForLocation", () => {
  it("returns setup cards for valid film ID", () => {
    const cards = getSetupCardsForLocation('s1-camp-happy-trails');
    expect(cards.length).toBeGreaterThan(0);
    expect(cards[0].name).toBeTruthy();
    expect(cards[0].description).toBeTruthy();
  });

  it("returns specific setup cards for Camp Happy Trails", () => {
    const cards = getSetupCardsForLocation('s1-camp-happy-trails');
    const cardNames = cards.map(c => c.name);
    expect(cardNames).toContain('Capture the Flag');
    expect(cardNames).toContain('Skinny Dipping');
    expect(cardNames).toContain('The Bonfire');
  });

  it("returns empty array for non-existent film ID", () => {
    const cards = getSetupCardsForLocation('non-existent');
    expect(cards).toEqual([]);
  });
});

describe("getEventsForLocation", () => {
  it("returns events for valid film ID", () => {
    const events = getEventsForLocation('s1-camp-happy-trails');
    expect(events.length).toBeGreaterThan(0);
    expect(events[0].name).toBeTruthy();
    expect(events[0].description).toBeTruthy();
  });

  it("returns specific events for Maple Lane", () => {
    const events = getEventsForLocation('s1-maple-lane');
    const eventNames = events.map(e => e.name);
    expect(eventNames).toContain('Boyfriend');
    expect(eventNames).toContain('Fire!');
  });

  it("returns empty array for non-existent film ID", () => {
    const events = getEventsForLocation('non-existent');
    expect(events).toEqual([]);
  });
});

describe("Season 2 - A Knock at the Door", () => {
  it("has complete details for Knock at the Door", () => {
    const details = getFilmDetails('s2-knock-at-door');
    expect(details).toBeDefined();
    expect(details?.killer.name).toBe('The Intruders');
    expect(details?.location.name).toBe('Wingard Cottage');
  });

  it("has Ginny and Ava as final girls", () => {
    const details = getFilmDetails('s2-knock-at-door');
    const names = details?.finalGirls.map(fg => fg.name);
    expect(names).toContain('Ginny');
    expect(names).toContain('Ava');
  });

  it("has backstories for both final girls", () => {
    const details = getFilmDetails('s2-knock-at-door');
    const ginny = details?.finalGirls.find(fg => fg.name === 'Ginny');
    const ava = details?.finalGirls.find(fg => fg.name === 'Ava');
    
    expect(ginny?.backstory).toBeTruthy();
    expect(ava?.backstory).toBeTruthy();
  });
});
