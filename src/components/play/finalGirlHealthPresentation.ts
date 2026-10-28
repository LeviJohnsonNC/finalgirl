import manifest from '@/assets/play/final-girl-health/manifest.json';

const images = import.meta.glob<string>('/src/assets/play/final-girl-health/*.webp', {
  eager: true, query: '?url', import: 'default',
});

export type HealthPortraitState = 'healthy' | 'critical' | 'original';

/** The same reviewed tracker frame applies to all three states. */
export function finalGirlHealthFrame(name: string) {
  const entry = manifest.find(entry => entry.name === name);
  return entry ? { position: entry.position, scale: entry.scale, origin: entry.origin } : undefined;
}

/** Decorative presentation only. Unknown health/maxima never create observations. */
export function healthPortraitState(health?: number, maximum?: number): HealthPortraitState {
  if (health === undefined || !Number.isInteger(health) || health < 0) return 'original';
  if (health <= 2) return 'critical';
  if (maximum !== undefined && Number.isInteger(maximum) && maximum > 2 && health === maximum) return 'healthy';
  return 'original';
}

export function finalGirlHealthPortrait(name: string, health: number | undefined, maximum: number | undefined, aiEnabled: boolean) {
  const state = healthPortraitState(health, maximum);
  if (!aiEnabled || state === 'original') return undefined;
  const portrait = manifest.find(entry => entry.name === name);
  if (!portrait) return undefined;
  const src = images[`/src/assets/play/final-girl-health/${portrait.slug}-${state}.webp`];
  return src ? { src, state, position: portrait.position } : undefined;
}
