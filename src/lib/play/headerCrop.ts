import type { HeaderFace } from './face-detection/headerFaces.worker';

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

function cropPosition(
  visible: number,
  faces: readonly HeaderFace[],
  start: (face: HeaderFace) => number,
  end: (face: HeaderFace) => number,
  fallback: number,
) {
  const overflow = 1 - visible;
  if (overflow <= 0 || faces.length === 0) return fallback * 100;
  const firstEdge = Math.min(...faces.map(start));
  const lastEdge = Math.max(...faces.map(end));
  // If the group cannot fit, protect the largest face. At extreme ratios
  // prioritize its leading edge, which includes headroom on the vertical axis.
  const leading = lastEdge - firstEdge <= visible ? firstEdge : start(faces[0]);
  const trailing = lastEdge - firstEdge <= visible ? lastEdge : end(faces[0]);
  const latest = clamp(leading, 0, overflow);
  const earliest = clamp(trailing - visible, 0, latest);
  return 100 * clamp(fallback * overflow, earliest, latest) / overflow;
}

const headTop = (face: HeaderFace) => face.y - face.height * 0.95;
const headBottom = (face: HeaderFace) => face.y + face.height * 0.62;

export function headerCrop(imageRatio: number, frameRatio: number, faces: readonly HeaderFace[]) {
  const foreground = faces.filter(face => face.height >= faces[0].height * 0.55);
  const headHeight = foreground.length
    ? Math.min(1, Math.max(...foreground.map(headBottom))) - Math.max(0, Math.min(...foreground.map(headTop)))
    : 0;
  const photoRatio = headHeight > 0 ? Math.min(frameRatio, imageRatio / headHeight) : frameRatio;
  const x = cropPosition(Math.min(1, photoRatio / imageRatio), faces,
    face => face.x - face.width * 0.6, face => face.x + face.width * 0.6, 0.5);
  const y = cropPosition(Math.min(1, imageRatio / photoRatio), faces, headTop, headBottom, 0.2);
  return { position: `${x}% ${y}%`, width: 100 * (photoRatio / frameRatio) };
}
