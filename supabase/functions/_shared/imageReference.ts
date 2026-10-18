/** Only this authenticated game's public opening image may condition a poster.
 * No arbitrary URLs, foreign owners, signed credentials or redirects. The edge
 * never fetches a caller-supplied URL itself. */
export function ownedOpeningReference(value: string | undefined, projectUrl: string, owner: string, gameId?: string): string | undefined {
  if (!value || !gameId) return undefined;
  try {
    const url = new URL(value), project = new URL(projectUrl);
    const prefix = `/storage/v1/object/public/posters/game-posters/${owner}/${gameId}-scene-`;
    if (url.protocol !== 'https:' || url.origin !== project.origin || url.username || url.password || url.search || url.hash || !url.pathname.startsWith(prefix)) return undefined;
    return /^\d+\.(png|jpg|webp)$/.test(url.pathname.slice(prefix.length)) ? url.href : undefined;
  } catch { return undefined; }
}
