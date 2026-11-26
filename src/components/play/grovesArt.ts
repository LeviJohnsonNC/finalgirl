import { sacredPhoto } from "./modulePhotos";
import { sacredTokens, type SacredToken } from "./sacredSpaceTokens";
import scenes from "@/assets/play/groves/scenes.webp";
import people from "@/assets/play/groves/people.webp";
import guideKilled from "@/assets/play/groves/guide-killed.webp";
import touristKilled from "@/assets/play/groves/tourist-killed.webp";
import holyManKilled from "@/assets/play/groves/holy-man-killed.webp";
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
const killedPortraits = [guideKilled, touristKilled, holyManKilled];

export function grovesPerson(column: number, status?: string): ModuleArt {
  if (status === "killed") {
    return { src: killedPortraits[column], fit: "slice", position: "center 38%" };
  }
  const row = status === "saved" ? 1 : status === "removed" || status === "away" ? 2 : 0;
  return {
    src: people,
    atlas: {
      width: 1536,
      height: 1536,
      x: column * 512 + 3,
      y: row * 512 + 3,
      cellWidth: 506,
      cellHeight: 506,
    },
  };
}

/** Each observed token combination has one full-width photographic state. */
export const grovesSite = (
  row: number,
  tokens: readonly SacredToken[] = [],
): ModuleArt => {
  const bits = sacredTokens.reduce(
    (bits, token, bit) => bits | (tokens.includes(token) ? 1 << bit : 0),
    0,
  );
  return sacredPhoto(row, bits);
};
