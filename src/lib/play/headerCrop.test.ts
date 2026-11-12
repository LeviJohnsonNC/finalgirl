import { expect, it } from 'vitest';
import { headerCrop } from './headerCrop';

const xPercent = (position: string) => parseFloat(position);
const yPercent = (position: string) => parseFloat(position.split(' ')[1]);

it('keeps both heads inside a wide crop when they fit', () => {
  const faces = [
    { x: 0.38, y: 0.23, width: 0.14, height: 0.25 },
    { x: 0.78, y: 0.17, width: 0.13, height: 0.23 },
  ];
  const visibleHeight = 1.8 / 3.75;
  const { position, width } = headerCrop(1.8, 3.75, faces);
  const top = yPercent(position) * (1 - visibleHeight) / 100;
  expect(width).toBe(100);
  expect(top).toBe(0);
  expect(top + visibleHeight).toBeGreaterThan(faces[0].y + faces[0].height / 2);
});

it('follows the largest face in a narrow crop and uses a safe default without faces', () => {
  const faces = [
    { x: 0.83, y: 0.35, width: 0.18, height: 0.3 },
    { x: 0.20, y: 0.44, width: 0.10, height: 0.19 },
  ];
  expect(xPercent(headerCrop(2, 1.25, faces).position)).toBeGreaterThan(80);
  expect(headerCrop(2, 1.25, [])).toEqual({ position: '50% 20%', width: 100 });
});

it('reduces the zoom when the main head is taller than the cover crop', () => {
  const face = { x: 0.54, y: 0.25, width: 0.24, height: 0.24 };
  const { position, width } = headerCrop(0.8, 4, [face]);
  const visible = 0.8 / (4 * width / 100);
  const top = yPercent(position) * (1 - visible) / 100;
  expect(width).toBeLessThan(100);
  expect(top).toBeCloseTo(face.y - face.height * 0.95);
  expect(top + visible).toBeCloseTo(face.y + face.height * 0.62);
});
