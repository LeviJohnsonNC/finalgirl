import type { ModuleArt } from "./ModuleArtwork";
const photos = import.meta.glob<string>("/src/assets/play/photos/*/*.webp", {
  eager: true,
  query: "?url",
  import: "default",
});
const owners: Record<string, string> = {
  Inkanyamba: "inkanyamba",
  Hans: "hans",
  "Billy the Bear": "billy",
  Geppetto: "geppetto",
  "Dr. Fright": "fright",
};
/** Stable canonical card order; these are UI motifs, never narrative evidence. */
export function modulePhoto(
  killer: string,
  index: number,
): ModuleArt | undefined {
  const src = photos[`/src/assets/play/photos/${owners[killer]}/${index}.webp`];
  return src ? { src, fit: "slice", align: "right" } : undefined;
}
export function sacredPhoto(row: number, bits: number): ModuleArt {
  return {
    src: photos[
      `/src/assets/play/photos/groves-${["burial", "shrine", "holy"][row]}/${bits}.webp`
    ],
    fit: "slice",
  };
}
