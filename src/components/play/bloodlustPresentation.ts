import level0 from "@/assets/play/bloodlust/level-0.webp";
import level1 from "@/assets/play/bloodlust/level-1.webp";
import level2 from "@/assets/play/bloodlust/level-2.webp";
import level3 from "@/assets/play/bloodlust/level-3.webp";
import level4 from "@/assets/play/bloodlust/level-4.webp";
import level5 from "@/assets/play/bloodlust/level-5.webp";
import level6 from "@/assets/play/bloodlust/level-6.webp";
import level7 from "@/assets/play/bloodlust/level-7.webp";
import level8 from "@/assets/play/bloodlust/level-8.webp";
import level9 from "@/assets/play/bloodlust/level-9.webp";
import level10 from "@/assets/play/bloodlust/level-10.webp";

const photographs = [
  level0,
  level1,
  level2,
  level3,
  level4,
  level5,
  level6,
  level7,
  level8,
  level9,
  level10,
];

/** Printed standard-mode positions, counting the separate bottom space as 0.
 * Sources and counted rows: src/assets/play/bloodlust/README.md.
 * Presentation metadata only; never clamp or resolve saved observations.
 * Billy's board remains a documented source gap, so he uses the generic scale.
 */
export const verifiedBloodlustMaximum: Readonly<Record<string, number>> = {
  Hans: 10,
  "Dr. Fright": 9,
  Inkanyamba: 8,
  Geppetto: 8,
};

export function bloodlustBackground(killer: string, value?: number) {
  const maximum = Object.prototype.hasOwnProperty.call(
    verifiedBloodlustMaximum,
    killer,
  )
    ? verifiedBloodlustMaximum[killer]
    : photographs.length - 1;
  // Unknown stays unknown. High legacy observations keep their number and use
  // the strongest photograph; unverified killers do not gain an invented cap.
  const stage =
    Number.isInteger(value) && value! >= 0
      ? Math.min(
          photographs.length - 1,
          Math.round((value! / maximum) * (photographs.length - 1)),
        )
      : undefined;
  return { stage, src: photographs[stage ?? 0] };
}
