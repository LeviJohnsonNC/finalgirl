import { useState } from 'react';
import criticalHealth from '@/assets/play/states/critical-health.webp';
import { finalGirlHealthPortrait, finalGirlHealthFrame } from './finalGirlHealthPresentation';

export function FinalGirlHealthPortrait({ name, health, maximum, original, aiEnabled }: {
  name: string; health?: number; maximum?: number; original?: string; aiEnabled: boolean;
}) {
  const portrait = finalGirlHealthPortrait(name, health, maximum, aiEnabled);
  const frame = aiEnabled ? finalGirlHealthFrame(name) : undefined;
  const [failed, setFailed] = useState<string>();
  const variant = portrait && failed !== portrait.src ? portrait : undefined;
  const src = variant?.src ?? original;
  return <>
    {src && <img className="play-stat-portrait" src={src} alt="" decoding="async"
      data-health-portrait={variant?.state}
      style={frame ? { objectPosition: frame.position, transform: frame.scale > 1 ? `scale(${frame.scale})` : 'none', transformOrigin: frame.origin } : undefined}
      onError={variant ? () => setFailed(variant.src) : undefined} />}
    {!variant && health !== undefined && health <= 2 && <img className="play-critical-art" src={criticalHealth} alt="" />}
  </>;
}
