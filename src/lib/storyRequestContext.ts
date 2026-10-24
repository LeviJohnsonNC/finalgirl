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
