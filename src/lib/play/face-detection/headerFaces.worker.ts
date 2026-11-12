import cascadeUrl from './facefinder.bin?url';
import { pico } from './pico.js';

export type HeaderFace = { x: number; y: number; width: number; height: number };

self.onmessage = async ({ data }: MessageEvent<ImageData>) => {
  try {
    const response = await fetch(cascadeUrl);
    if (!response.ok) throw new Error('Face model unavailable');
    const classify = pico.unpack_cascade(new Int8Array(await response.arrayBuffer()));
    const { width, height, data: rgba } = data;
    const pixels = new Uint8Array(width * height);
    for (let i = 0; i < pixels.length; i++) {
      pixels[i] = (2 * rgba[4 * i] + 7 * rgba[4 * i + 1] + rgba[4 * i + 2]) / 10;
    }
    const detections: [number, number, number, number][] = pico.cluster_detections(
      pico.run_cascade({ pixels, nrows: height, ncols: width, ldim: width }, classify, {
        minsize: Math.max(20, Math.round(Math.min(width, height) * 0.07)),
        maxsize: Math.min(width, height),
        scalefactor: 1.1,
        shiftfactor: 0.1,
      }),
      0.2,
    );
    const faces: HeaderFace[] = detections
      .filter(([, , , confidence]) => confidence >= 5)
      .sort((a, b) => b[2] - a[2])
      .map(([y, x, size]) => ({ x: x / width, y: y / height, width: size / width, height: size / height }));
    self.postMessage(faces);
  } catch {
    self.postMessage([]);
  }
};
