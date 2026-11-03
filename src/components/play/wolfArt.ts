import banner from "@/assets/play/banners/big-bad-wolf.webp";
import portrait from "@/assets/characters/ai/big-bad-wolf.png";
import type { ModuleArt } from "./ModuleArtwork";

const photos = import.meta.glob<string>("/src/assets/play/photos/big-bad-wolf/*.webp", {
  eager: true,
  query: "?url",
  import: "default",
});

const photo = (id: string) => photos[`/src/assets/play/photos/big-bad-wolf/${id}.webp`];

export function wolfArt(id: string, thumbnail = false): ModuleArt {
  if (id === "header") return { src: banner, fit: "slice", position: "87% 53%" };
  const position = id === "slay" ? "64% 37%" : "center";
  return { src: (thumbnail && photo(`${id}-thumb`)) || photo(id) || portrait, fit: "slice", position };
}

export const wolfPortrait: ModuleArt = { src: portrait, fit: "slice", position: "56% 49%" };
