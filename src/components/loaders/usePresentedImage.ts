import { useEffect, useRef, useState } from 'react';

export const IMAGE_REVEAL_MS = 1050;

/** Presentation only: never starts generation or delays persistence/save readiness. */
export function usePresentedImage(imageUrl: string, isGenerating: boolean) {
  // Saved pictures render normally, without replaying a development sequence.
  const [shown, setShown] = useState({ url: isGenerating ? '' : imageUrl, ratio: 16 / 9 });
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const [revealing, setRevealing] = useState(false);
  const generationSeen = useRef(isGenerating);
  const revision = useRef(0);
  useEffect(() => { if (isGenerating) { generationSeen.current = true; setRevealing(false); } }, [isGenerating]);
  useEffect(() => {
    const ticket = ++revision.current;
    if (isGenerating || !imageUrl || (imageUrl === shown.url && failedUrl !== imageUrl)) return;
    let alive = true;
    const img = new Image();
    const current = () => alive && ticket === revision.current;
    const fail = () => { if (current()) { setFailedUrl(imageUrl); setRevealing(false); } };
    const timeout = window.setTimeout(fail, 25000);
    img.onerror = () => { clearTimeout(timeout); fail(); };
    img.onload = () => {
      void (typeof img.decode === 'function' ? img.decode() : Promise.resolve()).then(() => {
        if (!current()) return;
        clearTimeout(timeout); setFailedUrl(null);
        setShown({ url: imageUrl, ratio: img.naturalWidth / img.naturalHeight || 16 / 9 });
        setRevealing(generationSeen.current && !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
        generationSeen.current = false;
      }).catch(fail);
    };
    img.src = imageUrl;
    return () => { alive = false; clearTimeout(timeout); img.onload = null; img.onerror = null; img.src = ''; };
    // shown/failed are results, not triggers: failures wait for an explicit retry.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl, retry, isGenerating]);
  useEffect(() => {
    if (!revealing) return;
    const timeout = window.setTimeout(() => setRevealing(false), IMAGE_REVEAL_MS);
    return () => clearTimeout(timeout);
  }, [revealing]);
  const loading = Boolean(imageUrl && imageUrl !== shown.url && failedUrl !== imageUrl);
  return {
    shown, revealing, loading, failed: failedUrl === imageUrl && Boolean(imageUrl),
    onImageLoad: (img: HTMLImageElement) => setShown(s => s.url === img.src || s.url === img.getAttribute('src') ? { ...s, ratio: img.naturalWidth / img.naturalHeight || s.ratio } : s),
    onImageError: () => setFailedUrl(shown.url),
    retryLoad: () => { setFailedUrl(null); setRetry(n => n + 1); },
  };
}
