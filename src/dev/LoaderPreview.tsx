import { useState } from 'react';
import { DarkroomImageLoader } from '@/components/loaders/CinematicLoaders';
import { StoryFilmLoader } from '@/components/loaders/StoryFilmLoader';
import { NarrationPhoto } from '@/components/NarrationPhoto';
import mall from '@/assets/locations/ai/sunnydaze-mall.png';
import { FEATURE_FILMS } from '@/types/gameData';
import '@/styles/narration.css';
import '@/styles/ending.css';

const locations = [...new Set(FEATURE_FILMS.map(film => film.location).filter(name => name && name !== 'TBD'))].sort();

/** Development-only material study. Excluded from production by App's DEV guard. */
export default function LoaderPreview() {
  const [location, setLocation] = useState('Sunnydaze Mall');
  const [time, setTime] = useState<number | undefined>(undefined);
  const [key, setKey] = useState(0);
  const [generating, setGenerating] = useState(true);
  const [url, setUrl] = useState('');
  return <main style={{ minHeight: '100vh', background: '#090807', color: '#dfd4c0', padding: 32 }}>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
      <strong>Loader material study</strong>
      <label>Location <select aria-label="Location" value={location} onChange={event => setLocation(event.target.value)}>
        <option value="">Neutral leader</option>
        {locations.map(name => <option key={name}>{name}</option>)}
      </select></label>
      {[undefined, 0, .48, .89, .99, 1.16, 2, 8, 20, 180, 300].map(t => <button key={t ?? 'live'} onClick={() => setTime(t)}>{t === undefined ? 'Live' : `${t}s`}</button>)}
      <button onClick={() => setKey(k => k + 1)}>Restart</button>
      <button onClick={() => { setGenerating(false); setUrl(mall); }}>Complete image</button>
      <button onClick={() => setGenerating(true)}>Reshoot</button>
    </div>
    <div key={key} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: 32, maxWidth: 1200, margin: 'auto' }}>
      <div>
        <section style={{ minHeight: 350, display: 'grid', placeItems: 'center', background: '#0d0b09', border: '1px solid #30251f' }}><StoryFilmLoader key={location} location={location} inspectTime={time} /></section>
        <section style={{ aspectRatio: '16/9', marginTop: 24 }}><DarkroomImageLoader previewUrl={mall} inspectTime={time} /></section>
        <NarrationPhoto imageUrl={url} isGenerating={generating} onRetry={() => setGenerating(true)} variant="scene" caption="Development handoff" previewUrl={mall} />
      </div>
      <section style={{ aspectRatio: '2/3', maxHeight: 640 }}><DarkroomImageLoader variant="poster" previewUrl={mall} inspectTime={time} /></section>
    </div>
  </main>;
}
