import { useState } from 'react';
import { createPortal } from 'react-dom';

interface ScrapbookPolaroidProps {
  sceneImageUrl: string;
}

export const ScrapbookPolaroid = ({ sceneImageUrl }: ScrapbookPolaroidProps) => {
  const [showLightbox, setShowLightbox] = useState(false);

  return (
    <>
      {/* Small polaroid - HIDDEN when lightbox is open */}
      {!showLightbox && (
        <div className="scrapbook-polaroid" onClick={() => setShowLightbox(true)}>
          {/* Paperclip */}
          <div className="polaroid-clip" />
          
          {/* Polaroid frame */}
          <div className="polaroid-frame">
            <img
              src={sceneImageUrl}
              alt="Scene evidence"
              className="polaroid-image"
              loading="lazy"
              decoding="async"
            />
            <span className="polaroid-caption">EVIDENCE</span>
          </div>
        </div>
      )}

      {/* Lightbox - rendered via portal to escape stacking context */}
      {showLightbox && createPortal(
        <div 
          className="polaroid-lightbox-transparent"
          onClick={() => setShowLightbox(false)}
        >
          {/* Polaroid frame - enlarged, centered, floating with physical look */}
          <div 
            className="lightbox-polaroid-floating"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={sceneImageUrl}
              alt="Scene evidence - full view"
              className="lightbox-image"
            />
            <span className="lightbox-caption">
              RECOVERED EVIDENCE
            </span>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
