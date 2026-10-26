import { expect, it } from "vitest";
import { modulePhoto, sacredPhoto } from "./modulePhotos";
import { illustratedKillerCards } from "./killerPresentation";
it("ships a separate wide photograph for every supported killer card and Minor Power", () => {
  const all = new Set<string>();
  for (const [killer, count] of [
    ["Inkanyamba", 9],
    ["Hans", 9],
    ["Billy the Bear", 10],
    ["Geppetto", 9],
    ["Dr. Fright", 9],
  ] as const) {
    for (let index = 0; index < count; index++) {
      const photo = modulePhoto(killer, index);
      expect(photo?.src).toMatch(/photos\//);
      expect(photo?.fit).toBe("slice");
      all.add(photo!.src);
    }
    for (const type of ["dark-power", "finale"] as const)
      for (const card of illustratedKillerCards(killer, type)) {
        expect(card.heroArt?.src).toMatch(/photos\//);
        expect(card.art).toEqual(card.heroArt);
      }
  }
  expect(all.size).toBe(46);
  expect(modulePhoto("Unsupported", 0)).toBeUndefined();
});
it("ships all 24 Sacred-space combinations as distinct full-width photographs", () => {
  const all = new Set<string>();
  for (let row = 0; row < 3; row++)
    for (let bits = 0; bits < 8; bits++) {
      const art = sacredPhoto(row, bits);
      expect(art.src).toMatch(/photos\/groves-/);
      expect(art.atlas).toBeUndefined();
      expect(art.fit).toBe("slice");
      all.add(art.src);
    }
  expect(all.size).toBe(24);
});
