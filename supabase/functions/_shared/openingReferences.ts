import { OPENING_REFERENCE_DATA } from './openingReferenceData.ts';

/** Reviewed portraits only, chosen by cast name. No caller URLs or scene reshoot input. */
export function openingReferences(finalGirl: string, killer: string): Array<{ name: string; url: string }> {
  return [...new Set([finalGirl, killer])].flatMap(name => {
    const url = Object.hasOwn(OPENING_REFERENCE_DATA, name) ? OPENING_REFERENCE_DATA[name] : undefined;
    return url ? [{ name, url }] : [];
  });
}
