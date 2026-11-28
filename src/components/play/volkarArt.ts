import type { ModuleArt } from "./ModuleArtwork";
import dakotaUltimate from "@/assets/characters/dakota-ultimate.png";
import aloisUltimate from "@/assets/characters/alois-ultimate.png";

const photos = import.meta.glob<string>(
  "../../assets/play/photos/volkar/*.webp",
  { eager: true, query: "?url", import: "default" },
);
export function volkarArt(id: string): ModuleArt {
  return {
    src: photos["../../assets/play/photos/volkar/" + id + ".webp"],
    fit: "slice",
    position: "50% 40%",
  };
}
export function huntArt(state: unknown) {
  return volkarArt(typeof state === "string" ? state : "banner");
}
export function ultimatePortrait(name: string, photographic: boolean) {
  if (name !== "Dakota" && name !== "Alois") return undefined;
  return photographic
    ? volkarArt(name.toLowerCase() + "-ultimate").src
    : name === "Dakota"
      ? dakotaUltimate
      : aloisUltimate;
}
