import { useState } from 'react';
import blood from '@/assets/loaders/blood-stain.webp';
import tray from '@/assets/loaders/developer-tray.webp';
import portraitTray from '@/assets/loaders/developer-tray-portrait.webp';
import { MaterialCanvas } from './MaterialCanvas';
import { bloodShader, darkroomShader } from './shaders';
import '@/styles/cinematic-loaders.css';

export function StoryBloodLoader({ kind = 'opening', label, inspectTime }: { kind?: 'opening' | 'ending'; label?: string; inspectTime?: number }) {
  const [seed] = useState(() => Math.random() * 20);
  return <div className="cinematic-loader blood-loader" role="status" aria-live="polite">
    <div className="blood-loader-art" aria-hidden="true">
      <img src={blood} className="blood-fallback" alt="" />
      <MaterialCanvas artwork={blood} shader={bloodShader} seed={inspectTime === undefined ? seed : 2} inspectTime={inspectTime} />
    </div>
    <div className="cinematic-loader-copy">
      <p className="cinematic-loader-title">Every story leaves a stain</p>
      <p className="cinematic-loader-status">{label ?? (kind === 'ending' ? 'Writing your final scene' : 'Writing your opening scene')}</p>
    </div>
  </div>;
}

export function DarkroomImageLoader({ variant = 'scene', previewUrl, inspectTime, label, developedUrl }: { variant?: 'scene' | 'poster'; previewUrl?: string; inspectTime?: number; label?: string; developedUrl?: string }) {
  const [seed] = useState(() => Math.random() * 20);
  const portrait = variant === 'poster';
  const artwork = portrait ? portraitTray : tray;
  return <div className={`cinematic-loader darkroom-loader${portrait ? ' darkroom-loader--portrait' : ''}`} role="status" aria-live="polite">
    <div className="darkroom-loader-art" aria-hidden="true">
      <div className="darkroom-fallback">
        <img src={artwork} alt="" className="darkroom-tray" />
        <div className="darkroom-fallback-paper">{previewUrl && <img src={previewUrl} alt="" />}</div>
      </div>
      <MaterialCanvas artwork={artwork} photograph={previewUrl} shader={darkroomShader} portrait={portrait} seed={inspectTime === undefined ? seed : 2} inspectTime={inspectTime} />
      {developedUrl && <div className="darkroom-developed-print"><img src={developedUrl} alt="" /></div>}
    </div>
    <div className="cinematic-loader-copy">
      <p className="cinematic-loader-title">Developing the nightmare</p>
      <p className="cinematic-loader-status">{label ?? (portrait ? 'Your final frame is coming into focus' : 'Your scene is coming into focus')}</p>
    </div>
  </div>;
}
