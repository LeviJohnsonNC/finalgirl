import banner from "@/assets/play/photos/mort/banner.webp";

const art = import.meta.glob<string>("@/assets/play/photos/mort/*.webp", {
  eager: true,
  query: "?url",
  import: "default",
});

export const mortPhoto = (id: string) =>
  art[`/src/assets/play/photos/mort/${id}.webp`] ?? banner;
