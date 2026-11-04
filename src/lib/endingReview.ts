import type { EndingFormData } from './activeGame';

function ordered(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(ordered);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b))
      .map(([key, entry]) => [key, ordered(entry)]));
  }
  return value;
}

/** Compare only ending inputs, independent of JSONB object key order. */
export function sameEndingReview(
  previous: EndingFormData | undefined,
  next: EndingFormData,
  previousOutcome: 'won' | 'lost',
) {
  if (!previous) return false;
  const comparable = (form: EndingFormData) => ({
    ...form,
    outcome: form.outcome ?? previousOutcome,
    roundsPlayed: form.roundsPlayed ?? null,
    finalGirlHealth: form.finalGirlHealth ?? null,
    killerHealth: form.killerHealth ?? null,
    finalHorrorLevel: form.finalHorrorLevel ?? null,
  });
  return JSON.stringify(ordered(comparable(previous))) === JSON.stringify(ordered(comparable(next)));
}
