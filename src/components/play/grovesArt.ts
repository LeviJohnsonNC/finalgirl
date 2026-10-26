import burial from "@/assets/play/groves/site-burial.webp";
import shrine from "@/assets/play/groves/site-shrine.webp";
import holy from "@/assets/play/groves/site-holy.webp";
import { sacredTokens, type SacredToken } from "./sacredSpaceTokens";
import scenes from "@/assets/play/groves/scenes.webp";
import people from "@/assets/play/groves/people.webp";
import type { ModuleArt } from "./ModuleArtwork";
export const grovesScene = (i: number): ModuleArt => ({
  src: scenes,
  atlas: {
    width: 1536,
    height: 1536,
    x: (i % 4) * 384 + 3,
    y: Math.floor(i / 4) * 384 + 3,
    cellWidth: 378,
    cellHeight: 378,
  },
});
export const grovesPerson = (column: number, status?: string): ModuleArt => ({
  src: people,
  atlas: {
    width: 1536,
    height: 1536,
    x: column * 512 + 3,
    y:
      (status === "saved"
        ? 1
        : ["killed", "removed", "away"].includes(status ?? "")
          ? 2
          : 0) *
        512 +
      3,
    cellWidth: 506,
    cellHeight: 506,
  },
});

/** Three independent 4×2 atlases. Bits: Closed=1, Fire=2, Hallowed=4.
 * Every combination has its own environmental illustration, never a token overlay. */
export const grovesSite = (
  row: number,
  tokens: readonly SacredToken[] = [],
): ModuleArt => {
  const index = sacredTokens.reduce(
    (bits, token, bit) => bits | (tokens.includes(token) ? 1 << bit : 0),
    0,
  );
  return {
    src: [burial, shrine, holy][row],
    fit: "meet",
    atlas: {
      width: 1536,
      height: 768,
      x: (index % 4) * 384 + 3,
      y: Math.floor(index / 4) * 384 + 3,
      cellWidth: 378,
      cellHeight: 378,
    },
  };
};
