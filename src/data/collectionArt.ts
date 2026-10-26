/** Original collection illustrations and authored, live-text poster lettering.
 * IDs are catalog IDs; artwork never changes game facts or image preferences. */
export interface CollectionArt {
  scene: string;
  accent: string;
  pale: string;
  lettering: "brush" | "gothic" | "industrial" | "storybook";
  lines: { text: string; scale?: number; accent?: boolean }[];
  position?: string;
  titleFont: string;
  titleWeight: number;
  titleScale?: number;
}
const line = (text: string, scale = 1, accent = false) => ({
  text,
  scale,
  accent,
});
export const COLLECTION_ART: Record<string, CollectionArt> = {
  "s1-camp-happy-trails": {
    titleFont: "Shelf Brush",
    titleWeight: 600,
    scene: "happy-trails",
    accent: "#ed3534",
    pale: "#f1dbb9",
    lettering: "brush",
    lines: [
      line("The", 0.43),
      line("Happy Trails", 0.92),
      line("Horror", 1.3, true),
    ],
  },
  "s1-creech-manor": {
    titleFont: "Shelf Fell",
    titleWeight: 400,
    scene: "creech-manor",
    accent: "#8ecab8",
    pale: "#e8e1bd",
    lettering: "gothic",
    lines: [
      line("The Haunting", 0.72),
      line("of Creech", 0.86),
      line("Manor", 1.12, true),
    ],
  },
  "s1-sacred-groves": {
    titleFont: "Kalam",
    titleWeight: 700,
    scene: "sacred-groves",
    accent: "#dc7138",
    pale: "#e8d3a6",
    lettering: "brush",
    lines: [
      line("Slaughter", 1.05),
      line("in the", 0.46),
      line("Groves", 1.26, true),
    ],
  },
  "s1-carnival-of-blood": {
    titleFont: "Rye",
    titleWeight: 400,
    scene: "carnival",
    accent: "#e94a51",
    pale: "#f4dbad",
    lettering: "gothic",
    lines: [
      line("Carnage", 1.1, true),
      line("at the", 0.45),
      line("Carnival", 0.95),
    ],
  },
  "s1-maple-lane": {
    titleFont: "Creepster",
    titleWeight: 400,
    scene: "maple-lane",
    accent: "#ac8bd2",
    pale: "#e9dce0",
    lettering: "brush",
    lines: [line("Frightmare", 1.04, true), line("on Maple Lane", 0.75)],
  },
  "s1-terror-from-above": {
    titleFont: "Permanent Marker",
    titleWeight: 400,
    scene: "birds",
    accent: "#eab561",
    pale: "#ecdfc1",
    lettering: "brush",
    lines: [line("Terror", 1.32, true), line("from Above", 0.88)],
  },
  "s2-into-the-void": {
    titleFont: "Shelf Condensed",
    titleWeight: 700,
    scene: "void",
    accent: "#9cdebd",
    pale: "#e4e7cd",
    lettering: "industrial",
    lines: [line("Into the", 0.72), line("Void", 1.65, true)],
  },
  "s2-panic-station-2891": {
    titleFont: "Staatliches",
    titleWeight: 400,
    scene: "station",
    accent: "#93c7e5",
    pale: "#eff1de",
    lettering: "industrial",
    lines: [
      line("Panic", 1.15, true),
      line("at Station", 0.65),
      line("2891", 1.38),
    ],
  },
  "s2-madness-in-dark": {
    titleFont: "Special Elite",
    titleWeight: 400,
    scene: "asylum",
    accent: "#bed16c",
    pale: "#e5dfbd",
    lettering: "brush",
    lines: [line("Madness", 1.18, true), line("in the Dark", 0.86)],
  },
  "s2-once-upon-full-moon": {
    titleScale: 1.25,
    titleFont: "Pirata One",
    titleWeight: 400,
    scene: "full-moon",
    accent: "#d7ae70",
    pale: "#eee4bd",
    lettering: "storybook",
    lines: [line("Once Upon", 0.8), line("a Full Moon", 0.9, true)],
  },
  "s2-knock-at-door": {
    titleFont: "Sedgwick Ave Display",
    titleWeight: 400,
    scene: "cottage",
    accent: "#d96a4d",
    pale: "#ead5b9",
    lettering: "brush",
    lines: [line("A Knock", 1.15), line("at the Door", 0.94, true)],
  },
  "s2-terror-from-grave": {
    titleFont: "Eater",
    titleWeight: 400,
    scene: "grave",
    accent: "#a4b873",
    pale: "#e2dfba",
    lettering: "gothic",
    lines: [
      line("Terror", 1.2, true),
      line("from the", 0.52),
      line("Grave", 1.2),
    ],
  },
  "s3-falconwood-files": {
    titleScale: 0.88,
    titleFont: "Black Ops One",
    titleWeight: 400,
    scene: "falconwood",
    accent: "#de645e",
    pale: "#e4ddc7",
    lettering: "industrial",
    lines: [
      line("The", 0.42),
      line("Falconwood", 0.85, true),
      line("Files", 1.1),
    ],
  },
  "s3-killer-from-tomorrow": {
    titleFont: "Teko",
    titleWeight: 600,
    scene: "mall",
    accent: "#79cee1",
    pale: "#e1e3d4",
    lettering: "industrial",
    lines: [
      line("The Killer", 0.92),
      line("from", 0.44),
      line("Tomorrow", 0.98, true),
    ],
  },
  "s3-hell-to-pay": {
    titleFont: "Metal Mania",
    titleWeight: 400,
    scene: "hellscape",
    accent: "#f47843",
    pale: "#edd9b8",
    lettering: "gothic",
    lines: [line("Hell", 1.56, true), line("to Pay", 1.02)],
  },
  "s3-marrek-murders": {
    titleFont: "Anton",
    titleWeight: 400,
    scene: "warehouse",
    accent: "#d7ad56",
    pale: "#e1d9bb",
    lettering: "industrial",
    lines: [line("The Marrek", 0.88), line("Murders", 1.18, true)],
  },
  "s3-dont-make-sound": {
    titleFont: "Oswald",
    titleWeight: 600,
    scene: "utopia",
    accent: "#9fb9b3",
    pale: "#e5e0cb",
    lettering: "industrial",
    lines: [line("Don't Make", 0.86), line("a Sound", 1.18, true)],
  },
  "s3-terror-from-destiny": {
    titleFont: "Cinzel Decorative",
    titleWeight: 700,
    scene: "destiny",
    accent: "#d95f59",
    pale: "#e5d9c4",
    lettering: "storybook",
    lines: [
      line("Terror", 1.25, true),
      line("from", 0.48),
      line("Destiny", 1.06),
    ],
  },
  "s4-shriek": {
    titleScale: 0.77,
    titleFont: "Rock Salt",
    titleWeight: 400,
    scene: "convention",
    accent: "#d889c4",
    pale: "#f1d7bc",
    lettering: "brush",
    lines: [line("Shriek", 1.63, true)],
  },
  "s4-buddyland": {
    titleFont: "Fugaz One",
    titleWeight: 400,
    scene: "buddyland",
    accent: "#f35d94",
    pale: "#f3dba8",
    lettering: "brush",
    lines: [
      line("Bad Times", 1),
      line("at", 0.44),
      line("Buddyland", 1.03, true),
    ],
  },
  "s4-rotten-harvest": {
    titleFont: "New Rocker",
    titleWeight: 400,
    scene: "harvest",
    accent: "#dda34c",
    pale: "#e4d3a1",
    lettering: "gothic",
    lines: [line("A Rotten", 0.92), line("Harvest", 1.17, true)],
  },
  "s4-demon-shadows": {
    titleFont: "UnifrakturCook",
    titleWeight: 700,
    scene: "upcoming-shadows",
    accent: "#b490c1",
    pale: "#e4d2c6",
    lettering: "gothic",
    lines: [line("A Demon", 0.95), line("in the Shadows", 0.71, true)],
  },
  "s4-green-terror": {
    titleScale: 0.79,
    titleFont: "Nosifer",
    titleWeight: 400,
    scene: "upcoming-green",
    accent: "#a6c37a",
    pale: "#e2ddbd",
    lettering: "brush",
    lines: [line("The Green", 0.96), line("Terror", 1.3, true)],
  },
};

const scenes = import.meta.glob<{ default: string }>(
  "../assets/collection-scenes/*.webp",
  { eager: true },
);
/** Reviewed narrow-strip crops; other identities use the shared 42% position. */
export const COLLECTION_PORTRAIT_FOCUS: Record<string, string> = {
  Nancy: "50% 0%",
  Kenzie: "50% 65%",
  Ginny: "50% 25%",
};
export function getCollectionScene(scene: string): string | undefined {
  return scenes[`../assets/collection-scenes/${scene}.webp`]?.default;
}
