import killer1 from "@/assets/play/inkanyamba/wrath-1.webp";
import killer2 from "@/assets/play/inkanyamba/wrath-2.webp";
import killer3 from "@/assets/play/inkanyamba/wrath-3.webp";
import killer4 from "@/assets/play/inkanyamba/wrath-4.webp";
import killer5 from "@/assets/play/inkanyamba/wrath-5.webp";
import divine1 from "@/assets/play/groves/wrath-1.webp";
import divine2 from "@/assets/play/groves/wrath-2.webp";
import divine3 from "@/assets/play/groves/wrath-3.webp";
import divine4 from "@/assets/play/groves/wrath-4.webp";
import divine5 from "@/assets/play/groves/wrath-5.webp";

const backgrounds = {
  killer: [killer1, killer2, killer3, killer4, killer5],
  divine: [divine1, divine2, divine3, divine4, divine5],
};
/** Presentation bands only. An unknown observation never becomes a level. */
export function wrathBackground(
  kind: keyof typeof backgrounds,
  value?: number,
) {
  const stage =
    Number.isInteger(value) && value! >= 1 && value! <= 10
      ? Math.ceil(value! / 2)
      : undefined;
  return { stage, src: backgrounds[kind][(stage ?? 1) - 1] };
}
