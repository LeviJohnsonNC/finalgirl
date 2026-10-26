import heroes from "@/assets/play/inkanyamba/heroes.webp";
import type { ModuleArt } from "./ModuleArtwork";

/** Original card order, independent of alphabetical chooser order. */
export const inkanyambaHero = (index: number): ModuleArt => ({
  src: heroes,
  fit: "meet",
  atlas: {
    width: 1254,
    height: 1254,
    x: (index % 3) * 418 + 3,
    y: Math.floor(index / 3) * 418 + 3,
    cellWidth: 412,
    cellHeight: 412,
  },
});
