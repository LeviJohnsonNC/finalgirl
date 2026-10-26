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
