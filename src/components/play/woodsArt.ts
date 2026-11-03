import type { ModuleArt } from "./ModuleArtwork";
import banner from "@/assets/play/banners/storybook-woods.webp";

const files = import.meta.glob<string>("@/assets/play/photos/storybook-woods/*.webp", {
  eager: true, import: "default",
});
const positions: Record<string, string> = {
  banner:"50% 56%", "moon-clearing":"50% 30%", "moon-meadow":"50% 14%",
  "moon-glen":"50% 20%", treats:"50% 100%",
};

export function woodsArt(id: string): ModuleArt {
  return {
    src: files[`/src/assets/play/photos/storybook-woods/${id}.webp`] ?? banner,
    fit: "slice",
    position: positions[id] ?? "50% 50%",
  };
}
