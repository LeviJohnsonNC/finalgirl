import { useCallback, useId, useRef, useState } from 'react';
import plate from '@/assets/loaders/film/gate.webp';
import blood from '@/assets/loaders/blood-stain.webp';
import { MaterialCanvas } from './MaterialCanvas';
import { filmAngle, filmBottom, filmOffset, filmTop, framePitch, gateHeight, gateWidth } from './openingFilmGeometry';
import { openingFilmStills } from './openingFilm';
import { openingFilmShader } from './openingFilmShader';
import '@/styles/opening-film-loader.css';

export function StoryFilmLoader({ location, label = 'Writing your opening scene', inspectTime }: {
  location: string;
  label?: string;
  inspectTime?: number;
}) {
  const id = useId();
  const [seed] = useState(() => Math.random() * 20);
  const scene = useRef<HTMLDivElement>(null);
  const setFilmPosition = useCallback((time: number) => {
    const style = scene.current?.style;
    const offset = `${filmOffset(time)}px`;
    if (style && style.getPropertyValue('--film-offset') !== offset) {
      style.setProperty('--film-offset', offset);
    }
  }, []);
  const images = openingFilmStills(location);
  const bandHeight = filmBottom - filmTop;
  const photoY = filmTop + 23;

  return <div className="cinematic-loader blood-loader opening-film-loader" role="status" aria-live="polite">
    <div className="opening-film-window" aria-hidden="true">
      <div className="opening-film-gate" ref={scene}>
        <img className="opening-film-plate" src={plate} alt="" />
        <svg className="opening-film-reel" viewBox={`0 0 ${gateWidth} ${gateHeight}`} focusable="false">
          <defs>
            <clipPath id={`${id}-aperture`}><rect x="137" y="57" width="705" height="288" rx="7" /></clipPath>
            <pattern id={`${id}-perforations`} x="0" y={filmTop} width={framePitch / 8} height={bandHeight} patternUnits="userSpaceOnUse">
              <rect width={framePitch / 8} height={bandHeight} fill="white" />
              <rect x="9" y="5" width="12" height="10" rx="1.8" />
              <rect x="9" y={bandHeight - 15} width="12" height="10" rx="1.8" />
            </pattern>
            <mask id={`${id}-stock`} x="-260" y={filmTop} width="1500" height={bandHeight} maskUnits="userSpaceOnUse">
              <rect x="-260" y={filmTop} width="1500" height={bandHeight} fill={`url(#${id}-perforations)`} />
            </mask>
            <linearGradient id={`${id}-stock-shade`} x2="0" y2="1">
              <stop offset="0" stopColor="#35190e" />
              <stop offset=".18" stopColor="#211208" />
              <stop offset=".75" stopColor="#211208" />
              <stop offset="1" stopColor="#593012" />
            </linearGradient>
            <linearGradient id={`${id}-light`}>
              <stop offset="0" stopColor="#090501" stopOpacity=".78" />
              <stop offset=".27" stopColor="#1e0f06" stopOpacity=".32" />
              <stop offset=".48" stopColor="#824019" stopOpacity=".07" />
              <stop offset=".68" stopColor="#1e0f06" stopOpacity=".28" />
              <stop offset="1" stopColor="#080501" stopOpacity=".78" />
            </linearGradient>
          </defs>
          <g clipPath={`url(#${id}-aperture)`}>
            <g transform={`rotate(${filmAngle} ${gateWidth / 2} ${gateHeight / 2})`}>
              <g className="opening-film-stock">
                <g mask={`url(#${id}-stock)`}>
                  <rect x="-260" y={filmTop} width="1500" height={bandHeight} fill={`url(#${id}-stock-shade)`} />
                  {images.map((src, index) => {
                    const x = gateWidth / 2 + (index - 1) * framePitch - framePitch / 2 + 8;
                    return <g key={index}>
                      <rect x={x} y={photoY} width={framePitch - 16} height={bandHeight - 46} fill="#291a0e" rx="2" />
                      {src && <image className="opening-film-still" href={src} x={x} y={photoY}
                        width={framePitch - 16} height={bandHeight - 46} preserveAspectRatio="xMidYMid slice" />}
                    </g>;
                  })}
                </g>
              </g>
              <rect x="132" y={filmTop} width="714" height={bandHeight} fill={`url(#${id}-light)`} />
            </g>
          </g>
        </svg>
        <img className="opening-film-still-blood" src={blood} alt="" />
        <MaterialCanvas artwork={blood} shader={openingFilmShader} seed={inspectTime === undefined ? seed : 2}
          inspectTime={inspectTime} onFrame={setFilmPosition} />
      </div>
    </div>
    <div className="cinematic-loader-copy">
      <p className="cinematic-loader-title">Every story leaves a stain</p>
      <p className="cinematic-loader-status">{label}</p>
    </div>
  </div>;
}
