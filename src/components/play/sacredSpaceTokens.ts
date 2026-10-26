import type { ModuleValue } from "@/lib/play/modules";
export const sacredTokens = ["closed", "fire", "hallowed"] as const;
export type SacredToken = (typeof sacredTokens)[number];
export const sacredTokenNames = {
  closed: "Closed",
  fire: "Fire and Brimstone",
  hallowed: "Hallowed Ground",
};
export type Placements = Partial<Record<SacredToken, ModuleValue>>;
export const tokensAt = (state: Placements, site: string) =>
  sacredTokens.filter((k) => state[k] === site);
/** Ordinary cycling is safe only with fully observed, single-token state.
 * Mixed/legacy state opens the explicit editor instead of erasing evidence. */
export function cycleSacredTokens(
  state: Placements,
  site: string,
): Record<string, ModuleValue> | null {
  const current = tokensAt(state, site);
  if (
    sacredTokens.some((k) => typeof state[k] !== "string") ||
    current.length > 1
  )
    return null;
  const next = current.length
    ? sacredTokens[sacredTokens.indexOf(current[0]) + 1]
    : sacredTokens[0];
  return {
    ...Object.fromEntries(current.map((k) => [k, "none"])),
    ...(next ? { [next]: site } : {}),
  };
}
