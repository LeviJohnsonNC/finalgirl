import { OPENING_DIRECTIONS, randomOpeningTake } from '../../supabase/functions/_shared/narrativeStyle';
import { getKillerNarrativeRules } from '@/data/killerSpecialRules';
import { getEntityPromptContext } from '@/data/rules/moduleRules';

/** Keep each owner's full guidance in its own bounded API field. */
export function getStoryRequestRules(killer: string, location: string) {
  const killerContext = getEntityPromptContext(killer);
  const locationContext = getEntityPromptContext(location);
  return {
    killerRules: [
      getKillerNarrativeRules(killer),
      killerContext?.rulesSummary,
      killerContext?.narrativeGuidance,
    ].filter(Boolean).join('\n') || undefined,
    locationRules: [
      locationContext?.rulesSummary,
      locationContext?.narrativeGuidance,
    ].filter(Boolean).join('\n') || undefined,
  };
}

/** Advance this browser's rotation only once a new game has been saved. */
export function openingRotation(owner: string, killer: string, location: string) {
  const key = 'final-girl-opening-take-v1:' + JSON.stringify([owner, killer, location]);
  let take = randomOpeningTake();
  try {
    const last = localStorage.getItem(key);
    const index = Number(last);
    if (last !== null && Number.isInteger(index) && index >= 0 && index < OPENING_DIRECTIONS.length) {
      take = (index + 1) % OPENING_DIRECTIONS.length;
    }
  } catch { /* The saved game still carries its own take when preferences are unavailable. */ }
  return {
    take,
    remember() {
      try { localStorage.setItem(key, String(take)); } catch { /* Optional replay preference. */ }
    },
  };
}
