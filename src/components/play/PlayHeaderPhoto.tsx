import { useEffect, useRef } from 'react';
import { headerCrop } from '@/lib/play/headerCrop';
import type { HeaderFace } from '@/lib/play/face-detection/headerFaces.worker';

let lastCrop: { src: string; faces: HeaderFace[] } | undefined;

async function samplePhoto(image: HTMLImageElement) {
  let source = image;
  const url = new URL(image.currentSrc);
  if (url.protocol.startsWith('http') && url.origin !== location.origin) {
    // The visible photo can load even when its host disallows pixel access.
    source = new Image();
    source.crossOrigin = 'anonymous';
    source.src = url.href;
    await source.decode();
  }
  const scale = Math.min(1, 480 / Math.max(source.naturalWidth, source.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(source.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(source.naturalHeight * scale));
  const context = canvas.getContext('2d');
  if (!context) return;
  context.drawImage(source, 0, 0, canvas.width, canvas.height);
  return context.getImageData(0, 0, canvas.width, canvas.height);
}

export function PlayHeaderPhoto({ src, alt }: { src: string; alt: string }) {
  const photo = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const image = photo.current;
    const frame = image?.parentElement;
    if (!image || !frame) return;
    let active = true;
    let worker: Worker | undefined;
    let observer: ResizeObserver | undefined;
    const apply = (faces: HeaderFace[]) => {
      if (!faces.length) return;
      const update = () => {
        if (!frame.clientWidth || !frame.clientHeight) return;
        const { position, width } = headerCrop(
          image.naturalWidth / image.naturalHeight, frame.clientWidth / frame.clientHeight, faces,
        );
        image.style.objectPosition = position;
        frame.style.setProperty('--play-photo-width', `${width}%`);
        frame.classList.toggle('play-hero-frame--inset', width < 100);
      };
      update();
      observer = new ResizeObserver(update);
      observer.observe(frame);
    };
    const analyze = async () => {
      await image.decode();
      if (!active) return;
      if (lastCrop?.src === src) {
        apply(lastCrop.faces);
        return;
      }
      const pixels = await samplePhoto(image);
      if (!active || !pixels) return;
      worker = new Worker(new URL('../../lib/play/face-detection/headerFaces.worker.ts', import.meta.url), { type: 'module' });
      worker.onmessage = ({ data }: MessageEvent<HeaderFace[]>) => {
        worker?.terminate();
        if (!active) return;
        lastCrop = { src, faces: data };
        apply(data);
      };
      worker.onerror = () => worker?.terminate();
      worker.postMessage(pixels, [pixels.data.buffer]);
    };
    void analyze().catch(() => { /* Keep the CSS crop if analysis is unavailable. */ });
    return () => {
      active = false;
      observer?.disconnect();
      worker?.terminate();
    };
  }, [src]);

  return <span key={src} className="play-hero-frame">
    <img className="play-hero-backdrop" src={src} alt="" aria-hidden="true" />
    <img ref={photo} className="play-hero-image" src={src} alt={alt} />
  </span>;
}
