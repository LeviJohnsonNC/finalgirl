/** Atlas rectangles are original generated panels, addressed without distorting
 * or repainting their subjects. Ordinary images use the same presentation. */
export interface ModuleArt {
  src: string;
  atlas?: { width: number; height: number; x: number; y: number; cellWidth: number; cellHeight: number };
}
export function ModuleArtwork({ art, className = "" }: { art: ModuleArt; className?: string }) {
  if (!art.atlas) return <img className={`play-module-art ${className}`} src={art.src} alt="" loading="lazy" decoding="async" />;
  const { width, height, x, y, cellWidth, cellHeight } = art.atlas;
  return <svg className={`play-module-art ${className}`} viewBox={`${x} ${y} ${cellWidth} ${cellHeight}`}
    preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
    <image href={art.src} width={width} height={height} />
  </svg>;
}
