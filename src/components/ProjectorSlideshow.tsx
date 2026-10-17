import { useState, useEffect } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export const ProjectorSlideshow = ({ images }: { images: string[] }) => {
  const [index, setIndex] = useState(0);
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    if (images.length < 2 || reducedMotion) return;
    const timer = window.setInterval(() => setIndex(i => (i + 1) % images.length), 16000);
    return () => window.clearInterval(timer);
  }, [images.length, reducedMotion]);
  const image = images[index % images.length];
  if (!image) return null;
  return (
    <div className="theater-projection" key={image}>
      <img src={image} className="theater-projection-fill" alt="" aria-hidden="true" />
      <img src={image} className="theater-projection-art" alt="A scene from a previous game" />
    </div>
  );
};
