import {
  Children,
  isValidElement,
  useState,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from "react";
import type { MinorPowerControl } from "./MinorPowerControl";

type Card = ReactElement<ComponentProps<typeof MinorPowerControl>>;
/** Hide unused choices, never erase recorded powers or enforce an invented limit. */
export function MinorPowerGroup({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const cards = Children.toArray(children).filter(isValidElement) as Card[];
  const recorded = cards.filter(
    (card) => card.props.health !== undefined || card.props.previouslyRevealed,
  );
  const signature = recorded
    .map(
      (card) =>
        `${card.props.name}:${card.props.health === undefined ? "unknown" : "known"}`,
    )
    .join("|");
  const [editingFor, setEditingFor] = useState<string | null>(null);
  const choosing = recorded.length === 0 || editingFor === signature;
  const unused = cards.length - recorded.length;
  return (
    <div className={`module-minor-group ${className}`} data-focused={!choosing}>
      {choosing ? cards : recorded}
      {recorded.length > 0 && unused > 0 && (
        <button
          type="button"
          className="module-change-choice"
          aria-expanded={choosing}
          onClick={() => setEditingFor(choosing ? null : signature)}
        >
          {choosing ? "Done choosing Minor Powers" : "Add another Minor Power"}
        </button>
      )}
    </div>
  );
}
