export const gateWidth = 960;
export const gateHeight = 400;
export const framePitch = 240;
export const filmAngle = 2.6;
export const pullStart = 0.12;
export const pullEnd = 0.89;
export const filmTop = 104;
export const filmBottom = 294;

export function filmOffset(time: number) {
  const progress = Math.min(1, Math.max(0, (time - pullStart) / (pullEnd - pullStart)));
  return -framePitch * (1 - progress * progress * (3 - 2 * progress));
}
