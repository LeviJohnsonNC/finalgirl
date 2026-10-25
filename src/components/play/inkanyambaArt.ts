import atlas from "@/assets/play/inkanyamba/atlas.webp";
import type { ModuleArt } from "./ModuleArtwork";
/** Stable source order is independent of alphabetical card display sorting. */
export const inkanyambaCell = (index: number): ModuleArt => ({
  src: atlas,
  atlas: {
    width: 1536,
    height: 1536,
    x: (index % 4) * 384 + 3,
    y: Math.floor(index / 4) * 384 + 3,
    cellWidth: 378,
    cellHeight: 378,
  },
});
