// Per-film visual themes for the NowPlaying recording page.
// Colors are HSL strings matching the CSS custom property format used by the app.
// Taglines are sourced from official Final Girl lore (product pages and rulebook descriptions).

export interface FilmTheme {
  primary: string;    // HSL string override for --primary (e.g. "0 100% 31%")
  secondary: string;  // HSL string override for --secondary
  tagline: string;    // Short atmospheric line from official lore
}

export const FILM_THEMES: Record<string, FilmTheme> = {
  // ── Series 1 ──────────────────────────────────────────────────────────────

  's1-camp-happy-trails': {
    primary: '0 100% 31%',       // blood red — the default, fitting for Hans
    secondary: '120 40% 30%',    // forest green
    tagline: 'Summers at Camp Happy Trails really are to die for.',
  },
  's1-creech-manor': {
    primary: '160 60% 35%',      // ghostly teal
    secondary: '180 40% 60%',    // pale mist
    tagline: 'Carolyn noticed the supernatural phenomena first.',
  },
  's1-sacred-groves': {
    primary: '30 80% 35%',       // earth ochre
    secondary: '45 70% 45%',     // amber
    tagline: 'Inkanyamba arrived to punish the trespassers on behalf of the gods.',
  },
  's1-carnival-of-blood': {
    primary: '25 100% 45%',      // carnival orange
    secondary: '55 100% 50%',    // garish yellow
    tagline: 'He used dark rituals and a circus front to create a twisted family.',
  },
  's1-maple-lane': {
    primary: '270 70% 40%',      // deep purple
    secondary: '300 50% 55%',    // nightmare violet
    tagline: 'The teens on Maple Lane started dying in their sleep.',
  },
  's1-terror-from-above': {
    primary: '200 30% 40%',      // overcast gray
    secondary: '30 40% 50%',     // wheat/sky
    tagline: 'They came from above.',
  },

  // ── Series 2 ──────────────────────────────────────────────────────────────

  's2-into-the-void': {
    primary: '186 100% 35%',     // cold cyan
    secondary: '210 80% 50%',    // blue-steel
    tagline: 'It evolves. It vanishes.',
  },
  's2-panic-station-2891': {
    primary: '200 60% 40%',      // arctic blue
    secondary: '180 30% 70%',    // icy white-blue
    tagline: 'If your horror rises above 6, you have been assimilated.',
  },
  's2-madness-in-dark': {
    primary: '80 40% 35%',       // sickly green
    secondary: '60 60% 45%',     // clinical yellow
    tagline: 'The pills keep the maniacs at bay. For now.',
  },
  's2-once-upon-full-moon': {
    primary: '135 50% 25%',      // dark forest green
    secondary: '220 40% 65%',    // moonlit blue
    tagline: 'Once upon a full moon, the Wolf began to slay.',
  },
  's2-knock-at-door': {
    primary: '30 60% 35%',       // warm amber
    secondary: '20 50% 50%',     // wood brown
    tagline: 'Three of them. Only one active at a time.',
  },
  's2-terror-from-grave': {
    primary: '90 40% 25%',       // rot green
    secondary: '40 50% 30%',     // decay brown
    tagline: 'The dead walk. They can find you anywhere.',
  },

  // ── Series 3 ──────────────────────────────────────────────────────────────

  's3-falconwood-files': {
    primary: '260 30% 40%',      // muted purple
    secondary: '210 20% 55%',    // government gray
    tagline: 'Government experiments. Supernatural occurrences. Falconwood has secrets.',
  },
  's3-killer-from-tomorrow': {
    primary: '330 80% 45%',      // neon pink
    secondary: '200 100% 50%',   // 80s electric blue
    tagline: 'It came from tomorrow. It kills today.',
  },
  's3-hell-to-pay': {
    primary: '15 100% 40%',      // hellfire orange
    secondary: '0 90% 50%',      // demon red
    tagline: 'There is no way out of Hellscape.',
  },
  's3-marrek-murders': {
    primary: '200 10% 40%',      // industrial steel gray
    secondary: '80 30% 40%',     // sickly industrial green
    tagline: 'The deathtraps were escapable. In theory.',
  },
  's3-dont-make-sound': {
    primary: '35 50% 40%',       // desert sand
    secondary: '30 30% 60%',     // bone white
    tagline: "Don't move. Don't breathe. Don't make a sound.",
  },
  's4-terror-from-beyond': {primary: '82 33% 38%', secondary: '346 34% 28%', tagline: 'You recognize every face.'},
  's3-terror-from-destiny': {
    primary: '270 50% 35%',      // fate purple
    secondary: '40 60% 50%',     // golden prophecy
    tagline: "Let the Fated Victims die. Then face Destiny's accounting.",
  },

  // ── Series 4 ──────────────────────────────────────────────────────────────

  's4-buddyland': {
    primary: '300 70% 40%',      // creepy magenta
    secondary: '180 80% 45%',    // garish teal
    tagline: 'Billy needs power. Turn it off before he recharges.',
  },
  's4-rotten-harvest': {
    primary: '20 80% 35%',       // harvest rust
    secondary: '40 70% 45%',     // harvest gold
    tagline: 'Echoes from beneath the fields bring growing madness.',
  },
  's4-demon-shadows': {
    primary: '270 60% 30%',      // deep demonic purple
    secondary: '45 80% 40%',     // church gold
    tagline: 'Berith has possessed Ursula. Expel the demon. Save her soul.',
  },
  's4-shriek': {
    primary: '300 80% 50%',      // garish pink
    secondary: '60 100% 50%',    // neon yellow
    tagline: 'Mort the Teenage Dirtbag is ready to play.',
  },
  's4-green-terror': {
    primary: '120 60% 25%',      // deep jungle green
    secondary: '150 50% 40%',    // dense foliage
    tagline: 'Locals vanish without a trace in Pesadilla Verde.',
  },

  // ── Special Features ──────────────────────────────────────────────────────

  'special-north-pole-nightmare': {
    primary: '200 60% 35%',      // frozen blue
    secondary: '0 80% 45%',      // krampus red
    tagline: 'Krampus is coming. And he is not here to deliver gifts.',
  },
};
