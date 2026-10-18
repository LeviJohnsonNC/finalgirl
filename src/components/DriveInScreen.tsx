import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type CSSProperties } from 'react';
import landscape from '@/assets/theater-starlight.webp';
import portrait from '@/assets/theater-starlight-portrait.webp';

const phoneQuery = '(max-width: 639px)';
// Measured from the actual photographs. Every live element shares the same
// coordinate plane as the steel, supports and ground. The small black gasket
// seals the photographed surface to the exact 16:9 projection aperture.
const driveInCompositions = {
  landscape: { src: landscape, width: 1915, height: 821, aperture: { x: 690, y: 159, width: 532 }, marquee: { x: 724, y: 505, width: 466 } },
  portrait: { src: portrait, width: 910, height: 1729, aperture: { x: 222, y: 477, width: 526 }, marquee: { x: 244, y: 811, width: 478 } },
};

export function DriveInScreen({ children, lower, busy, projecting }: { children: ReactNode; lower: ReactNode; busy: boolean; projecting: boolean }) {
  const [composition, setComposition] = useState<keyof typeof driveInCompositions>(() => window.matchMedia(phoneQuery).matches ? 'portrait' : 'landscape');
  const wrapRef = useRef<HTMLDivElement>(null);
  const lowerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const media = window.matchMedia(phoneQuery);
    let request = 0, disposed = false;
    const update = async () => {
      const next = media.matches ? 'portrait' : 'landscape';
      const ticket = ++request;
      try {
        const image = new Image(); image.src = driveInCompositions[next].src;
        await image.decode();
        if (!disposed && ticket === request) setComposition(next);
      } catch { /* Keep the existing aligned photograph if its alternate fails. */ }
    };
    media.addEventListener('change', update); void update();
    return () => { disposed = true; media.removeEventListener('change', update); };
  }, []);

  // Long titles, recovery messages, or larger text extend the page rather than
  // colliding with the footer. The photograph's scale uses the viewport, not
  // this measured height, so expanding the page cannot create a resize loop.
  useLayoutEffect(() => {
    const wrap = wrapRef.current, lower = lowerRef.current;
    if (!wrap || !lower) return;
    const footer = wrap.closest('.theater')?.querySelector<HTMLElement>('.theater-footer');
    const measure = () => {
      const reserve = (footer?.getBoundingClientRect().height ?? 90) + 32;
      wrap.style.setProperty('--required-stage-height', `${Math.ceil(lower.getBoundingClientRect().bottom - wrap.getBoundingClientRect().top + reserve)}px`);
    };
    const observer = new ResizeObserver(measure); observer.observe(lower); observer.observe(wrap); if (footer) observer.observe(footer);
    window.addEventListener('resize', measure); measure();
    return () => { observer.disconnect(); window.removeEventListener('resize', measure); };
  }, [composition]);

  const art = driveInCompositions[composition];
  const style = {
    '--source-ratio': art.width / art.height,
    '--aperture-x': `${art.aperture.x / art.width * 100}%`,
    '--aperture-y': `${art.aperture.y / art.height * 100}%`,
    '--aperture-width': `${art.aperture.width / art.width * 100}%`,
    '--marquee-x': `${art.marquee.x / art.width * 100}%`,
    '--marquee-y': `${art.marquee.y / art.height * 100}%`,
    '--marquee-width': `${art.marquee.width / art.width * 100}%`,
  } as CSSProperties;
  return <div ref={wrapRef} className="theater-screen-wrap" data-composition={composition} style={style}>
    <div className="theater-scene-plane">
      <img src={art.src} className="theater-scenery" alt="" aria-hidden="true" width={art.width} height={art.height} fetchPriority="high" />
      <div className="theater-screen" aria-busy={busy} data-projecting={projecting}>
        {children}<div className="theater-screen-texture" aria-hidden="true" />
      </div>
      <div ref={lowerRef} className="theater-lower">{lower}</div>
    </div>
  </div>;
}
