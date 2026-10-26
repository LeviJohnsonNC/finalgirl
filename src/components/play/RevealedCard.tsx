import { ModuleArtwork } from "./ModuleArtwork";
import type { IllustratedKillerCard } from "./killerPresentation";

/** Read-only presentation. Revealing/correcting is owned by the chooser. */
export function RevealedCard({
  card,
  label,
}: {
  card: IllustratedKillerCard;
  label: string;
}) {
  return (
    <div
      className="module-revealed-hero"
      data-epic={card.epic || undefined}
      aria-label={`Revealed ${label}: ${card.name}`}
    >
      <div className="module-revealed-art">
        <ModuleArtwork art={card.heroArt ?? card.art} />
      </div>
      <div className="module-revealed-copy">
        <span className="module-revealed-stamp">
          Revealed{card.epic ? " · Epic" : ""}
        </span>
        <span className="cinematic-eyebrow">{label}</span>
        <h4>{card.name}</h4>
        <span className="module-revealed-rule" aria-hidden="true" />
      </div>
    </div>
  );
}
