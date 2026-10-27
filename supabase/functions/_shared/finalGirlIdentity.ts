/**
 * Identity corrections reviewed against the selected photographs, 2026-10-27.
 * Shared by the app and edge prompts so stale clients cannot restore crossed data.
 * These describe the selected portraits, not official-card wardrobe or session injuries.
 */
export const REVIEWED_FINAL_GIRL_IDENTITIES: Readonly<Record<string, string>> = {
  Alice: 'A young adult woman with fair freckled skin, green eyes and long, thick, wavy copper-red hair worn loose. She wears a plain green short-sleeved V-neck T-shirt. Preserve the selected Alice portrait identity; its incidental cuts, blood, torn fabric and house background do not establish injuries, damage or a location in a new scene.',
  Selena: 'A young adult woman with medium-brown skin, brown eyes, an oval face and dark, tightly textured hair pulled up into a high round bun. She wears a plain yellow athletic tank top. Preserve the selected Selena portrait identity, including her high bun; its incidental cuts, blood and house background do not establish injuries or a location in a new scene.',
  Mandy: 'A young adult woman with fair skin, blue eyes, an angular face and straight dark chin-length hair with a side part. She wears a black mesh athletic top over a black underlayer, black athletic hand wraps and black nail polish. Preserve the selected Mandy portrait identity; its incidental blood, fighting pose and industrial background do not establish injuries, combat or a location in a new scene.',
  Cassie: 'A young adult woman with medium-brown skin, brown eyes, strong dark eyebrows and long, thick, wavy black hair worn loose. She wears a small silver nostril hoop, a silver septum ring, hoop earrings and a purple hoodie. Preserve the selected Cassie portrait identity; its incidental blood, upward gaze and industrial background do not establish injuries, a pose or a location in a new scene.',
};

export function reviewedFinalGirlIdentity(name: string): string | undefined {
  return Object.prototype.hasOwnProperty.call(REVIEWED_FINAL_GIRL_IDENTITIES, name)
    ? REVIEWED_FINAL_GIRL_IDENTITIES[name]
    : undefined;
}

/** Keep supported caller descriptions for cast members outside this reviewed set. */
export function resolveFinalGirlIdentity(name: string, supplied?: string): string | undefined {
  return reviewedFinalGirlIdentity(name) ?? supplied;
}
