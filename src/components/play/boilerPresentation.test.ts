import { expect, it } from "vitest";
import {
  boilerGeometry,
  legalDirections,
} from "../../../supabase/functions/_shared/play/fright";
import { boilerFrame, dragPosition } from "./boilerPresentation";

it("reserves complete card travel for every reachable next slide without consulting a deal", () => {
  function check(path: string) {
    const frame = boilerFrame(path);
    for (const next of [path, ...legalDirections(path).map((d) => path + d)]) {
      const geometry = boilerGeometry(next)!;
      for (const p of [geometry.cover, ...geometry.cards]) {
        expect(p.x * 100).toBeGreaterThan(frame.x);
        expect(p.y * 150).toBeGreaterThan(frame.y);
        expect((p.x + 2) * 100).toBeLessThan(frame.x + frame.width);
        expect((p.y + 2) * 150).toBeLessThan(frame.y + frame.height);
      }
    }
    for (const direction of legalDirections(path)) check(path + direction);
  }
  check("");
});

it("moves in card coordinates, locks the chosen axis and resists unavailable reversals", () => {
  expect(dragPosition(40, 90, "y", ["U", "D"])).toMatchObject({
    offset: { x: 0, y: 0.6 },
    direction: "D",
    legal: true,
  });
  expect(dragPosition(-250, 15, "x", ["L"])).toMatchObject({
    offset: { x: -1, y: 0 },
    direction: "L",
    legal: true,
  });
  const unavailable = dragPosition(0, 100, "y", ["U"]);
  expect(unavailable.legal).toBe(false);
  expect(unavailable.progress).toBeLessThan(0.1);
  expect(dragPosition(3, -4, null, ["U"]).offset).toEqual({
    x: 0.03,
    y: -4 / 150,
  });
});
