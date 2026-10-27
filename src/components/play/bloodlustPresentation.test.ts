import { describe, expect, it } from "vitest";
import {
  bloodlustBackground,
  verifiedBloodlustMaximum,
} from "./bloodlustPresentation";

describe("photographic Bloodlust progression", () => {
  it.each([
    ["Hans", 10],
    ["Dr. Fright", 9],
    ["Inkanyamba", 8],
    ["Geppetto", 8],
  ] as const)(
    "%s has a distinct photograph for every printed position and reaches the full-intensity image",
    (killer, maximum) => {
      expect(verifiedBloodlustMaximum[killer]).toBe(maximum);
      const levels = Array.from({ length: maximum + 1 }, (_, value) =>
        bloodlustBackground(killer, value),
      );
      expect(new Set(levels.map(({ src }) => src)).size).toBe(maximum + 1);
      expect(
        levels.every(
          ({ src }) => typeof src === "string" && src.endsWith(".webp"),
        ),
      ).toBe(true);
      expect(levels[0].stage).toBe(0);
      expect(levels[maximum].stage).toBe(10);
      expect(levels[maximum].src).toBe(bloodlustBackground("Hans", 10).src);
    },
  );
  it("keeps unknown separate from quiet level zero and safely renders high legacy observations", () => {
    for (const value of [undefined, -1, 1.5, NaN, Infinity])
      expect(bloodlustBackground("Hans", value)).toEqual({
        stage: undefined,
        src: bloodlustBackground("Hans", 0).src,
      });
    expect(bloodlustBackground("Inkanyamba", 99)).toEqual(
      bloodlustBackground("Inkanyamba", 8),
    );
  });
  it("uses a generic progression without claiming a maximum for unverified killers", () => {
    expect(verifiedBloodlustMaximum["Billy the Bear"]).toBeUndefined();
    for (const killer of [
      "Billy the Bear",
      "Poltergeist",
      "constructor",
      "toString",
    ]) {
      const levels = Array.from({ length: 11 }, (_, n) =>
        bloodlustBackground(killer, n),
      );
      expect(new Set(levels.map(({ src }) => src)).size).toBe(11);
      expect(levels[0].stage).toBe(0);
      expect(levels[10].stage).toBe(10);
    }
  });
});
