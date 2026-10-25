import { inkanyambaCell } from "./inkanyambaArt";
import { INKANYAMBA_POWERS, INKANYAMBA_FINALES } from "../../../supabase/functions/_shared/play/inkanyamba";
import {
  BILLY_POWERS,
  BILLY_FINALES,
  HANS_POWERS,
  HANS_FINALES,
  GEPPETTO_POWERS,
  GEPPETTO_FINALES,
  FRIGHT_POWERS,
  FRIGHT_FINALES,
} from "@/lib/play/modules";
import type { ModuleArt } from "./ModuleArtwork";
import billyCards from "@/assets/play/consistent/billy-cards.webp";
import hansCards from "@/assets/play/consistent/hans-cards.webp";
import geppettoCards from "@/assets/play/geppetto/cards.webp";
import frightCards from "@/assets/play/fright/cards.webp";

export interface IllustratedKillerCard {
  id: string;
  name: string;
  effect: string;
  epic?: boolean;
  art: ModuleArt;
}
export const atlasCell = (
  src: string,
  index: number,
  width = 1536,
  height = 1536,
  columns = 3,
  rows = 3,
): ModuleArt => ({
  src,
  atlas: {
    width,
    height,
    x: ((index % columns) * width) / columns + 4,
    y: (Math.floor(index / columns) * height) / rows + 4,
    cellWidth: width / columns - 8,
    cellHeight: height / rows - 8,
  },
});
export function illustratedKillerCards(
  killer: string,
  type: "dark-power" | "finale",
): IllustratedKillerCard[] {
  const power = type === "dark-power";
  const cards =
    killer === "Inkanyamba" ? power ? INKANYAMBA_POWERS : INKANYAMBA_FINALES : killer === "Billy the Bear"
      ? power
        ? BILLY_POWERS.filter((card) => !("health" in card))
        : BILLY_FINALES
      : killer === "Hans"
        ? power
          ? HANS_POWERS
          : HANS_FINALES
        : killer === "Geppetto"
          ? power
            ? GEPPETTO_POWERS
            : GEPPETTO_FINALES
          : killer === "Dr. Fright" ? power ? FRIGHT_POWERS : FRIGHT_FINALES : [];
  return cards
    .map((card, index) => ({
      ...card,
      epic:
        ("epic" in card && card.epic === true) ||
        card.effect.startsWith("Epic"),
      art:
        killer === "Inkanyamba" ? inkanyambaCell(index + (power ? 0 : 4)) : killer === "Dr. Fright" ? atlasCell(frightCards,index+(power?0:4),1254,1254) : killer === "Geppetto"
          ? atlasCell(geppettoCards, index + (power ? 0 : 4), 1254, 1254)
          : atlasCell(
              killer === "Hans" ? hansCards : billyCards,
              index + (power ? 0 : 4),
              1254,
              1254,
            ),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
