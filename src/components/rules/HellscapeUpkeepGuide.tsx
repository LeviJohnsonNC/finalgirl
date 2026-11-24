import { HELLSCAPE_UPKEEP } from "../../../supabase/functions/_shared/play/hellscape";

export function HellscapeUpkeepGuide() {
  return (
    <div className="hellscape-upkeep-guide" aria-label="Hellscape dice examples">
      {HELLSCAPE_UPKEEP.map((effect, index) => (
        <figure className="hellscape-upkeep-result" key={effect}>
          <div className="hellscape-dice-example" aria-hidden="true">
            <span className="hellscape-die">✦</span>
            <span className="hellscape-die">{index === 0 ? "✦" : "✿"}</span>
            <strong>{index === 0 ? "Flip" : "Swap"}</strong>
          </div>
          <figcaption>{effect}</figcaption>
        </figure>
      ))}
    </div>
  );
}
