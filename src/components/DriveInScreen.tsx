import { useEffect, useState, type ReactNode } from 'react';
import landscape from '@/assets/theater-drive-in.webp';
import portrait from '@/assets/theater-drive-in-portrait.webp';
import landscapeSurface from '@/assets/theater-screen-surface.webp';
import portraitSurface from '@/assets/theater-screen-surface-portrait.webp';

const phoneQuery = '(max-width: 639px)';
const compositions = {
  landscape: { src: landscape, surface: landscapeSurface, width: 1536, height: 1024 },
  portrait: { src: portrait, surface: portraitSurface, width: 1024, height: 1536 },
};

export function DriveInScreen({ children, busy }: { children: ReactNode; busy: boolean }) {
  const [composition, setComposition] = useState<keyof typeof compositions>(() =>
    window.matchMedia(phoneQuery).matches ? 'portrait' : 'landscape');

  useEffect(() => {
    const media = window.matchMedia(phoneQuery);
    let request = 0;
    let disposed = false;
    const update = async () => {
      const next = media.matches ? 'portrait' : 'landscape';
      const ticket = ++request;
      // Decode before changing the artwork AND its aperture coordinates. A
      // picture/media swap can otherwise leave a projection on the wrong frame
      // while the new composition downloads during rotation or window resizing.
      try {
        await Promise.all([compositions[next].src, compositions[next].surface].map(src => {
          const image = new Image();
          image.src = src;
          return image.decode();
        }));
        if (!disposed && ticket === request) setComposition(next);
      } catch {
        // Keep the existing, aligned scene if the alternate asset cannot load.
      }
    };
    media.addEventListener('change', update);
    void update();
    return () => { disposed = true; media.removeEventListener('change', update); };
  }, []);

  const art = compositions[composition];
  return (
    <div className="theater-screen-wrap" data-composition={composition}>
      <div className="theater-scene-plane">
        <img src={art.src} className="theater-scenery" alt="" aria-hidden="true"
          width={art.width} height={art.height} fetchPriority="high" />
        <div className="theater-screen" aria-busy={busy}>
          {children}
          <div className="theater-screen-texture" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
