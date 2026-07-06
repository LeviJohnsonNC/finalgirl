// ─── Image assets ──────────────────────────────────────────────────────────
// Official Van Ryder Games art lives in the top-level asset folders and is the
// default for all users. Legacy AI-generated art lives in an `ai/` subfolder
// and is only shown when the user opts in via the "Enable AI Images" toggle.
//
// Rollout fallback: during the art-drop transition, any entity that has no
// official PNG yet transparently falls back to its AI counterpart so the app
// remains usable. Remove that fallback once the official drop is complete —
// see the `FALLBACK_TO_AI_WHEN_MISSING` constant below.
const FALLBACK_TO_AI_WHEN_MISSING = true;

// Vite glob imports — `*.png` does not recurse, so the top-level globs will
// never accidentally include the ai/ subfolder.
const officialCharacterGlob = import.meta.glob<{ default: string }>(
  '../assets/characters/*.png',
  { eager: true },
);
const aiCharacterGlob = import.meta.glob<{ default: string }>(
  '../assets/characters/ai/*.png',
  { eager: true },
);
const officialLocationGlob = import.meta.glob<{ default: string }>(
  '../assets/locations/*.png',
  { eager: true },
);
const aiLocationGlob = import.meta.glob<{ default: string }>(
  '../assets/locations/ai/*.png',
  { eager: true },
);
const officialBoxArtGlob = import.meta.glob<{ default: string }>(
  '../assets/box-art/*.png',
  { eager: true },
);
const aiBoxArtGlob = import.meta.glob<{ default: string }>(
  '../assets/box-art/ai/*.png',
  { eager: true },
);

// Index each glob by basename once, so building the image maps is a hash
// lookup per entity instead of a linear scan over every glob entry.
const globsByBasename = new WeakMap<Record<string, { default: string }>, Map<string, string>>();

function resolveAsset(
  glob: Record<string, { default: string }>,
  filename: string,
): string | undefined {
  let index = globsByBasename.get(glob);
  if (!index) {
    index = new Map(
      Object.entries(glob).map(([path, mod]) => [path.slice(path.lastIndexOf('/') + 1), mod.default]),
    );
    globsByBasename.set(glob, index);
  }
  return index.get(filename);
}

function buildImageMap(
  nameToFile: Record<string, string>,
  primary: Record<string, { default: string }>,
  fallback?: Record<string, { default: string }>,
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const [name, filename] of Object.entries(nameToFile)) {
    const primaryUrl = resolveAsset(primary, filename);
    if (primaryUrl) {
      map[name] = primaryUrl;
      continue;
    }
    if (fallback) {
      const fallbackUrl = resolveAsset(fallback, filename);
      if (fallbackUrl) map[name] = fallbackUrl;
    }
  }
  return map;
}

// ─── Entity → filename mappings ────────────────────────────────────────────
// Single source of truth for the file each entity expects. When the user
// drops official art into src/assets/{characters,locations,box-art}/, the
// filenames on disk should match these values (kebab-case, .png).

const CHARACTER_FILES: Record<string, string> = {
  'Hans': 'hans.png',
  'Laurie': 'laurie.png',
  'Reiko': 'reiko.png',
  'Dr. Fright': 'dr-fright.png',
  'Nancy': 'nancy.png',
  'Sheila': 'sheila.png',
  'Geppetto': 'geppetto.png',
  'Asami': 'asami.png',
  'Charlie': 'charlie.png',
  'Alice': 'alice.png',
  'Selena': 'selena.png',
  'Adelaide': 'adelaide.png',
  'Barbara': 'barbara.png',
  'Poltergeist': 'poltergeist.png',
  'Inkanyamba': 'inkanyamba.png',
  'Heather': 'heather.png',
  'Veronica': 'veronica.png',
  'Ratchet Lady': 'ratchet-lady.png',
  'Kat': 'kat.png',
  'Tali': 'tali.png',
  'The Hunter': 'the-hunter.png',
  'Joy': 'joy.png',
  'Vicky': 'vicky.png',
  'Grimlash': 'grimlash.png',
  'Ellen': 'ellen.png',
  'Jenette': 'jenette.png',
  'Evomorph': 'evomorph.png',
  'Kate': 'kate.png',
  'Uki': 'uki.png',
  'The Organism': 'the-organism.png',
  'Gretel': 'gretel.png',
  'Red': 'red.png',
  'Big Bad Wolf': 'big-bad-wolf.png',
  'Ginny': 'ginny.png',
  'Ava': 'ava.png',
  'The Intruders': 'the-intruders.png',
  'Octavia': 'octavia.png',
  'Janelle': 'janelle.png',
  'Slayer': 'slayer.png',
  'Kenzie': 'kenzie.png',
  'Julie': 'julie.png',
  'Razorface': 'razorface.png',
  'Mandy': 'mandy.png',
  'Cassie': 'cassie.png',
  'The Tormentor': 'the-tormentor.png',
  'Meghan': 'meghan.png',
  'Ronda': 'ronda.png',
  'The Eyeless': 'the-eyeless.png',
  'Melanie': 'melanie.png',
  'Birds': 'birds.png',
  'Patsy': 'patsy.png',
  'Zombies': 'zombies.png',
  'Gabrielle': 'gabrielle.png',
  'Destiny': 'destiny.png',
  'Adrianne': 'adrianne.png',
  'Maureen': 'maureen.png',
  'Mort the Teenage Dirtbag': 'mort-the-teenage-dirtbag.png',
};

const LOCATION_FILES: Record<string, string> = {
  'Camp Happy Trails': 'camp-happy-trails.png',
  'Maple Lane': 'maple-lane.png',
  'Carnival of Blood': 'carnival-of-blood.png',
  'Creech Manor': 'creech-manor.png',
  'Sacred Groves': 'sacred-groves.png',
  'Wolfe Asylum': 'wolfe-asylum.png',
  'Sunnydaze Mall': 'sunnydaze-mall.png',
  'Shady Acres': 'shady-acres.png',
  'USS Konrad': 'uss-konrad.png',
  'Station 2891': 'station-2891.png',
  'Storybook Woods': 'storybook-woods.png',
  'Wingard Cottage': 'wingard-cottage.png',
  'Falconwood': 'falconwood.png',
  'Hellscape': 'hellscape.png',
  'Marrek Warehouse': 'marrek-warehouse.png',
  'Utopia': 'utopia.png',
  'MegaBGCon': 'megabgcon.png',
};

const FILM_BOX_ART_FILES: Record<string, string> = {
  's1-camp-happy-trails': 'happy-trails-horror.png',
  's1-creech-manor': 'haunting-creech-manor.png',
  's1-sacred-groves': 'slaughter-groves.png',
  's1-carnival-of-blood': 'carnage-carnival.png',
  's1-maple-lane': 'frightmare-maple-lane.png',
  's1-terror-from-above': 'terror-from-above.png',
  's2-into-the-void': 'into-the-void.png',
  's2-panic-station-2891': 'panic-station-2891.png',
  's2-madness-in-dark': 'madness-in-the-dark.png',
  's2-once-upon-full-moon': 'once-upon-full-moon.png',
  's2-knock-at-door': 'knock-at-the-door.png',
  's2-terror-from-grave': 'terror-from-the-grave.png',
  's3-falconwood-files': 'the-falconwood-files.png',
  's3-killer-from-tomorrow': 'killer-from-tomorrow.png',
  's3-hell-to-pay': 'hell-to-pay.png',
  's3-marrek-murders': 'the-marrek-murders.png',
  's3-dont-make-sound': 'dont-make-a-sound.png',
  's3-terror-from-destiny': 'terror-from-destiny.png',
  's4-shriek': 'shriek.png',
  's4-rotten-harvest': 'rotten-harvest.png',
};

// ─── Public image registries ───────────────────────────────────────────────
// Default registry: official Van Ryder Games art. The AI registry is only
// surfaced when the user opts in — see src/hooks/useActiveImages.ts.

export const CHARACTER_IMAGES: Record<string, string> = buildImageMap(
  CHARACTER_FILES,
  officialCharacterGlob,
  FALLBACK_TO_AI_WHEN_MISSING ? aiCharacterGlob : undefined,
);

export const LOCATION_IMAGES: Record<string, string> = buildImageMap(
  LOCATION_FILES,
  officialLocationGlob,
  FALLBACK_TO_AI_WHEN_MISSING ? aiLocationGlob : undefined,
);

export const CHARACTER_IMAGES_AI: Record<string, string> = buildImageMap(
  CHARACTER_FILES,
  aiCharacterGlob,
);

export const LOCATION_IMAGES_AI: Record<string, string> = buildImageMap(
  LOCATION_FILES,
  aiLocationGlob,
);

// ─── Types & data ──────────────────────────────────────────────────────────

export interface FeatureFilm {
  id: string;
  name: string;
  season: number;
  killer: string;
  location: string;
  finalGirls: [string, string] | [string]; // Vignettes have single final girl
  boxArt?: string;
  boxArtAi?: string;
  isVignette?: boolean; // Vignettes have no location
}

export interface SessionLog {
  id: string;
  date: string;
  killer: string;
  location: string;
  finalGirl: string;
  result: 'win' | 'loss';
}

export interface GameSelection {
  killer: string | null;
  location: string | null;
  finalGirl: string | null;
  startingEvent: string;
  initialSetupCard: string;
}

const BASE_FEATURE_FILMS: Omit<FeatureFilm, 'boxArt' | 'boxArtAi'>[] = [
  // Season 1
  { id: 's1-camp-happy-trails', name: 'The Happy Trails Horror', season: 1, killer: 'Hans', location: 'Camp Happy Trails', finalGirls: ['Laurie', 'Reiko'] },
  { id: 's1-creech-manor', name: 'The Haunting of Creech Manor', season: 1, killer: 'Poltergeist', location: 'Creech Manor', finalGirls: ['Alice', 'Selena'] },
  { id: 's1-sacred-groves', name: 'Slaughter in the Groves', season: 1, killer: 'Inkanyamba', location: 'Sacred Groves', finalGirls: ['Adelaide', 'Barbara'] },
  { id: 's1-carnival-of-blood', name: 'Carnage at the Carnival', season: 1, killer: 'Geppetto', location: 'Carnival of Blood', finalGirls: ['Asami', 'Charlie'] },
  { id: 's1-maple-lane', name: 'Frightmare on Maple Lane', season: 1, killer: 'Dr. Fright', location: 'Maple Lane', finalGirls: ['Sheila', 'Nancy'] },
  { id: 's1-terror-from-above', name: 'Terror From Above', season: 1, killer: 'Birds', location: '', finalGirls: ['Melanie'], isVignette: true },

  // Season 2
  { id: 's2-into-the-void', name: 'Into the Void', season: 2, killer: 'Evomorph', location: 'USS Konrad', finalGirls: ['Jenette', 'Ellen'] },
  { id: 's2-panic-station-2891', name: 'Panic at Station 2891', season: 2, killer: 'The Organism', location: 'Station 2891', finalGirls: ['Kate', 'Uki'] },
  { id: 's2-madness-in-dark', name: 'Madness in the Dark', season: 2, killer: 'Ratchet Lady', location: 'Wolfe Asylum', finalGirls: ['Heather', 'Veronica'] },
  { id: 's2-once-upon-full-moon', name: 'Once Upon a Full Moon', season: 2, killer: 'Big Bad Wolf', location: 'Storybook Woods', finalGirls: ['Gretel', 'Red'] },
  { id: 's2-knock-at-door', name: 'A Knock at the Door', season: 2, killer: 'The Intruders', location: 'Wingard Cottage', finalGirls: ['Ginny', 'Ava'] },
  { id: 's2-terror-from-grave', name: 'Terror From the Grave', season: 2, killer: 'Zombies', location: '', finalGirls: ['Patsy'], isVignette: true },

  // Season 3
  { id: 's3-falconwood-files', name: 'The Falconwood Files', season: 3, killer: 'Slayer', location: 'Falconwood', finalGirls: ['Octavia', 'Janelle'] },
  { id: 's3-killer-from-tomorrow', name: 'The Killer from Tomorrow', season: 3, killer: 'The Hunter', location: 'Sunnydaze Mall', finalGirls: ['Kat', 'Tali'] },
  { id: 's3-hell-to-pay', name: 'Hell to Pay', season: 3, killer: 'Razorface', location: 'Hellscape', finalGirls: ['Kenzie', 'Julie'] },
  { id: 's3-marrek-murders', name: 'The Marrek Murders', season: 3, killer: 'The Tormentor', location: 'Marrek Warehouse', finalGirls: ['Mandy', 'Cassie'] },
  { id: 's3-dont-make-sound', name: "Don't Make a Sound", season: 3, killer: 'The Eyeless', location: 'Utopia', finalGirls: ['Meghan', 'Ronda'] },
  { id: 's3-terror-from-destiny', name: 'Terror From Destiny', season: 3, killer: 'Destiny', location: '', finalGirls: ['Gabrielle'], isVignette: true },

  // Season 4
  { id: 's4-shriek', name: 'Shriek', season: 4, killer: 'Mort the Teenage Dirtbag', location: 'MegaBGCon', finalGirls: ['Adrianne', 'Maureen'] },
  { id: 's4-demon-shadows', name: 'A Demon in the Shadows', season: 4, killer: 'TBD', location: 'TBD', finalGirls: ['TBD', 'TBD'] },
  { id: 's4-buddyland', name: 'Bad Times at Buddyland', season: 4, killer: 'TBD', location: 'TBD', finalGirls: ['TBD', 'TBD'] },
  { id: 's4-rotten-harvest', name: 'A Rotten Harvest', season: 4, killer: 'Grimlash', location: 'Shady Acres', finalGirls: ['Joy', 'Vicky'] },
  { id: 's4-green-terror', name: 'The Green Terror', season: 4, killer: 'TBD', location: 'TBD', finalGirls: ['TBD', 'TBD'] },
];

export const FEATURE_FILMS: FeatureFilm[] = BASE_FEATURE_FILMS.map(film => {
  const filename = FILM_BOX_ART_FILES[film.id];
  if (!filename) return film;
  const aiBoxArt = resolveAsset(aiBoxArtGlob, filename);
  const officialBoxArt = resolveAsset(officialBoxArtGlob, filename);
  const boxArt = officialBoxArt ?? (FALLBACK_TO_AI_WHEN_MISSING ? aiBoxArt : undefined);
  return { ...film, boxArt, boxArtAi: aiBoxArt };
});

export const getOwnedContent = (ownedFilms: string[]) => {
  const owned = FEATURE_FILMS.filter(film => ownedFilms.includes(film.id));

  return {
    killers: [...new Set(owned.map(f => f.killer))],
    locations: [...new Set(owned.map(f => f.location))],
    finalGirls: [...new Set(owned.flatMap(f => f.finalGirls))],
  };
};

// Helper to find film ID by location name.
// Guard against empty input: vignettes legitimately store location: '', so an
// unguarded lookup with '' would misattribute them (e.g. return the first
// vignette's film for a game with no location selected).
export const getFilmIdByLocation = (locationName: string): string | null => {
  if (!locationName) return null;
  const film = FEATURE_FILMS.find(f => f.location === locationName);
  return film?.id ?? null;
};

// Helper to find film ID by killer name
export const getFilmIdByKiller = (killerName: string): string | null => {
  if (!killerName) return null;
  const film = FEATURE_FILMS.find(f => f.killer === killerName);
  return film?.id ?? null;
};

// Helper to find film ID by final girl name
export const getFilmIdByFinalGirl = (finalGirlName: string): string | null => {
  if (!finalGirlName) return null;
  const film = FEATURE_FILMS.find(f => f.finalGirls.includes(finalGirlName));
  return film?.id ?? null;
};
