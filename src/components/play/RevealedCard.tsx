import type { ReactNode } from "react";
import { ModuleArtwork } from "./ModuleArtwork";
import type { IllustratedKillerCard } from "./killerPresentation";

/** Revealing and correcting the card name is owned by the chooser. */
export function RevealedCard({
  card,
  label,
  children,
  showEyebrow = true,
}: {
  card: IllustratedKillerCard;
  label: string;
  children?: ReactNode;
  showEyebrow?: boolean;
}) {
  return (
    <div
      className="module-revealed-hero"
      data-epic={card.epic || undefined}
      data-has-controls={children ? true : undefined}
      aria-label={`Revealed ${label}: ${card.name}`}
    >
      <div className="module-revealed-art">
        <ModuleArtwork art={card.heroArt ?? card.art} />
      </div>
      <div className="module-revealed-copy">
        <span className="module-revealed-stamp">
          Revealed{card.epic ? " · Epic" : ""}
        </span>
        {showEyebrow && <span className="cinematic-eyebrow">{label}</span>}
        <h4>{card.name}</h4>
        {children ?? <span className="module-revealed-rule" aria-hidden="true" />}
      </div>
    </div>
  );
}
