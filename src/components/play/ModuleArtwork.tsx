import { useId } from "react";
/** Atlas rectangles are original generated panels, addressed without distorting
 * or repainting their subjects. Ordinary images use the same presentation. */
export interface ModuleArt {
  src: string;
  fit?: "meet" | "slice";
  align?: "right";
  atlas?: {
    width: number;
    height: number;
    x: number;
    y: number;
    cellWidth: number;
    cellHeight: number;
  };
}
export function ModuleArtwork({
  art,
  className = "",
}: {
  art: ModuleArt;
  className?: string;
}) {
  const clip = useId();
  if (!art.atlas)
    return (
      <img
        className={`play-module-art ${className}`}
        src={art.src}
        style={{
          objectFit:
            art.fit === "slice"
              ? "cover"
              : art.fit === "meet"
                ? "contain"
                : undefined,
          objectPosition: art.align === "right" ? "right center" : undefined,
        }}
        alt=""
        loading="lazy"
        decoding="async"
      />
    );
  const { width, height, x, y, cellWidth, cellHeight } = art.atlas;
  return (
    <svg
      className={`play-module-art ${className}`}
      viewBox={`${x} ${y} ${cellWidth} ${cellHeight}`}
      preserveAspectRatio={`${art.align === "right" ? "xMaxYMid" : "xMidYMid"} ${art.fit ?? "slice"}`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <clipPath id={clip}>
          <rect x={x} y={y} width={cellWidth} height={cellHeight} />
        </clipPath>
      </defs>
      <image
        href={art.src}
        width={width}
        height={height}
        clipPath={`url(#${clip})`}
      />
    </svg>
  );
}
