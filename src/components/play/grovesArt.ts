import sites from "@/assets/play/groves/sites.webp";
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

/** 4 columns: clear / Closed / Fire token / Hallowed token; 3 named sites. */
export const grovesSite = (
  row: number,
  token?: "closed" | "fire" | "hallowed",
): ModuleArt => ({
  src: sites,
  fit: "meet",
  atlas: {
    width: 1448,
    height: 1086,
    x:
      (token ? ["closed", "fire", "hallowed"].indexOf(token) + 1 : 0) * 362 + 3,
    y: row * 362 + 3,
    cellWidth: 356,
    cellHeight: 356,
  },
});
