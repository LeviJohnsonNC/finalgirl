export { FINAL_GIRL_REFERENCES, getFinalGirlReference, observedFinalGirlMaxHealth } from '../../supabase/functions/_shared/play/finalGirls';
export type { FinalGirlReference } from '../../supabase/functions/_shared/play/finalGirls';

const cards = import.meta.glob('../assets/final-girls/cards/*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string,string>;
export const getFinalGirlCard = (name: string, ultimate = false): string | undefined =>
  cards[`../assets/final-girls/cards/${name.toLowerCase()}-${ultimate ? 'ultimate' : 'front'}.webp`];
