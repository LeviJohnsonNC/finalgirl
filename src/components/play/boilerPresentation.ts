import {
  boilerGeometry,
  legalDirections,
  STEP,
  type Direction,
} from "../../../supabase/functions/_shared/play/fright";

// Presentation units only. The rules still use half-card integer coordinates.
export const HALF_WIDTH = 100;
export const HALF_HEIGHT = 150;
export type Frame = { x: number; y: number; width: number; height: number };
export type Offset = { x: number; y: number };
export type Axis = "x" | "y";

/** Reserve legal travel before pickup, so dragging never reframes the scene. */
export function boilerFrame(path: string, reserveTravel = true): Frame {
  const geometries = [
    path,
    ...(reserveTravel ? legalDirections(path).map((d) => path + d) : []),
  ].map((p) => boilerGeometry(p)!);
  const positions = geometries.flatMap((g) => [g.cover, ...g.cards]);
  const left = Math.min(...positions.map((p) => p.x));
  const top = Math.min(...positions.map((p) => p.y));
  const right = Math.max(...positions.map((p) => p.x + 2));
  const bottom = Math.max(...positions.map((p) => p.y + 2));
  return {
    x: left * HALF_WIDTH - 14,
    y: top * HALF_HEIGHT - 14,
    width: (right - left) * HALF_WIDTH + 28,
    height: (bottom - top) * HALF_HEIGHT + 28,
  };
}
export const frameText = (frame: Frame) =>
  `${frame.x} ${frame.y} ${frame.width} ${frame.height}`;

export function dragPosition(
  x: number,
  y: number,
  axis: Axis | null,
  allowed: readonly Direction[],
) {
  const direction: Direction | null =
    axis === "x"
      ? x > 0
        ? "R"
        : x < 0
          ? "L"
          : null
      : axis === "y"
        ? y > 0
          ? "D"
          : y < 0
            ? "U"
            : null
        : null;
  const legal = direction !== null && allowed.includes(direction);
  const limit = (n: number, max: number) => Math.max(-max, Math.min(max, n));
  // Small free pickup movement; unavailable directions offer gentle resistance.
  const offset = !axis
    ? { x: limit(x / HALF_WIDTH, 0.06), y: limit(y / HALF_HEIGHT, 0.06) }
    : {
        x:
          axis === "x"
            ? limit((x / HALF_WIDTH) * (legal ? 1 : 0.12), legal ? 1 : 0.09)
            : 0,
        y:
          axis === "y"
            ? limit((y / HALF_HEIGHT) * (legal ? 1 : 0.12), legal ? 1 : 0.09)
            : 0,
      };
  return {
    offset,
    direction,
    legal,
    progress: Math.max(Math.abs(offset.x), Math.abs(offset.y)),
  };
}
export const slideOffset = (direction: Direction): Offset => ({
  ...STEP[direction],
});
