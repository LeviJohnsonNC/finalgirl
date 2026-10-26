import { describe, expect, it } from "vitest";
import { wrathBackground } from "./wrathPresentation";
import { grovesSite } from "./grovesArt";
import { sacredTokens } from "./sacredSpaceTokens";

describe("observed artwork states", () => {
  it("uses five two-level bands per owner, with a separate unknown state and no borrowed art", () => {
    const sources = new Set<string>();
    for (const kind of ["killer", "divine"] as const) {
      for (let stage = 1; stage <= 5; stage++) {
        const low = wrathBackground(kind, stage * 2 - 1);
        expect(low.stage).toBe(stage);
        expect(wrathBackground(kind, stage * 2)).toEqual(low);
        sources.add(low.src);
      }
      for (const unknown of [undefined, 0, 11, 1.5, NaN])
        expect(wrathBackground(kind, unknown).stage).toBeUndefined();
    }
    expect(sources.size).toBe(10);
  });
  it("addresses all eight combinations independently at each Sacred space, regardless of token ordering", () => {
    const cells = new Set<string>();
    for (let row = 0; row < 3; row++) {
      for (let bits = 0; bits < 8; bits++) {
        const tokens = sacredTokens.filter((_, bit) => bits & (1 << bit));
        const art = grovesSite(row, tokens);
        expect(grovesSite(row, [...tokens].reverse())).toEqual(art);
        expect(art.atlas.x).toBe((bits % 4) * 384 + 3);
        expect(art.atlas.y).toBe(Math.floor(bits / 4) * 384 + 3);
        cells.add(`${art.src}:${art.atlas.x}:${art.atlas.y}`);
      }
    }
    expect(cells.size).toBe(24);
  });
});
