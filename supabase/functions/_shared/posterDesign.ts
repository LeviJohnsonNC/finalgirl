/** Bounded print direction shared by the planner, art prompt and raster compositor. */
export const POSTER_LAYOUTS = ['crown', 'basement', 'marquee', 'inset'] as const;
export const POSTER_FACES = ['slash', 'brush', 'gothic', 'industrial', 'serif'] as const;
export const POSTER_PALETTES = ['ember', 'bone', 'electric', 'ochre'] as const;
export interface PosterDesign {
  layout: typeof POSTER_LAYOUTS[number];
  face: typeof POSTER_FACES[number];
  palette: typeof POSTER_PALETTES[number];
}
export interface PosterCopy { title: string; tagline: string }
export interface PosterCast { finalGirl?: string; killer?: string; location?: string }
export interface PrintBox { x: number; y: number; width: number; height: number }
export interface PosterLayout {
  art: PrintBox; title: PrintBox; tagline: PrintBox; credits: PrintBox;
  paper: boolean; align: 'center' | 'left';
  direction: string;
}
const box = (x: number, y: number, width: number, height: number): PrintBox => ({ x, y, width, height });
export const posterLayouts: Readonly<Record<PosterDesign['layout'], PosterLayout>> = {
  crown: { art: box(0,0,1000,1500), title: box(55,65,890,250), tagline: box(95,345,810,75), credits: box(65,1360,870,100), paper: false, align: 'center',
    direction: 'Large upper title at 4–21% height, tagline immediately below at 23–28%. Keep these areas low-detail. Place the decisive faces/action at 32–86%; leave the lowest 10% quiet for billing.' },
  basement: { art: box(0,0,1000,1500), title: box(55,1115,890,230), tagline: box(100,80,800,85), credits: box(65,1375,870,95), paper: false, align: 'center',
    direction: 'Small upper tagline at 5–11% height, large lower title at 74–90%. Keep those areas low-detail. Place decisive faces/action at 15–70%; leave the lowest 9% quiet for billing.' },
  marquee: { art: box(20,20,960,1300), title: box(65,1035,870,200), tagline: box(90,1250,820,58), credits: box(65,1355,870,110), paper: true, align: 'center',
    direction: 'A lower title occupies approximately 78–93% of the PAINTING height; its short tagline sits at the very bottom, 94–99%. Keep that lower portion atmospheric and low-detail. Put decisive faces/action in the upper 8–72%. A separate cream billing panel will be added BELOW the complete painting; do not paint the panel or border.' },
  inset: { art: box(30,30,940,1440), title: box(75,95,850,240), tagline: box(80,365,820,75), credits: box(75,1355,850,100), paper: true, align: 'left',
    direction: 'An inset print with a left-aligned upper title at approximately 4–22% of PAINTING height and a tagline just beneath at 23–29%. Keep those zones low-detail. Put decisive faces/action at 33–87%; leave the lowest 9% quiet for billing. The compositor supplies a narrow cream paper border; do not paint a frame.' },
};
export const posterPalettes = {
  ember: { ink: 0xe94129ff, edge: 0xf3b946ff, paper: 0xe9dfc5ff },
  bone: { ink: 0xf3e8caff, edge: 0x4d1918ff, paper: 0xe9dfc5ff },
  electric: { ink: 0xa8e2e6ff, edge: 0xc46629ff, paper: 0xe5dfcfff },
  ochre: { ink: 0xf2bf47ff, edge: 0x8e251fff, paper: 0xe9dfc5ff },
} as const;
export function parsePosterDesign(value: unknown): PosterDesign | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const d = value as Record<string, unknown>;
  if (!(POSTER_LAYOUTS as readonly unknown[]).includes(d.layout) ||
      !(POSTER_FACES as readonly unknown[]).includes(d.face) ||
      !(POSTER_PALETTES as readonly unknown[]).includes(d.palette)) return undefined;
  return { layout: d.layout, face: d.face, palette: d.palette } as PosterDesign;
}
/** Stable recovery without another provider call, request field or history write. */
export function fallbackPosterDesign(seed: string): PosterDesign {
  let hash = 2166136261;
  for (const c of seed) hash = Math.imul(hash ^ c.charCodeAt(0), 16777619) >>> 0;
  return { layout: POSTER_LAYOUTS[hash % POSTER_LAYOUTS.length],
    face: POSTER_FACES[Math.floor(hash / 4) % POSTER_FACES.length],
    palette: POSTER_PALETTES[Math.floor(hash / 20) % POSTER_PALETTES.length] };
}
export const POSTER_DESIGN_MENU = `Choose one coordinated print design for the selected composition. Return design:{layout,face,palette} using ONLY these values:
layout: crown (large upper title, tagline beneath, full bleed), basement (lower title, upper tagline, full bleed), marquee (lower title with a separate cream billing panel), inset (left-aligned upper title, narrow cream paper border).
face: slash (ragged sharp hand lettering), brush (bold hand-painted marker), gothic (angular heavy-metal horror lettering), industrial (stencilled mechanical lettering), serif (literary/occult lettering).
palette: ember (red ink with golden offset edge), bone (cream ink with deep wine edge), electric (pale cyan ink with burnt-orange edge), ochre (yellow ink with oxblood edge).
Choose a coherent treatment earned by the story, setting and composition, including unusual mixed casts. These are lettering colors, not a compulsory painting color grade. Do not default every film to a red lower title. Lettering must feel like a distinctive movie identity, not a caption. Never choose a font merely from a character's identity. Place subjects clear of the chosen print zones.`;
export function posterArtDirection(design: PosterDesign): string {
  const faces = design.layout === 'crown' || design.layout === 'inset'
    ? 'HEADROOM IS ESSENTIAL: pull the camera back and place EVERY head and face, including a distant ghost or killer, below 33% of the painting height and above 85%. The upper third shows only low-detail architecture, shadow or sky. Never inherit a reference portrait’s high head placement.'
    : design.layout === 'marquee'
    ? 'Keep EVERY face, including a distant ghost or killer, within 8–70% of painting height. The lower quarter contains only low-detail ground or architecture, never faces or decisive story details.'
    : 'Keep EVERY face and decisive story detail between 15–70% of painting height. The upper tagline and lower title areas show only low-detail environment, never a face or eye.';
  return `PRINT DESIGN: ${design.layout}; ${design.face} lettering; ${design.palette} lettering colors.\n${posterLayouts[design.layout].direction}\n${faces}\nThe painting stays continuous through its reserved zones. No letters, fake glyphs, printed borders, credits, logos or title shapes in the painting. Do not leave a blank opaque rectangle. The finished poster will have its lettering rasterized afterward.`;
}
