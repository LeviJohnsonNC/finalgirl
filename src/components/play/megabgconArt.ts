const artFiles = import.meta.glob<string>("@/assets/play/photos/megabgcon/*.webp", { eager: true, import: "default" });
const photos = Object.fromEntries(Object.entries(artFiles).map(([path, src]) => [path.slice(path.lastIndexOf("/") + 1, -5), src]));
export const conArt = (key: string) => ({ src: photos[key] ?? photos.booth ?? photos.banner, fit: "slice" as const, position: key === "banner" ? "58% 57%" : "50% 47%" });
