import poltergeist from '@/assets/play/banners/poltergeist.webp';
import type { ModuleArt } from "./ModuleArtwork";
import inkanyamba from "@/assets/play/banners/inkanyamba.webp";
import hans from "@/assets/play/banners/hans.webp";
import billy from "@/assets/play/banners/billy.webp";
import geppetto from "@/assets/play/banners/geppetto.webp";
import fright from "@/assets/play/banners/fright.webp";
import groves from "@/assets/play/banners/groves.webp";
import maple from "@/assets/play/banners/maple.webp";
import buddyland from "@/assets/play/banners/buddyland.webp";
import camp from "@/assets/play/banners/camp.webp";
import carnival from "@/assets/play/banners/carnival.webp";

/** Per-owner focal crops keep identities/landmarks visible in shallow phone headers. */
export const moduleBanners = {
  poltergeist:{src:poltergeist,fit:'slice',position:'70% center'},
  inkanyamba: { src: inkanyamba, fit: "slice", position: "70% center" },
  hans: { src: hans, fit: "slice", position: "70% center" },
  billy: { src: billy, fit: "slice", position: "70% center" },
  geppetto: { src: geppetto, fit: "slice", position: "70% center" },
  fright: { src: fright, fit: "slice", position: "70% center" },
  groves: { src: groves, fit: "slice", position: "70% center" },
  maple: { src: maple, fit: "slice", position: "70% center" },
  buddyland: { src: buddyland, fit: "slice", position: "80% center" },
  camp: { src: camp, fit: "slice", position: "80% center" },
  carnival: { src: carnival, fit: "slice", position: "70% center" },
} satisfies Record<string, ModuleArt>;
