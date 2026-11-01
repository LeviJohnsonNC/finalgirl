import { OPENING_REFERENCE_MANIFEST } from './openingReferenceManifest.ts';

/** A reviewed portrait that cannot be served exactly as stored. The shot is refused, never replaced. */
export class OpeningReferenceError extends Error {}

/** Casts that have a reviewed portrait, in the order the model should receive them. */
export function openingReferenceNames(finalGirl: string, killer: string, includeKiller=true): string[] {
  return [...new Set(includeKiller?[finalGirl,killer]:[finalGirl])].filter((name) =>
    Object.prototype.hasOwnProperty.call(OPENING_REFERENCE_MANIFEST, name)
  );
}

async function sha256Hex(bytes: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new Uint8Array(bytes).buffer);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

function toDataUri(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return `data:image/jpeg;base64,${btoa(binary)}`;
}

/**
 * Reviewed portraits only, chosen by cast name. No caller URLs or scene reshoot input.
 * A cast with no reviewed portrait simply contributes nothing; a cast with one must load
 * its exact stored bytes, or the opening is refused instead of generated generically.
 */
export async function openingReferences(
  finalGirl: string,
  killer: string,
  load: (path: string) => Promise<Uint8Array>,
  includeKiller=true,
): Promise<Array<{ name: string; url: string }>> {
  return Promise.all(openingReferenceNames(finalGirl, killer, includeKiller).map(async (name) => {
    const { path, sha256 } = OPENING_REFERENCE_MANIFEST[name];
    let bytes: Uint8Array;
    try {
      bytes = await load(path);
    } catch (err) {
      throw new OpeningReferenceError(`${name}: ${err instanceof Error ? err.message : String(err)}`);
    }
    if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
      throw new OpeningReferenceError(`${name}: the stored reference is not a JPEG`);
    }
    if (await sha256Hex(bytes) !== sha256) {
      throw new OpeningReferenceError(`${name}: the stored reference does not match its reviewed digest`);
    }
    return { name, url: toDataUri(bytes) };
  }));
}
